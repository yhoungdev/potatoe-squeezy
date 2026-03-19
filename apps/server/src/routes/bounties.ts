import { Hono } from 'hono';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { db } from '../db';
import { bounties, contributions, users } from '../db/schema';

const bountiesRoute = new Hono();

bountiesRoute.get('/', async (c) => {
  const status = c.req.query('status');
  const limitRaw = c.req.query('limit');
  const limit = Math.min(Math.max(Number(limitRaw ?? 50), 1), 100);

  const rows = await db
    .select({
      id: bounties.id,
      repo: bounties.repo,
      issueNumber: bounties.issueNumber,
      amount: bounties.amount,
      token: bounties.token,
      network: bounties.network,
      status: bounties.status,
      escrowTxHash: bounties.escrowTxHash,
      payoutTxHash: bounties.payoutTxHash,
      createdAt: bounties.createdAt,
      creatorId: users.id,
      creatorUsername: users.username,
      creatorAvatarUrl: users.avatarUrl,
    })
    .from(bounties)
    .innerJoin(users, eq(bounties.creatorId, users.id))
    .where(status ? eq(bounties.status, status) : undefined)
    .orderBy(desc(bounties.createdAt))
    .limit(limit);

  const bountyIds = rows.map((row) => row.id);

  if (bountyIds.length === 0) {
    return c.json([]);
  }

  const contributionRows = await db
    .select({
      bountyId: contributions.bountyId,
      mergedCount: contributions.merged,
    })
    .from(contributions)
    .where(
      and(
        eq(contributions.merged, true),
        inArray(contributions.bountyId, bountyIds),
      ),
    );

  const counts = new Map<string, number>();
  for (const row of contributionRows) {
    const current = counts.get(row.bountyId) ?? 0;
    counts.set(row.bountyId, current + 1);
  }

  return c.json(
    rows.map((row) => ({
      ...row,
      mergedContributions: counts.get(row.id) ?? 0,
    })),
  );
});

bountiesRoute.post('/sync', async (c) => {
  const { repo, issueNumber } = await c.req.json<{
    repo: string;
    issueNumber: number;
  }>();

  if (!repo || !issueNumber) {
    return c.json({ error: 'Missing repo or issueNumber' }, 400);
  }

  const token = process.env.GITHUB_APP_TOKEN || process.env.GITHUB_BOT_TOKEN;
  if (!token) {
    return c.json({ error: 'GitHub token not configured' }, 500);
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${repo}/issues/${issueNumber}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
        },
      },
    );

    if (!response.ok) {
      return c.json({ error: 'Failed to fetch issue from GitHub' }, 404);
    }

    const issue = (await response.json()) as any;
    const labels = issue.labels.map((l: any) => l.name.toLowerCase());

    if (!labels.includes('bounty') && !labels.includes('open bounty')) {
      return c.json({ error: 'Issue is not labeled as a bounty or open bounty' }, 400);
    }

    // Check if bounty already exists
    const existing = await db
      .select()
      .from(bounties)
      .where(and(eq(bounties.repo, repo), eq(bounties.issueNumber, issueNumber)))
      .limit(1);

    if (existing.length > 0) {
      return c.json(existing[0]);
    }

    // Identify creator (issue author)
    const creatorPayload = issue.user;
    const githubId = String(creatorPayload.id);
    const username = creatorPayload.login;
    const avatarUrl = creatorPayload.avatar_url;

    let creator = await db
      .select()
      .from(users)
      .where(eq(users.githubId, githubId))
      .limit(1)
      .then((res) => res[0]);

    if (!creator) {
      const inserted = await db
        .insert(users)
        .values({
          githubId,
          username,
          avatarUrl,
        })
        .returning();
      creator = inserted[0];
    }

    // Try to parse amount/token from comments if bot is mentioned
    const commentsResponse = await fetch(issue.comments_url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
    });

    let amount = '0';
    let tokenSym = 'SOL';
    let network = 'solana';

    if (commentsResponse.ok) {
      const comments = (await commentsResponse.json()) as any[];
      for (const comment of comments) {
        const body = comment.body || '';
        const match = body.match(
          /^\/bounty\s+(\d+(?:\.\d+)?)\s+([a-zA-Z0-9]+)$/i,
        );
        if (match) {
          amount = match[1];
          tokenSym = match[2].toUpperCase();
          break;
        }
      }
    }

    const created = await db
      .insert(bounties)
      .values({
        id: crypto.randomUUID(),
        repo,
        issueNumber,
        creatorId: creator.id,
        amount: amount,
        token: tokenSym,
        network: creator.network || network,
        status: amount === '0' ? 'pending' : 'open',
        escrowTxHash: '',
      })
      .returning();

    return c.json(created[0], 201);
  } catch (error) {
    console.error('Sync error:', error);
    return c.json({ error: 'Internal server error during sync' }, 500);
  }
});

export default bountiesRoute;
