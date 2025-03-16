import { InferSelectModel } from "drizzle-orm";
import { users, wallets } from "./db/schema";

export type User = InferSelectModel<typeof users>;
export type Wallet = InferSelectModel<typeof wallets>;

export interface UserWithWallets extends User {
  wallets: Wallet[];
}