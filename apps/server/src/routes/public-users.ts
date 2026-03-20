import { Hono } from 'hono';
import { and, desc, eq, inArray, or, sql } from 'drizzle-orm';
import { db } from '../db';
import {
  addresses,
  badges,
  bounties,
  contributions,
  developerStats,
  transactionRecords,
  userBadges,
  users,
} from '../db/schema';
import { getTipperRank } from '@potatoe/shared';

const publicUsersRoute = new Hono();

publicUsersRoute.get('/:username/profile', async (c) => {
  const username = c.req.param('username');

  const userRows = await db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      twitterUrl: users.twitterUrl,
      tippersPublic: users.tippersPublic,
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

  const userWallets = await db
    .select({ address: addresses.address })
    .from(addresses)
    .where(eq(addresses.userId, user.id));

  const walletAddresses = userWallets.map((wallet) => wallet.address);

  const sentTipRows = await db
    .select({
      totalTipsSent: sql<string>`coalesce(sum(${transactionRecords.amount}), 0)`,
      sentTipCount: sql<number>`cast(count(*) as int)`,
    })
    .from(transactionRecords)
    .where(
      or(
        eq(transactionRecords.senderId, user.id),
        walletAddresses.length > 0
          ? inArray(transactionRecords.senderAddress, walletAddresses)
          : sql`false`,
      ),
    );

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
    .where(
      and(
        eq(contributions.contributorId, user.id),
        eq(bounties.isVerified, true),
      ),
    )
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
    .where(and(eq(bounties.creatorId, user.id), eq(bounties.isVerified, true)))
    .orderBy(desc(bounties.createdAt))
    .limit(20);

  const mergedOnNetworks = await db
    .select({ network: bounties.network })
    .from(contributions)
    .innerJoin(bounties, eq(contributions.bountyId, bounties.id))
    .where(
      and(
        eq(contributions.contributorId, user.id),
        eq(contributions.merged, true),
        eq(bounties.isVerified, true),
      ),
    );

  const networkSet = [
    ...new Set(mergedOnNetworks.map((entry) => entry.network)),
  ];

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
    tipping: {
      totalTipsSent: sentTipRows[0]?.totalTipsSent ?? '0',
      sentTipCount: sentTipRows[0]?.sentTipCount ?? 0,
      rankBadge: getTipperRank(sentTipRows[0]?.sentTipCount ?? 0),
    },
    recentContributions,
    createdBounties,
    earnedNetworks: networkSet,
  });
});

publicUsersRoute.get('/:username/tippers', async (c) => {
  const username = c.req.param('username');

  const userRows = await db
    .select({
      id: users.id,
      tippersPublic: users.tippersPublic,
    })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (userRows.length === 0) {
    return c.json({ error: 'User not found' }, 404);
  }

  const user = userRows[0];

  if (!user.tippersPublic) {
    return c.json({ isPublic: false, tippers: [] });
  }

  const rows = await db
    .select({
      userId: users.id,
      username: users.username,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      totalAmount: sql<string>`coalesce(sum(${transactionRecords.amount}), 0)`,
      tipCount: sql<number>`cast(count(*) as int)`,
      lastTippedAt: sql<Date | null>`max(${transactionRecords.createdAt})`,
    })
    .from(transactionRecords)
    .innerJoin(users, eq(users.id, transactionRecords.senderId))
    .where(eq(transactionRecords.recipientId, user.id))
    .groupBy(users.id, users.username, users.displayName, users.avatarUrl)
    .orderBy(
      desc(sql`coalesce(sum(${transactionRecords.amount}), 0)`),
      desc(sql`max(${transactionRecords.createdAt})`),
    )
    .limit(20);

  return c.json({
    isPublic: true,
    tippers: rows,
  });
});

export default publicUsersRoute;
