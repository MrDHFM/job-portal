import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { applications, jobs, companies } from "@/db/schema";
import {
  eq,
  desc,
  and,
  sql,
} from "drizzle-orm";
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

    const { searchParams } =
      new URL(req.url);

    const page = Math.max(
      1,
      Number(
        searchParams.get("page") || "1",
      ),
    );

    const limit = Math.min(
      100,
      Math.max(
        1,
        Number(
          searchParams.get("limit") || "25",
        ),
      ),
    );

    const offset =
      (page - 1) * limit;

    const status =
      searchParams.get("status") || "";

    const whereCondition =
      status
        ? eq(applications.status, status)
        : undefined;

    const [results, countResult] =
      await Promise.all([
        db
          .select({
            id: applications.id,
            name: applications.name,
            email: applications.email,
            phone: applications.phone,
            resumeUrl:
              applications.resumeUrl,
            coverLetter:
              applications.coverLetter,
            linkedinUrl:
              applications.linkedinUrl,
            portfolioUrl:
              applications.portfolioUrl,
            status: applications.status,
            createdAt:
              applications.createdAt,

            job: {
              id: jobs.id,
              title: jobs.title,
              slug: jobs.slug,
            },

            company: {
              name: companies.name,
            },
          })
          .from(applications)
          .innerJoin(
            jobs,
            eq(
              applications.jobId,
              jobs.id,
            ),
          )
          .innerJoin(
            companies,
            eq(
              jobs.companyId,
              companies.id,
            ),
          )
          .where(whereCondition)
          .orderBy(
            desc(applications.createdAt),
          )
          .limit(limit)
          .offset(offset),

        db
          .select({
            count:
              sql<number>`count(*)::int`,
          })
          .from(applications)
          .where(whereCondition),
      ]);

    const total =
      countResult[0]?.count || 0;

    const totalPages =
      Math.ceil(total / limit);

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
    console.error(
      "Error in GET /api/admin/applications:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}