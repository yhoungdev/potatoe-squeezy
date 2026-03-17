import { Hono } from 'hono';
import { db } from '../db';
import type { Env } from '../types/env';
import { eq } from 'drizzle-orm';
import { users, wallets } from '../db/schema';
import type { User } from '../types';

const userRoute = new Hono<{
  Bindings: Env;
  Variables: {
    user: User | null;
  };
}>();

userRoute.get('/profile', async (c) => {
  try {
    const user = c.get('user');

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userWallets = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, user.id))
      .execute();

    return c.json({
      user,
      wallet: userWallets[0] || null,
    });
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
