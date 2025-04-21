import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  numeric,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  githubId: text('github_id').notNull().unique(),
  username: text('username').notNull(),
  email: text('email'),
  name: text('name'),
  avatarUrl: text('avatar_url'),
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
