import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const authUsers = pgTable('auth_users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  email_verified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

export const authSessions = pgTable(
  'auth_sessions',
  {
    id: text('id').primaryKey(),
    user_id: text('user_id')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    expires_at: timestamp('expires_at').notNull(),
    token: text('token').notNull(),
    ip_address: text('ip_address'),
    user_agent: text('user_agent'),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    tokenUnique: uniqueIndex('auth_sessions_token_unique').on(table.token),
    userIdIndex: index('auth_sessions_user_id_idx').on(table.user_id),
  }),
);

export const authAccounts = pgTable(
  'auth_accounts',
  {
    id: text('id').primaryKey(),
    account_id: text('account_id').notNull(),
    provider_id: text('provider_id').notNull(),
    user_id: text('user_id')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    access_token: text('access_token'),
    refresh_token: text('refresh_token'),
    id_token: text('id_token'),
    access_token_expires_at: timestamp('access_token_expires_at'),
    refresh_token_expires_at: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    providerAccountUnique: uniqueIndex(
      'auth_accounts_provider_account_unique',
    ).on(table.provider_id, table.account_id),
    userIdIndex: index('auth_accounts_user_id_idx').on(table.user_id),
  }),
);

export const authVerifications = pgTable(
  'auth_verifications',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expires_at: timestamp('expires_at').notNull(),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    identifierIndex: index('auth_verifications_identifier_idx').on(
      table.identifier,
    ),
  }),
);
