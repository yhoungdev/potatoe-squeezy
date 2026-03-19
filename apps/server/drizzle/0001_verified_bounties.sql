ALTER TABLE "bounties" ADD COLUMN "is_verified" boolean DEFAULT false NOT NULL;
ALTER TABLE "bounties" ADD COLUMN "verification_source" text;
ALTER TABLE "bounties" ADD COLUMN "verified_at" timestamp;
ALTER TABLE "bounties" ADD COLUMN "bot_actor_login" text;
