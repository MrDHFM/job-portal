CREATE TABLE "admin_activity_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"admin_name" text NOT NULL,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" integer,
	"details" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" integer NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"resume_url" text NOT NULL,
	"cover_letter" text,
	"linkedin_url" text,
	"portfolio_url" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo_url" text,
	"description" text,
	"website" text,
	"industry" text,
	"size" text,
	"founded_year" integer,
	"headquarters" text,
	"linkedin" text,
	"other_socials" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "companies_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"is_resolved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"keywords" text,
	"category_id" integer,
	"location" text,
	"frequency" text DEFAULT 'daily' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_social_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" integer NOT NULL,
	"platform" text NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"external_post_id" text,
	"external_post_url" text,
	"post_content" text,
	"error_message" text,
	"posted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"sector" text NOT NULL,
	"employment_type" text NOT NULL,
	"experience_level" text NOT NULL,
	"work_mode" text NOT NULL,
	"vacancies" integer DEFAULT 1 NOT NULL,
	"country" text NOT NULL,
	"state" text NOT NULL,
	"city" text NOT NULL,
	"address" text,
	"is_remote_eligible" boolean DEFAULT false NOT NULL,
	"min_salary" integer,
	"max_salary" integer,
	"currency" text DEFAULT 'USD' NOT NULL,
	"salary_period" text DEFAULT 'yearly' NOT NULL,
	"is_salary_visible" boolean DEFAULT false NOT NULL,
	"summary" text,
	"about_role" text,
	"description" text NOT NULL,
	"responsibilities" text,
	"eligibility" text,
	"benefits" text,
	"hiring_process" text,
	"additional_info" text,
	"required_skills" text,
	"preferred_skills" text,
	"education_qualification" text,
	"education_degree" text,
	"education_branch" text,
	"graduation_year" integer,
	"min_cgpa" text,
	"application_method" text NOT NULL,
	"application_url" text,
	"recruiter_email" text,
	"application_deadline" timestamp,
	"walkin_date" timestamp,
	"walkin_start_time" text,
	"walkin_end_time" text,
	"walkin_venue" text,
	"walkin_contact_info" text,
	"walkin_documents" text,
	"walkin_instructions" text,
	"gov_organization" text,
	"gov_notification_number" text,
	"gov_age_limit" text,
	"gov_application_fee" text,
	"gov_selection_process" text,
	"gov_official_notification_url" text,
	"gov_official_website_url" text,
	"status" text DEFAULT 'PUBLISHED' NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_urgent" boolean DEFAULT false NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"views_count" integer DEFAULT 0 NOT NULL,
	"apply_clicks_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"published_at" timestamp DEFAULT now() NOT NULL,
	"scheduled_publish_at" timestamp,
	"expires_at" timestamp,
	CONSTRAINT "jobs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "saved_jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"job_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "site_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"role" text DEFAULT 'admin' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_alerts" ADD CONSTRAINT "job_alerts_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_social_posts" ADD CONSTRAINT "job_social_posts_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_jobs" ADD CONSTRAINT "saved_jobs_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "job_social_posts_job_platform_unique" ON "job_social_posts" USING btree ("job_id","platform");