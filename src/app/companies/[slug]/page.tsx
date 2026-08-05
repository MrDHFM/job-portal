import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { companies, jobs, categories } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { Building2, MapPin, Globe, Users, Calendar, Briefcase, ChevronRight, ExternalLink } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function CompanyDetailPage(props: Props) {
  const params = await props.params;
  const { slug } = params;

  // Retrieve company
  const companyResults = await db
    .select()
    .from(companies)
    .where(and(eq(companies.slug, slug), eq(companies.isActive, true)))
    .limit(1);

  if (companyResults.length === 0) {
    return notFound();
  }

  const company = companyResults[0];

  // Retrieve published jobs for this company
  const activeJobs = await db
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
      categoryName: categories.name,
    })
    .from(jobs)
    .innerJoin(categories, eq(jobs.categoryId, categories.id))
    .where(and(eq(jobs.companyId, company.id), eq(jobs.status, "PUBLISHED")))
    .orderBy(desc(jobs.publishedAt));

  return (
    <PublicLayout>
      <div className="bg-neutral-50 dark:bg-neutral-950 min-h-screen py-10 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Header Card */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 rounded-2xl shadow-sm mb-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="h-20 w-20 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center border shrink-0">
                {company.logoUrl ? (
                  <img src={company.logoUrl} alt={company.name} className="h-14 w-14 object-contain rounded" />
                ) : (
                  <Building2 className="h-10 w-10 text-neutral-400" />
                )}
              </div>
              
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white leading-tight">
                    {company.name}
                  </h1>
                  <span className="bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-xs font-bold px-3 py-1 rounded-full">
                    {company.industry}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-neutral-500 dark:text-neutral-400 font-medium">
                  {company.headquarters && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-neutral-400" /> {company.headquarters}
                    </span>
                  )}
                  {company.size && (
                    <span className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-neutral-400" /> {company.size} employees
                    </span>
                  )}
                  {company.foundedYear && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-neutral-400" /> Founded {company.foundedYear}
                    </span>
                  )}
                </div>
              </div>

              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  Visit Website <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Description (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 rounded-2xl shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white border-b pb-2">About The Company</h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-line">
                  {company.description || "No corporate details registered for this employer."}
                </p>

                {company.linkedin && (
                  <div className="pt-4 flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-400 uppercase">External Links:</span>
                    <a href={company.linkedin} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 hover:underline">
                      LinkedIn Company Page
                    </a>
                  </div>
                )}
              </div>

              {/* Jobs section */}
              <div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
                  Active Career Openings ({activeJobs.length})
                </h2>

                {activeJobs.length === 0 ? (
                  <div className="bg-white dark:bg-neutral-900 border border-dashed border-neutral-200 dark:border-neutral-800 p-12 text-center rounded-2xl shadow-sm">
                    <Briefcase className="mx-auto h-12 w-12 text-neutral-300 mb-4" />
                    <p className="text-neutral-600 dark:text-neutral-400 font-medium">No open positions available.</p>
                    <p className="text-xs text-neutral-400 mt-1">This firm has zero published vacancies right now.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeJobs.map((job) => (
                      <div
                        key={job.id}
                        className="bg-white dark:bg-neutral-900 p-6 border border-neutral-200 dark:border-neutral-800 rounded-2xl hover:border-blue-500 shadow-xs transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                      >
                        <div>
                          <h3 className="font-extrabold text-neutral-900 dark:text-white hover:text-blue-600 text-base">
                            <Link href={`/jobs/detail/${job.slug}`}>{job.title}</Link>
                          </h3>
                          <p className="text-xs text-neutral-500 mt-1">
                            {job.categoryName} • {job.employmentType} • {job.workMode}
                          </p>
                          <p className="text-xs text-neutral-400 mt-0.5">{job.city}, {job.country}</p>
                        </div>
                        <div className="shrink-0 flex items-center gap-3">
                          <span className="text-xs font-bold text-neutral-900 dark:text-white">
                            {job.isSalaryVisible && job.minSalary
                              ? `$${(job.minSalary/1000).toFixed(0)}k - ${(job.maxSalary ? job.maxSalary/1000 : 0).toFixed(0)}k`
                              : "Salary Undisclosed"}
                          </span>
                          <Link
                            href={`/jobs/detail/${job.slug}`}
                            className="bg-neutral-100 hover:bg-blue-600 hover:text-white text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all"
                          >
                            Apply
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Quick Overview Sidebar (4 cols) */}
            <aside className="lg:col-span-4 space-y-6">
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl shadow-sm">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-4 border-b pb-2">Employer Snapshot</h3>
                <div className="space-y-3.5 text-sm">
                  <p><strong className="text-neutral-400 text-xs uppercase block">Industry Sector</strong> <span className="font-semibold text-neutral-800 dark:text-neutral-100">{company.industry || "Not Specified"}</span></p>
                  <p><strong className="text-neutral-400 text-xs uppercase block">Headquarters</strong> <span className="font-semibold text-neutral-800 dark:text-neutral-100">{company.headquarters || "Global HQ"}</span></p>
                  <p><strong className="text-neutral-400 text-xs uppercase block">Staff Count</strong> <span className="font-semibold text-neutral-800 dark:text-neutral-100">{company.size || "Unknown"}</span></p>
                  <p><strong className="text-neutral-400 text-xs uppercase block">Founded Year</strong> <span className="font-semibold text-neutral-800 dark:text-neutral-100">{company.foundedYear || "Not Specified"}</span></p>
                  <p><strong className="text-neutral-400 text-xs uppercase block">Status</strong> <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Active Recruiter</span></p>
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
