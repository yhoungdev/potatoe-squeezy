import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  numeric,
  boolean,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  githubId: text('github_id').notNull().unique(),
  username: text('username').notNull().unique(),
  email: text('email'),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  network: text('network'),
  walletAddress: text('wallet_address'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const wallets = pgTable('wallets', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  address: text('address').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const transactionRecords = pgTable('transaction_records', {
  id: serial('id').primaryKey(),
  amount: numeric('amount').notNull(),
  senderAddress: text('sender_address').notNull(),
  senderId: integer('sender_id').references(() => users.id),
  recipientAddress: text('recipient_address').notNull(),
  recipientId: integer('recipient_id').references(() => users.id),
  txHash: text('tx_hash'),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const tips = pgTable('tips', {
  id: text('id').primaryKey(),
  senderId: integer('sender_id')
    .notNull()
    .references(() => users.id),
  receiverId: integer('receiver_id')
    .notNull()
    .references(() => users.id),
  amount: numeric('amount').notNull(),
  token: text('token').notNull(),
  network: text('network').notNull(),
  txHash: text('tx_hash').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const bounties = pgTable(
  'bounties',
  {
    id: text('id').primaryKey(),
    repo: text('repo').notNull(),
    issueNumber: integer('issue_number').notNull(),
    creatorId: integer('creator_id')
      .notNull()
      .references(() => users.id),
    amount: numeric('amount').notNull(),
    token: text('token').notNull(),
    network: text('network').notNull(),
    status: text('status').notNull(),
    escrowTxHash: text('escrow_tx_hash').notNull(),
    payoutTxHash: text('payout_tx_hash'),
    refundTxHash: text('refund_tx_hash'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    repoIssueUnique: uniqueIndex('bounties_repo_issue_unique').on(
      table.repo,
      table.issueNumber,
    ),
  }),
);

export const contributions = pgTable(
  'contributions',
  {
    id: text('id').primaryKey(),
    bountyId: text('bounty_id')
      .notNull()
      .references(() => bounties.id),
    contributorId: integer('contributor_id')
      .notNull()
      .references(() => users.id),
    prNumber: integer('pr_number').notNull(),
    merged: boolean('merged').notNull().default(false),
    difficulty: integer('difficulty').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    mergedAt: timestamp('merged_at'),
  },
  (table) => ({
    uniqueBountyPr: uniqueIndex('contributions_bounty_pr_unique').on(
      table.bountyId,
      table.prNumber,
    ),
  }),
);

export const developerStats = pgTable('developer_stats', {
  id: text('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .unique()
    .references(() => users.id),
  totalEarnedUSD: numeric('total_earned_usd').notNull().default('0'),
  totalTipsUSD: numeric('total_tips_usd').notNull().default('0'),
  bountiesCompleted: integer('bounties_completed').notNull().default(0),
  consecutiveDays: integer('consecutive_days').notNull().default(0),
  totalPoints: numeric('total_points').notNull().default('0'),
  lastContributionDate: timestamp('last_contribution_date'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const badges = pgTable('badges', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description').notNull(),
});

export const userBadges = pgTable(
  'user_badges',
  {
    id: text('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id),
    badgeId: text('badge_id')
      .notNull()
      .references(() => badges.id),
    earnedAt: timestamp('earned_at').defaultNow(),
  },
  (table) => ({
    userBadgeUnique: uniqueIndex('user_badges_user_badge_unique').on(
      table.userId,
      table.badgeId,
    ),
  }),
);

export const webhookEvents = pgTable('webhook_events', {
  id: text('id').primaryKey(),
  deliveryId: text('delivery_id').notNull().unique(),
  eventType: text('event_type').notNull(),
  status: text('status').notNull(),
  payloadHash: text('payload_hash'),
  createdAt: timestamp('created_at').defaultNow(),
  processedAt: timestamp('processed_at'),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  wallets: many(wallets),
  tipsSent: many(tips, { relationName: 'sent_tips' }),
  tipsReceived: many(tips, { relationName: 'received_tips' }),
  bountiesCreated: many(bounties),
  contributions: many(contributions),
  stats: one(developerStats),
  badges: many(userBadges),
}));

export const walletsRelations = relations(wallets, ({ one }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id],
  }),
}));

export const transactionRecordsRelations = relations(
  transactionRecords,
  ({ one }) => ({
    sender: one(users, {
      fields: [transactionRecords.senderId],
      references: [users.id],
    }),
    recipient: one(users, {
      fields: [transactionRecords.recipientId],
      references: [users.id],
    }),
  }),
);

export const tipsRelations = relations(tips, ({ one }) => ({
  sender: one(users, {
    relationName: 'sent_tips',
    fields: [tips.senderId],
    references: [users.id],
  }),
  receiver: one(users, {
    relationName: 'received_tips',
    fields: [tips.receiverId],
    references: [users.id],
  }),
}));

export const bountiesRelations = relations(bounties, ({ one, many }) => ({
  creator: one(users, {
    fields: [bounties.creatorId],
    references: [users.id],
  }),
  contributions: many(contributions),
}));

export const contributionsRelations = relations(contributions, ({ one }) => ({
  bounty: one(bounties, {
    fields: [contributions.bountyId],
    references: [bounties.id],
  }),
  contributor: one(users, {
    fields: [contributions.contributorId],
    references: [users.id],
  }),
}));

export const developerStatsRelations = relations(developerStats, ({ one }) => ({
  user: one(users, {
    fields: [developerStats.userId],
    references: [users.id],
  }),
}));

export const badgesRelations = relations(badges, ({ many }) => ({
  users: many(userBadges),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id],
  }),
}));

export * from './better-auth-schema';
