import { Hono } from 'hono';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '../db';
import {
  badges,
  bounties,
  contributions,
  developerStats,
  userBadges,
  users,
} from '../db/schema';

const publicUsersRoute = new Hono();

publicUsersRoute.get('/:username/profile', async (c) => {
  const username = c.req.param('username');

  const userRows = await db
    .select({
      id: users.id,
      username: users.username,
      avatarUrl: users.avatarUrl,
      walletAddress: users.walletAddress,
      network: users.network,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (userRows.length === 0) {
    return c.json({ error: 'User not found' }, 404);
  }

  const user = userRows[0];

  const statsRows = await db
    .select({
      totalEarnedUSD: developerStats.totalEarnedUSD,
      totalTipsUSD: developerStats.totalTipsUSD,
      bountiesCompleted: developerStats.bountiesCompleted,
      consecutiveDays: developerStats.consecutiveDays,
      totalPoints: developerStats.totalPoints,
      updatedAt: developerStats.updatedAt,
    })
    .from(developerStats)
    .where(eq(developerStats.userId, user.id))
    .limit(1);

  const badgesRows = await db
    .select({
      id: badges.id,
      name: badges.name,
      description: badges.description,
      earnedAt: userBadges.earnedAt,
    })
    .from(userBadges)
    .innerJoin(badges, eq(userBadges.badgeId, badges.id))
    .where(eq(userBadges.userId, user.id));

  const recentContributions = await db
    .select({
      id: contributions.id,
      prNumber: contributions.prNumber,
      merged: contributions.merged,
      difficulty: contributions.difficulty,
      createdAt: contributions.createdAt,
      mergedAt: contributions.mergedAt,
      bountyId: contributions.bountyId,
      repo: bounties.repo,
      issueNumber: bounties.issueNumber,
      amount: bounties.amount,
      token: bounties.token,
      network: bounties.network,
    })
    .from(contributions)
    .innerJoin(bounties, eq(contributions.bountyId, bounties.id))
    .where(eq(contributions.contributorId, user.id))
    .orderBy(desc(contributions.createdAt))
    .limit(20);

  const createdBounties = await db
    .select({
      id: bounties.id,
      repo: bounties.repo,
      issueNumber: bounties.issueNumber,
      amount: bounties.amount,
      token: bounties.token,
      network: bounties.network,
      status: bounties.status,
      createdAt: bounties.createdAt,
    })
    .from(bounties)
    .where(eq(bounties.creatorId, user.id))
    .orderBy(desc(bounties.createdAt))
    .limit(20);

  const mergedOnNetworks = await db
    .select({ network: bounties.network })
    .from(contributions)
    .innerJoin(bounties, eq(contributions.bountyId, bounties.id))
    .where(and(eq(contributions.contributorId, user.id), eq(contributions.merged, true)));

  const networkSet = [...new Set(mergedOnNetworks.map((entry) => entry.network))];

  return c.json({
    user,
    stats: statsRows[0] ?? {
      totalEarnedUSD: '0',
      totalTipsUSD: '0',
      bountiesCompleted: 0,
      consecutiveDays: 0,
      totalPoints: '0',
      updatedAt: null,
    },
    badges: badgesRows,
    recentContributions,
    createdBounties,
    earnedNetworks: networkSet,
  });
});

export default publicUsersRoute;
