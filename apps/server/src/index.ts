import { Hono } from 'hono';
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
import { sendTelegramMessage } from './utils/telegram-notification';
import { TELEGRAM_CHAT_ID, FRONTEND_APP_URL } from './constants';
import { launchBot, telegram_bot } from './config/telegraf';
import type { User } from './types';
import { users } from './db/schema';
import { sign, verify } from 'hono/jwt';
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
    process.env.FRONTEND_APP_URL ? normalizeOrigin(process.env.FRONTEND_APP_URL) : null,
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

app.use(
  '*',
  cors({
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
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: false,
  }),
);

const parseBearerToken = (header: string | undefined) => {
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
};

app.use('*', async (c, next) => {
  const token = parseBearerToken(c.req.header('authorization'));
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

  c.env = {
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID!,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET!,
    JWT_SECRET: process.env.JWT_SECRET!,
    DB: db,
  };
  await next();
});

app.get('/auth/github', async (c) => {
  const githubClientId = process.env.GITHUB_CLIENT_ID;

  if (!githubClientId) {
    return c.json({ error: 'Missing GitHub client ID' }, 500);
  }

  const frontend = process.env.FRONTEND_APP_URL || 'http://localhost:5173';
  const frontendOrigin = new URL(frontend).origin;
  const callbackURL = c.req.query('callbackURL') || `${frontendOrigin}/app`;
  const errorCallbackURL =
    c.req.query('errorCallbackURL') || `${frontendOrigin}/status/error`;

  let callbackOrigin: string | null = null;
  let errorOrigin: string | null = null;
  try {
    callbackOrigin = new URL(callbackURL).origin;
  } catch {}
  try {
    errorOrigin = new URL(errorCallbackURL).origin;
  } catch {}

  if (
    !callbackOrigin ||
    !errorOrigin ||
    !allowedFrontendOrigins.has(callbackOrigin) ||
    !allowedFrontendOrigins.has(errorOrigin)
  ) {
    return c.json({ error: 'Invalid callback origin' }, 400);
  }

  const apiOrigin = new URL(c.req.url).origin;
  const redirectURI =
    process.env.GITHUB_REDIRECT_URI || `${apiOrigin}/callback/github`;

  const state = await sign(
    {
      callbackURL,
      errorCallbackURL,
      nonce:
        (globalThis.crypto as Crypto | undefined)?.randomUUID?.() ||
        Math.random().toString(16).slice(2),
      exp: Math.floor(Date.now() / 1000) + 60 * 10,
    },
    process.env.JWT_SECRET!,
    'HS256',
  );

  const authorizeUrl = new URL('https://github.com/login/oauth/authorize');
  authorizeUrl.searchParams.set('client_id', githubClientId);
  authorizeUrl.searchParams.set('redirect_uri', redirectURI);
  authorizeUrl.searchParams.set('scope', 'read:user user:email');
  authorizeUrl.searchParams.set('state', state);

  return c.redirect(authorizeUrl.toString());
});

app.get('/callback/github', async (c) => {
  const code = c.req.query('code');
  const state = c.req.query('state');

  const defaultErrorURL = (() => {
    try {
      const origin = new URL(process.env.FRONTEND_APP_URL || FRONTEND_APP_URL)
        .origin;
      return `${origin}/status/error`;
    } catch {
      return `${FRONTEND_APP_URL}/status/error`;
    }
  })();

  if (!code || !state) {
    return c.redirect(defaultErrorURL);
  }

  let statePayload: Record<string, unknown>;
  try {
    statePayload = (await verify(
      state,
      process.env.JWT_SECRET!,
      'HS256',
    )) as Record<string, unknown>;
  } catch {
    const url = new URL(defaultErrorURL);
    url.searchParams.set('error', 'state_mismatch');
    return c.redirect(url.toString());
  }

  const callbackURL = String(statePayload.callbackURL || '');
  const errorCallbackURL = String(statePayload.errorCallbackURL || '');

  const safeErrorURL = (() => {
    try {
      const url = new URL(errorCallbackURL);
      return allowedFrontendOrigins.has(url.origin) ? url.toString() : defaultErrorURL;
    } catch {
      return defaultErrorURL;
    }
  })();

  const safeCallbackURL = (() => {
    try {
      const url = new URL(callbackURL);
      return allowedFrontendOrigins.has(url.origin) ? url.toString() : null;
    } catch {
      return null;
    }
  })();

  if (!safeCallbackURL) {
    const url = new URL(safeErrorURL);
    url.searchParams.set('error', 'invalid_callback');
    return c.redirect(url.toString());
  }

  const githubClientId = process.env.GITHUB_CLIENT_ID;
  const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!githubClientId || !githubClientSecret) {
    const url = new URL(safeErrorURL);
    url.searchParams.set('error', 'missing_github_credentials');
    return c.redirect(url.toString());
  }

  const apiOrigin = new URL(c.req.url).origin;
  const redirectURI =
    process.env.GITHUB_REDIRECT_URI || `${apiOrigin}/callback/github`;

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: githubClientId,
      client_secret: githubClientSecret,
      code,
      redirect_uri: redirectURI,
    }),
  }).catch(() => null);

  if (!tokenRes) {
    const url = new URL(safeErrorURL);
    url.searchParams.set('error', 'token_exchange_failed');
    return c.redirect(url.toString());
  }

  const tokenJson = (await tokenRes.json().catch(() => null)) as
    | Record<string, unknown>
    | null;

  const accessToken =
    tokenJson && typeof tokenJson.access_token === 'string'
      ? tokenJson.access_token
      : null;

  if (!accessToken) {
    const url = new URL(safeErrorURL);
    url.searchParams.set('error', 'token_exchange_failed');
    return c.redirect(url.toString());
  }

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'User-Agent': 'potatoe-squeezy',
    Accept: 'application/vnd.github+json',
  };

  const profileRes = await fetch('https://api.github.com/user', {
    headers,
  }).catch(() => null);

  if (!profileRes || !profileRes.ok) {
    const url = new URL(safeErrorURL);
    url.searchParams.set('error', 'github_profile_failed');
    return c.redirect(url.toString());
  }

  const profile = (await profileRes.json().catch(() => null)) as
    | Record<string, unknown>
    | null;

  const githubId = profile?.id != null ? String(profile.id) : '';
  const username =
    typeof profile?.login === 'string' ? String(profile.login) : '';
  const displayName =
    typeof profile?.name === 'string' && profile.name
      ? String(profile.name)
      : username;
  const avatarUrl =
    typeof profile?.avatar_url === 'string' ? String(profile.avatar_url) : null;

  if (!githubId || !username) {
    const url = new URL(safeErrorURL);
    url.searchParams.set('error', 'invalid_github_user');
    return c.redirect(url.toString());
  }

  let emails: Array<{ email: string; primary?: boolean; verified?: boolean }> =
    [];

  try {
    const emailsRes = await fetch('https://api.github.com/user/emails', {
      headers,
    });
    if (emailsRes.ok) {
      emails = (await emailsRes.json()) as typeof emails;
    }
  } catch {}

  let email: string | null =
    typeof profile?.email === 'string' ? String(profile.email) : null;

  if (!email && emails.length) {
    email = (emails.find((e) => e.primary) ?? emails[0])?.email ?? null;
  }

  const allowNoreply =
    process.env.GITHUB_ALLOW_NOREPLY_EMAIL?.toLowerCase() === 'true';

  if (!email && allowNoreply) {
    email = `${githubId}+${username}@users.noreply.github.com`;
  }

  const nextValues = {
    githubId,
    username,
    email,
    name: displayName || null,
    avatarUrl,
    updatedAt: new Date(),
  };

  const existingByGithubId = await db
    .select()
    .from(users)
    .where(eq(users.githubId, githubId))
    .limit(1);

  let appUser: typeof users.$inferSelect | undefined;

  if (existingByGithubId[0]) {
    const updated = await db
      .update(users)
      .set(nextValues)
      .where(eq(users.id, existingByGithubId[0].id))
      .returning();
    appUser = updated[0];
  } else {
    const existingByUsername = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    const legacyGithubId =
      existingByUsername[0] &&
      typeof existingByUsername[0].githubId === 'string' &&
      existingByUsername[0].githubId.includes('-');

    const emailMatches =
      existingByUsername[0] &&
      email &&
      existingByUsername[0].email &&
      existingByUsername[0].email.toLowerCase() === email.toLowerCase();

    if (existingByUsername[0] && (legacyGithubId || emailMatches)) {
      const updated = await db
        .update(users)
        .set(nextValues)
        .where(eq(users.id, existingByUsername[0].id))
        .returning();
      appUser = updated[0];
    } else {
      let usernameCandidate = username;
      if (existingByUsername[0]) {
        usernameCandidate = `${username}-${githubId}`;
      }

      const inserted = await db
        .insert(users)
        .values({
          ...nextValues,
          username: usernameCandidate,
        })
        .returning();
      appUser = inserted[0];
    }
  }

  if (!appUser) {
    const url = new URL(safeErrorURL);
    url.searchParams.set('error', 'user_sync_failed');
    return c.redirect(url.toString());
  }

  const appToken = await sign(
    {
      userId: appUser.id,
      githubId,
      username,
      email,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    },
    process.env.JWT_SECRET!,
    'HS256',
  );

  const url = new URL(safeCallbackURL);
  url.searchParams.set('token', appToken);
  return c.redirect(url.toString());
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
