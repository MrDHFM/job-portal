import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { categories, jobs } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const results = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        displayOrder: categories.displayOrder,
        activeJobsCount: sql<number>`cast(count(${jobs.id}) as integer)`,
      })
      .from(categories)
      .leftJoin(jobs, and(eq(jobs.categoryId, categories.id), eq(jobs.status, "PUBLISHED")))
      .where(eq(categories.isVisible, true))
      .groupBy(categories.id)
      .orderBy(categories.displayOrder, categories.name);

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    console.error("Error in GET /api/v1/categories:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
