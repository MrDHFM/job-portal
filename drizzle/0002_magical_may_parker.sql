ALTER TABLE "jobs" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "min_experience_years" integer;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "max_experience_years" integer;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "external_source" text;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "external_id" text;--> statement-breakpoint
CREATE INDEX "applications_job_id_idx" ON "applications" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "applications_status_idx" ON "applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "applications_created_at_idx" ON "applications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "job_social_posts_status_idx" ON "job_social_posts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "jobs_status_idx" ON "jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "jobs_created_at_idx" ON "jobs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "jobs_published_at_idx" ON "jobs" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "jobs_expires_at_idx" ON "jobs" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "jobs_company_id_idx" ON "jobs" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "jobs_category_id_idx" ON "jobs" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "jobs_status_published_at_idx" ON "jobs" USING btree ("status","published_at");--> statement-breakpoint
CREATE UNIQUE INDEX "jobs_external_source_id_unique" ON "jobs" USING btree ("external_source","external_id");