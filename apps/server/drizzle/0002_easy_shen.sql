CREATE TABLE "transaction_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"amount" numeric NOT NULL,
	"sender_address" text NOT NULL,
	"sender_id" integer,
	"recipient_address" text NOT NULL,
	"recipient_id" integer,
	"tx_hash" text NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "transaction_records" ADD CONSTRAINT "transaction_records_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_records" ADD CONSTRAINT "transaction_records_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;