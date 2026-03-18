import { pgTable, uuid, text, varchar, integer, timestamp, boolean, decimal, jsonb, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().default('gen_random_uuid()'),
  githubId: integer('github_id').notNull().unique(),
  username: varchar('username', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  name: varchar('name', { length: 255 }),
  avatarUrl: text('avatar_url'),
  walletAddress: varchar('wallet_address', { length: 42 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  githubIdIdx: uniqueIndex('users_github_id_idx').on(table.githubId),
  usernameIdx: index('users_username_idx').on(table.username),
  walletAddressIdx: index('users_wallet_address_idx').on(table.walletAddress),
}));

export const repositories = pgTable('repositories', {
  id: uuid('id').primaryKey().default('gen_random_uuid()'),
  githubId: integer('github_id').notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  description: text('description'),
  htmlUrl: text('html_url').notNull(),
  ownerId: uuid('owner_id').references(() => users.id).notNull(),
  isPrivate: boolean('is_private').default(false).notNull(),
  stargazersCount: integer('stargazers_count').default(0),
  forksCount: integer('forks_count').default(0),
  language: varchar('language', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  githubIdIdx: uniqueIndex('repositories_github_id_idx').on(table.githubId),
  ownerIdIdx: index('repositories_owner_id_idx').on(table.ownerId),
  fullNameIdx: index('repositories_full_name_idx').on(table.fullName),
  languageIdx: index('repositories_language_idx').on(table.language),
}));

export const issues = pgTable('issues', {
  id: uuid('id').primaryKey().default('gen_random_uuid()'),
  githubId: integer('github_id').notNull().unique(),
  number: integer('number').notNull(),
  title: text('title').notNull(),
  body: text('body'),
  state: varchar('state', { length: 50 }).notNull().default('open'),
  htmlUrl: text('html_url').notNull(),
  repositoryId: uuid('repository_id').references(() => repositories.id).notNull(),
  authorId: uuid('author_id').references(() => users.id).notNull(),
  assigneeId: uuid('assignee_id').references(() => users.id),
  labels: jsonb('labels').default('[]').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  closedAt: timestamp('closed_at'),
}, (table) => ({
  githubIdIdx: uniqueIndex('issues_github_id_idx').on(table.githubId),
  repositoryIdIdx: index('issues_repository_id_idx').on(table.repositoryId),
  authorIdIdx: index('issues_author_id_idx').on(table.authorId),
  assigneeIdIdx: index('issues_assignee_id_idx').on(table.assigneeId),
  stateIdx: index('issues_state_idx').on(table.state),
  numberRepoIdx: uniqueIndex('issues_number_repo_idx').on(table.number, table.repositoryId),
}));

export const bounties = pgTable('bounties', {
  id: uuid('id').primaryKey().default('gen_random_uuid()'),
  issueId: uuid('issue_id').references(() => issues.id).notNull(),
  creatorId: uuid('creator_id').references(() => users.id).notNull(),
  amount: decimal('amount', { precision: 18, scale: 6 }).notNull(),
  currency: varchar('currency', { length: 10 }).notNull().default('USDC'),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  description: text('description'),
  requirements: text('requirements'),
  deadline: timestamp('deadline'),
  claimantId: uuid('claimant_id').references(() => users.id),
  claimedAt: timestamp('claimed_at'),
  completedAt: timestamp('completed_at'),
  txHash: varchar('tx_hash', { length: 66 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  issueIdIdx: index('bounties_issue_id_idx').on(table.issueId),
  creatorIdIdx: index('bounties_creator_id_idx').on(table.creatorId),
  claimantIdIdx: index('bounties_claimant_id_idx').on(table.claimantId),
  statusIdx: index('bounties_status_idx').on(table.status),
  deadlineIdx: index('bounties_deadline_idx').on(table.deadline),
  txHashIdx: index('bounties_tx_hash_idx').on(table.txHash),
}));

export const tips = pgTable('tips', {
  id: uuid('id').primaryKey().default('gen_random_uuid()'),
  fromUserId: uuid('from_user_id').references(() => users.id).notNull(),
  toUserId: uuid('to_user_id').references(() => users.id).notNull(),
  issueId: uuid('issue_id').references(() => issues.id),
  repositoryId: uuid('repository_id').references(() => repositories.id),
  amount: decimal('amount', { precision: 18, scale: 6 }).notNull(),
  currency: varchar('currency', { length: 10 }).notNull().default('USDC'),
  message: text('message'),
  txHash: varchar('tx_hash', { length: 66 }),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  fromUserIdIdx: index('tips_from_user_id_idx').on(table.fromUserId),
  toUserIdIdx: index('tips_to_user_id_idx').on(table.toUserId),
  issueIdIdx: index('tips_issue_id_idx').on(table.issueId),
  repositoryIdIdx: index('tips_repository_id_idx').on(table.repositoryId),
  statusIdx: index('tips_status_idx').on(table.status),
  txHashIdx: index('tips_tx_hash_idx').on(table.txHash),
  createdAtIdx: index('tips_created_at_idx').on(table.createdAt),
}));

export const webhookEvents = pgTable('webhook_events', {
  id: uuid('id').primaryKey().default('gen_random_uuid()'),
  githubDeliveryId: varchar('github_delivery_id', { length: 255 }).notNull().unique(),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  action: varchar('action', { length: 100 }),
  payload: jsonb('payload').notNull(),
  processed: boolean('processed').default(false).notNull(),
  error: text('error'),
  repositoryId: uuid('repository_id').references(() => repositories.id),
  issueId: uuid('issue_id').references(() => issues.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  processedAt: timestamp('processed_at'),
}, (table) => ({
  githubDeliveryIdIdx: uniqueIndex('webhook_events_github_delivery_id_idx').on(table.githubDeliveryId),
  eventTypeIdx: index('webhook_events_event_type_idx').on(table.eventType),
  processedIdx: index('webhook_events_processed_idx').on(table.processed),
  repositoryIdIdx: index('webhook_events_repository_id_idx').on(table.repositoryId),
  issueIdIdx: index('webhook_events_issue_id_idx').on(table.issueId),
  createdAtIdx: index('webhook_events_created_at_idx').on(table.createdAt),
}));