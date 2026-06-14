CREATE TABLE "application" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"display_name" text NOT NULL,
	"redirect_to" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "application" ADD CONSTRAINT "application_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;