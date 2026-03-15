import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { drizzle } from 'drizzle-orm/node-postgres';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '../../');
config({ path: resolve(rootDir, '.env') });
config({ path: resolve(rootDir, '.env.local') });

const db = drizzle(process.env.DATABASE_URL!);
export { db };
