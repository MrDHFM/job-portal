import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { companies, jobs } from "@/db/schema";
import { eq, and, sql, ilike, or } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const industry = searchParams.get("industry") || "";
    const location = searchParams.get("location") || "";

    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.min(
      50,
      Math.max(1, Number(searchParams.get("limit") || "12")),
    );
    const offset = (page - 1) * limit;

    const conditions: any[] = [eq(companies.isActive, true)];

    if (search) {
      conditions.push(
        or(
          ilike(companies.name, `%${search}%`),
          ilike(companies.description, `%${search}%`),
          ilike(companies.industry, `%${search}%`),
          ilike(companies.headquarters, `%${search}%`)
        )
      );
    }

    if (industry) {
      conditions.push(eq(companies.industry, industry));
    }

    if (location) {
      conditions.push(ilike(companies.headquarters, `%${location}%`));
    }

    const whereClause = and(...conditions);

    // Fetch companies and their real-time count of PUBLISHED jobs
    const [results, countResult] = await Promise.all([
      db
        .select({
          id: companies.id,
          name: companies.name,
          slug: companies.slug,
          logoUrl: companies.logoUrl,
          description: companies.description,
          website: companies.website,
          industry: companies.industry,
          size: companies.size,
          foundedYear: companies.foundedYear,
          headquarters: companies.headquarters,
          activeJobsCount: sql<number>`cast(count(${jobs.id}) as integer)`,
        })
        .from(companies)
        .leftJoin(jobs, and(eq(jobs.companyId, companies.id), eq(jobs.status, "PUBLISHED")))
        .where(whereClause)
        .groupBy(companies.id)
        .orderBy(companies.name)
        .limit(limit)
        .offset(offset),

      db
        .select({ count: sql<number>`count(*)::int` })
        .from(companies)
        .where(whereClause),
    ]);

    const total = countResult[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: results,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/v1/companies:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
