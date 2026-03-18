import { pgTable, uuid, varchar, text, timestamp, integer, decimal, boolean, jsonb, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  githubId: varchar('github_id', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  name: varchar('name', { length: 255 }),
  avatarUrl: text('avatar_url'),
  walletAddress: varchar('wallet_address', { length: 255 }),
  createdAt: timestamp('created_at').default(sql`now()`).notNull(),
  updatedAt: timestamp('updated_at').default(sql`now()`).notNull(),
}, (table) => ({
  githubIdIdx: index('users_github_id_idx').on(table.githubId),
  usernameIdx: index('users_username_idx').on(table.username),
  walletAddressIdx: index('users_wallet_address_idx').on(table.walletAddress),
}));

export const repositories = pgTable('repositories', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  githubId: varchar('github_id', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  description: text('description'),
  htmlUrl: text('html_url').notNull(),
  defaultBranch: varchar('default_branch', { length: 255 }).default('main'),
  private: boolean('private').default(false).notNull(),
  ownerId: uuid('owner_id').references(() => users.id),
  createdAt: timestamp('created_at').default(sql`now()`).notNull(),
  updatedAt: timestamp('updated_at').default(sql`now()`).notNull(),
}, (table) => ({
  githubIdIdx: index('repositories_github_id_idx').on(table.githubId),
  ownerIdIdx: index('repositories_owner_id_idx').on(table.ownerId),
  fullNameIdx: index('repositories_full_name_idx').on(table.fullName),
}));

export const issues = pgTable('issues', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  githubId: varchar('github_id', { length: 255 }).notNull().unique(),
  number: integer('number').notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  body: text('body'),
  state: varchar('state', { length: 50 }).notNull(),
  htmlUrl: text('html_url').notNull(),
  repositoryId: uuid('repository_id').references(() => repositories.id).notNull(),
  authorId: uuid('author_id').references(() => users.id),
  assigneeId: uuid('assignee_id').references(() => users.id),
  labels: jsonb('labels'),
  createdAt: timestamp('created_at').default(sql`now()`).notNull(),
  updatedAt: timestamp('updated_at').default(sql`now()`).notNull(),
}, (table) => ({
  githubIdIdx: index('issues_github_id_idx').on(table.githubId),
  repositoryIdIdx: index('issues_repository_id_idx').on(table.repositoryId),
  authorIdIdx: index('issues_author_id_idx').on(table.authorId),
  assigneeIdIdx: index('issues_assignee_id_idx').on(table.assigneeId),
  stateIdx: index('issues_state_idx').on(table.state),
  numberRepoIdx: index('issues_number_repo_idx').on(table.number, table.repositoryId),
}));

export const bounties = pgTable('bounties', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  issueId: uuid('issue_id').references(() => issues.id).notNull(),
  createdById: uuid('created_by_id').references(() => users.id).notNull(),
  amount: decimal('amount', { precision: 18, scale: 8 }).notNull(),
  currency: varchar('currency', { length: 10 }).notNull(),
  status: varchar('status', { length: 50 }).default('active').notNull(),
  expiresAt: timestamp('expires_at'),
  claimedById: uuid('claimed_by_id').references(() => users.id),
  claimedAt: timestamp('claimed_at'),
  txHash: varchar('tx_hash', { length: 255 }),
  createdAt: timestamp('created_at').default(sql`now()`).notNull(),
  updatedAt: timestamp('updated_at').default(sql`now()`).notNull(),
}, (table) => ({
  issueIdIdx: index('bounties_issue_id_idx').on(table.issueId),
  createdByIdIdx: index('bounties_created_by_id_idx').on(table.createdById),
  claimedByIdIdx: index('bounties_claimed_by_id_idx').on(table.claimedById),
  statusIdx: index('bounties_status_idx').on(table.status),
  expiresAtIdx: index('bounties_expires_at_idx').on(table.expiresAt),
  txHashIdx: index('bounties_tx_hash_idx').on(table.txHash),
}));

export const tips = pgTable('tips', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  fromUserId: uuid('from_user_id').references(() => users.id).notNull(),
  toUserId: uuid('to_user_id').references(() => users.id).notNull(),
  issueId: uuid('issue_id').references(() => issues.id),
  amount: decimal('amount', { precision: 18, scale: 8 }).notNull(),
  currency: varchar('currency', { length: 10 }).notNull(),
  message: text('message'),
  txHash: varchar('tx_hash', { length: 255 }),
  status: varchar('status', { length: 50 }).default('pending').notNull(),
  createdAt: timestamp('created_at').default(sql`now()`).notNull(),
  updatedAt: timestamp('updated_at').default(sql`now()`).notNull(),
}, (table) => ({
  fromUserIdIdx: index('tips_from_user_id_idx').on(table.fromUserId),
  toUserIdIdx: index('tips_to_user_id_idx').on(table.toUserId),
  issueIdIdx: index('tips_issue_id_idx').on(table.issueId),
  statusIdx: index('tips_status_idx').on(table.status),
  txHashIdx: index('tips_tx_hash_idx').on(table.txHash),
  createdAtIdx: index('tips_created_at_idx').on(table.createdAt),
}));

export const webhookEvents = pgTable('webhook_events', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  payload: jsonb('payload').notNull(),
  signature: varchar('signature', { length: 500 }),
  processed: boolean('processed').default(false).notNull(),
  processedAt: timestamp('processed_at'),
  errorMessage: text('error_message'),
  retryCount: integer('retry_count').default(0).notNull(),
  createdAt: timestamp('created_at').default(sql`now()`).notNull(),
}, (table) => ({
  eventTypeIdx: index('webhook_events_event_type_idx').on(table.eventType),
  processedIdx: index('webhook_events_processed_idx').on(table.processed),
  createdAtIdx: index('webhook_events_created_at_idx').on(table.createdAt),
  retryCountIdx: index('webhook_events_retry_count_idx').on(table.retryCount),
}));