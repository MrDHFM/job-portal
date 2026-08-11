import {
  NextRequest,
  NextResponse,
} from "next/server";

import { db } from "@/db";

import {
  jobs,
  companies,
  categories,
  applications,
  contactMessages,
  adminActivityLogs,
  jobTrafficEvents,
} from "@/db/schema";

import {
  eq,
  sql,
  desc,
} from "drizzle-orm";

import { getAdminSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
) {
  try {
    const session =
      await getAdminSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const [
      jobsRes,
      publishedRes,
      draftsRes,
      expiredRes,
      companiesRes,
      categoriesRes,
      applicationsRes,
      messagesRes,
      metricsRes,
      sourceRes,
      jobPerformanceRes,
      recentLogs,
    ] = await Promise.all([
      db
        .select({
          count: sql<number>`count(*)`,
        })
        .from(jobs),

      db
        .select({
          count: sql<number>`count(*)`,
        })
        .from(jobs)
        .where(
          eq(jobs.status, "PUBLISHED"),
        ),

      db
        .select({
          count: sql<number>`count(*)`,
        })
        .from(jobs)
        .where(
          eq(jobs.status, "DRAFT"),
        ),

      db
        .select({
          count: sql<number>`count(*)`,
        })
        .from(jobs)
        .where(
          eq(jobs.status, "EXPIRED"),
        ),

      db
        .select({
          count: sql<number>`count(*)`,
        })
        .from(companies),

      db
        .select({
          count: sql<number>`count(*)`,
        })
        .from(categories),

      db
        .select({
          count: sql<number>`count(*)`,
        })
        .from(applications),

      db
        .select({
          count: sql<number>`count(*)`,
        })
        .from(contactMessages),

      db
        .select({
          views: sql<number>`
            coalesce(
              sum(${jobs.viewsCount}),
              0
            )
          `,

          clicks: sql<number>`
            coalesce(
              sum(${jobs.applyClicksCount}),
              0
            )
          `,
        })
        .from(jobs),

      db
        .select({
          source:
            jobTrafficEvents.source,

          views: sql<number>`
            count(*) filter (
              where ${jobTrafficEvents.eventType}
              = 'VIEW'
            )
          `,

          applyClicks: sql<number>`
            count(*) filter (
              where ${jobTrafficEvents.eventType}
              = 'APPLY_CLICK'
            )
          `,
        })
        .from(jobTrafficEvents)
        .groupBy(
          jobTrafficEvents.source,
        )
        .orderBy(
          desc(sql`count(*)`),
        ),

      db
        .select({
          jobId: jobs.id,
          title: jobs.title,
          slug: jobs.slug,
          views: jobs.viewsCount,
          applyClicks:
            jobs.applyClicksCount,

          instagram: sql<number>`
            count(*) filter (
              where
                ${jobTrafficEvents.source}
                = 'instagram'
                and
                ${jobTrafficEvents.eventType}
                = 'VIEW'
            )
          `,

          telegram: sql<number>`
            count(*) filter (
              where
                ${jobTrafficEvents.source}
                = 'telegram'
                and
                ${jobTrafficEvents.eventType}
                = 'VIEW'
            )
          `,

          linkedin: sql<number>`
            count(*) filter (
              where
                ${jobTrafficEvents.source}
                = 'linkedin'
                and
                ${jobTrafficEvents.eventType}
                = 'VIEW'
            )
          `,

          x: sql<number>`
            count(*) filter (
              where
                ${jobTrafficEvents.source}
                = 'x'
                and
                ${jobTrafficEvents.eventType}
                = 'VIEW'
            )
          `,

          google: sql<number>`
            count(*) filter (
              where
                ${jobTrafficEvents.source}
                = 'google'
                and
                ${jobTrafficEvents.eventType}
                = 'VIEW'
            )
          `,

          direct: sql<number>`
            count(*) filter (
              where
                ${jobTrafficEvents.source}
                = 'direct'
                and
                ${jobTrafficEvents.eventType}
                = 'VIEW'
            )
          `,
        })
        .from(jobs)
        .leftJoin(
          jobTrafficEvents,
          eq(
            jobTrafficEvents.jobId,
            jobs.id,
          ),
        )
        .groupBy(
          jobs.id,
          jobs.title,
          jobs.slug,
          jobs.viewsCount,
          jobs.applyClicksCount,
        )
        .orderBy(
          desc(jobs.viewsCount),
        ),

      db
        .select()
        .from(adminActivityLogs)
        .orderBy(
          desc(
            adminActivityLogs.createdAt,
          ),
        )
        .limit(10),
    ]);

    const totalViews =
      Number(metricsRes[0]?.views || 0);

    const totalClicks =
      Number(metricsRes[0]?.clicks || 0);

    const totalTraffic =
      sourceRes.reduce(
        (sum, item) =>
          sum + Number(item.views || 0),
        0,
      );

    const uniqueVisitorsRes =
      await db.execute(sql`
        select count(distinct session_id)::integer
        as count
        from job_traffic_events
        where session_id is not null
      `);

    const uniqueVisitors =
      Number(
        uniqueVisitorsRes.rows[0]
          ?.count || 0,
      );

    return NextResponse.json({
      success: true,

      data: {
        totalJobs:
          Number(
            jobsRes[0]?.count || 0,
          ),

        activeJobs:
          Number(
            publishedRes[0]?.count || 0,
          ),

        draftJobs:
          Number(
            draftsRes[0]?.count || 0,
          ),

        expiredJobs:
          Number(
            expiredRes[0]?.count || 0,
          ),

        totalCompanies:
          Number(
            companiesRes[0]?.count || 0,
          ),

        totalCategories:
          Number(
            categoriesRes[0]?.count || 0,
          ),

        totalApplications:
          Number(
            applicationsRes[0]?.count || 0,
          ),

        totalMessages:
          Number(
            messagesRes[0]?.count || 0,
          ),

        totalViews,

        totalClicks,

        totalTraffic,

        uniqueVisitors,

        trafficSources:
          sourceRes.map((item) => ({
            source: item.source,
            views: Number(
              item.views || 0,
            ),
            applyClicks:
              Number(
                item.applyClicks || 0,
              ),
          })),

        jobPerformance:
          jobPerformanceRes.map(
            (item) => ({
              ...item,
              views:
                Number(
                  item.views || 0,
                ),
              applyClicks:
                Number(
                  item.applyClicks || 0,
                ),
              instagram:
                Number(
                  item.instagram || 0,
                ),
              telegram:
                Number(
                  item.telegram || 0,
                ),
              linkedin:
                Number(
                  item.linkedin || 0,
                ),
              x:
                Number(item.x || 0),
              google:
                Number(
                  item.google || 0,
                ),
              direct:
                Number(
                  item.direct || 0,
                ),
            }),
          ),

        recentLogs,
      },
    });
  } catch (error) {
    console.error(
      "Error in GET /api/admin/analytics:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Internal server error",
      },
      { status: 500 },
    );
  }
}