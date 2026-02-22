ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_unique" ON "users" ("username");

CREATE TABLE IF NOT EXISTS "tips" (
  "id" text PRIMARY KEY NOT NULL,
  "sender_id" integer NOT NULL,
  "receiver_id" integer NOT NULL,
  "amount" numeric NOT NULL,
  "token" text NOT NULL,
  "network" text NOT NULL,
  "tx_hash" text NOT NULL,
  "created_at" timestamp DEFAULT now(),
  CONSTRAINT "tips_tx_hash_unique" UNIQUE("tx_hash")
);

ALTER TABLE "tips" ADD CONSTRAINT "tips_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "tips" ADD CONSTRAINT "tips_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "bounties" ADD COLUMN IF NOT EXISTS "payout_tx_hash" text;
ALTER TABLE "bounties" ADD COLUMN IF NOT EXISTS "refund_tx_hash" text;
CREATE UNIQUE INDEX IF NOT EXISTS "bounties_repo_issue_unique" ON "bounties" ("repo", "issue_number");

ALTER TABLE "contributions" ADD COLUMN IF NOT EXISTS "merged_at" timestamp;
CREATE UNIQUE INDEX IF NOT EXISTS "contributions_bounty_pr_unique" ON "contributions" ("bounty_id", "pr_number");

ALTER TABLE "developer_stats" ADD COLUMN IF NOT EXISTS "last_contribution_date" timestamp;

CREATE UNIQUE INDEX IF NOT EXISTS "badges_name_unique" ON "badges" ("name");
CREATE UNIQUE INDEX IF NOT EXISTS "user_badges_user_badge_unique" ON "user_badges" ("user_id", "badge_id");

CREATE TABLE IF NOT EXISTS "webhook_events" (
  "id" text PRIMARY KEY NOT NULL,
  "delivery_id" text NOT NULL,
  "event_type" text NOT NULL,
  "status" text NOT NULL,
  "payload_hash" text,
  "created_at" timestamp DEFAULT now(),
  "processed_at" timestamp,
  CONSTRAINT "webhook_events_delivery_id_unique" UNIQUE("delivery_id")
);
