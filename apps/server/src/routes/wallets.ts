import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { wallets } from '../db/schema';

const walletsRoute = new Hono();

walletsRoute.post('/', async (c) => {
  try {
    const { userId, address } = await c.req.json();

    if (!userId || !address) {
      return c.json({ error: 'User ID and wallet address are required' }, 400);
    }

    const newWallet = await db.insert(wallets)
      .values({
        userId,
        address,
        updatedAt: new Date(),
      })
      .returning();

    return c.json(newWallet[0]);
  } catch (error) {
    console.error('Error adding wallet:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

walletsRoute.get('/user/:userId', async (c) => {
  try {
    const userId = parseInt(c.req.param('userId'));
    const userWallets = await db.query.wallets.findMany({
      where: eq(wallets.userId, userId),
    });
    
    return c.json(userWallets);
  } catch (error) {
    console.error('Error fetching wallets:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default walletsRoute;