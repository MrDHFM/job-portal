import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { applications, jobs, companies } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const results = await db
      .select({
        id: applications.id,
        name: applications.name,
        email: applications.email,
        phone: applications.phone,
        resumeUrl: applications.resumeUrl,
        coverLetter: applications.coverLetter,
        linkedinUrl: applications.linkedinUrl,
        portfolioUrl: applications.portfolioUrl,
        status: applications.status,
        createdAt: applications.createdAt,
        job: {
          id: jobs.id,
          title: jobs.title,
          slug: jobs.slug,
        },
        company: {
          name: companies.name,
        }
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .orderBy(desc(applications.createdAt));

    return NextResponse.json({ success: true, data: results });
  } catch (error: any) {
    console.error("Error in GET /api/admin/applications:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
