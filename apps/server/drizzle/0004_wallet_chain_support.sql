ALTER TABLE "wallets" ADD COLUMN "chain" text;--> statement-breakpoint
UPDATE "wallets" w
SET "chain" = COALESCE(NULLIF(u."network", ''), 'solana')
FROM "users" u
WHERE u."id" = w."user_id"
  AND w."chain" IS NULL;--> statement-breakpoint
DELETE FROM "wallets" a
USING "wallets" b
WHERE a."user_id" = b."user_id"
  AND COALESCE(a."chain", 'solana') = COALESCE(b."chain", 'solana')
  AND a."id" < b."id";--> statement-breakpoint
ALTER TABLE "wallets" ALTER COLUMN "chain" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "wallets_user_chain_unique" ON "wallets" USING btree ("user_id","chain");
