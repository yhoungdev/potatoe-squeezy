import { Hono } from 'hono';
import { db } from '../db';
import { UserWithWallets } from '../types';
import { auth } from '../middleware/auth';
import type { Env } from '../types/env';
import { eq } from 'drizzle-orm';
import { users, wallets } from '../db/schema';
const userRoute = new Hono<{ Bindings: Env }>();

userRoute.get('/profile', auth, async (c) => {
  try {
    const userId = c.get('userId');

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(userId)))
      .leftJoin(wallets, eq(users.id, wallets.userId))
      .execute();

    if (!user || user.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json(user[0]);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

userRoute.get('/all', async (c) => {
  try {
    const usersList = await db
      .select()
      .from(users)
      .leftJoin(wallets, eq(users.id, wallets.userId))
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
