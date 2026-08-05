import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobs, adminActivityLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const id = parseInt(params.id);
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const jobResults = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
    if (jobResults.length === 0) {
      return NextResponse.json({ success: false, error: "Job posting not found" }, { status: 404 });
    }

    const originalJob = jobResults[0];

    // Create a new slug
    let slug = `${originalJob.slug}-copy`;
    let originalSlug = slug;
    let count = 1;
    while (true) {
      const match = await db.select().from(jobs).where(eq(jobs.slug, slug)).limit(1);
      if (match.length === 0) break;
      slug = `${originalSlug}-${count++}`;
    }

    // Insert as DRAFT
    const [duplicatedJob] = await db
      .insert(jobs)
      .values({
        ...originalJob,
        id: undefined, // Let the serial id auto-increment
        title: `Copy of ${originalJob.title}`,
        slug,
        status: "DRAFT", // DUPLICATING A JOB MUST CREATE A DRAFT
        viewsCount: 0,
        applyClicksCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: new Date(),
      })
      .returning();

    // Log admin activity
    await db.insert(adminActivityLogs).values({
      adminName: session.name || session.email,
      action: "JOB_DUPLICATE",
      entity: "jobs",
      entityId: duplicatedJob.id,
      details: `Duplicated job posting: ${originalJob.title} -> ${duplicatedJob.title}`,
    });

    return NextResponse.json({ success: true, data: duplicatedJob });
  } catch (error: any) {
    console.error("Error in POST /api/admin/jobs/[id]/duplicate:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
