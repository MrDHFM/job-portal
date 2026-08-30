ALTER TABLE "jobs" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "min_experience_years" integer;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "max_experience_years" integer;