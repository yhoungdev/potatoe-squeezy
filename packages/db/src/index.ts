import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create postgres client
const client = postgres(connectionString, {
  max: process.env.NODE_ENV === 'production' ? 10 : 1,
  idle_timeout: 20,
  max_lifetime: 60 * 30,
});

// Create drizzle database instance
export const db = drizzle(client, { schema });

// Migration utility
export const runMigrations = async () => {
  await migrate(db, { migrationsFolder: './migrations' });
};

// Export schema and types
export * from './schema';
export { schema };

// Export database client for advanced usage
export { client };

// Cleanup function for graceful shutdown
export const closeConnection = async () => {
  await client.end();
};