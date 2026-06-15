CREATE TABLE "profile_certifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"name" text NOT NULL,
	"proof_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "hours_per_week" integer;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "availability_hours_per_week" integer;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "preferred_project_types" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "preferred_specialties" text;--> statement-breakpoint
ALTER TABLE "profile_certifications" ADD CONSTRAINT "profile_certifications_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "profile_certifications_profile_idx" ON "profile_certifications" USING btree ("profile_id");