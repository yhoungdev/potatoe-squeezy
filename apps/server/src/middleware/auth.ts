import { Context, Next } from 'hono';
import { verify } from 'hono/jwt';
import type { Env } from '../types/env';

export const auth = async (c: Context<{ Bindings: Env }>, next: Next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = await verify(token, c.env.JWT_SECRET, 'HS256');

    const userId = (payload as any).userId ?? (payload as any).sub;

    if (!userId) {
      return c.json({ error: 'Invalid token payload' }, 401);
    }

    c.set('user', payload);
    c.set('userId', userId);

    await next();
  } catch (error: any) {
    console.error('Token Verification Error:', error);
    return c.json({ error: 'Invalid token', details: error.message }, 401);
  }
};
