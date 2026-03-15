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
import { TELEGRAM_CHAT_ID } from './constants';
import { launchBot, telegram_bot } from './config/telegraf';
const telegram_bot_config = { launchBot, telegram_bot };

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
    origin: process.env.FRONTEND_APP_URL || 'http://localhost:5173',
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

app.on(['POST', 'GET'], '/api/auth/*', (c) => {
  return auth.handler(c.req.raw);
});

app.get('/auth/callback', (c) => {
  const url = new URL(c.req.url);
  url.pathname = '/api/auth/callback/github';
  return c.redirect(url.toString());
});

app.get('/callback/:provider', async (c) => {
  const provider = c.req.param('provider');
  const query = c.req.query();
  const searchParams = new URLSearchParams(query);
  const redirectUrl = `/api/auth/callback/${provider}?${searchParams.toString()}`;
  return c.redirect(redirectUrl);
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
