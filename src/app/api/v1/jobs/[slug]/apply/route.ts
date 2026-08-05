import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobs, applications } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ slug: string }> }
) {
  try {
    const params = await props.params;
    const { slug } = params;
    const body = await req.json();

    // Find the job
    const jobResults = await db
      .select({ id: jobs.id, applicationMethod: jobs.applicationMethod })
      .from(jobs)
      .where(eq(jobs.slug, slug))
      .limit(1);

    if (jobResults.length === 0) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 }
      );
    }

    const job = jobResults[0];

    // Increment click counter
    await db
      .update(jobs)
      .set({ applyClicksCount: sql`${jobs.applyClicksCount} + 1` })
      .where(eq(jobs.id, job.id));

    // If it's an internal application, insert into applications table
    if (body.isInternal) {
      const { name, email, phone, resumeUrl, coverLetter, linkedinUrl, portfolioUrl } = body;
      
      if (!name || !email || !phone || !resumeUrl) {
        return NextResponse.json(
          { success: false, error: "Missing required application fields: name, email, phone, resumeUrl" },
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

      return NextResponse.json({
        success: true,
        message: "Internal application submitted successfully!",
      });
    }

    return NextResponse.json({
      success: true,
      message: "External application click recorded.",
    });
  } catch (error: any) {
    console.error("Error in POST /api/v1/jobs/[slug]/apply:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
