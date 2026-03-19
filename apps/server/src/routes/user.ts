import { Hono } from 'hono';
import { db } from '../db';
import type { Env } from '../types/env';
import { and, asc, eq } from 'drizzle-orm';
import { addresses, users } from '../db/schema';
import type { User } from '../types';

const userRoute = new Hono<{
  Bindings: Env;
  Variables: {
    user: User | null;
  };
}>();

const normalizeOptionalText = (value: unknown) => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const normalizeTwitterUrl = (value: unknown) => {
  const raw = normalizeOptionalText(value);

  if (!raw) {
    return null;
  }

  const handle = raw.replace(/^@/, '');
  if (/^[A-Za-z0-9_]{1,15}$/.test(handle)) {
    return `https://x.com/${handle}`;
  }

  try {
    const url = new URL(raw);
    const hostname = url.hostname.toLowerCase();
    const supportedHosts = new Set([
      'x.com',
      'www.x.com',
      'twitter.com',
      'www.twitter.com',
      'mobile.twitter.com',
    ]);

    if (!supportedHosts.has(hostname)) {
      return null;
    }

    const path = url.pathname.replace(/\/+$/, '');
    if (!/^\/[A-Za-z0-9_]{1,15}$/.test(path)) {
      return null;
    }

    return `https://x.com${path}`;
  } catch {
    return null;
  }
};

userRoute.get('/profile', async (c) => {
  try {
    const user = c.get('user');

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userWallets = await db
      .select()
      .from(addresses)
      .where(eq(addresses.userId, user.id))
      .orderBy(asc(addresses.chain), asc(addresses.id))
      .execute();

    const primaryWallet =
      userWallets.find((wallet) => wallet.chain === 'solana') ??
      userWallets[0] ??
      null;

    return c.json({
      user,
      wallet: primaryWallet,
      wallets: userWallets,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

userRoute.put('/profile', async (c) => {
  try {
    const user = c.get('user');

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json<{
      displayName?: string | null;
      twitterUrl?: string | null;
    }>();

    const updates: Partial<typeof users.$inferInsert> = {
      updatedAt: new Date(),
    };
    const displayName = normalizeOptionalText(body.displayName);
    const twitterUrl = normalizeTwitterUrl(body.twitterUrl);

    if (
      body.displayName !== undefined &&
      displayName !== null &&
      displayName.length > 80
    ) {
      return c.json(
        { error: 'Display name must be 80 characters or fewer' },
        400,
      );
    }

    if (
      body.twitterUrl !== undefined &&
      body.twitterUrl !== null &&
      body.twitterUrl.trim() !== '' &&
      twitterUrl === null
    ) {
      return c.json(
        {
          error: 'Twitter link must be a valid X/Twitter profile URL or handle',
        },
        400,
      );
    }

    if (body.displayName !== undefined) {
      updates.displayName = displayName;
    }

    if (body.twitterUrl !== undefined) {
      updates.twitterUrl = twitterUrl;
    }

    const updated = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, user.id))
      .returning();

    if (!updated[0]) {
      return c.json({ error: 'User not found' }, 404);
    }

    const userWallets = await db
      .select()
      .from(addresses)
      .where(eq(addresses.userId, updated[0].id))
      .orderBy(asc(addresses.chain), asc(addresses.id))
      .execute();

    const primaryWallet =
      userWallets.find((wallet) => wallet.chain === 'solana') ??
      userWallets[0] ??
      null;

    return c.json({
      user: updated[0],
      wallet: primaryWallet,
      wallets: userWallets,
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

userRoute.get('/all', async (c) => {
  try {
    const usersList = await db
      .select({
        users: {
          id: users.id,
          githubId: users.githubId,
          username: users.username,
          email: users.email,
          name: users.name,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
          twitterUrl: users.twitterUrl,
          network: users.network,
          walletAddress: users.walletAddress,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
        wallets: {
          id: addresses.id,
          userId: addresses.userId,
          chain: addresses.chain,
          address: addresses.address,
          createdAt: addresses.createdAt,
          updatedAt: addresses.updatedAt,
        },
      })
      .from(users)
      .leftJoin(
        addresses,
        and(eq(users.id, addresses.userId), eq(addresses.chain, 'solana')),
      )
      .execute();

    if (!usersList || usersList.length === 0) {
      return c.json({ error: 'No users found' }, 404);
    }

    return c.json(usersList);
  } catch (error) {
    console.error('Error fetching all users:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export { userRoute };
