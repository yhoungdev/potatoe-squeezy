import { Hono } from 'hono';
import { db } from '../db';
import type { Env } from '../types/env';
import { and, asc, eq, inArray, or, sql } from 'drizzle-orm';
import { addresses, transactionRecords, users } from '../db/schema';
import type { User } from '../types';
import { getTipperRank } from '@potatoe/shared';
import communicationChannel from '../services/communication';

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

const normalizeEmail = (value: unknown) => {
  const raw = normalizeOptionalText(value);

  if (!raw) {
    return null;
  }

  const normalized = raw.toLowerCase();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailPattern.test(normalized) ? normalized : null;
};

const getUserTipTotals = async ({
  userId,
  walletAddresses,
}: {
  userId: number;
  walletAddresses: string[];
}) => {
  const [receivedRows, sentRows] = await Promise.all([
    db
      .select({
        totalTipsReceived: sql<string>`coalesce(sum(${transactionRecords.amount}), 0)`,
        receivedTipCount: sql<number>`cast(count(*) as int)`,
      })
      .from(transactionRecords)
      .where(
        or(
          eq(transactionRecords.recipientId, userId),
          walletAddresses.length > 0
            ? inArray(transactionRecords.recipientAddress, walletAddresses)
            : sql`false`,
        ),
      ),
    db
      .select({
        totalTipsSent: sql<string>`coalesce(sum(${transactionRecords.amount}), 0)`,
        sentTipCount: sql<number>`cast(count(*) as int)`,
      })
      .from(transactionRecords)
      .where(
        or(
          eq(transactionRecords.senderId, userId),
          walletAddresses.length > 0
            ? inArray(transactionRecords.senderAddress, walletAddresses)
            : sql`false`,
        ),
      ),
  ]);

  return {
    totalTipsReceived: receivedRows[0]?.totalTipsReceived ?? '0',
    totalTipsSent: sentRows[0]?.totalTipsSent ?? '0',
    totalTokensSent: sentRows[0]?.totalTipsSent ?? '0',
    sentTipCount: sentRows[0]?.sentTipCount ?? 0,
    receivedTipCount: receivedRows[0]?.receivedTipCount ?? 0,
    rankBadge: getTipperRank(sentRows[0]?.sentTipCount ?? 0),
  };
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

    const walletAddresses = userWallets.map((wallet) => wallet.address);
    const tipTotals = await getUserTipTotals({
      userId: user.id,
      walletAddresses,
    });

    return c.json({
      user,
      wallet: primaryWallet,
      wallets: userWallets,
      ...tipTotals,
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
      email?: string | null;
      twitterUrl?: string | null;
      tippersPublic?: boolean;
    }>();

    const updates: Partial<typeof users.$inferInsert> = {
      updatedAt: new Date(),
    };
    const displayName = normalizeOptionalText(body.displayName);
    const email = normalizeEmail(body.email);
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
      body.email !== undefined &&
      body.email !== null &&
      body.email.trim() !== '' &&
      email === null
    ) {
      return c.json({ error: 'Email must be a valid email address' }, 400);
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

    if (body.email !== undefined) {
      updates.email = email;
    }

    if (body.twitterUrl !== undefined) {
      updates.twitterUrl = twitterUrl;
    }

    if (body.tippersPublic !== undefined) {
      updates.tippersPublic = Boolean(body.tippersPublic);
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
    const walletAddresses = userWallets.map((wallet) => wallet.address);
    const tipTotals = await getUserTipTotals({
      userId: updated[0].id,
      walletAddresses,
    });

    if (updated[0].email) {
      void communicationChannel
        .sendProfileUpdatedEmail({
          user: {
            email: updated[0].email,
            username: updated[0].username,
            name: updated[0].name,
          },
          displayName: updated[0].displayName,
          twitterUrl: updated[0].twitterUrl,
          tippersPublic: updated[0].tippersPublic,
        })
        .catch((error) => {
          console.error('Failed to send profile updated email:', error);
        });
    }

    return c.json({
      user: updated[0],
      wallet: primaryWallet,
      wallets: userWallets,
      ...tipTotals,
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
