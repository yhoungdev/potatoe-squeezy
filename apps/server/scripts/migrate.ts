import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

const serverRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

config({ path: resolve(serverRoot, '.env') });
config({ path: resolve(serverRoot, '.env.local') });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set (apps/server/.env or .env.local).');
}

const databaseUrl = process.env.DATABASE_URL;
const migrationsFolder = resolve(serverRoot, 'drizzle');

const pool = new Pool({ connectionString: databaseUrl });
const db = drizzle(pool);

const ensureBetterAuthTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "auth_users" (
      "id" text PRIMARY KEY NOT NULL,
      "name" text NOT NULL,
      "email" text NOT NULL,
      "email_verified" boolean DEFAULT false NOT NULL,
      "image" text,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS "auth_sessions" (
      "id" text PRIMARY KEY NOT NULL,
      "user_id" text NOT NULL,
      "expires_at" timestamp NOT NULL,
      "token" text NOT NULL,
      "ip_address" text,
      "user_agent" text,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS "auth_accounts" (
      "id" text PRIMARY KEY NOT NULL,
      "account_id" text NOT NULL,
      "provider_id" text NOT NULL,
      "user_id" text NOT NULL,
      "access_token" text,
      "refresh_token" text,
      "id_token" text,
      "access_token_expires_at" timestamp,
      "refresh_token_expires_at" timestamp,
      "scope" text,
      "password" text,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS "auth_verifications" (
      "id" text PRIMARY KEY NOT NULL,
      "identifier" text NOT NULL,
      "value" text NOT NULL,
      "expires_at" timestamp NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );
  `);

  await pool.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS "auth_accounts_provider_account_unique" ON "auth_accounts" USING btree ("provider_id","account_id");`,
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS "auth_accounts_user_id_idx" ON "auth_accounts" USING btree ("user_id");`,
  );
  await pool.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS "auth_sessions_token_unique" ON "auth_sessions" USING btree ("token");`,
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS "auth_sessions_user_id_idx" ON "auth_sessions" USING btree ("user_id");`,
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS "auth_verifications_identifier_idx" ON "auth_verifications" USING btree ("identifier");`,
  );

  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'auth_accounts_user_id_auth_users_id_fk') THEN
        ALTER TABLE "auth_accounts"
          ADD CONSTRAINT "auth_accounts_user_id_auth_users_id_fk"
          FOREIGN KEY ("user_id") REFERENCES "public"."auth_users"("id")
          ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;
  `);

  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'auth_sessions_user_id_auth_users_id_fk') THEN
        ALTER TABLE "auth_sessions"
          ADD CONSTRAINT "auth_sessions_user_id_auth_users_id_fk"
          FOREIGN KEY ("user_id") REFERENCES "public"."auth_users"("id")
          ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;
  `);
};

try {
  await migrate(db, { migrationsFolder });
  // eslint-disable-next-line no-console
  console.log('Database migrations applied');
} catch (err) {
  let target = '<unknown>';
  try {
    const parsed = new URL(databaseUrl);
    target = `${parsed.hostname}${parsed.port ? `:${parsed.port}` : ''}${parsed.pathname}`;
  } catch {
    // ignore
  }
  // If the DB already has some tables but no Drizzle journal state, a full migrate
  // can fail on "relation already exists". In that case, ensure Better Auth tables
  // exist so auth endpoints can function.
  try {
    await ensureBetterAuthTables();
    // eslint-disable-next-line no-console
    console.warn(
      `Full DB migrate failed against ${target}; ensured Better Auth tables exist instead.`,
    );
  } catch (ensureErr) {
    throw new Error(
      `Failed to run DB migrations against ${target}. ` +
        `Start Postgres (or fix DATABASE_URL) and rerun: bun run db:migrate`,
      { cause: ensureErr ?? err },
    );
  }
} finally {
  await pool.end();
}
