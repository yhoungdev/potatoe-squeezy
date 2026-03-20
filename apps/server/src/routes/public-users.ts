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
const SEARCH_CACHE_TTL_MS = 1000 * 60 * 10;
const USER_CACHE_TTL_MS = 1000 * 60 * 30;
const DISCOVER_QUERY = 'followers:>1000 repos:>20 sort:followers-desc';

type CachedValue<T> = {
  value: T;
  expiresAt: number;
};

type GitHubSearchItem = {
  login: string;
  avatar_url: string;
};

type GitHubUserDetail = {
  login: string;
  avatar_url: string;
  name: string | null;
  bio: string | null;
};

const githubSearchCache = new Map<string, CachedValue<GitHubUserDetail[]>>();
const githubUserCache = new Map<string, CachedValue<GitHubUserDetail>>();

const getCachedValue = <T>(cache: Map<string, CachedValue<T>>, key: string) => {
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }

  return entry.value;
};

const setCachedValue = <T>(
  cache: Map<string, CachedValue<T>>,
  key: string,
  value: T,
  ttlMs: number,
) => {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
};

const getGitHubHeaders = () => {
  const token =
    process.env.GITHUB_BOT_TOKEN ||
    process.env.GITHUB_APP_TOKEN ||
    process.env.GITHUB_TOKEN;

  return {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'potatoe-squeezy',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const fetchGitHubUserDetail = async (login: string) => {
  const cached = getCachedValue(githubUserCache, login.toLowerCase());

  if (cached) {
    return cached;
  }

  const response = await fetch(`https://api.github.com/users/${login}`, {
    headers: getGitHubHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch GitHub user ${login}`);
  }

  const data = (await response.json()) as GitHubUserDetail;
  const normalized = {
    login: data.login,
    avatar_url: data.avatar_url,
    name: data.name,
    bio: data.bio,
  };

  setCachedValue(
    githubUserCache,
    login.toLowerCase(),
    normalized,
    USER_CACHE_TTL_MS,
  );

  return normalized;
};

publicUsersRoute.get('/github/search', async (c) => {
  const q = c.req.query('q')?.trim() ?? '';
  const limitRaw = c.req.query('limit');
  const limit = Math.min(Math.max(Number(limitRaw ?? 10), 1), 20);
  const effectiveQuery = q || DISCOVER_QUERY;
  const cacheKey = `${effectiveQuery.toLowerCase()}:${limit}`;
  const cached = getCachedValue(githubSearchCache, cacheKey);

  if (cached) {
    return c.json(cached);
  }

  try {
    const searchResponse = await fetch(
      `https://api.github.com/search/users?q=${encodeURIComponent(
        effectiveQuery,
      )}&per_page=${limit}`,
      {
        headers: getGitHubHeaders(),
      },
    );

    if (!searchResponse.ok) {
      const message =
        searchResponse.status === 403
          ? 'GitHub rate limit reached. Please try again shortly.'
          : 'Failed to fetch GitHub users';
      return c.json({ error: message }, searchResponse.status);
    }

    const searchResult = (await searchResponse.json()) as {
      items?: GitHubSearchItem[];
    };

    const users = await Promise.all(
      (searchResult.items ?? []).map((item) =>
        fetchGitHubUserDetail(item.login),
      ),
    );

    setCachedValue(githubSearchCache, cacheKey, users, SEARCH_CACHE_TTL_MS);

    return c.json(users);
  } catch (error) {
    console.error('Error fetching GitHub users:', error);
    return c.json({ error: 'Failed to fetch GitHub users' }, 500);
  }
});

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
