import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobSocialPosts } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";
import { jobs, companies } from "@/db/schema";
import { publishSinglePlatform } from "@/lib/social/publisher";

const AUTOMATED_PLATFORMS = ["telegram", "instagram", "linkedin"] as const;

export async function PATCH(
  req: NextRequest,
  props: {
    params: Promise<{
      id: string;
      platform: string;
    }>;
  }
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { id, platform } = await props.params;

    if (platform !== "linkedin" && platform !== "x") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Manual status updates are only for LinkedIn and X.",
        },
        { status: 400 }
      );
    }

    const body = await req.json();

    const updated = await db
      .update(jobSocialPosts)
      .set({
        status: "PUBLISHED",
        externalPostUrl:
          body.externalPostUrl || null,
        postedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(
            jobSocialPosts.jobId,
            parseInt(id)
          ),
          eq(
            jobSocialPosts.platform,
            platform
          )
        )
      )
      .returning();

    return NextResponse.json({
      success: true,
      data: updated[0],
    });
  } catch (error) {
    console.error(
      "Failed to update social post status:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update post status.",
      },
      { status: 500 }
    );
  }
}

/**
 * Retries publishing to an AUTOMATED platform (telegram/instagram/linkedin)
 * for a single job. Used by the "Retry" button in the admin social panel
 * when one platform failed but others succeeded.
 */
export async function POST(
  req: NextRequest,
  props: {
    params: Promise<{
      id: string;
      platform: string;
    }>;
  }
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id, platform } = await props.params;
    const jobId = Number(id);

    if (!Number.isInteger(jobId)) {
      return NextResponse.json(
        { success: false, error: "Invalid job ID." },
        { status: 400 },
      );
    }

    if (
      !AUTOMATED_PLATFORMS.includes(
        platform as (typeof AUTOMATED_PLATFORMS)[number],
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Retry is only available for automated platforms (telegram, instagram, linkedin). LinkedIn and X manual entries use PATCH instead.",
        },
        { status: 400 },
      );
    }

    const result = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        slug: jobs.slug,
        companyName: companies.name,
        city: jobs.city,
        state: jobs.state,
        country: jobs.country,
        sector: jobs.sector,
        employmentType: jobs.employmentType,
        experienceLevel: jobs.experienceLevel,
        workMode: jobs.workMode,
        requiredSkills: jobs.requiredSkills,
        minSalary: jobs.minSalary,
        maxSalary: jobs.maxSalary,
        currency: jobs.currency,
        salaryPeriod: jobs.salaryPeriod,
        isSalaryVisible: jobs.isSalaryVisible,
        applicationDeadline: jobs.applicationDeadline,
        isUrgent: jobs.isUrgent,
        isFeatured: jobs.isFeatured,
      })
      .from(jobs)
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .where(eq(jobs.id, jobId))
      .limit(1);

    if (!result.length) {
      return NextResponse.json(
        { success: false, error: "Job not found." },
        { status: 404 },
      );
    }

    const publishResult = await publishSinglePlatform(
      result[0],
      platform as "telegram" | "instagram" | "linkedin",
    );

    return NextResponse.json({
      success: publishResult.success,
      data: publishResult,
      error: publishResult.success ? undefined : publishResult.error,
    });
  } catch (error) {
    console.error("Failed to retry social post:", error);

    return NextResponse.json(
      { success: false, error: "Failed to retry publishing." },
      { status: 500 },
    );
  }
}