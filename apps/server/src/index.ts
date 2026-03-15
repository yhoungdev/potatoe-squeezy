import { Hono } from 'hono';
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
import { TELEGRAM_CHAT_ID } from './constants';
import { launchBot, telegram_bot } from './config/telegraf';
import { auth } from './lib/better-auth/auth';

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
  Bindings: Env;
}>();

app.use(logger());
app.use(prettyJSON());

const varyAppend = (value: string | null, item: string) => {
  if (!value) return item;
  const parts = value
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.some((p) => p.toLowerCase() === item.toLowerCase())) return value;
  return `${value}, ${item}`;
};

app.use('*', async (c, next) => {
  const origin = c.req.header('Origin');
  const requestHeaders = c.req.header('Access-Control-Request-Headers');

  if (origin) {
    c.header('Access-Control-Allow-Origin', origin);
    c.header('Access-Control-Allow-Credentials', 'true');
    c.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    c.header(
      'Access-Control-Allow-Headers',
      requestHeaders || 'Content-Type, Authorization',
    );
    c.header('Access-Control-Max-Age', '600');
    c.header('Vary', varyAppend(c.res.headers.get('Vary'), 'Origin'));
  }

  if (c.req.method === 'OPTIONS') {
    return c.body(null, 204);
  }

  await next();

  if (origin) {
    c.res.headers.set('Access-Control-Allow-Origin', origin);
    c.res.headers.set('Access-Control-Allow-Credentials', 'true');
    c.res.headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    c.res.headers.set(
      'Access-Control-Allow-Headers',
      requestHeaders || 'Content-Type, Authorization',
    );
    c.res.headers.set('Access-Control-Max-Age', '600');
    c.res.headers.set('Vary', varyAppend(c.res.headers.get('Vary'), 'Origin'));
  }
});

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
  const origin = c.req.header('Origin');
  const requestHeaders = c.req.header('Access-Control-Request-Headers');
  const res = await auth.handler(c.req.raw);

  if (!origin) return res;

  const headers = new Headers(res.headers);
  headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Access-Control-Allow-Credentials', 'true');
  headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  headers.set(
    'Access-Control-Allow-Headers',
    requestHeaders || 'Content-Type, Authorization',
  );
  headers.set('Access-Control-Max-Age', '600');
  headers.set('Vary', varyAppend(headers.get('Vary'), 'Origin'));

  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
});

// Compatibility route: allow GitHub redirect URIs like `/callback/github` while
// Better Auth is mounted under `/api/auth/*`.
app.get('/callback/:provider', async (c) => {
  const provider = c.req.param('provider');
  const url = new URL(c.req.url);
  url.pathname = `/api/auth/callback/${provider}`;

  const res = await auth.handler(
    new Request(url.toString(), {
      method: 'GET',
      headers: c.req.raw.headers,
    }),
  );

  return res;
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

export default app;
