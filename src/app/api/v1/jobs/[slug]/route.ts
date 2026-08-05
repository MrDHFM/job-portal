import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobs, companies, categories } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ slug: string }> }
) {
  try {
    const params = await props.params;
    const { slug } = params;
    const session = await getAdminSession();
    const isAdmin = !!session;

    const conditions = [eq(jobs.slug, slug)];
    if (!isAdmin) {
      conditions.push(eq(jobs.status, "PUBLISHED"));
    }

    const jobResults = await db
      .select({
        job: jobs,
        company: companies,
        category: categories,
      })
      .from(jobs)
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .innerJoin(categories, eq(jobs.categoryId, categories.id))
      .where(and(...conditions))
      .limit(1);

    if (jobResults.length === 0) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 }
      );
    }

    const result = jobResults[0];

    // Optionally increment views_count safely in the database
    // To prevent immediate multiple views from inflating count on same browser,
    // the client can send a view record, or we can just increment here. Let's increment
    // views on detail fetch to keep it robust and automated!
    await db
      .update(jobs)
      .set({ viewsCount: sql`${jobs.viewsCount} + 1` })
      .where(eq(jobs.id, result.job.id));

    return NextResponse.json({
      success: true,
      data: {
        ...result.job,
        company: result.company,
        category: result.category,
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/v1/jobs/[slug]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
