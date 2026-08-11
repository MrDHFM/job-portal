import { pgTable, serial, text, integer, timestamp, unique, boolean, foreignKey, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const adminActivityLogs = pgTable("admin_activity_logs", {
	id: serial().primaryKey().notNull(),
	adminName: text("admin_name").notNull(),
	action: text().notNull(),
	entity: text().notNull(),
	entityId: integer("entity_id"),
	details: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const categories = pgTable("categories", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	description: text(),
	displayOrder: integer("display_order").default(0).notNull(),
	isVisible: boolean("is_visible").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("categories_slug_unique").on(table.slug),
]);

export const companies = pgTable("companies", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	logoUrl: text("logo_url"),
	description: text(),
	website: text(),
	industry: text(),
	size: text(),
	foundedYear: integer("founded_year"),
	headquarters: text(),
	linkedin: text(),
	otherSocials: text("other_socials"),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("companies_slug_unique").on(table.slug),
]);

export const contactMessages = pgTable("contact_messages", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	subject: text().notNull(),
	message: text().notNull(),
	isRead: boolean("is_read").default(false).notNull(),
	isResolved: boolean("is_resolved").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const jobAlerts = pgTable("job_alerts", {
	id: serial().primaryKey().notNull(),
	email: text().notNull(),
	keywords: text(),
	categoryId: integer("category_id"),
	location: text(),
	frequency: text().default('daily').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "job_alerts_category_id_categories_id_fk"
		}).onDelete("set null"),
]);

export const jobs = pgTable("jobs", {
	id: serial().primaryKey().notNull(),
	companyId: integer("company_id").notNull(),
	categoryId: integer("category_id").notNull(),
	title: text().notNull(),
	slug: text().notNull(),
	sector: text().notNull(),
	employmentType: text("employment_type").notNull(),
	experienceLevel: text("experience_level").notNull(),
	workMode: text("work_mode").notNull(),
	vacancies: integer().default(1).notNull(),
	country: text().notNull(),
	state: text().notNull(),
	city: text().notNull(),
	address: text(),
	isRemoteEligible: boolean("is_remote_eligible").default(false).notNull(),
	minSalary: integer("min_salary"),
	maxSalary: integer("max_salary"),
	currency: text().default('USD').notNull(),
	salaryPeriod: text("salary_period").default('yearly').notNull(),
	isSalaryVisible: boolean("is_salary_visible").default(false).notNull(),
	summary: text(),
	aboutRole: text("about_role"),
	description: text().notNull(),
	responsibilities: text(),
	eligibility: text(),
	benefits: text(),
	hiringProcess: text("hiring_process"),
	additionalInfo: text("additional_info"),
	requiredSkills: text("required_skills"),
	preferredSkills: text("preferred_skills"),
	educationQualification: text("education_qualification"),
	educationDegree: text("education_degree"),
	educationBranch: text("education_branch"),
	graduationYear: integer("graduation_year"),
	minCgpa: text("min_cgpa"),
	applicationMethod: text("application_method").notNull(),
	applicationUrl: text("application_url"),
	recruiterEmail: text("recruiter_email"),
	applicationDeadline: timestamp("application_deadline", { mode: 'string' }),
	walkinDate: timestamp("walkin_date", { mode: 'string' }),
	walkinStartTime: text("walkin_start_time"),
	walkinEndTime: text("walkin_end_time"),
	walkinVenue: text("walkin_venue"),
	walkinContactInfo: text("walkin_contact_info"),
	walkinDocuments: text("walkin_documents"),
	walkinInstructions: text("walkin_instructions"),
	govOrganization: text("gov_organization"),
	govNotificationNumber: text("gov_notification_number"),
	govAgeLimit: text("gov_age_limit"),
	govApplicationFee: text("gov_application_fee"),
	govSelectionProcess: text("gov_selection_process"),
	govOfficialNotificationUrl: text("gov_official_notification_url"),
	govOfficialWebsiteUrl: text("gov_official_website_url"),
	status: text().default('PUBLISHED').notNull(),
	isFeatured: boolean("is_featured").default(false).notNull(),
	isUrgent: boolean("is_urgent").default(false).notNull(),
	seoTitle: text("seo_title"),
	seoDescription: text("seo_description"),
	viewsCount: integer("views_count").default(0).notNull(),
	applyClicksCount: integer("apply_clicks_count").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	publishedAt: timestamp("published_at", { mode: 'string' }).defaultNow().notNull(),
	scheduledPublishAt: timestamp("scheduled_publish_at", { mode: 'string' }),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.companyId],
			foreignColumns: [companies.id],
			name: "jobs_company_id_companies_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "jobs_category_id_categories_id_fk"
		}).onDelete("cascade"),
	unique("jobs_slug_unique").on(table.slug),
]);

export const siteSettings = pgTable("site_settings", {
	id: serial().primaryKey().notNull(),
	key: text().notNull(),
	value: text().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("site_settings_key_unique").on(table.key),
]);

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	email: text().notNull(),
	passwordHash: text("password_hash").notNull(),
	name: text().notNull(),
	role: text().default('admin').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const applications = pgTable("applications", {
	id: serial().primaryKey().notNull(),
	jobId: integer("job_id").notNull(),
	name: text().notNull(),
	email: text().notNull(),
	phone: text().notNull(),
	resumeUrl: text("resume_url").notNull(),
	coverLetter: text("cover_letter"),
	linkedinUrl: text("linkedin_url"),
	portfolioUrl: text("portfolio_url"),
	status: text().default('pending').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.jobId],
			foreignColumns: [jobs.id],
			name: "applications_job_id_jobs_id_fk"
		}).onDelete("cascade"),
]);

export const savedJobs = pgTable("saved_jobs", {
	id: serial().primaryKey().notNull(),
	sessionId: text("session_id").notNull(),
	jobId: integer("job_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.jobId],
			foreignColumns: [jobs.id],
			name: "saved_jobs_job_id_jobs_id_fk"
		}).onDelete("cascade"),
]);

export const jobSocialPosts = pgTable("job_social_posts", {
	id: serial().primaryKey().notNull(),
	jobId: integer("job_id").notNull(),
	platform: text().notNull(),
	status: text().default('PENDING').notNull(),
	externalPostId: text("external_post_id"),
	externalPostUrl: text("external_post_url"),
	postContent: text("post_content"),
	errorMessage: text("error_message"),
	postedAt: timestamp("posted_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("job_social_posts_job_platform_unique").using("btree", table.jobId.asc().nullsLast().op("int4_ops"), table.platform.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.jobId],
			foreignColumns: [jobs.id],
			name: "job_social_posts_job_id_jobs_id_fk"
		}).onDelete("cascade"),
]);

export const jobTrafficEvents = pgTable("job_traffic_events", {
	id: serial().primaryKey().notNull(),
	jobId: integer("job_id").notNull(),
	eventType: text("event_type").notNull(),
	source: text().default('direct').notNull(),
	medium: text(),
	campaign: text(),
	content: text(),
	sessionId: text("session_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("job_traffic_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("job_traffic_event_type_idx").using("btree", table.eventType.asc().nullsLast().op("text_ops")),
	index("job_traffic_job_id_idx").using("btree", table.jobId.asc().nullsLast().op("int4_ops")),
	index("job_traffic_source_idx").using("btree", table.source.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.jobId],
			foreignColumns: [jobs.id],
			name: "job_traffic_events_job_id_jobs_id_fk"
		}).onDelete("cascade"),
]);
