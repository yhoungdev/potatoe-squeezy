import { InferSelectModel } from 'drizzle-orm';
import {
  users,
  wallets,
  bounties,
  contributions,
  developerStats,
  badges,
  userBadges,
  tips,
  webhookEvents,
} from './db/schema';

export type User = InferSelectModel<typeof users>;
export type Wallet = InferSelectModel<typeof wallets>;
export type Bounty = InferSelectModel<typeof bounties>;
export type Contribution = InferSelectModel<typeof contributions>;
export type DeveloperStats = InferSelectModel<typeof developerStats>;
export type Badge = InferSelectModel<typeof badges>;
export type UserBadge = InferSelectModel<typeof userBadges>;
export type Tip = InferSelectModel<typeof tips>;
export type WebhookEvent = InferSelectModel<typeof webhookEvents>;

export interface UserWithWallets extends User {
  wallets: Wallet[];
}
