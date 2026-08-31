ALTER TABLE "jobs" ADD COLUMN "original_job_url" text;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "original_apply_url" text;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "source_published_at" timestamp;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "auto_imported" boolean DEFAULT false NOT NULL;