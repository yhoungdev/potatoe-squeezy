import { InferSelectModel } from 'drizzle-orm';
import { addresses, users } from './db/schema';

export type User = InferSelectModel<typeof users>;
export type Wallet = InferSelectModel<typeof addresses>;

export interface UserWithWallets extends User {
  wallets: Wallet[];
}
