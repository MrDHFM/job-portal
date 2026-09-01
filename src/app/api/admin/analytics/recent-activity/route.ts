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
      Math.max(1, Number(searchParams.get("limit") || "15")),
    );
    const offset = (page - 1) * limit;

    // Optional filter: "VIEW" | "APPLY_CLICK" | "" (all)
    const eventType = searchParams.get("eventType") || "";

    const filter = eventType
      ? sql`WHERE e.event_type = ${eventType}`
      : sql``;

    const [rowsRes, countRes] = await Promise.all([
      db.execute(sql`
        SELECT
          e.id,
          e.event_type,
          e.source,
          e.created_at,
          j.id AS job_id,
          j.title AS job_title,
          j.slug AS job_slug,
          c.name AS company_name

        FROM job_traffic_events e
        INNER JOIN jobs j ON j.id = e.job_id
        INNER JOIN companies c ON c.id = j.company_id

        ${filter}

        ORDER BY e.created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `),

      db.execute(sql`
        SELECT count(*)::int AS count FROM job_traffic_events e ${filter}
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
      "Error in GET /api/admin/analytics/recent-activity:",
      error,
    );

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
