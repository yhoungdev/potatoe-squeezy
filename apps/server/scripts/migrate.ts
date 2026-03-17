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

  throw new Error(
    `Failed to run DB migrations against ${target}. ` +
      `Start Postgres (or fix DATABASE_URL) and rerun: bun run db:migrate`,
    { cause: err },
  );
} finally {
  await pool.end();
}
