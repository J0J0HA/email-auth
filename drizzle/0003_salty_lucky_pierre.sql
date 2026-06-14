CREATE TABLE "user_request_token" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_request_token" ADD CONSTRAINT "user_request_token_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;