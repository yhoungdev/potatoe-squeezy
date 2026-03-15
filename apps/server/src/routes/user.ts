import { Hono } from 'hono';
import { db } from '../db';
import type { Env } from '../types/env';
import { eq } from 'drizzle-orm';
import { users, wallets } from '../db/schema';
import { auth } from '../lib/better-auth/auth';
import { sign } from 'hono/jwt';

const userRoute = new Hono<{
  Bindings: Env;
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

userRoute.get('/profile', async (c) => {
  try {
    const authUser = c.get('user');
    const session = c.get('session');

    if (!authUser) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const token = await sign(
      {
        userId: authUser.id,
        email: authUser.email,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
      },
      process.env.JWT_SECRET!,
    );

    const userRecord = await db
      .select()
      .from(users)
      .where(eq(users.githubId, authUser.id))
      .limit(1)
      .execute();

    if (userRecord.length === 0) {
      if (authUser.email) {
        const userByEmail = await db
          .select()
          .from(users)
          .where(eq(users.email, authUser.email))
          .limit(1)
          .execute();

        if (userByEmail.length > 0) {
          userRecord.push(userByEmail[0]);
        }
      }
    }

    if (userRecord.length === 0) {
      return c.json({ error: 'User profile not found in database' }, 404);
    }

    const userData = userRecord[0];

    const userWallets = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, userData.id))
      .execute();

    return c.json({
      user: userData,
      wallet: userWallets[0] || null,
      session,
      token,
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
