import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobs, applications } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { isJobExpired } from "@/lib/jobs/job-expiry";

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ slug: string }> }
) {
  try {
    const params = await props.params;
    const { slug } = params;

    const body = await req.json();

    // --------------------------------------------------
    // Find job
    // --------------------------------------------------

    const jobResults = await db
      .select({
        id: jobs.id,
        status: jobs.status,
        applicationMethod: jobs.applicationMethod,
        applicationDeadline: jobs.applicationDeadline,
        expiresAt: jobs.expiresAt,
      })
      .from(jobs)
      .where(eq(jobs.slug, slug))
      .limit(1);

    if (jobResults.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Job not found",
        },
        { status: 404 }
      );
    }

    const job = jobResults[0];

    // --------------------------------------------------
    // Block expired / inactive jobs
    // --------------------------------------------------

    const expired = isJobExpired(job);

    if (expired) {
      // Keep database status synchronized.
      if (job.status === "PUBLISHED") {
        await db
          .update(jobs)
          .set({
            status: "EXPIRED",
            updatedAt: new Date(),
          })
          .where(eq(jobs.id, job.id));
      }

      return NextResponse.json(
        {
          success: false,
          error:
            "Applications for this job are now closed.",
          code: "JOB_EXPIRED",
        },
        { status: 410 }
      );
    }

    // Also don't accept applications for drafts,
    // archived jobs, etc.
    if (job.status !== "PUBLISHED") {
      return NextResponse.json(
        {
          success: false,
          error:
            "This job is not currently accepting applications.",
          code: "JOB_NOT_ACTIVE",
        },
        { status: 410 }
      );
    }

    // --------------------------------------------------
    // Internal application
    // --------------------------------------------------

    if (body.isInternal) {
      const {
        name,
        email,
        phone,
        resumeUrl,
        coverLetter,
        linkedinUrl,
        portfolioUrl,
      } = body;

      if (!name || !email || !phone || !resumeUrl) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Missing required application fields: name, email, phone, resumeUrl",
          },
          { status: 400 }
        );
      }

      await db.insert(applications).values({
        jobId: job.id,
        name,
        email,
        phone,
        resumeUrl,
        coverLetter: coverLetter || "",
        linkedinUrl: linkedinUrl || "",
        portfolioUrl: portfolioUrl || "",
        status: "pending",
      });
    }

    // --------------------------------------------------
    // Count successful apply action
    // --------------------------------------------------

    await db
      .update(jobs)
      .set({
        applyClicksCount:
          sql`${jobs.applyClicksCount} + 1`,
      })
      .where(eq(jobs.id, job.id));

    if (body.isInternal) {
      return NextResponse.json({
        success: true,
        message:
          "Internal application submitted successfully!",
      });
    }

    return NextResponse.json({
      success: true,
      message: "External application click recorded.",
    });
  } catch (error: any) {
    console.error(
      "Error in POST /api/v1/jobs/[slug]/apply:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}