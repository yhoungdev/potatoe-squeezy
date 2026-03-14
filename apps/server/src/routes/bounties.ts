import { Hono } from 'hono';
import { and, desc, eq, inArray } from 'drizzle-orm';
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

export default bountiesRoute;
