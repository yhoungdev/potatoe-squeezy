import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { wallets } from '../db/schema';
import { auth } from '../middleware/auth';
import type { Env } from '../types/env';
import { validateSolanaAddress } from '@potatoe/shared';

const walletsRoute = new Hono<{ Bindings: Env }>();

walletsRoute.use('*', auth);

walletsRoute.post('/', async (c) => {
  try {
    const userId = c.get('userId') as number | string | undefined;
    const { address } = await c.req.json<{ address: string }>();

    if (!userId) {
      return c.json({ error: 'No userId in token' }, 401);
    }

    if (!address) {
      return c.json({ error: 'Wallet address is required' }, 400);
    }

    if (!validateSolanaAddress(address)) {
      return c.json({ error: 'Invalid Solana wallet address' }, 400);
    }

    const newWallet = await db
      .insert(wallets)
      .values({
        userId: Number(userId),
        address: address.trim(),
        updatedAt: new Date(),
      })
      .returning();

    return c.json(newWallet[0]);
  } catch (error) {
    console.error('Error adding wallet:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

walletsRoute.put('/', async (c) => {
  try {
    const userId = c.get('userId');
    const { walletId, address } = await c.req.json<{
      walletId: number;
      address: string;
    }>();

    if (!userId) {
      return c.json({ error: 'No userId in token' }, 401);
    }

    if (!walletId || !address) {
      return c.json({ error: 'Wallet ID and address are required' }, 400);
    }

    if (!validateSolanaAddress(address)) {
      return c.json({ error: 'Invalid Solana wallet address' }, 400);
    }

    const updatedWallet = await db
      .update(wallets)
      .set({
        address: address.trim(),
        updatedAt: new Date(),
      })
      .where(eq(wallets.id, walletId))
      .returning();

    if (!updatedWallet[0]) {
      return c.json({ error: 'Wallet not found' }, 404);
    }

    return c.json(updatedWallet[0]);
  } catch (error) {
    console.error('Error updating wallet:', error);
    return c.json({ error: 'Internal server error' }, 500);
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
      .from(wallets)
      .where(eq(wallets.userId, Number(userId)));

    return c.json(userWallets);
  } catch (error) {
    console.error('Error fetching wallets:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default walletsRoute;
