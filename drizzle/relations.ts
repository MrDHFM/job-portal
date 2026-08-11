import { relations } from "drizzle-orm/relations";
import { categories, jobAlerts, companies, jobs, applications, savedJobs, jobSocialPosts, jobTrafficEvents } from "./schema";

export const jobAlertsRelations = relations(jobAlerts, ({one}) => ({
	category: one(categories, {
		fields: [jobAlerts.categoryId],
		references: [categories.id]
	}),
}));

export const categoriesRelations = relations(categories, ({many}) => ({
	jobAlerts: many(jobAlerts),
	jobs: many(jobs),
}));

export const jobsRelations = relations(jobs, ({one, many}) => ({
	company: one(companies, {
		fields: [jobs.companyId],
		references: [companies.id]
	}),
	category: one(categories, {
		fields: [jobs.categoryId],
		references: [categories.id]
	}),
	applications: many(applications),
	savedJobs: many(savedJobs),
	jobSocialPosts: many(jobSocialPosts),
	jobTrafficEvents: many(jobTrafficEvents),
}));

export const companiesRelations = relations(companies, ({many}) => ({
	jobs: many(jobs),
}));

export const applicationsRelations = relations(applications, ({one}) => ({
	job: one(jobs, {
		fields: [applications.jobId],
		references: [jobs.id]
	}),
}));

export const savedJobsRelations = relations(savedJobs, ({one}) => ({
	job: one(jobs, {
		fields: [savedJobs.jobId],
		references: [jobs.id]
	}),
}));

export const jobSocialPostsRelations = relations(jobSocialPosts, ({one}) => ({
	job: one(jobs, {
		fields: [jobSocialPosts.jobId],
		references: [jobs.id]
	}),
}));

export const jobTrafficEventsRelations = relations(jobTrafficEvents, ({one}) => ({
	job: one(jobs, {
		fields: [jobTrafficEvents.jobId],
		references: [jobs.id]
	}),
}));