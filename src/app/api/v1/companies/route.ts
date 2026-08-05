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

    const conditions: any[] = [eq(companies.isActive, true)];

    if (search) {
      conditions.push(
        or(
          ilike(companies.name, `%${search}%`),
          ilike(companies.description, `%${search}%`)
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
    const results = await db
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
      .orderBy(companies.name);

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    console.error("Error in GET /api/v1/companies:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
