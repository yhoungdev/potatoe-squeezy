CREATE TABLE "addresses" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"chain" text NOT NULL,
	"address" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "addresses_user_chain_unique" ON "addresses" USING btree ("user_id","chain");
--> statement-breakpoint
INSERT INTO "addresses" ("user_id", "chain", "address", "created_at", "updated_at")
SELECT "user_id", "chain", "address", "created_at", "updated_at"
FROM "wallets"
ON CONFLICT ("user_id", "chain") DO NOTHING;
