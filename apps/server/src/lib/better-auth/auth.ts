import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { bearer } from 'better-auth/plugins';
import { db } from '../../db/index';
import {
  authAccounts,
  authSessions,
  authUsers,
  authVerifications,
} from '../../db/better-auth-schema';
import { users } from '../../db/schema';

const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;

const basePath = '/api/auth';
const baseURL =
  process.env.BETTER_AUTH_URL ||
  process.env.API_BASE_URL ||
  `http://localhost:${process.env.PORT || 3000}`;

const isProduction = process.env.NODE_ENV === 'production';

const githubRedirectURI =
  process.env.GITHUB_REDIRECT_URI ||
  new URL(`${basePath}/callback/github`, baseURL).toString();

console.log('Better Auth Configuration:');
console.log('Base Path:', basePath);
console.log('Base URL:', baseURL);
console.log('Is Production:', isProduction);
console.log('GitHub Redirect URI:', githubRedirectURI);

const githubAllowNoreplyEmail =
  process.env.GITHUB_ALLOW_NOREPLY_EMAIL?.toLowerCase() === 'true';

function toOrigin(value?: string) {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

const frontendOrigin = toOrigin(process.env.FRONTEND_APP_URL);
const apiOrigin = toOrigin(baseURL) || baseURL;
const defaultErrorURL =
  process.env.BETTER_AUTH_ERROR_URL ||
  (frontendOrigin ? `${frontendOrigin}/status/error` : null) ||
  `${apiOrigin}/status/error`;

export const auth = betterAuth({
  basePath,
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET || process.env.JWT_SECRET,
  plugins: [bearer()],
  onAPIError: {
    errorURL: defaultErrorURL,
  },
  trustedOrigins: [
    process.env.FRONTEND_APP_URL,
    toOrigin(process.env.BETTER_AUTH_URL),
    toOrigin(process.env.API_BASE_URL),
    toOrigin(baseURL),
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:4173',
    'http://localhost:4174',
    'https://potato-squeezy.up.railway.app',
    'https://www.potatosqueezy.xyz',
    'https://potatosqueezy.xyz',
  ].filter(Boolean) as string[],
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: authUsers,
      session: authSessions,
      account: authAccounts,
      verification: authVerifications,
    },
  }),
  user: {
    fields: {
      emailVerified: 'email_verified',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
  session: {
    fields: {
      userId: 'user_id',
      expiresAt: 'expires_at',
      ipAddress: 'ip_address',
      userAgent: 'user_agent',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
  account: {
    storeStateStrategy: 'database',
    fields: {
      accountId: 'account_id',
      providerId: 'provider_id',
      userId: 'user_id',
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
      idToken: 'id_token',
      accessTokenExpiresAt: 'access_token_expires_at',
      refreshTokenExpiresAt: 'refresh_token_expires_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
  verification: {
    fields: {
      expiresAt: 'expires_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
  socialProviders:
    githubClientId && githubClientSecret
      ? {
          github: {
            clientId: githubClientId,
            clientSecret: githubClientSecret,
            redirectURI: githubRedirectURI,
            scope: ['read:user', 'user:email'],
            async getUserInfo(token) {
              const headers = {
                Authorization: `Bearer ${token.accessToken}`,
                'User-Agent': 'potatoe-squeezy',
                Accept: 'application/vnd.github+json',
              };

              const profileRes = await fetch('https://api.github.com/user', {
                headers,
              });
              if (!profileRes.ok) return null;

              const profile = (await profileRes.json()) as {
                id: number | string;
                login?: string | null;
                name?: string | null;
                email?: string | null;
                avatar_url?: string | null;
              };

              let emails: Array<{
                email: string;
                primary?: boolean;
                verified?: boolean;
              }> = [];

              try {
                const emailsRes = await fetch(
                  'https://api.github.com/user/emails',
                  { headers },
                );
                if (emailsRes.ok) {
                  emails = (await emailsRes.json()) as typeof emails;
                } else {
                  const body = await emailsRes.text().catch(() => '');
                  console.warn(
                    `[auth] GitHub /user/emails failed (${emailsRes.status}). ${body}`,
                  );
                }
              } catch (err) {
                console.warn('[auth] GitHub /user/emails request failed', err);
              }

              let email = profile.email ?? null;
              if (!email && emails.length) {
                email = (emails.find((e: any) => e.primary) ?? emails[0])
                  ?.email;
              }

              if (!email && githubAllowNoreplyEmail) {
                const login = profile.login ?? String(profile.id);
                email = `${profile.id}+${login}@users.noreply.github.com`;
              }

              const emailVerified =
                emails.find((e: any) => e.email === email)?.verified ?? false;

              const githubId = String(profile.id);
              const username = profile.login || '';
              const displayName = profile.name || profile.login || '';
              const avatarUrl = profile.avatar_url || '';

              // Sync to the 'users' table used by the application
              try {
                await db
                  .insert(users)
                  .values({
                    githubId,
                    username,
                    email: email || '',
                    name: displayName,
                    avatarUrl,
                  })
                  .onConflictDoUpdate({
                    target: users.githubId,
                    set: {
                      username,
                      email: email || '',
                      name: displayName,
                      avatarUrl,
                      updatedAt: new Date(),
                    },
                  });
                console.log(
                  `[auth] Synced user ${username} to application users table`,
                );
              } catch (syncError) {
                console.error(
                  '[auth] Failed to sync user to application users table:',
                  syncError,
                );
              }

              return {
                user: {
                  id: githubId,
                  name: displayName,
                  email: email ?? undefined,
                  image: avatarUrl ?? undefined,
                  emailVerified,
                },
                data: profile,
              } as any;
            },
          },
        }
      : {},
});
