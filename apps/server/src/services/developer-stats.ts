import { and, eq } from 'drizzle-orm';
import { db } from '../db';
import { contributions, developerStats } from '../db/schema';
import { LeaderboardService } from './leaderboard';

const leaderboardService = new LeaderboardService();

const startOfDay = (value: Date) => {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
};

const isSameDay = (a: Date, b: Date) => {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
};

const isYesterday = (a: Date, b: Date) => {
  const diff = startOfDay(b).getTime() - startOfDay(a).getTime();
  return diff === 24 * 60 * 60 * 1000;
};

export class DeveloperStatsService {
  async updateAfterMerge(userId: number, earnedUsd: number) {
    const now = new Date();

    await db.transaction(async (tx) => {
      const existing = await tx
        .select()
        .from(developerStats)
        .where(eq(developerStats.userId, userId))
        .limit(1);

      if (existing.length === 0) {
        await tx.insert(developerStats).values({
          id: crypto.randomUUID(),
          userId,
          totalEarnedUSD: earnedUsd.toString(),
          totalTipsUSD: '0',
          bountiesCompleted: 1,
          consecutiveDays: 1,
          lastContributionDate: now,
          totalPoints: '0',
        });

        return;
      }

      const row = existing[0];
      const previousDate = row.lastContributionDate
        ? new Date(row.lastContributionDate)
        : null;

      let nextConsecutiveDays = Number(row.consecutiveDays ?? 0);

      if (!previousDate) {
        nextConsecutiveDays = 1;
      } else if (isSameDay(previousDate, now)) {
        nextConsecutiveDays = Number(row.consecutiveDays ?? 0);
      } else if (isYesterday(previousDate, now)) {
        nextConsecutiveDays = Number(row.consecutiveDays ?? 0) + 1;
      } else {
        nextConsecutiveDays = 1;
      }

      await tx
        .update(developerStats)
        .set({
          totalEarnedUSD: (Number(row.totalEarnedUSD ?? 0) + earnedUsd).toString(),
          bountiesCompleted: Number(row.bountiesCompleted ?? 0) + 1,
          consecutiveDays: nextConsecutiveDays,
          lastContributionDate: now,
          updatedAt: now,
        })
        .where(eq(developerStats.userId, userId));
    });

    await leaderboardService.calculateUserPoints(userId);
  }

  async getMergedCount(userId: number) {
    const rows = await db
      .select({ id: contributions.id })
      .from(contributions)
      .where(and(eq(contributions.contributorId, userId), eq(contributions.merged, true)));

    return rows.length;
  }
}
