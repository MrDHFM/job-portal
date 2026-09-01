import { db } from "@/db";
import { jobs, companies, categories } from "@/db/schema";
import { eq, and, or, ilike, gte, sql, desc, asc } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";

export type PublicJobsParams = {
  page?: number;
  limit?: number;
  keyword?: string;
  sector?: string;
  workMode?: string;
  employmentType?: string;
  experienceLevel?: string;
  categoryId?: string;
  companyId?: string;
  city?: string;
  state?: string;
  country?: string;
  isFeatured?: boolean;
  isUrgent?: boolean;
  minSalary?: number | null;
  sort?: string;
  status?: string; // only honored for admins
};

/**
 * Core job-listing query, shared by /api/v1/jobs (client-side re-fetches
 * on filter change) and the /jobs server component (so the very first
 * render already has real data — no "Searching database..." flash, and
 * search engine crawlers see actual job listings in the initial HTML
 * instead of an empty shell).
 */
export async function getPublicJobs(params: PublicJobsParams) {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const offset = (page - 1) * limit;

  const session = await getAdminSession();
  const isAdmin = !!session;

  const conditions: any[] = [];

  if (!isAdmin) {
    conditions.push(eq(jobs.status, "PUBLISHED"));

    conditions.push(
      or(
        sql`${jobs.applicationDeadline} IS NULL`,
        gte(jobs.applicationDeadline, new Date()),
      ),
    );

    conditions.push(
      or(sql`${jobs.expiresAt} IS NULL`, gte(jobs.expiresAt, new Date())),
    );
  } else if (params.status) {
    conditions.push(eq(jobs.status, params.status));
  }

  if (params.sector) conditions.push(eq(jobs.sector, params.sector));
  if (params.workMode) conditions.push(eq(jobs.workMode, params.workMode));
  if (params.employmentType)
    conditions.push(eq(jobs.employmentType, params.employmentType));
  if (params.experienceLevel)
    conditions.push(eq(jobs.experienceLevel, params.experienceLevel));
  if (params.categoryId)
    conditions.push(eq(jobs.categoryId, parseInt(params.categoryId)));
  if (params.companyId)
    conditions.push(eq(jobs.companyId, parseInt(params.companyId)));
  if (params.city) conditions.push(ilike(jobs.city, `%${params.city}%`));
  if (params.state) conditions.push(ilike(jobs.state, `%${params.state}%`));
  if (params.country)
    conditions.push(ilike(jobs.country, `%${params.country}%`));
  if (params.isFeatured) conditions.push(eq(jobs.isFeatured, true));
  if (params.isUrgent) conditions.push(eq(jobs.isUrgent, true));
  if (params.minSalary != null)
    conditions.push(gte(jobs.maxSalary, params.minSalary));

  if (params.keyword) {
    conditions.push(
      or(
        ilike(jobs.title, `%${params.keyword}%`),
        ilike(jobs.description, `%${params.keyword}%`),
        ilike(jobs.requiredSkills, `%${params.keyword}%`),
        ilike(jobs.summary, `%${params.keyword}%`),
      ),
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  let orderBy: any = desc(jobs.publishedAt);
  if (params.sort === "oldest") {
    orderBy = asc(jobs.publishedAt);
  } else if (params.sort === "salary_high") {
    orderBy = desc(jobs.maxSalary);
  } else if (params.sort === "salary_low") {
    orderBy = asc(jobs.minSalary);
  }

  const [rawJobs, countResult] = await Promise.all([
    db
      .select({
        id: jobs.id,
        title: jobs.title,
        slug: jobs.slug,
        sector: jobs.sector,
        employmentType: jobs.employmentType,
        experienceLevel: jobs.experienceLevel,
        workMode: jobs.workMode,
        vacancies: jobs.vacancies,
        country: jobs.country,
        state: jobs.state,
        city: jobs.city,
        minSalary: jobs.minSalary,
        maxSalary: jobs.maxSalary,
        currency: jobs.currency,
        salaryPeriod: jobs.salaryPeriod,
        isSalaryVisible: jobs.isSalaryVisible,
        requiredSkills: jobs.requiredSkills,
        applicationMethod: jobs.applicationMethod,
        isFeatured: jobs.isFeatured,
        isUrgent: jobs.isUrgent,
        status: jobs.status,

        applicationDeadline: jobs.applicationDeadline,
        expiresAt: jobs.expiresAt,

        createdAt: jobs.createdAt,
        publishedAt: jobs.publishedAt,
        viewsCount: jobs.viewsCount,
        applyClicksCount: jobs.applyClicksCount,
        company: {
          id: companies.id,
          name: companies.name,
          slug: companies.slug,
          logoUrl: companies.logoUrl,
          industry: companies.industry,
          headquarters: companies.headquarters,
        },
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
        },
      })
      .from(jobs)
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .innerJoin(categories, eq(jobs.categoryId, categories.id))
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset),

    db
      .select({ count: sql<number>`count(*)` })
      .from(jobs)
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .innerJoin(categories, eq(jobs.categoryId, categories.id))
      .where(whereClause),
  ]);

  const totalCount = Number(countResult[0]?.count || 0);

  return {
    jobs: rawJobs,
    pagination: {
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
}

/** Same visible-categories query used by /api/v1/categories, shared so
 * the SSR jobs page's filter dropdown isn't empty on first paint either. */
export async function getVisibleCategories() {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      displayOrder: categories.displayOrder,
      activeJobsCount: sql<number>`cast(count(${jobs.id}) as integer)`,
    })
    .from(categories)
    .leftJoin(
      jobs,
      and(eq(jobs.categoryId, categories.id), eq(jobs.status, "PUBLISHED")),
    )
    .where(eq(categories.isVisible, true))
    .groupBy(categories.id)
    .orderBy(categories.displayOrder, categories.name);
}
