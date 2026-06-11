import { Hono } from 'hono';
import { upgradeWebSocket, websocket } from 'hono/bun';
import { cors } from 'hono/cors';
import walletsRoute from './routes/wallets';
import txRecordsRoute from './routes/tx-records';
import { db } from './db';
import { eq, sql } from 'drizzle-orm';
import type { Env } from './types/env';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { userRoute } from './routes/user';
import leaderboardRoute from './routes/leaderboard';
import publicUsersRoute from './routes/public-users';
import bountiesRoute from './routes/bounties';
import githubWebhookRoute from './routes/github-webhook';
import docsRoute from './routes/docs';
import notificationsRoute from './routes/notifications';
import { authRouter } from './routes/auth';
import { sendTelegramMessage } from './utils/telegram-notification';
import { TELEGRAM_CHAT_ID } from './constants';
import { launchBot, telegram_bot } from './config/telegraf';
import type { User } from './types';
import { users } from './db/schema';
import { verify } from 'hono/jwt';
import {
  addNotificationSocket,
  removeNotificationSocket,
} from './services/realtime-notifications';
const telegram_bot_config = { launchBot, telegram_bot };

const normalizeOrigin = (value: string) => {
  try {
    return new URL(value).origin;
  } catch {
    return value;
  }
};

const allowedFrontendOrigins = new Set(
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

const app = new Hono<{
  Variables: {
    user: User | null;
  };
  Bindings: Env;
}>();

app.use(logger());
app.use(prettyJSON());

app.use('*', async (c, next) => {
  if (c.req.path.startsWith('/ws/')) {
    await next();
    return;
  }

  return cors({
    origin: (origin) => {
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
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: false,
  })(c, next);
});

const parseBearerToken = (header: string | undefined) => {
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
};

app.use('*', async (c, next) => {
  const token =
    parseBearerToken(c.req.header('authorization')) || c.req.query('token');
  if (!token) {
    c.set('user', null);
  } else {
    try {
      const payload = (await verify(
        token,
        process.env.JWT_SECRET!,
        'HS256',
      )) as Record<string, unknown>;
      const userId = Number(payload.userId);
      if (!Number.isFinite(userId)) {
        c.set('user', null);
      } else {
        const rows = await db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);
        c.set('user', rows[0] ?? null);
      }
    } catch {
      c.set('user', null);
    }
  }

  Object.assign(c.env, {
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID!,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET!,
    JWT_SECRET: process.env.JWT_SECRET!,
    DB: db,
  });
  await next();
});

app.get(
  '/ws/notifications',
  upgradeWebSocket((c) => {
    const user = c.get('user');
    const userId = user?.id ?? null;

    return {
      onOpen(_event, ws) {
        if (!userId) {
          ws.close(1008, 'Unauthorized');
          return;
        }

        addNotificationSocket(userId, ws);
      },
      onClose(_event, ws) {
        if (!userId) {
          return;
        }

        removeNotificationSocket(userId, ws);
      },
      onError(_event, ws) {
        if (!userId) {
          return;
        }

        removeNotificationSocket(userId, ws);
      },
    };
  }),
);

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
  { path: '/auth', handler: authRouter },
  { path: '/wallet', handler: walletsRoute },
  { path: '/user', handler: userRoute },
  { path: '/notifications', handler: notificationsRoute },
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
  websocket,
};
