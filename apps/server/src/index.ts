import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { auth } from './auth';
import walletsRoute from './routes/wallets';
import txRecordsRoute from './routes/tx-records';
import { db } from './db';
import { sql } from 'drizzle-orm';
import type { Env } from './types/env';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { userRoute } from './routes/user';
import leaderboardRoute from './routes/leaderboard';
import publicUsersRoute from './routes/public-users';
import bountiesRoute from './routes/bounties';
import githubWebhookRoute from './routes/github-webhook';
import docsRoute from './routes/docs';
import { sendTelegramMessage } from './utils/telegram-notification';
import { TELEGRAM_CHAT_ID, FRONTEND_APP_URL } from './constants';
import { launchBot, telegram_bot } from './config/telegraf';
const telegram_bot_config = { launchBot, telegram_bot };

import { sign } from 'hono/jwt';

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
  Bindings: Env;
}>();

app.use(logger());
app.use(prettyJSON());

app.use(
  '*',
  cors({
    origin: (origin) => {
      const normalizeOrigin = (value: string) => {
        try {
          return new URL(value).origin;
        } catch {
          return value;
        }
      };

      const allowedOrigins = new Set(
        [
          process.env.FRONTEND_APP_URL
            ? normalizeOrigin(process.env.FRONTEND_APP_URL)
            : null,
          'https://www.potatosqueezy.xyz',
          'https://potatosqueezy.xyz',
          'http://localhost:5173',
          'http://127.0.0.1:5173',
          'http://localhost:4173',
          'http://localhost:4174',
        ].filter(Boolean) as string[],
      );

      if (!origin) return '*';
      const normalized = normalizeOrigin(origin);
      return allowedOrigins.has(normalized) ? origin : null;
    },
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  }),
);

app.use('*', async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set('user', null);
    c.set('session', null);
  } else {
    c.set('user', session.user);
    c.set('session', session.session);
  }

  c.env = {
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID!,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET!,
    JWT_SECRET: process.env.JWT_SECRET!,
    DB: db,
  };
  await next();
});

app.on(['POST', 'GET'], '/api/auth/*', async (c) => {
  const res = await auth.handler(c.req.raw);

  if (res.status === 302) {
    const location = res.headers.get('Location');
    if (
      location &&
      (location === FRONTEND_APP_URL ||
        location.startsWith(FRONTEND_APP_URL + '/'))
    ) {
      const session = await auth.api.getSession({ headers: res.headers });

      if (session?.user) {
        const token = await sign(
          {
            userId: session.user.id,
            email: session.user.email,
          },
          process.env.JWT_SECRET!,
        );

        const url = new URL(location);
        url.searchParams.set('token', token);

        const newRes = c.redirect(url.toString());

        res.headers.forEach((value, key) => {
          if (key.toLowerCase() === 'set-cookie') {
            newRes.headers.append(key, value);
          }
        });
        return newRes;
      }
    }
  }
  return res;
});

app.get('/auth/callback', (c) => {
  const url = new URL(c.req.url);
  url.pathname = '/api/auth/callback/github';
  return c.redirect(url.toString());
});

app.get('/auth/github', async (c) => {
  const frontend = process.env.FRONTEND_APP_URL || 'http://localhost:5173';
  const callbackURL = `${new URL(frontend).origin}/app`;
  const errorCallbackURL = `${new URL(frontend).origin}/status/error`;

  const internalReq = new Request(
    new URL('/api/auth/sign-in/social', c.req.url),
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'github',
        callbackURL,
        newUserCallbackURL: callbackURL,
        errorCallbackURL,
      }),
    },
  );

  const res = await auth.handler(internalReq);

  if (!res.ok) {
    return res;
  }

  const data = (await res.json()) as { url?: string };
  if (!data?.url) {
    return c.json({ error: 'Missing OAuth redirect URL' }, 500);
  }

  const redirectRes = c.redirect(data.url);
  res.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') {
      redirectRes.headers.append(key, value);
    }
  });
  return redirectRes;
});

app.get('/callback/:provider', async (c) => {
  const provider = c.req.param('provider');
  const query = c.req.query();

  if (!query.code || !query.state) {
    return c.redirect(`${FRONTEND_APP_URL}/app`);
  }

  const callbackUrl = new URL(`/api/auth/callback/${provider}`, c.req.url);
  callbackUrl.search = new URLSearchParams(query).toString();

  const internalReq = new Request(callbackUrl, {
    method: 'GET',
    headers: c.req.raw.headers,
  });

  return await auth.handler(internalReq);
});

const PORT = process.env.PORT || 3000;

app.get('/status/error', (c) => {
  const state = c.req.query('state');
  return c.json({ error: 'Authentication failed', state }, 400);
});

app.get('/', (c) => {
  sendTelegramMessage(TELEGRAM_CHAT_ID, 'Potatoe API is up and running!');
  return c.json({
    name: 'Potatoe GitHub Users API',
    version: '1.0.0',
    description: '⚡ Instantly tip developers with SOL for their contributions',
  });
});

app.get('/db-test', async (c) => {
  try {
    const result = await c.env.DB.query(sql`SELECT NOW()`);
    return c.json({
      status: 'Connected',
      timestamp: result[0].now,
      message: 'Database connection successful!',
    });
  } catch (error) {
    return c.json(
      {
        status: 'Error',

        message:
          error instanceof Error ? error.message : 'An unknown error occurred',
      },
      500,
    );
  }
});

const routes = [
  { path: '/wallet', handler: walletsRoute },
  { path: '/user', handler: userRoute },
  { path: '/tx-records', handler: txRecordsRoute },
  { path: '/leaderboard', handler: leaderboardRoute },
  { path: '/users', handler: publicUsersRoute },
  { path: '/bounties', handler: bountiesRoute },
  { path: '/github', handler: githubWebhookRoute },
  { path: '/docs', handler: docsRoute },
];

routes.forEach(({ path, handler }) => {
  //@ts-ignore
  app.route(path, handler);
});

launchBot();
logger();

export default {
  port: Number(PORT),
  fetch: app.fetch,
};
