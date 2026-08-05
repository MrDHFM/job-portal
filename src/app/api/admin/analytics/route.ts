import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobs, companies, categories, applications, contactMessages, adminActivityLogs } from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Run parallel count queries using Drizzle
    const [
      totalJobsRes,
      publishedJobsRes,
      draftJobsRes,
      expiredJobsRes,
      companiesRes,
      categoriesRes,
      applicationsRes,
      messagesRes,
      metricsSumRes
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(jobs),
      db.select({ count: sql<number>`count(*)` }).from(jobs).where(eq(jobs.status, "PUBLISHED")),
      db.select({ count: sql<number>`count(*)` }).from(jobs).where(eq(jobs.status, "DRAFT")),
      db.select({ count: sql<number>`count(*)` }).from(jobs).where(eq(jobs.status, "EXPIRED")),
      db.select({ count: sql<number>`count(*)` }).from(companies),
      db.select({ count: sql<number>`count(*)` }).from(categories),
      db.select({ count: sql<number>`count(*)` }).from(applications),
      db.select({ count: sql<number>`count(*)` }).from(contactMessages),
      db.select({
        views: sql<number>`sum(${jobs.viewsCount})`,
        clicks: sql<number>`sum(${jobs.applyClicksCount})`,
      }).from(jobs),
    ]);

    const totalJobs = Number(totalJobsRes[0]?.count || 0);
    const activeJobs = Number(publishedJobsRes[0]?.count || 0);
    const draftJobs = Number(draftJobsRes[0]?.count || 0);
    const expiredJobs = Number(expiredJobsRes[0]?.count || 0);
    const totalCompanies = Number(companiesRes[0]?.count || 0);
    const totalCategories = Number(categoriesRes[0]?.count || 0);
    const totalApplications = Number(applicationsRes[0]?.count || 0);
    const totalMessages = Number(messagesRes[0]?.count || 0);
    
    const totalViews = Number(metricsSumRes[0]?.views || 0);
    const totalClicks = Number(metricsSumRes[0]?.clicks || 0);

    // Fetch some recent activity logs
    const recentLogs = await db
      .select()
      .from(adminActivityLogs)
      .orderBy(desc(adminActivityLogs.createdAt))
      .limit(10);

    return NextResponse.json({
      success: true,
      data: {
        totalJobs,
        activeJobs,
        draftJobs,
        expiredJobs,
        totalCompanies,
        totalCategories,
        totalApplications,
        totalMessages,
        totalViews,
        totalClicks,
        recentLogs,
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/admin/analytics:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
