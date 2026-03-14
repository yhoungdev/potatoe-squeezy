import { and, eq, inArray, sql } from 'drizzle-orm';
import { db } from '../db';
import {
  badges,
  contributions,
  developerStats,
  bounties,
  userBadges,
} from '../db/schema';

const BADGE_DEFINITIONS = [
  {
    name: 'First Merge',
    description: 'Completed first merged contribution',
  },
  {
    name: 'Ten Merges',
    description: 'Completed ten merged contributions',
  },
  {
    name: '7-Day Streak',
    description: 'Maintained a 7 day contribution streak',
  },
  {
    name: '$100 Earned',
    description: 'Earned at least $100 from bounties',
  },
  {
    name: 'Cross-Chain Earner',
    description: 'Earned rewards on Solana and Stellar',
  },
] as const;

export class BadgeService {
  async seedBadges() {
    for (const definition of BADGE_DEFINITIONS) {
      await db
        .insert(badges)
        .values({
          id: crypto.randomUUID(),
          name: definition.name,
          description: definition.description,
        })
        .onConflictDoNothing();
    }
  }

  async evaluateAndAssign(userId: number) {
    await this.seedBadges();

    const mergedRow = await db
      .select({
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(contributions)
      .where(
        and(
          eq(contributions.contributorId, userId),
          eq(contributions.merged, true),
        ),
      );

    const statsRow = await db
      .select({
        totalEarnedUSD: developerStats.totalEarnedUSD,
        consecutiveDays: developerStats.consecutiveDays,
      })
      .from(developerStats)
      .where(eq(developerStats.userId, userId));

    const networksRow = await db
      .select({
        count: sql<number>`cast(count(distinct ${bounties.network}) as int)`,
      })
      .from(contributions)
      .innerJoin(bounties, eq(contributions.bountyId, bounties.id))
      .where(
        and(
          eq(contributions.contributorId, userId),
          eq(contributions.merged, true),
        ),
      );

    const mergedCount = mergedRow[0]?.count ?? 0;
    const totalEarned = Number(statsRow[0]?.totalEarnedUSD ?? 0);
    const streak = Number(statsRow[0]?.consecutiveDays ?? 0);
    const networks = networksRow[0]?.count ?? 0;

    const earnedBadgeNames: string[] = [];

    if (mergedCount >= 1) {
      earnedBadgeNames.push('First Merge');
    }
    if (mergedCount >= 10) {
      earnedBadgeNames.push('Ten Merges');
    }
    if (streak >= 7) {
      earnedBadgeNames.push('7-Day Streak');
    }
    if (totalEarned >= 100) {
      earnedBadgeNames.push('$100 Earned');
    }
    if (networks >= 2) {
      earnedBadgeNames.push('Cross-Chain Earner');
    }

    if (earnedBadgeNames.length === 0) {
      return;
    }

    const badgeRows = await db
      .select({ id: badges.id, name: badges.name })
      .from(badges)
      .where(inArray(badges.name, earnedBadgeNames));

    for (const badge of badgeRows) {
      await db
        .insert(userBadges)
        .values({
          id: crypto.randomUUID(),
          userId,
          badgeId: badge.id,
        })
        .onConflictDoNothing();
    }
  }

  async getUserBadges(userId: number) {
    return db
      .select({
        id: badges.id,
        name: badges.name,
        description: badges.description,
        earnedAt: userBadges.earnedAt,
      })
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, userId));
  }

  async getBadgesForUsers(userIds: number[]) {
    if (userIds.length === 0) {
      return new Map<
        number,
        { id: string; name: string; description: string }[]
      >();
    }

    const rows = await db
      .select({
        userId: userBadges.userId,
        id: badges.id,
        name: badges.name,
        description: badges.description,
      })
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(inArray(userBadges.userId, userIds));

    const grouped = new Map<
      number,
      { id: string; name: string; description: string }[]
    >();

    for (const row of rows) {
      const existing = grouped.get(row.userId) ?? [];
      existing.push({
        id: row.id,
        name: row.name,
        description: row.description,
      });
      grouped.set(row.userId, existing);
    }

    return grouped;
  }
}
