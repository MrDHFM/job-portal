import { pgTable, serial, text, timestamp, integer, boolean , index, uniqueIndex } from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";

// Users (Admins, Editors, Candidates)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("admin"), // "super_admin", "admin", "editor"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Companies
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logoUrl: text("logo_url"),
  description: text("description"),
  website: text("website"),
  industry: text("industry"),
  size: text("size"), // "1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"
  foundedYear: integer("founded_year"),
  headquarters: text("headquarters"),
  linkedin: text("linkedin"),
  otherSocials: text("other_socials"), // JSON or text
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Categories (e.g. IT, Non-IT, Government, Finance, etc.)
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  displayOrder: integer("display_order").default(0).notNull(),
  isVisible: boolean("is_visible").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Jobs
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id")
    .references(() => companies.id, { onDelete: "cascade" })
    .notNull(),
  categoryId: integer("category_id")
    .references(() => categories.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  sector: text("sector").notNull(), // "IT", "Non-IT"
  employmentType: text("employment_type").notNull(), // "Full-time", "Part-time", "Contract", "Internship", "Walk-In", "Fresher"
  experienceLevel: text("experience_level").notNull(), // "Fresher", "Experienced", "0-1 Years", "1-3 Years", etc.
  minExperienceYears: integer("min_experience_years"),
  maxExperienceYears: integer("max_experience_years"),
  workMode: text("work_mode").notNull(), // "Remote", "Hybrid", "On-site"
  vacancies: integer("vacancies"), // null = not specified; do not default to 1
  
  // Location
  country: text("country").notNull(),
  state: text("state").notNull(),
  city: text("city").notNull(),
  address: text("address"),
  isRemoteEligible: boolean("is_remote_eligible").default(false).notNull(),

  // Compensation
  minSalary: integer("min_salary"),
  maxSalary: integer("max_salary"),
  currency: text("currency").default("USD").notNull(),
  salaryPeriod: text("salary_period").default("yearly").notNull(), // "hourly", "monthly", "yearly"
  isSalaryVisible: boolean("is_salary_visible").default(false).notNull(),

  // Rich-text contents
  summary: text("summary"),
  aboutRole: text("about_role"),
  description: text("description"),
  responsibilities: text("responsibilities"), // lines separated by newline or list
  eligibility: text("eligibility"),
  benefits: text("benefits"),
  hiringProcess: text("hiring_process"), // stages separated by arrow or list
  additionalInfo: text("additional_info"),

  // Skills (Comma separated or space separated for easier SQL search)
  requiredSkills: text("required_skills"), 
  preferredSkills: text("preferred_skills"),

  // Education Requirements
  educationQualification: text("education_qualification"),
  educationDegree: text("education_degree"),
  educationBranch: text("education_branch"),
  graduationYear: integer("graduation_year"),
  minCgpa: text("min_cgpa"),

  // Application
  applicationMethod: text("application_method").notNull(), // "EXTERNAL_URL", "EMAIL", "INTERNAL"
  applicationUrl: text("application_url"),
  recruiterEmail: text("recruiter_email"),
  applicationDeadline: timestamp("application_deadline"),

  // Walk-In Specific Fields
  walkinDate: timestamp("walkin_date"),
  walkinStartTime: text("walkin_start_time"),
  walkinEndTime: text("walkin_end_time"),
  walkinVenue: text("walkin_venue"),
  walkinContactInfo: text("walkin_contact_info"),
  walkinDocuments: text("walkin_documents"),
  walkinInstructions: text("walkin_instructions"),

  // Government Job Specific Fields
  govOrganization: text("gov_organization"),
  govNotificationNumber: text("gov_notification_number"),
  govAgeLimit: text("gov_age_limit"),
  govApplicationFee: text("gov_application_fee"),
  govSelectionProcess: text("gov_selection_process"),
  govOfficialNotificationUrl: text("gov_official_notification_url"),
  govOfficialWebsiteUrl: text("gov_official_website_url"),

  // Status and Flags
  status: text("status").notNull().default("PUBLISHED"), // "DRAFT", "SCHEDULED", "PUBLISHED", "EXPIRED", "ARCHIVED"
  isFeatured: boolean("is_featured").default(false).notNull(),
  isUrgent: boolean("is_urgent").default(false).notNull(),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),

  // Source tracking, shared by both the URL-import feature and the
  // Adzuna auto-import feature — externalSource doubles as "sourceType"
  // (e.g. "MANUAL", "URL_IMPORT", "GREENHOUSE", "LEVER", "ASHBY", "adzuna")
  // and externalId as "externalJobId", so we don't carry two near-duplicate
  // column pairs for the same concept.
  externalSource: text("external_source"), // e.g. "adzuna", "GREENHOUSE", "URL_IMPORT"
  externalId: text("external_id"), // the source's own ID for this listing
  originalJobUrl: text("original_job_url"), // the URL an admin pasted / the source listing URL
  originalApplyUrl: text("original_apply_url"), // the source's own "apply" link, if different from applicationUrl
  sourcePublishedAt: timestamp("source_published_at"), // datePosted from the source, if known
  autoImported: boolean("auto_imported").default(false).notNull(), // true only for unattended pipelines (e.g. Adzuna cron); false for manual + URL-import (an admin always reviews those before saving)

  // Metrics
  viewsCount: integer("views_count").default(0).notNull(),
  applyClicksCount: integer("apply_clicks_count").default(0).notNull(),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  scheduledPublishAt: timestamp("scheduled_publish_at"),
  expiresAt: timestamp("expires_at"),
},
  (table) => ({
    statusIdx: index("jobs_status_idx").on(table.status),
    createdAtIdx: index("jobs_created_at_idx").on(table.createdAt),
    publishedAtIdx: index("jobs_published_at_idx").on(table.publishedAt),
    expiresAtIdx: index("jobs_expires_at_idx").on(table.expiresAt),
    companyIdIdx: index("jobs_company_id_idx").on(table.companyId),
    categoryIdIdx: index("jobs_category_id_idx").on(table.categoryId),
    // Composite index matching the public listing's most common query:
    // WHERE status = 'PUBLISHED' ORDER BY published_at DESC
    statusPublishedAtIdx: index("jobs_status_published_at_idx").on(
      table.status,
      table.publishedAt,
    ),
    // Prevents the same external listing from being imported twice on
    // repeated cron runs. Both columns are nullable (manual jobs have
    // neither), so this only constrains rows that actually came from
    // an import source.
    externalSourceIdIdx: uniqueIndex("jobs_external_source_id_unique").on(
      table.externalSource,
      table.externalId,
    ),
  }),
);

export const jobSocialPosts = pgTable(
  "job_social_posts",
  {
    id: serial("id").primaryKey(),

    jobId: integer("job_id")
      .references(() => jobs.id, {
        onDelete: "cascade",
      })
      .notNull(),

    platform: text("platform").notNull(),

    status: text("status")
      .notNull()
      .default("PENDING"),

    externalPostId: text("external_post_id"),

    externalPostUrl: text("external_post_url"),

    postContent: text("post_content"),

    errorMessage: text("error_message"),

    postedAt: timestamp("posted_at"),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    jobPlatformUnique: index(
      "job_social_posts_job_platform_unique"
    ).on(
      table.jobId,
      table.platform
    ),
    statusIdx: index("job_social_posts_status_idx").on(table.status),
  })
);

// Job Traffic Analytics
export const jobTrafficEvents = pgTable(
  "job_traffic_events",
  {
    id: serial("id").primaryKey(),

    jobId: integer("job_id")
      .references(() => jobs.id, { onDelete: "cascade" })
      .notNull(),

    eventType: text("event_type").notNull(),

    source: text("source")
      .notNull()
      .default("direct"),

    medium: text("medium"),

    campaign: text("campaign"),

    content: text("content"),

    sessionId: text("session_id"),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    jobIdIdx: index("job_traffic_job_id_idx")
      .on(table.jobId),

    sourceIdx: index("job_traffic_source_idx")
      .on(table.source),

    eventTypeIdx: index("job_traffic_event_type_idx")
      .on(table.eventType),

    createdAtIdx: index("job_traffic_created_at_idx")
      .on(table.createdAt),
  }),
);

// Applications for internal submissions
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id")
    .references(() => jobs.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  resumeUrl: text("resume_url").notNull(),
  coverLetter: text("cover_letter"),
  linkedinUrl: text("linkedin_url"),
  portfolioUrl: text("portfolio_url"),
  status: text("status").default("pending").notNull(), // "pending", "reviewed", "shortlisted", "rejected", "offered"
  createdAt: timestamp("created_at").defaultNow().notNull(),
},
  (table) => ({
    jobIdIdx: index("applications_job_id_idx").on(table.jobId),
    statusIdx: index("applications_status_idx").on(table.status),
    createdAtIdx: index("applications_created_at_idx").on(table.createdAt),
  }),
);

// Saved Jobs (using local session ID or email or userId)
export const savedJobs = pgTable("saved_jobs", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(), // can be user's session ID or persistent guest token
  jobId: integer("job_id")
    .references(() => jobs.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Job Alerts
export const jobAlerts = pgTable("job_alerts", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  keywords: text("keywords"),
  categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
  location: text("location"),
  frequency: text("frequency").default("daily").notNull(), // "daily", "weekly"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Contact Messages
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  isResolved: boolean("is_resolved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Admin Activity Logs
export const adminActivityLogs = pgTable("admin_activity_logs", {
  id: serial("id").primaryKey(),
  adminName: text("admin_name").notNull(),
  action: text("action").notNull(), // "JOB_CREATE", "JOB_EDIT", "COMPANY_CREATE", etc.
  entity: text("entity").notNull(), // "jobs", "companies", "categories", etc.
  entityId: integer("entity_id"),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Site Settings
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relationships
export const jobsRelations = relations(jobs, ({ one, many }) => ({
  company: one(companies, {
    fields: [jobs.companyId],
    references: [companies.id],
  }),

  category: one(categories, {
    fields: [jobs.categoryId],
    references: [categories.id],
  }),

  applications: many(applications),

  saved: many(savedJobs),

  trafficEvents: many(jobTrafficEvents),
}));

export const jobSocialPostsRelations = relations(
  jobSocialPosts,
  ({ one }) => ({
    job: one(jobs, {
      fields: [jobSocialPosts.jobId],
      references: [jobs.id],
    }),
  })
);

export const companiesRelations = relations(companies, ({ many }) => ({
  jobs: many(jobs),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  jobs: many(jobs),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  job: one(jobs, {
    fields: [applications.jobId],
    references: [jobs.id],
  }),
}));
