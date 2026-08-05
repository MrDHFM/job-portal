import React from "react";
import Link from "next/link";
import { db } from "@/db";
import { jobs, companies, categories } from "@/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import {
  Search,
  MapPin,
  Briefcase,
  Layers,
  ArrowRight,
  TrendingUp,
  Globe,
  Plus,
  ShieldCheck,
  Zap,
  Building2,
  Calendar
} from "lucide-react";
import PublicLayout from "@/components/PublicLayout";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Query real data from PostgreSQL
  let activeCategories: any[] = [];
  let featuredJobs: any[] = [];
  let latestJobs: any[] = [];
  let popularCompanies: any[] = [];
  let popularLocations: any[] = [];

  try {
    // 1. Categories with real active job count
    activeCategories = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        activeJobsCount: sql<number>`cast(count(${jobs.id}) as integer)`,
      })
      .from(categories)
      .leftJoin(jobs, and(eq(jobs.categoryId, categories.id), eq(jobs.status, "PUBLISHED")))
      .where(eq(categories.isVisible, true))
      .groupBy(categories.id)
      .orderBy(categories.displayOrder, categories.name)
      .limit(8);

    // 2. Featured Jobs (only those with isFeatured = true)
    featuredJobs = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        slug: jobs.slug,
        sector: jobs.sector,
        employmentType: jobs.employmentType,
        workMode: jobs.workMode,
        city: jobs.city,
        minSalary: jobs.minSalary,
        maxSalary: jobs.maxSalary,
        currency: jobs.currency,
        isSalaryVisible: jobs.isSalaryVisible,
        publishedAt: jobs.publishedAt,
        company: {
          name: companies.name,
          logoUrl: companies.logoUrl,
          slug: companies.slug,
        },
      })
      .from(jobs)
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .where(and(eq(jobs.status, "PUBLISHED"), eq(jobs.isFeatured, true)))
      .orderBy(desc(jobs.publishedAt))
      .limit(6);

    // 3. Latest Jobs (recently published)
    latestJobs = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        slug: jobs.slug,
        sector: jobs.sector,
        employmentType: jobs.employmentType,
        workMode: jobs.workMode,
        city: jobs.city,
        minSalary: jobs.minSalary,
        maxSalary: jobs.maxSalary,
        currency: jobs.currency,
        isSalaryVisible: jobs.isSalaryVisible,
        publishedAt: jobs.publishedAt,
        company: {
          name: companies.name,
          logoUrl: companies.logoUrl,
          slug: companies.slug,
        },
      })
      .from(jobs)
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .where(eq(jobs.status, "PUBLISHED"))
      .orderBy(desc(jobs.publishedAt))
      .limit(6);

    // 4. Companies with active openings
    popularCompanies = await db
      .select({
        id: companies.id,
        name: companies.name,
        slug: companies.slug,
        logoUrl: companies.logoUrl,
        industry: companies.industry,
        headquarters: companies.headquarters,
        activeJobsCount: sql<number>`cast(count(${jobs.id}) as integer)`,
      })
      .from(companies)
      .innerJoin(jobs, and(eq(jobs.companyId, companies.id), eq(jobs.status, "PUBLISHED")))
      .groupBy(companies.id)
      .orderBy(desc(sql`count(${jobs.id})`))
      .limit(6);

    // 5. Popular locations with active job count
    popularLocations = await db
      .select({
        city: jobs.city,
        country: jobs.country,
        count: sql<number>`cast(count(*) as integer)`,
      })
      .from(jobs)
      .where(eq(jobs.status, "PUBLISHED"))
      .groupBy(jobs.city, jobs.country)
      .orderBy(desc(sql`count(*)`))
      .limit(4);

  } catch (error) {
    console.error("Database query failed on homepage:", error);
  }

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28 bg-gradient-to-b from-blue-50/40 via-white to-white dark:from-neutral-900/40 dark:via-neutral-950 dark:to-neutral-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 mb-6">
              <Zap className="h-3.5 w-3.5 fill-current" />
              Verified & Real-Time Openings
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-6">
              Find the right opportunity for your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                next career move
              </span>
            </h1>
            
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              Browse 100% verified jobs across major engineering fields, governmental departments, private institutions, remote openings, and on-site walk-ins.
            </p>
          </div>

          {/* Interactive Search Box */}
          <div className="max-w-4xl mx-auto">
            <form action="/jobs" method="GET" className="bg-white dark:bg-neutral-900 p-2 rounded-2xl shadow-xl border border-neutral-100 dark:border-neutral-800 grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
              <div className="md:col-span-5 flex items-center px-3 gap-2">
                <Search className="h-5 w-5 text-neutral-400 shrink-0" />
                <input
                  type="text"
                  name="keyword"
                  placeholder="Job title, keyword, skills or company..."
                  className="w-full bg-transparent border-0 outline-none text-sm py-3 text-neutral-800 dark:text-neutral-100 placeholder-neutral-400"
                />
              </div>
              <div className="md:col-span-4 flex items-center px-3 gap-2 border-t md:border-t-0 md:border-l border-neutral-100 dark:border-neutral-800">
                <MapPin className="h-5 w-5 text-neutral-400 shrink-0" />
                <input
                  type="text"
                  name="location"
                  placeholder="City, state, or country..."
                  className="w-full bg-transparent border-0 outline-none text-sm py-3 text-neutral-800 dark:text-neutral-100 placeholder-neutral-400"
                />
              </div>
              <div className="md:col-span-3">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all shadow-md shadow-blue-600/15 cursor-pointer"
                >
                  Search Jobs
                </button>
              </div>
            </form>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2 justify-center mt-6 text-sm text-neutral-500 dark:text-neutral-400 items-center">
              <span className="font-medium text-neutral-700 dark:text-neutral-300">Quick Searches:</span>
              <Link href="/jobs/remote" className="px-3 py-1 rounded-full bg-neutral-100 hover:bg-blue-50 dark:bg-neutral-800 dark:hover:bg-blue-950/30 dark:hover:text-blue-400 hover:text-blue-600 transition-all text-xs">
                Remote Jobs
              </Link>
              <Link href="/jobs/freshers" className="px-3 py-1 rounded-full bg-neutral-100 hover:bg-blue-50 dark:bg-neutral-800 dark:hover:bg-blue-950/30 dark:hover:text-blue-400 hover:text-blue-600 transition-all text-xs">
                Fresher Roles
              </Link>
              <Link href="/jobs/internships" className="px-3 py-1 rounded-full bg-neutral-100 hover:bg-blue-50 dark:bg-neutral-800 dark:hover:bg-blue-950/30 dark:hover:text-blue-400 hover:text-blue-600 transition-all text-xs">
                Internships
              </Link>
              <Link href="/jobs/walk-ins" className="px-3 py-1 rounded-full bg-neutral-100 hover:bg-blue-50 dark:bg-neutral-800 dark:hover:bg-blue-950/30 dark:hover:text-blue-400 hover:text-blue-600 transition-all text-xs">
                Walk-In Drives
              </Link>
              <Link href="/jobs/government" className="px-3 py-1 rounded-full bg-neutral-100 hover:bg-blue-50 dark:bg-neutral-800 dark:hover:bg-blue-950/30 dark:hover:text-blue-400 hover:text-blue-600 transition-all text-xs">
                Government Jobs
              </Link>
              <Link href="/jobs/it" className="px-3 py-1 rounded-full bg-neutral-100 hover:bg-blue-50 dark:bg-neutral-800 dark:hover:bg-blue-950/30 dark:hover:text-blue-400 hover:text-blue-600 transition-all text-xs">
                IT Sector
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Discovery Hub Matrix */}
      <section className="py-16 bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-850">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center md:text-left md:flex md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                Job Type Discovery
              </h2>
              <p className="mt-2 text-neutral-500 dark:text-neutral-400">
                Instantly navigate verified openings filtered by employment models and sectors.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "IT Sector Jobs", desc: "Software, Cloud, Cybersecurity & Data Engineering", href: "/jobs/it", badge: "Tech Roles", bg: "from-sky-50 to-blue-50/50 dark:from-neutral-800/40 dark:to-neutral-850/40" },
              { title: "Non-IT Sector", desc: "Operations, Administration, Marketing & Retail", href: "/jobs/non-it", badge: "Business", bg: "from-amber-50 to-orange-50/50 dark:from-neutral-800/40 dark:to-neutral-850/40" },
              { title: "Government Jobs", desc: "Public sector notifications, examinations & departments", href: "/jobs/government", badge: "Public Sector", bg: "from-emerald-50 to-teal-50/50 dark:from-neutral-800/40 dark:to-neutral-850/40" },
              { title: "Private Jobs", desc: "Private limited enterprises, startups & corporations", href: "/jobs/private", badge: "Corporate", bg: "from-purple-50 to-indigo-50/50 dark:from-neutral-800/40 dark:to-neutral-850/40" },
              { title: "Internships", desc: "Summer projects, co-ops & student learning roles", href: "/jobs/internships", badge: "For Students", bg: "from-pink-50 to-rose-50/50 dark:from-neutral-800/40 dark:to-neutral-850/40" },
              { title: "Walk-In Drives", desc: "Direct interview venues, date, time & spot hiring", href: "/jobs/walk-ins", badge: "Direct Interview", bg: "from-cyan-50 to-teal-50/50 dark:from-neutral-800/40 dark:to-neutral-850/40" },
              { title: "Fresher Openings", desc: "Entry-level jobs with 0-1 years required experience", href: "/jobs/freshers", badge: "No Experience", bg: "from-indigo-50 to-violet-50/50 dark:from-neutral-800/40 dark:to-neutral-850/40" },
              { title: "Remote Work", desc: "Work from anywhere, digital nomad models", href: "/jobs/remote", badge: "Work from Home", bg: "from-blue-50 to-indigo-50/50 dark:from-neutral-800/40 dark:to-neutral-850/40" },
            ].map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className={`group flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-br ${item.bg} border border-neutral-100 dark:border-neutral-800 hover:border-blue-400 dark:hover:border-blue-500/50 hover:shadow-lg transition-all duration-300`}
              >
                <div>
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3 bg-white dark:bg-neutral-900 px-2 py-0.5 rounded-md border border-neutral-100 dark:border-neutral-800">
                    {item.badge}
                  </span>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-5 flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400 gap-1 group-hover:translate-x-1 transition-transform">
                  Explore Now <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-16 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center md:text-left md:flex md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
                <TrendingUp className="h-3.5 w-3.5" /> High Priority Roles
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                Featured Careers
              </h2>
            </div>
            <Link
              href="/jobs?isFeatured=true"
              className="hidden md:flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              View all featured <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {featuredJobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 p-12 text-center bg-white dark:bg-neutral-900">
              <Briefcase className="mx-auto h-12 w-12 text-neutral-300 dark:text-neutral-700 mb-4" />
              <p className="text-neutral-600 dark:text-neutral-400 font-medium">No featured jobs available yet.</p>
              <p className="text-xs text-neutral-400 mt-1">Check back later or browse standard latest roles.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredJobs.map((job) => (
                <div key={job.id} className="relative flex flex-col justify-between p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-blue-500 shadow-sm transition-all duration-300">
                  <div className="absolute top-4 right-4 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md">
                    Featured
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1.5 hover:text-blue-600">
                      <Link href={`/jobs/detail/${job.slug}`}>{job.title}</Link>
                    </h3>
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-4">
                      {job.company.name}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                      <span className="bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
                        {job.workMode}
                      </span>
                      <span className="bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
                        {job.employmentType}
                      </span>
                      <span className="bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
                        {job.city}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 mt-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-900 dark:text-white">
                      {job.isSalaryVisible && job.minSalary
                        ? `${job.currency} ${job.minSalary.toLocaleString()} - ${job.maxSalary?.toLocaleString()}`
                        : "Salary Undisclosed"}
                    </span>
                    <Link
                      href={`/jobs/detail/${job.slug}`}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                    >
                      View Details <ChevronRightIcon className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-16 bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-850">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
              Browse by Industry Categories
            </h2>
            <p className="mt-2 text-neutral-500 dark:text-neutral-400">
              Browse positions grouped by corporate categories based on active vacancy database counts.
            </p>
          </div>

          {activeCategories.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 p-12 text-center">
              <Layers className="mx-auto h-12 w-12 text-neutral-300 dark:text-neutral-700 mb-4" />
              <p className="text-neutral-600 dark:text-neutral-400 font-medium">No categories available.</p>
              <p className="text-xs text-neutral-400 mt-1">Create categories in the Admin panel first.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {activeCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-750 hover:bg-blue-50/50 dark:hover:bg-neutral-700 hover:border-blue-400 transition-all text-center"
                >
                  <h3 className="font-bold text-neutral-900 dark:text-white truncate">
                    {category.name}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    {category.activeJobsCount} Active Jobs
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Latest Jobs Section */}
      <section className="py-16 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 md:flex md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                Latest Job Openings
              </h2>
              <p className="mt-2 text-neutral-500 dark:text-neutral-400">
                Discover recently published live career options from trusted employers.
              </p>
            </div>
            <Link
              href="/jobs"
              className="mt-4 md:mt-0 flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-750 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Browse All Jobs <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {latestJobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 p-12 text-center bg-white dark:bg-neutral-900">
              <Briefcase className="mx-auto h-12 w-12 text-neutral-300 dark:text-neutral-700 mb-4" />
              <p className="text-neutral-600 dark:text-neutral-400 font-medium">No jobs available yet.</p>
              <p className="text-xs text-neutral-400 mt-1">Analytics and job records will appear once real activity is registered.</p>
              <Link href="/admin" className="inline-flex items-center gap-1.5 mt-5 bg-blue-600 text-white rounded-lg px-4 py-2 text-xs font-semibold hover:bg-blue-700">
                <Plus className="h-3.5 w-3.5" /> Post First Job
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {latestJobs.map((job) => (
                <div key={job.id} className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-blue-500 shadow-sm transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 border border-neutral-200 dark:border-neutral-700">
                      {job.company.logoUrl ? (
                        <img src={job.company.logoUrl} alt={job.company.name} className="h-8 w-8 object-contain rounded" />
                      ) : (
                        <Building2 className="h-6 w-6 text-neutral-400 dark:text-neutral-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-neutral-900 dark:text-white hover:text-blue-600">
                        <Link href={`/jobs/detail/${job.slug}`}>{job.title}</Link>
                      </h3>
                      <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mt-0.5">
                        {job.company.name} • {job.city}, {job.country}
                      </p>
                      <div className="flex flex-wrap gap-2 text-[10px] mt-3">
                        <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-2 py-0.5 rounded font-medium">
                          {job.workMode}
                        </span>
                        <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-2 py-0.5 rounded font-medium">
                          {job.employmentType}
                        </span>
                        <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-2 py-0.5 rounded font-medium">
                          {job.sector}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex md:flex-col items-end justify-between w-full md:w-auto border-t md:border-0 border-neutral-100 dark:border-neutral-800 pt-3 md:pt-0 shrink-0">
                    <span className="text-xs font-bold text-neutral-900 dark:text-white md:mb-1.5">
                      {job.isSalaryVisible && job.minSalary
                        ? `${job.currency} ${(job.minSalary/1000).toFixed(0)}k - ${(job.maxSalary ? job.maxSalary/1000 : 0).toFixed(0)}k`
                        : "Salary Undisclosed"}
                    </span>
                    <Link
                      href={`/jobs/detail/${job.slug}`}
                      className="bg-neutral-100 hover:bg-blue-600 hover:text-white dark:bg-neutral-800 dark:hover:bg-blue-600 text-neutral-800 dark:text-neutral-200 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
                    >
                      Apply Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Popular Companies */}
      <section className="py-16 bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-850">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
              Hiring Companies
            </h2>
            <p className="mt-2 text-neutral-500 dark:text-neutral-400">
              Leading employers recruiting for active, published positions in our database.
            </p>
          </div>

          {popularCompanies.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 p-12 text-center">
              <Building2 className="mx-auto h-12 w-12 text-neutral-300 dark:text-neutral-700 mb-4" />
              <p className="text-neutral-600 dark:text-neutral-400 font-medium">No companies available.</p>
              <p className="text-xs text-neutral-400 mt-1">Registered companies with active jobs will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularCompanies.map((company) => (
                <div key={company.id} className="p-6 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl flex flex-col justify-between hover:shadow-md transition-all">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center shrink-0">
                      {company.logoUrl ? (
                        <img src={company.logoUrl} alt={company.name} className="h-8 w-8 object-contain rounded" />
                      ) : (
                        <Building2 className="h-6 w-6 text-neutral-400 dark:text-neutral-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-900 dark:text-white">
                        <Link href={`/companies/${company.slug}`} className="hover:text-blue-600">{company.name}</Link>
                      </h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        {company.industry} • {company.headquarters || "Global HQ"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-neutral-200 dark:border-neutral-700 pt-4">
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                      {company.activeJobsCount} Active Jobs
                    </span>
                    <Link
                      href={`/companies/${company.slug}`}
                      className="text-xs text-neutral-600 dark:text-neutral-300 hover:text-blue-600 flex items-center gap-0.5"
                    >
                      View Profile <ChevronRightIcon className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white border-t border-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-90 z-0"></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Ready to find your next breakthrough?
          </h2>
          <p className="text-blue-100 max-w-2xl mx-auto mb-8 text-base">
            No fake salaries, no ghost vacancies. Join thousands of candidates discovering real, verified opportunities every single day.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/jobs"
              className="bg-white hover:bg-neutral-100 text-blue-600 font-bold px-6 py-3 rounded-xl shadow-md transition-all text-sm"
            >
              Browse Active Jobs
            </Link>
            <Link
              href="/admin"
              className="bg-blue-500/30 hover:bg-blue-500/50 border border-blue-400/40 text-white font-bold px-6 py-3 rounded-xl transition-all text-sm"
            >
              Employer Dashboard
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

// Simple custom inline helper to bypass import clashes
function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}
