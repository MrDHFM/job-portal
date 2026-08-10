import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  jobs,
  companies,
  jobSocialPosts,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";
import {
  buildLinkedInPost,
  buildXPost,
} from "@/lib/social/manual-formatter";

export async function GET(
  req: NextRequest,
  props: {
    params: Promise<{ id: string }>;
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

    const { id } = await props.params;

    const jobId = Number(id);

    if (!Number.isInteger(jobId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid job ID.",
        },
        { status: 400 }
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

        applicationDeadline:
          jobs.applicationDeadline,

        isUrgent: jobs.isUrgent,
        isFeatured: jobs.isFeatured,
      })
      .from(jobs)
      .innerJoin(
        companies,
        eq(jobs.companyId, companies.id)
      )
      .where(eq(jobs.id, jobId))
      .limit(1);

    if (!result.length) {
      return NextResponse.json(
        {
          success: false,
          error: "Job not found.",
        },
        { status: 404 }
      );
    }

    const job = result[0];

    // Get existing social statuses
    const existingPosts = await db
      .select()
      .from(jobSocialPosts)
      .where(eq(jobSocialPosts.jobId, jobId))
      .orderBy(desc(jobSocialPosts.updatedAt));

    // Generate manual LinkedIn/X content
    const linkedin = buildLinkedInPost(job);
    const x = buildXPost(job);

    // Make sure manual posts exist in database.
    for (const post of [linkedin, x]) {
      const existing = existingPosts.find(
        (item) =>
          item.platform === post.platform
      );

      if (!existing) {
        await db
          .insert(jobSocialPosts)
          .values({
            jobId,
            platform: post.platform,
            status: "MANUAL_READY",
            postContent: post.content,
            updatedAt: new Date(),
          });
      } else if (
        existing.status !== "PUBLISHED"
      ) {
        await db
          .update(jobSocialPosts)
          .set({
            status: "MANUAL_READY",
            postContent: post.content,
            updatedAt: new Date(),
          })
          .where(
            eq(
              jobSocialPosts.id,
              existing.id
            )
          );
      }
    }

    // Get latest state after insert/update
    const statuses = await db
      .select({
        id: jobSocialPosts.id,
        platform: jobSocialPosts.platform,
        status: jobSocialPosts.status,
        externalPostId:
          jobSocialPosts.externalPostId,
        externalPostUrl:
          jobSocialPosts.externalPostUrl,
        postContent:
          jobSocialPosts.postContent,
        errorMessage:
          jobSocialPosts.errorMessage,
        postedAt: jobSocialPosts.postedAt,
      })
      .from(jobSocialPosts)
      .where(eq(jobSocialPosts.jobId, jobId));

    return NextResponse.json({
      success: true,

      data: {
        statuses,

        linkedin,

        x,
      },
    });
  } catch (error) {
    console.error(
      "Failed to load social media posts:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to load social media posts.",
      },
      { status: 500 }
    );
  }
}