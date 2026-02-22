import { and, desc, eq, gte, sql } from 'drizzle-orm';
import { db } from '../db';
import { bounties, contributions, developerStats, users } from '../db/schema';
import { BadgeService } from './badges';
import { toUsd } from './pricing';

const badgeService = new BadgeService();

type LeaderboardUser = {
  userId: number;
  username: string;
  avatarUrl: string | null;
  totalPoints: number;
  totalEarnedUSD: number;
  mergedPRCount: number;
  consecutiveDays: number;
  difficultySum: number;
  badges: { id: string; name: string; description: string }[];
};

const withRank = (rows: LeaderboardUser[]) => {
  return rows.map((row, index) => ({
    rank: index + 1,
    ...row,
  }));
};

export class LeaderboardService {
  async calculateUserPoints(userId: number) {
    const statsRow = await db
      .select({
        totalEarnedUSD: developerStats.totalEarnedUSD,
        consecutiveDays: developerStats.consecutiveDays,
      })
      .from(developerStats)
      .where(eq(developerStats.userId, userId));

    const contributionRow = await db
      .select({
        mergedCount: sql<number>`cast(count(*) as int)`,
        difficultySum: sql<number>`cast(coalesce(sum(${contributions.difficulty}), 0) as int)`,
      })
      .from(contributions)
      .where(and(eq(contributions.contributorId, userId), eq(contributions.merged, true)));

    const earningsUSD = Number(statsRow[0]?.totalEarnedUSD ?? 0);
    const consecutiveDays = Number(statsRow[0]?.consecutiveDays ?? 0);
    const mergedPRCount = contributionRow[0]?.mergedCount ?? 0;
    const difficultySum = contributionRow[0]?.difficultySum ?? 0;

    const points = earningsUSD + difficultySum * 10 + consecutiveDays * 5 + mergedPRCount * 2;

    await db
      .update(developerStats)
      .set({
        totalPoints: points.toString(),
        updatedAt: new Date(),
      })
      .where(eq(developerStats.userId, userId));

    return points;
  }

  async getGlobalLeaderboard(limit: number) {
    const rows = await db
      .select({
        userId: users.id,
        username: users.username,
        avatarUrl: users.avatarUrl,
        totalEarnedUSD: developerStats.totalEarnedUSD,
        totalPoints: developerStats.totalPoints,
        consecutiveDays: developerStats.consecutiveDays,
      })
      .from(users)
      .leftJoin(developerStats, eq(users.id, developerStats.userId))
      .orderBy(desc(developerStats.totalPoints), desc(developerStats.totalEarnedUSD))
      .limit(limit);

    const aggregateRows = await db
      .select({
        userId: contributions.contributorId,
        mergedPRCount: sql<number>`cast(count(*) as int)`,
        difficultySum: sql<number>`cast(coalesce(sum(${contributions.difficulty}), 0) as int)`,
      })
      .from(contributions)
      .where(eq(contributions.merged, true))
      .groupBy(contributions.contributorId);

    const aggregateMap = new Map<number, { mergedPRCount: number; difficultySum: number }>();
    for (const row of aggregateRows) {
      aggregateMap.set(row.userId, {
        mergedPRCount: row.mergedPRCount,
        difficultySum: row.difficultySum,
      });
    }

    const userIds = rows.map((row) => row.userId);
    const badgesByUser = await badgeService.getBadgesForUsers(userIds);

    const leaderboardRows = rows.map((row) => {
      const aggregate = aggregateMap.get(row.userId);
      return {
        userId: row.userId,
        username: row.username,
        avatarUrl: row.avatarUrl,
        totalPoints: Number(row.totalPoints ?? 0),
        totalEarnedUSD: Number(row.totalEarnedUSD ?? 0),
        mergedPRCount: aggregate?.mergedPRCount ?? 0,
        consecutiveDays: Number(row.consecutiveDays ?? 0),
        difficultySum: aggregate?.difficultySum ?? 0,
        badges: badgesByUser.get(row.userId) ?? [],
      };
    });

    return withRank(leaderboardRows);
  }

  async getWeeklyLeaderboard(limit: number) {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const rows = await db
      .select({
        userId: users.id,
        username: users.username,
        avatarUrl: users.avatarUrl,
        consecutiveDays: developerStats.consecutiveDays,
        difficulty: contributions.difficulty,
        token: bounties.token,
        amount: bounties.amount,
      })
      .from(contributions)
      .innerJoin(users, eq(contributions.contributorId, users.id))
      .innerJoin(bounties, eq(contributions.bountyId, bounties.id))
      .leftJoin(developerStats, eq(users.id, developerStats.userId))
      .where(and(eq(contributions.merged, true), gte(contributions.createdAt, since)));

    const grouped = new Map<number, LeaderboardUser>();

    for (const row of rows) {
      const existing = grouped.get(row.userId) ?? {
        userId: row.userId,
        username: row.username,
        avatarUrl: row.avatarUrl,
        totalPoints: 0,
        totalEarnedUSD: 0,
        mergedPRCount: 0,
        consecutiveDays: Number(row.consecutiveDays ?? 0),
        difficultySum: 0,
        badges: [],
      };

      existing.mergedPRCount += 1;
      existing.difficultySum += Number(row.difficulty ?? 0);
      existing.totalEarnedUSD += toUsd(Number(row.amount ?? 0), row.token);
      grouped.set(row.userId, existing);
    }

    const leaderboardRows = Array.from(grouped.values()).map((row) => {
      const totalPoints =
        row.totalEarnedUSD +
        row.difficultySum * 10 +
        row.consecutiveDays * 5 +
        row.mergedPRCount * 2;

      return {
        ...row,
        totalPoints,
      };
    });

    leaderboardRows.sort((a, b) => b.totalPoints - a.totalPoints);

    const sliced = leaderboardRows.slice(0, limit);
    const badgesByUser = await badgeService.getBadgesForUsers(
      sliced.map((row) => row.userId),
    );

    const enriched = sliced.map((row) => ({
      ...row,
      badges: badgesByUser.get(row.userId) ?? [],
    }));

    return withRank(enriched);
  }

  async getStreakLeaderboard(limit: number) {
    const rows = await db
      .select({
        userId: users.id,
        username: users.username,
        avatarUrl: users.avatarUrl,
        totalEarnedUSD: developerStats.totalEarnedUSD,
        totalPoints: developerStats.totalPoints,
        consecutiveDays: developerStats.consecutiveDays,
      })
      .from(developerStats)
      .innerJoin(users, eq(developerStats.userId, users.id))
      .orderBy(desc(developerStats.consecutiveDays), desc(developerStats.totalPoints))
      .limit(limit);

    const aggregateRows = await db
      .select({
        userId: contributions.contributorId,
        mergedPRCount: sql<number>`cast(count(*) as int)`,
        difficultySum: sql<number>`cast(coalesce(sum(${contributions.difficulty}), 0) as int)`,
      })
      .from(contributions)
      .where(eq(contributions.merged, true))
      .groupBy(contributions.contributorId);

    const aggregateMap = new Map<number, { mergedPRCount: number; difficultySum: number }>();
    for (const row of aggregateRows) {
      aggregateMap.set(row.userId, {
        mergedPRCount: row.mergedPRCount,
        difficultySum: row.difficultySum,
      });
    }

    const badgesByUser = await badgeService.getBadgesForUsers(rows.map((row) => row.userId));

    const leaderboardRows = rows.map((row) => ({
      userId: row.userId,
      username: row.username,
      avatarUrl: row.avatarUrl,
      totalPoints: Number(row.totalPoints ?? 0),
      totalEarnedUSD: Number(row.totalEarnedUSD ?? 0),
      mergedPRCount: aggregateMap.get(row.userId)?.mergedPRCount ?? 0,
      consecutiveDays: Number(row.consecutiveDays ?? 0),
      difficultySum: aggregateMap.get(row.userId)?.difficultySum ?? 0,
      badges: badgesByUser.get(row.userId) ?? [],
    }));

    return withRank(leaderboardRows);
  }
}
