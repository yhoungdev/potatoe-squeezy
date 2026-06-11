ALTER TABLE "wallets" ADD COLUMN "chain" text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "wallets_user_chain_unique" ON "wallets" USING btree ("user_id","chain");