CREATE TYPE "public"."quest_status" AS ENUM('ACTIVE', 'COMPLETED', 'LOCKED', 'SKIPPED');--> statement-breakpoint
CREATE TABLE "quest_states" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"challenge_id" text NOT NULL,
	"status" "quest_status" DEFAULT 'LOCKED' NOT NULL,
	"final_code" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "quest_states" ADD CONSTRAINT "quest_states_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quest_states" ADD CONSTRAINT "quest_states_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "quest_states_user_challenge_unique" ON "quest_states" USING btree ("user_id","challenge_id");--> statement-breakpoint
CREATE INDEX "quest_states_user_idx" ON "quest_states" USING btree ("user_id");