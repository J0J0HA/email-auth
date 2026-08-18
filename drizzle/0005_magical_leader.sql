ALTER TABLE "user" ADD COLUMN "is_elevated" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "is_teacher" boolean DEFAULT false NOT NULL;