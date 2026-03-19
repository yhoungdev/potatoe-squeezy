import { Hono } from 'hono';
import { and, asc, eq } from 'drizzle-orm';
import { db } from '../db';
import { addresses, users } from '../db/schema';
import { auth } from '../middleware/auth';
import type { Env } from '../types/env';
import { validateWalletAddress } from '@potatoe/shared';

const walletsRoute = new Hono<{ Bindings: Env }>();

walletsRoute.use('*', auth);

const normalizeChain = (value: unknown) =>
  String(value ?? '')
    .trim()
    .toLowerCase();

const syncPrimaryWallet = async (userId: number) => {
  const rows = await db
    .select({
      chain: addresses.chain,
      address: addresses.address,
    })
    .from(addresses)
    .where(eq(addresses.userId, userId))
    .orderBy(asc(addresses.chain), asc(addresses.id));

  const primary =
    rows.find((wallet) => wallet.chain === 'solana') ?? rows[0] ?? null;

  await db
    .update(users)
    .set({
      network: primary?.chain ?? null,
      walletAddress: primary?.address ?? null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  return primary;
};

const upsertWallet = async ({
  userId,
  chain,
  address,
}: {
  userId: number;
  chain: string;
  address: string;
}) => {
  const normalizedChain = normalizeChain(chain);
  const normalizedAddress = address.trim();

  if (!normalizedChain || !normalizedAddress) {
    throw new Error('Wallet chain and address are required');
  }

  if (!validateWalletAddress(normalizedChain, normalizedAddress)) {
    throw new Error(`Invalid ${normalizedChain} wallet address`);
  }

  const existing = await db
    .select()
    .from(addresses)
    .where(
      and(eq(addresses.userId, userId), eq(addresses.chain, normalizedChain)),
    )
    .limit(1);

  let wallet;

  if (existing[0]) {
    const updated = await db
      .update(addresses)
      .set({
        address: normalizedAddress,
        updatedAt: new Date(),
      })
      .where(eq(addresses.id, existing[0].id))
      .returning();

    wallet = updated[0];
  } else {
    const inserted = await db
      .insert(addresses)
      .values({
        userId,
        chain: normalizedChain,
        address: normalizedAddress,
        updatedAt: new Date(),
      })
      .returning();

    wallet = inserted[0];
  }

  await syncPrimaryWallet(userId);

  return wallet;
};

walletsRoute.post('/', async (c) => {
  try {
    const userId = c.get('userId') as number | string | undefined;
    const { chain, address } = await c.req.json<{
      chain: string;
      address: string;
    }>();

    if (!userId) {
      return c.json({ error: 'No userId in token' }, 401);
    }

    const wallet = await upsertWallet({
      userId: Number(userId),
      chain,
      address,
    });

    return c.json(wallet);
  } catch (error) {
    console.error('Error adding wallet:', error);
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      error instanceof Error &&
        (error.message.startsWith('Invalid') ||
          error.message.includes('required'))
        ? 400
        : 500,
    );
  }
});

walletsRoute.put('/', async (c) => {
  try {
    const userId = c.get('userId') as number | string | undefined;
    const { chain, address } = await c.req.json<{
      chain: string;
      address: string;
    }>();

    if (!userId) {
      return c.json({ error: 'No userId in token' }, 401);
    }

    const wallet = await upsertWallet({
      userId: Number(userId),
      chain,
      address,
    });

    return c.json(wallet);
  } catch (error) {
    console.error('Error updating wallet:', error);
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      error instanceof Error &&
        (error.message.startsWith('Invalid') ||
          error.message.includes('required'))
        ? 400
        : 500,
    );
  }
});

walletsRoute.get('/user', async (c) => {
  try {
    const userId = c.get('userId');

    if (!userId) {
      return c.json({ error: 'No userId in token' }, 401);
    }

    const userWallets = await db
      .select()
      .from(addresses)
      .where(eq(addresses.userId, Number(userId)))
      .orderBy(asc(addresses.chain), asc(addresses.id));

    return c.json(userWallets);
  } catch (error) {
    console.error('Error fetching wallets:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default walletsRoute;
