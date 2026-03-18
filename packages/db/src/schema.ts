import { pgTable, text, timestamp, integer, decimal, boolean, uuid, jsonb, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  githubId: integer('github_id').unique().notNull(),
  username: text('username').notNull(),
  email: text('email'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  githubIdIdx: index('users_github_id_idx').on(table.githubId),
  usernameIdx: index('users_username_idx').on(table.username),
}));

export const repositories = pgTable('repositories', {
  id: uuid('id').primaryKey().defaultRandom(),
  githubId: integer('github_id').unique().notNull(),
  name: text('name').notNull(),
  fullName: text('full_name').notNull(),
  description: text('description'),
  htmlUrl: text('html_url').notNull(),
  language: text('language'),
  stargazersCount: integer('stargazers_count').default(0),
  forksCount: integer('forks_count').default(0),
  openIssuesCount: integer('open_issues_count').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  githubIdIdx: index('repositories_github_id_idx').on(table.githubId),
  fullNameIdx: index('repositories_full_name_idx').on(table.fullName),
  activeIdx: index('repositories_active_idx').on(table.isActive),
}));

export const issues = pgTable('issues', {
  id: uuid('id').primaryKey().defaultRandom(),
  githubId: integer('github_id').unique().notNull(),
  repositoryId: uuid('repository_id').references(() => repositories.id).notNull(),
  number: integer('number').notNull(),
  title: text('title').notNull(),
  body: text('body'),
  state: text('state').notNull(),
  htmlUrl: text('html_url').notNull(),
  authorId: uuid('author_id').references(() => users.id),
  assigneeId: uuid('assignee_id').references(() => users.id),
  labels: jsonb('labels').default('[]'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  githubIdIdx: index('issues_github_id_idx').on(table.githubId),
  repositoryIdIdx: index('issues_repository_id_idx').on(table.repositoryId),
  stateIdx: index('issues_state_idx').on(table.state),
  authorIdIdx: index('issues_author_id_idx').on(table.authorId),
  assigneeIdIdx: index('issues_assignee_id_idx').on(table.assigneeId),
}));

export const bounties = pgTable('bounties', {
  id: uuid('id').primaryKey().defaultRandom(),
  issueId: uuid('issue_id').references(() => issues.id).notNull(),
  creatorId: uuid('creator_id').references(() => users.id).notNull(),
  amount: decimal('amount', { precision: 20, scale: 8 }).notNull(),
  currency: text('currency').notNull().default('SOL'),
  status: text('status').notNull().default('open'),
  description: text('description'),
  expiresAt: timestamp('expires_at'),
  claimedBy: uuid('claimed_by').references(() => users.id),
  claimedAt: timestamp('claimed_at'),
  paidAt: timestamp('paid_at'),
  txSignature: text('tx_signature'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  issueIdIdx: index('bounties_issue_id_idx').on(table.issueId),
  creatorIdIdx: index('bounties_creator_id_idx').on(table.creatorId),
  statusIdx: index('bounties_status_idx').on(table.status),
  claimedByIdx: index('bounties_claimed_by_idx').on(table.claimedBy),
  currencyIdx: index('bounties_currency_idx').on(table.currency),
}));

export const tips = pgTable('tips', {
  id: uuid('id').primaryKey().defaultRandom(),
  fromUserId: uuid('from_user_id').references(() => users.id).notNull(),
  toUserId: uuid('to_user_id').references(() => users.id).notNull(),
  amount: decimal('amount', { precision: 20, scale: 8 }).notNull(),
  currency: text('currency').notNull().default('SOL'),
  message: text('message'),
  issueId: uuid('issue_id').references(() => issues.id),
  txSignature: text('tx_signature'),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  fromUserIdIdx: index('tips_from_user_id_idx').on(table.fromUserId),
  toUserIdIdx: index('tips_to_user_id_idx').on(table.toUserId),
  issueIdIdx: index('tips_issue_id_idx').on(table.issueId),
  statusIdx: index('tips_status_idx').on(table.status),
  currencyIdx: index('tips_currency_idx').on(table.currency),
}));

export const webhookEvents = pgTable('webhook_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventType: text('event_type').notNull(),
  payload: jsonb('payload').notNull(),
  source: text('source').notNull(),
  processed: boolean('processed').default(false),
  processedAt: timestamp('processed_at'),
  error: text('error'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  eventTypeIdx: index('webhook_events_event_type_idx').on(table.eventType),
  processedIdx: index('webhook_events_processed_idx').on(table.processed),
  sourceIdx: index('webhook_events_source_idx').on(table.source),
  createdAtIdx: index('webhook_events_created_at_idx').on(table.createdAt),
}));

export const usersRelations = relations(users, ({ many }) => ({
  createdBounties: many(bounties, { relationName: 'bountyCreator' }),
  claimedBounties: many(bounties, { relationName: 'bountyClaimer' }),
  authoredIssues: many(issues, { relationName: 'issueAuthor' }),
  assignedIssues: many(issues, { relationName: 'issueAssignee' }),
  sentTips: many(tips, { relationName: 'tipSender' }),
  receivedTips: many(tips, { relationName: 'tipReceiver' }),
}));

export const repositoriesRelations = relations(repositories, ({ many }) => ({
  issues: many(issues),
}));

export const issuesRelations = relations(issues, ({ one, many }) => ({
  repository: one(repositories, {
    fields: [issues.repositoryId],
    references: [repositories.id],
  }),
  author: one(users, {
    fields: [issues.authorId],
    references: [users.id],
    relationName: 'issueAuthor',
  }),
  assignee: one(users, {
    fields: [issues.assigneeId],
    references: [users.id],
    relationName: 'issueAssignee',
  }),
  bounties: many(bounties),
  tips: many(tips),
}));

export const bountiesRelations = relations(bounties, ({ one }) => ({
  issue: one(issues, {
    fields: [bounties.issueId],
    references: [issues.id],
  }),
  creator: one(users, {
    fields: [bounties.creatorId],
    references: [users.id],
    relationName: 'bountyCreator',
  }),
  claimer: one(users, {
    fields: [bounties.claimedBy],
    references: [users.id],
    relationName: 'bountyClaimer',
  }),
}));

export const tipsRelations = relations(tips, ({ one }) => ({
  fromUser: one(users, {
    fields: [tips.fromUserId],
    references: [users.id],
    relationName: 'tipSender',
  }),
  toUser: one(users, {
    fields: [tips.toUserId],
    references: [users.id],
    relationName: 'tipReceiver',
  }),
  issue: one(issues, {
    fields: [tips.issueId],
    references: [issues.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Repository = typeof repositories.$inferSelect;
export type NewRepository = typeof repositories.$inferInsert;
export type Issue = typeof issues.$inferSelect;
export type NewIssue = typeof issues.$inferInsert;
export type Bounty = typeof bounties.$inferSelect;
export type NewBounty = typeof bounties.$inferInsert;
export type Tip = typeof tips.$inferSelect;
export type NewTip = typeof tips.$inferInsert;
export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type NewWebhookEvent = typeof webhookEvents.$inferInsert;