ALTER TABLE "bounties" ADD COLUMN "is_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "bounties" ADD COLUMN "verification_source" text;--> statement-breakpoint
ALTER TABLE "bounties" ADD COLUMN "verified_at" timestamp;--> statement-breakpoint
ALTER TABLE "bounties" ADD COLUMN "bot_actor_login" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "display_name" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "twitter_url" text;