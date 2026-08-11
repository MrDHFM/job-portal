CREATE TABLE "job_traffic_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" integer NOT NULL,
	"event_type" text NOT NULL,
	"source" text DEFAULT 'direct' NOT NULL,
	"medium" text,
	"campaign" text,
	"content" text,
	"session_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP INDEX "job_social_posts_job_platform_unique";--> statement-breakpoint
ALTER TABLE "job_traffic_events" ADD CONSTRAINT "job_traffic_events_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "job_traffic_job_id_idx" ON "job_traffic_events" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "job_traffic_source_idx" ON "job_traffic_events" USING btree ("source");--> statement-breakpoint
CREATE INDEX "job_traffic_event_type_idx" ON "job_traffic_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "job_traffic_created_at_idx" ON "job_traffic_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "job_social_posts_job_platform_unique" ON "job_social_posts" USING btree ("job_id","platform");