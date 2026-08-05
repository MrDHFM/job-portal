import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { companies, jobs, categories } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ slug: string }> }
) {
  try {
    const params = await props.params;
    const { slug } = params;

    const companyResults = await db
      .select()
      .from(companies)
      .where(and(eq(companies.slug, slug), eq(companies.isActive, true)))
      .limit(1);

    if (companyResults.length === 0) {
      return NextResponse.json(
        { success: false, error: "Company not found" },
        { status: 404 }
      );
    }

    const company = companyResults[0];

    // Get active jobs for this company
    const activeJobs = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        slug: jobs.slug,
        sector: jobs.sector,
        employmentType: jobs.employmentType,
        experienceLevel: jobs.experienceLevel,
        workMode: jobs.workMode,
        city: jobs.city,
        state: jobs.state,
        country: jobs.country,
        minSalary: jobs.minSalary,
        maxSalary: jobs.maxSalary,
        currency: jobs.currency,
        isSalaryVisible: jobs.isSalaryVisible,
        publishedAt: jobs.publishedAt,
        category: {
          id: categories.id,
          name: categories.name,
        }
      })
      .from(jobs)
      .innerJoin(categories, eq(jobs.categoryId, categories.id))
      .where(and(eq(jobs.companyId, company.id), eq(jobs.status, "PUBLISHED")))
      .orderBy(jobs.publishedAt);

    return NextResponse.json({
      success: true,
      data: {
        ...company,
        jobs: activeJobs,
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/v1/companies/[slug]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
