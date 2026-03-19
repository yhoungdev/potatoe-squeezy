import { Hono } from 'hono';
import { and, eq, inArray } from 'drizzle-orm';
import { createHash } from 'crypto';
import { db } from '../db';
import { bounties, contributions, users, webhookEvents } from '../db/schema';
import { verifyGitHubSignature } from '../utils/github-signature';
import { getEscrowService } from '../services/escrow';
import { DeveloperStatsService } from '../services/developer-stats';
import { BadgeService } from '../services/badges';
import { toUsd } from '../services/pricing';
import {
  getBotLogin,
  hasBountyLabel,
  isPotatoeBotComment,
  parseBountyCommand,
} from '../services/bounty-verification';

const githubWebhookRoute = new Hono();

const statsService = new DeveloperStatsService();
const badgeService = new BadgeService();

const SUPPORTED_BY_NETWORK: Record<string, string[]> = {
  solana: ['SOL', 'USDC'],
  stellar: ['XLM', 'USDC'],
};

const difficultyFromPR = (pullRequest: Record<string, unknown>) => {
  const changedFiles = Number(pullRequest.changed_files ?? 0);
  if (changedFiles >= 40) return 5;
  if (changedFiles >= 20) return 4;
  if (changedFiles >= 10) return 3;
  if (changedFiles >= 5) return 2;
  return 1;
};

const parseLinkedIssueNumbers = (body: string | undefined) => {
  if (!body) {
    return [] as number[];
  }

  const matches = body.matchAll(/#(\d+)/g);
  const values = Array.from(matches).map((value) => Number(value[1]));
  return [...new Set(values)].filter(
    (value) => Number.isInteger(value) && value > 0,
  );
};

const postGitHubComment = async (
  repo: string,
  issueNumber: number,
  body: string,
) => {
  const token = process.env.GITHUB_APP_TOKEN || process.env.GITHUB_BOT_TOKEN;

  if (!token) {
    return;
  }

  await fetch(
    `https://api.github.com/repos/${repo}/issues/${issueNumber}/comments`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ body }),
    },
  );
};

const ensureGitHubUser = async (payloadUser: Record<string, unknown>) => {
  const githubId = String(payloadUser.id ?? '');
  const username = String(payloadUser.login ?? '');
  const avatarUrl = payloadUser.avatar_url
    ? String(payloadUser.avatar_url)
    : null;

  if (!githubId || !username) {
    return null;
  }

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.githubId, githubId))
    .limit(1);

  if (existing.length > 0) {
    if (
      existing[0].username !== username ||
      existing[0].avatarUrl !== avatarUrl
    ) {
      const updated = await db
        .update(users)
        .set({
          username,
          avatarUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existing[0].id))
        .returning();
      return updated[0];
    }
    return existing[0];
  }

  const inserted = await db
    .insert(users)
    .values({
      githubId,
      username,
      avatarUrl,
    })
    .returning();

  return inserted[0];
};

const upsertVerifiedBounty = async ({
  repo,
  issueNumber,
  creatorId,
  amount,
  token,
  network,
  status,
  verificationSource,
  botActorLogin,
}: {
  repo: string;
  issueNumber: number;
  creatorId: number;
  amount: string;
  token: string;
  network: string;
  status: string;
  verificationSource: string;
  botActorLogin?: string | null;
}) => {
  const existing = await db
    .select()
    .from(bounties)
    .where(and(eq(bounties.repo, repo), eq(bounties.issueNumber, issueNumber)))
    .limit(1);

  const verifiedAt = new Date();

  if (existing.length === 0) {
    const inserted = await db
      .insert(bounties)
      .values({
        id: crypto.randomUUID(),
        repo,
        issueNumber,
        creatorId,
        amount,
        token,
        network,
        status,
        escrowTxHash: '',
        isVerified: true,
        verificationSource,
        verifiedAt,
        botActorLogin: botActorLogin ?? null,
      })
      .returning();

    return inserted[0];
  }

  const current = existing[0];
  const nextAmount = amount !== '0' ? amount : String(current.amount ?? '0');
  const nextToken = amount !== '0' ? token : current.token;
  const nextNetwork = current.network || network;
  const nextStatus =
    current.status === 'completed' || current.status === 'cancelled'
      ? current.status
      : current.escrowTxHash
        ? 'open'
        : nextAmount === '0'
          ? 'pending'
          : status;

  const updated = await db
    .update(bounties)
    .set({
      creatorId,
      amount: nextAmount,
      token: nextToken,
      network: nextNetwork,
      status: nextStatus,
      isVerified: true,
      verificationSource,
      verifiedAt,
      botActorLogin: botActorLogin ?? current.botActorLogin ?? null,
    })
    .where(eq(bounties.id, current.id))
    .returning();

  return updated[0];
};

const handleBotBountyVerificationComment = async (
  payload: Record<string, unknown>,
) => {
  const comment = payload.comment as Record<string, unknown> | undefined;
  const issue = payload.issue as Record<string, unknown> | undefined;
  const repository = payload.repository as Record<string, unknown> | undefined;

  if (!isPotatoeBotComment(comment) || !hasBountyLabel(issue)) {
    return;
  }

  const repo = String(repository?.full_name ?? '');
  const issueNumber = Number(issue?.number ?? 0);

  if (!repo || !issueNumber) {
    return;
  }

  const creator = await ensureGitHubUser(
    (issue?.user as Record<string, unknown>) || {},
  );

  if (!creator) {
    return;
  }

  await upsertVerifiedBounty({
    repo,
    issueNumber,
    creatorId: creator.id,
    amount: '0',
    token: 'SOL',
    network: creator.network || 'solana',
    status: 'pending',
    verificationSource: 'bot_comment',
    botActorLogin: getBotLogin(comment?.user as Record<string, unknown>),
  });
};

const handleBountyCommand = async (payload: Record<string, unknown>) => {
  const comment = payload.comment as Record<string, unknown> | undefined;
  const issue = payload.issue as Record<string, unknown> | undefined;
  const repository = payload.repository as Record<string, unknown> | undefined;

  const parsedCommand = parseBountyCommand(
    typeof comment?.body === 'string' ? comment.body : undefined,
  );

  if (!parsedCommand) {
    return;
  }

  const amount = parsedCommand.amount;
  const token = parsedCommand.token;
  const repo = String(repository?.full_name ?? '');
  const issueNumber = Number(issue?.number ?? 0);

  if (!repo || !issueNumber || amount <= 0) {
    return;
  }

  if (!hasBountyLabel(issue)) {
    await postGitHubComment(
      repo,
      issueNumber,
      'Add the `bounty` label before opening a Potatoe Squeezy bounty.',
    );
    return;
  }

  const creator = await ensureGitHubUser(
    (comment?.user as Record<string, unknown>) ||
      (payload.sender as Record<string, unknown>) ||
      {},
  );

  if (!creator) {
    return;
  }

  if (!creator.walletAddress || !creator.network) {
    await postGitHubComment(
      repo,
      issueNumber,
      `@${creator.username} connect your wallet and network before creating a bounty.`,
    );
    return;
  }

  const allowedTokens = SUPPORTED_BY_NETWORK[creator.network] ?? [];
  if (!allowedTokens.includes(token)) {
    await postGitHubComment(
      repo,
      issueNumber,
      `@${creator.username} token ${token} is not supported on ${creator.network}.`,
    );
    return;
  }

  const existing = await db
    .select({
      id: bounties.id,
      amount: bounties.amount,
      status: bounties.status,
    })
    .from(bounties)
    .where(and(eq(bounties.repo, repo), eq(bounties.issueNumber, issueNumber)))
    .limit(1);

  if (existing.length > 0 && Number(existing[0].amount) > 0) {
    await postGitHubComment(
      repo,
      issueNumber,
      `Bounty already exists for this issue with status ${existing[0].status}.`,
    );
    return;
  }

  const bounty = await upsertVerifiedBounty({
    repo,
    issueNumber,
    creatorId: creator.id,
    amount: amount.toString(),
    token,
    network: creator.network,
    status: 'pending',
    verificationSource: 'bounty_command',
    botActorLogin: null,
  });
  const escrowService = getEscrowService(bounty.network);

  try {
    const escrowTxHash = await escrowService.lockFunds(bounty.id, amount);
    await postGitHubComment(
      repo,
      issueNumber,
      `Bounty opened: ${amount} ${token} on ${bounty.network}. Escrow locked in ${escrowTxHash}.`,
    );
  } catch (error) {
    await db
      .update(bounties)
      .set({ status: 'cancelled' })
      .where(eq(bounties.id, bounty.id));

    await postGitHubComment(
      repo,
      issueNumber,
      `Failed to lock escrow for bounty creation.`,
    );

    throw error;
  }
};

const attachContributionForPR = async (payload: Record<string, unknown>) => {
  const pullRequest = payload.pull_request as
    | Record<string, unknown>
    | undefined;
  const repository = payload.repository as Record<string, unknown> | undefined;

  if (!pullRequest || !repository) {
    return;
  }

  const repo = String(repository.full_name ?? '');
  const prNumber = Number(pullRequest.number ?? 0);
  const issueNumbers = parseLinkedIssueNumbers(
    typeof pullRequest.body === 'string' ? pullRequest.body : undefined,
  );

  if (!repo || !prNumber || issueNumbers.length === 0) {
    return;
  }

  const contributor = await ensureGitHubUser(
    (pullRequest.user as Record<string, unknown>) || {},
  );

  if (!contributor) {
    return;
  }

  const linkedBounties = await db
    .select()
    .from(bounties)
    .where(
      and(
        eq(bounties.repo, repo),
        inArray(bounties.issueNumber, issueNumbers),
        eq(bounties.isVerified, true),
        eq(bounties.status, 'open'),
      ),
    );

  if (linkedBounties.length === 0) {
    return;
  }

  const difficulty = difficultyFromPR(pullRequest);

  for (const bounty of linkedBounties) {
    await db
      .insert(contributions)
      .values({
        id: crypto.randomUUID(),
        bountyId: bounty.id,
        contributorId: contributor.id,
        prNumber,
        difficulty,
        merged: false,
      })
      .onConflictDoUpdate({
        target: [contributions.bountyId, contributions.prNumber],
        set: {
          contributorId: contributor.id,
          difficulty,
        },
      });
  }
};

const processMergedPR = async (payload: Record<string, unknown>) => {
  const pullRequest = payload.pull_request as
    | Record<string, unknown>
    | undefined;
  const repository = payload.repository as Record<string, unknown> | undefined;

  if (!pullRequest || !repository) {
    return;
  }

  const merged = Boolean(pullRequest.merged);
  const repo = String(repository.full_name ?? '');
  const prNumber = Number(pullRequest.number ?? 0);
  const issueNumbers = parseLinkedIssueNumbers(
    typeof pullRequest.body === 'string' ? pullRequest.body : undefined,
  );

  if (!merged || !repo || !prNumber || issueNumbers.length === 0) {
    return;
  }

  const contributor = await ensureGitHubUser(
    (pullRequest.user as Record<string, unknown>) || {},
  );

  if (!contributor) {
    return;
  }

  if (!contributor.walletAddress) {
    await postGitHubComment(
      repo,
      prNumber,
      `@${contributor.username} payout blocked because no wallet address is linked.`,
    );
    return;
  }

  const linkedBounties = await db
    .select()
    .from(bounties)
    .where(
      and(
        eq(bounties.repo, repo),
        inArray(bounties.issueNumber, issueNumbers),
        eq(bounties.isVerified, true),
        eq(bounties.status, 'open'),
      ),
    );

  if (linkedBounties.length === 0) {
    return;
  }

  const difficulty = difficultyFromPR(pullRequest);

  for (const bounty of linkedBounties) {
    await db
      .insert(contributions)
      .values({
        id: crypto.randomUUID(),
        bountyId: bounty.id,
        contributorId: contributor.id,
        prNumber,
        difficulty,
        merged: false,
      })
      .onConflictDoUpdate({
        target: [contributions.bountyId, contributions.prNumber],
        set: {
          contributorId: contributor.id,
          difficulty,
        },
      });

    const contributionRow = await db
      .select()
      .from(contributions)
      .where(
        and(
          eq(contributions.bountyId, bounty.id),
          eq(contributions.prNumber, prNumber),
        ),
      )
      .limit(1);

    if (contributionRow[0]?.merged) {
      continue;
    }

    const escrowService = getEscrowService(bounty.network);
    const payoutTxHash = await escrowService.releaseFunds(
      bounty.id,
      contributor.walletAddress,
    );

    const mergedAt = new Date();

    await db
      .update(contributions)
      .set({
        merged: true,
        mergedAt,
      })
      .where(
        and(
          eq(contributions.bountyId, bounty.id),
          eq(contributions.prNumber, prNumber),
        ),
      );

    const earnedUSD = toUsd(Number(bounty.amount), bounty.token);
    await statsService.updateAfterMerge(contributor.id, earnedUSD);
    await badgeService.evaluateAndAssign(contributor.id);

    await postGitHubComment(
      repo,
      prNumber,
      `Bounty paid to @${contributor.username}. Payout transaction: ${payoutTxHash}.`,
    );
  }
};

const processPullRequestEvent = async (
  action: string,
  payload: Record<string, unknown>,
) => {
  if (['opened', 'synchronize', 'reopened'].includes(action)) {
    await attachContributionForPR(payload);
    return;
  }

  if (action === 'closed') {
    await processMergedPR(payload);
  }
};

githubWebhookRoute.post('/webhook', async (c) => {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!secret) {
    return c.json({ error: 'Missing webhook secret configuration' }, 500);
  }

  const rawPayload = await c.req.text();
  const signature = c.req.header('x-hub-signature-256');

  if (!verifyGitHubSignature(rawPayload, signature, secret)) {
    return c.json({ error: 'Invalid webhook signature' }, 401);
  }

  const eventType = c.req.header('x-github-event') ?? '';
  const deliveryId = c.req.header('x-github-delivery') ?? crypto.randomUUID();
  const payloadHash = createHash('sha256').update(rawPayload).digest('hex');

  const inserted = await db
    .insert(webhookEvents)
    .values({
      id: crypto.randomUUID(),
      deliveryId,
      eventType,
      status: 'processing',
      payloadHash,
    })
    .onConflictDoNothing()
    .returning({ id: webhookEvents.id });

  if (inserted.length === 0) {
    return c.json({ status: 'duplicate' });
  }

  const payload = JSON.parse(rawPayload) as Record<string, unknown>;

  try {
    if (eventType === 'issue_comment') {
      await handleBotBountyVerificationComment(payload);
      await handleBountyCommand(payload);
    }

    if (eventType === 'pull_request') {
      const action = String(payload.action ?? '');
      await processPullRequestEvent(action, payload);
    }

    if (eventType === 'pull_request_review') {
      await Promise.resolve();
    }

    await db
      .update(webhookEvents)
      .set({
        status: 'processed',
        processedAt: new Date(),
      })
      .where(eq(webhookEvents.deliveryId, deliveryId));

    return c.json({ status: 'ok' });
  } catch (error) {
    await db
      .update(webhookEvents)
      .set({
        status: 'failed',
        processedAt: new Date(),
      })
      .where(eq(webhookEvents.deliveryId, deliveryId));

    return c.json(
      {
        error:
          error instanceof Error ? error.message : 'Webhook processing failed',
      },
      500,
    );
  }
});

export default githubWebhookRoute;
