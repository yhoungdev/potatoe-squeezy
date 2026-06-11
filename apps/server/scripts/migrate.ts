import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { readMigrationFiles } from 'drizzle-orm/migrator';

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

type PgLikeError = {
  code?: string;
  message?: string;
};

const isDuplicateRelationError = (err: unknown) => {
  const e = err as PgLikeError | null;
  const code = e?.code;
  const message = String(e?.message || '');
  return (
    code === '42P07' ||
    code === '42710' ||
    /relation\s+".*"\s+already exists/i.test(message) ||
    /already exists/i.test(message)
  );
};

const ensureMigrationsBaselined = async () => {
  const migrations = readMigrationFiles({ migrationsFolder });

  await pool.query(`CREATE SCHEMA IF NOT EXISTS drizzle;`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    );
  `);

  const existing = await pool.query<{
    created_at: string | null;
  }>(`select created_at from drizzle.__drizzle_migrations;`);

  const existingCreatedAt = new Set(
    existing.rows
      .map((r) => (r.created_at == null ? null : Number(r.created_at)))
      .filter((v): v is number => Number.isFinite(v)),
  );

  for (const migration of migrations) {
    if (!existingCreatedAt.has(migration.folderMillis)) {
      await pool.query(
        `insert into drizzle.__drizzle_migrations ("hash", "created_at") values ($1, $2);`,
        [migration.hash, migration.folderMillis],
      );
    }
  }
};

try {
  await migrate(db, { migrationsFolder });
  // eslint-disable-next-line no-console
  console.log('Database migrations applied');
} catch (err) {
  if (isDuplicateRelationError(err)) {
    await ensureMigrationsBaselined();
    // eslint-disable-next-line no-console
    console.warn(
      'Drizzle migrations table was empty but schema existed; baselined migrations.',
    );
  } else {
    let target = '<unknown>';
    try {
      const parsed = new URL(databaseUrl);
      target = `${parsed.hostname}${parsed.port ? `:${parsed.port}` : ''}${parsed.pathname}`;
    } catch {
      // ignore
    }

    throw new Error(
      `Failed to run DB migrations against ${target}. ` +
        `Start Postgres (or fix DATABASE_URL) and rerun: bun run db:migrate`,
      { cause: err },
    );
  }
} finally {
  await pool.end();
}
