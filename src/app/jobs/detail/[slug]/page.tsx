import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { jobs, companies, categories } from "@/db/schema";
import { eq, and, ne, or, sql, gte } from "drizzle-orm";
import { isJobExpired } from "@/lib/jobs/job-expiry";
import {
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  ChevronRight,
  BookOpen,
  GraduationCap,
  Award,
  Users,
  Building,
  ExternalLink,
  ChevronLeft,
  Globe
} from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import JobDetailsClient from "./JobDetailsClient";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

// Generate SEO Metadata dynamically
export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const { slug } = params;
  try {
    const results = await db
      .select({
        title: jobs.title,
        seoTitle: jobs.seoTitle,
        seoDescription: jobs.seoDescription,
        companyName: companies.name,
      })
      .from(jobs)
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .where(eq(jobs.slug, slug))
      .limit(1);

    if (results.length === 0) {
      return { title: "Job Not Found" };
    }

    const item = results[0];
    return {
      title: item.seoTitle || `${item.title} at ${item.companyName} | CareerDiscover`,
      description: item.seoDescription || `Apply for ${item.title} at ${item.companyName}. Discover eligibility, salary details, and interview schedules on CareerDiscover.`,
    };
  } catch (e) {
    return { title: "CareerDiscover Job Listing" };
  }
}

export default async function JobDetailPage(props: Props) {
  const params = await props.params;
  const { slug } = params;

  // Query database for complete job details
  const jobResults = await db
    .select({
      job: jobs,
      company: companies,
      category: categories,
    })
    .from(jobs)
    .innerJoin(companies, eq(jobs.companyId, companies.id))
    .innerJoin(categories, eq(jobs.categoryId, categories.id))
    .where(eq(jobs.slug, slug))
    .limit(1);

  if (jobResults.length === 0) {
    return notFound();
  }

  const { job, company, category } = jobResults[0];
  const expired = isJobExpired(job);

  // Increment views count in PostgreSQL
  try {
    await db
      .update(jobs)
      .set({ viewsCount: sql`${jobs.viewsCount} + 1` })
      .where(eq(jobs.id, job.id));
  } catch (e) {
    console.error("Failed to increment views on detail:", e);
  }

  // Fetch real similar jobs (same category or company, excluding current job)
  let similarJobs: any[] = [];
  try {
    similarJobs = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        slug: jobs.slug,
        workMode: jobs.workMode,
        employmentType: jobs.employmentType,
        city: jobs.city,
        country: jobs.country,
        isSalaryVisible: jobs.isSalaryVisible,
        minSalary: jobs.minSalary,
        maxSalary: jobs.maxSalary,
        currency: jobs.currency,
        companyName: companies.name,
      })
      .from(jobs)
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .where(
  and(
    eq(jobs.status, "PUBLISHED"),

    // Don't show jobs past their application deadline
    or(
      sql`${jobs.applicationDeadline} IS NULL`,
      gte(jobs.applicationDeadline, new Date())
    ),

    // Don't show jobs past expiresAt
    or(
      sql`${jobs.expiresAt} IS NULL`,
      gte(jobs.expiresAt, new Date())
    ),

    // Same category OR same company
    or(
      eq(jobs.categoryId, job.categoryId),
      eq(jobs.companyId, job.companyId)
    ),

    // Don't show current job
    ne(jobs.id, job.id)
  )
)
      .orderBy(desc(jobs.publishedAt))
      .limit(3);
  } catch (e) {
    console.error("Failed to fetch similar jobs:", e);
  }

  // Build JSON-LD structured data for Google JobPosting schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description,
    "datePosted": job.publishedAt.toISOString(),
    "validThrough": job.applicationDeadline ? job.applicationDeadline.toISOString() : undefined,
    "employmentType": job.employmentType === "Full-time" ? "FULL_TIME" : job.employmentType === "Part-time" ? "PART_TIME" : job.employmentType === "Contract" ? "CONTRACTOR" : "OTHER",
    "hiringOrganization": {
      "@type": "Organization",
      "name": company.name,
      "sameAs": company.website || undefined,
      "logo": company.logoUrl || undefined,
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.city,
        "addressRegion": job.state,
        "addressCountry": job.country,
        "streetAddress": job.address || undefined,
      },
    },
    "baseSalary": job.isSalaryVisible && job.minSalary ? {
      "@type": "MonetaryAmount",
      "currency": job.currency,
      "value": {
        "@type": "QuantitativeValue",
        "minValue": job.minSalary,
        "maxValue": job.maxSalary || job.minSalary,
        "unitText": job.salaryPeriod === "yearly" ? "YEAR" : job.salaryPeriod === "monthly" ? "MONTH" : "HOUR",
      },
    } : undefined,
  };

  return (
    <PublicLayout>
      {/* Inject Google SEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-neutral-50 dark:bg-neutral-950 min-h-screen py-8 border-b border-neutral-200 dark:border-neutral-900 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumbs Navigation */}
          <nav className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 mb-6 bg-white dark:bg-neutral-900 px-4 py-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800">
            <Link href="/" className="hover:text-blue-600 transition-colors font-medium">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/jobs" className="hover:text-blue-600 transition-colors font-medium">Jobs</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/categories/${category.slug}`} className="hover:text-blue-600 transition-colors font-medium">{category.name}</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-neutral-800 dark:text-neutral-200 font-semibold truncate max-w-[200px]">{job.title}</span>
          </nav>

          {/* Job Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Content Area: Core Info (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              <JobDetailsClient job={job} company={company} isExpired={expired} category={category} similarJobs={similarJobs} />
            </div>

            {/* Right Sidebar: Structured Quick Summary Panel (4 cols) */}
            <aside className="lg:col-span-4 space-y-6">
              
              {/* Job Summary Panel */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-4 border-b pb-2">
                  Job Summary
                </h3>

                <div className="space-y-4">
                  {[
                    { label: "Role Title", value: job.title, icon: <Briefcase className="h-4 w-4 text-blue-600 shrink-0" /> },
                    { label: "Employer", value: company.name, icon: <Building2 className="h-4 w-4 text-emerald-600 shrink-0" /> },
                    { label: "Location", value: `${job.city}, ${job.state}, ${job.country}`, icon: <MapPin className="h-4 w-4 text-red-500 shrink-0" /> },
                    { label: "Employment", value: job.employmentType, icon: <Clock className="h-4 w-4 text-purple-600 shrink-0" /> },
                    { label: "Work Model", value: job.workMode, icon: <Globe className="h-4 w-4 text-cyan-600 shrink-0" /> },
                    { label: "Experience", value: job.experienceLevel, icon: <Award className="h-4 w-4 text-amber-500 shrink-0" /> },
                    { label: "Salary Period", value: job.salaryPeriod, icon: <DollarSign className="h-4 w-4 text-green-500 shrink-0" /> },
                    { label: "Vacancies", value: `${job.vacancies} open position${job.vacancies > 1 ? "s" : ""}`, icon: <Users className="h-4 w-4 text-pink-500 shrink-0" /> },
                    { label: "Education", value: job.educationDegree || "Not Specified", icon: <GraduationCap className="h-4 w-4 text-indigo-500 shrink-0" /> },
                  ].map((row, idx) => (
                    <div key={idx} className="flex gap-3 text-sm">
                      <div className="mt-0.5">{row.icon}</div>
                      <div>
                        <span className="block text-xs font-bold uppercase text-neutral-400 leading-none mb-1">{row.label}</span>
                        <span className="font-semibold text-neutral-800 dark:text-neutral-100">{row.value}</span>
                      </div>
                    </div>
                  ))}
                  
                  {job.applicationDeadline && (
                    <div className="flex gap-3 text-sm pt-2 border-t">
                      <Calendar className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-xs font-bold uppercase text-neutral-400 leading-none mb-1">Apply Before</span>
                        <span className="font-bold text-red-600 dark:text-red-400">
                          {new Date(job.applicationDeadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Hiring Company Profile Card */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-4 border-b pb-2">
                  Company Info
                </h3>

                <div className="flex gap-4 items-center mb-4">
                  <div className="h-12 w-12 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center border border-neutral-200 dark:border-neutral-700 shrink-0">
                    {company.logoUrl ? (
                      <img src={company.logoUrl} alt={company.name} className="h-8 w-8 object-contain rounded" />
                    ) : (
                      <Building2 className="h-6 w-6 text-neutral-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-neutral-900 dark:text-white leading-tight">
                      {company.name}
                    </h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{company.industry}</p>
                  </div>
                </div>

                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4 line-clamp-3">
                  {company.description || "No corporate description registered."}
                </p>

                <div className="space-y-2 text-xs font-medium text-neutral-600 dark:text-neutral-400">
                  {company.headquarters && <p>📍 HQ: {company.headquarters}</p>}
                  {company.size && <p>👥 Size: {company.size} employees</p>}
                  {company.foundedYear && <p>📅 Founded: {company.foundedYear}</p>}
                </div>

                <div className="mt-4 pt-4 border-t flex gap-2">
                  <Link
                    href={`/companies/${company.slug}`}
                    className="flex-1 text-center py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-bold rounded-lg transition-all"
                  >
                    View Profile
                  </Link>
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold flex items-center justify-center transition-all"
                      title="Visit Website"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>

            </aside>

          </div>

        </div>
      </div>
    </PublicLayout>
  );
}

function desc(arg0: any): any {
  return sql`${arg0} DESC`;
}
