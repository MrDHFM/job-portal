import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobs, companies, categories } from "@/db/schema";
import {
  eq,
  and,
  or,
  like,
  ilike,
  gte,
  lte,
  sql,
  desc,
  asc,
} from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const keyword = searchParams.get("keyword") || "";
    const sector = searchParams.get("sector") || "";
    const workMode = searchParams.get("workMode") || "";
    const employmentType = searchParams.get("employmentType") || "";
    const experienceLevel = searchParams.get("experienceLevel") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const companyId = searchParams.get("companyId") || "";
    const city = searchParams.get("city") || "";
    const state = searchParams.get("state") || "";
    const country = searchParams.get("country") || "";
    const isFeatured = searchParams.get("isFeatured") === "true";
    const isUrgent = searchParams.get("isUrgent") === "true";
    const minSalary = searchParams.get("minSalary")
      ? parseInt(searchParams.get("minSalary") || "0")
      : null;
    const sort = searchParams.get("sort") || "latest"; // latest, oldest, salary_high, salary_low, relevant

    const offset = (page - 1) * limit;

    // Check if requester is admin to allow viewing DRAFT, ARCHIVED, etc.
    const session = await getAdminSession();
    const isAdmin = !!session;

    const conditions: any[] = [];

    // Filter by status (unless admin requests all)
    if (!isAdmin) {
      conditions.push(eq(jobs.status, "PUBLISHED"));

      // Hide jobs whose application deadline has passed.
      conditions.push(
        or(
          sql`${jobs.applicationDeadline} IS NULL`,
          gte(jobs.applicationDeadline, new Date()),
        ),
      );

      // Also respect expiresAt if used in the future.
      conditions.push(
        or(sql`${jobs.expiresAt} IS NULL`, gte(jobs.expiresAt, new Date())),
      );
    } else {
      const statusFilter = searchParams.get("status");
      if (statusFilter) {
        conditions.push(eq(jobs.status, statusFilter));
      }
    }

    if (sector) conditions.push(eq(jobs.sector, sector));
    if (workMode) conditions.push(eq(jobs.workMode, workMode));
    if (employmentType)
      conditions.push(eq(jobs.employmentType, employmentType));
    if (experienceLevel)
      conditions.push(eq(jobs.experienceLevel, experienceLevel));
    if (categoryId) conditions.push(eq(jobs.categoryId, parseInt(categoryId)));
    if (companyId) conditions.push(eq(jobs.companyId, parseInt(companyId)));
    if (city) conditions.push(ilike(jobs.city, `%${city}%`));
    if (state) conditions.push(ilike(jobs.state, `%${state}%`));
    if (country) conditions.push(ilike(jobs.country, `%${country}%`));
    if (isFeatured) conditions.push(eq(jobs.isFeatured, true));
    if (isUrgent) conditions.push(eq(jobs.isUrgent, true));
    if (minSalary !== null) conditions.push(gte(jobs.maxSalary, minSalary));

    // Keyword search using simple ILIKE
    if (keyword) {
      conditions.push(
        or(
          ilike(jobs.title, `%${keyword}%`),
          ilike(jobs.description, `%${keyword}%`),
          ilike(jobs.requiredSkills, `%${keyword}%`),
          ilike(jobs.summary, `%${keyword}%`),
        ),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Sorting
    let orderBy: any = desc(jobs.publishedAt);
    if (sort === "oldest") {
      orderBy = asc(jobs.publishedAt);
    } else if (sort === "salary_high") {
      orderBy = desc(jobs.maxSalary);
    } else if (sort === "salary_low") {
      orderBy = asc(jobs.minSalary);
    }

    // Execute query with company and category relation
    const rawJobs = await db
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
      .offset(offset);

    // Get total count for pagination
    // Drizzle count helper
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(jobs)
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .innerJoin(categories, eq(jobs.categoryId, categories.id))
      .where(whereClause);

    const totalCount = countResult[0]?.count || 0;

    return NextResponse.json({
      success: true,
      data: rawJobs,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/v1/jobs:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
