ALTER TABLE "jobs" ADD COLUMN "external_source" text;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "external_id" text;--> statement-breakpoint
CREATE UNIQUE INDEX "jobs_external_source_id_unique" ON "jobs" USING btree ("external_source","external_id");