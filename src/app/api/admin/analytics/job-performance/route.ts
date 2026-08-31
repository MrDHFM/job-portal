import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);

    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.min(
      50,
      Math.max(1, Number(searchParams.get("limit") || "10")),
    );
    const offset = (page - 1) * limit;

    const search = (searchParams.get("search") || "").trim();

    // Whitelisted sort options — never interpolate the sort column/
    // direction directly from the query string into raw SQL.
    const sortKey = searchParams.get("sort") || "latest";
    const sortExpr =
      {
        latest: sql`j.created_at DESC`,
        oldest: sql`j.created_at ASC`,
        views: sql`j.views_count DESC`,
        applies: sql`j.apply_clicks_count DESC`,
        title: sql`j.title ASC`,
      }[sortKey] || sql`j.created_at DESC`;

    const searchFilter = search
      ? sql`WHERE j.title ILIKE ${`%${search}%`}`
      : sql``;

    const [rowsRes, countRes] = await Promise.all([
      db.execute(sql`
        SELECT
          j.id AS job_id,
          j.title,
          j.slug,
          j.created_at,
          j.views_count AS views,
          j.apply_clicks_count AS apply_clicks,

          COUNT(*) FILTER (
            WHERE e.source = 'instagram'
            AND e.event_type = 'VIEW'
          )::integer AS instagram,

          COUNT(*) FILTER (
            WHERE e.source = 'telegram'
            AND e.event_type = 'VIEW'
          )::integer AS telegram,

          COUNT(*) FILTER (
            WHERE e.source = 'linkedin'
            AND e.event_type = 'VIEW'
          )::integer AS linkedin,

          COUNT(*) FILTER (
            WHERE e.source = 'x'
            AND e.event_type = 'VIEW'
          )::integer AS x,

          COUNT(*) FILTER (
            WHERE e.source = 'google'
            AND e.event_type = 'VIEW'
          )::integer AS google,

          COUNT(*) FILTER (
            WHERE e.source = 'direct'
            AND e.event_type = 'VIEW'
          )::integer AS direct

        FROM jobs j

        LEFT JOIN job_traffic_events e
          ON e.job_id = j.id

        ${searchFilter}

        GROUP BY
          j.id,
          j.title,
          j.slug,
          j.created_at,
          j.views_count,
          j.apply_clicks_count

        ORDER BY ${sortExpr}
        LIMIT ${limit}
        OFFSET ${offset}
      `),

      db.execute(sql`
        SELECT count(*)::int AS count FROM jobs j ${searchFilter}
      `),
    ]);

    const total = Number((countRes.rows[0] as any)?.count || 0);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: rowsRes.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error(
      "Error in GET /api/admin/analytics/job-performance:",
      error,
    );

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}