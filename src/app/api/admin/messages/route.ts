import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { desc, sql } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);

    const page = Math.max(1, Number(searchParams.get("page") || "1"));

    const limit = Math.min(
      100,
      Math.max(1, Number(searchParams.get("limit") || "20")),
    );

    const offset = (page - 1) * limit;

    const [messages, countResult] = await Promise.all([
      db
        .select()
        .from(contactMessages)
        .orderBy(desc(contactMessages.createdAt))
        .limit(limit)
        .offset(offset),

      db
        .select({
          count: sql<number>`count(*)::int`,
        })
        .from(contactMessages),
    ]);

    const total = countResult[0]?.count || 0;

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: messages,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/admin/messages:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
