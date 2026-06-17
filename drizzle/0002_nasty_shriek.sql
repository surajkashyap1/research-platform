ALTER TYPE "public"."career_stage" ADD VALUE 'masters_student' BEFORE 'other_student';--> statement-breakpoint
ALTER TYPE "public"."career_stage" ADD VALUE 'phd_student' BEFORE 'other_student';--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "career_stage_other" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "linkedin_url" text;--> statement-breakpoint
ALTER TABLE "verifications" ADD COLUMN "token" text;--> statement-breakpoint
ALTER TABLE "verifications" ADD COLUMN "expires_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "verifications_token_idx" ON "verifications" USING btree ("token");