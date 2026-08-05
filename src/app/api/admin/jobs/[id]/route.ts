import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobs, adminActivityLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";

export async function PUT(
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

    const body = await req.json();
    const existing = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ success: false, error: "Job posting not found." }, { status: 404 });
    }

    const updated = await db
      .update(jobs)
      .set({
        companyId: body.companyId ? parseInt(body.companyId) : undefined,
        categoryId: body.categoryId ? parseInt(body.categoryId) : undefined,
        title: body.title !== undefined ? body.title.trim() : undefined,
        sector: body.sector !== undefined ? body.sector : undefined,
        employmentType: body.employmentType !== undefined ? body.employmentType : undefined,
        experienceLevel: body.experienceLevel !== undefined ? body.experienceLevel : undefined,
        workMode: body.workMode !== undefined ? body.workMode : undefined,
        vacancies: body.vacancies !== undefined ? parseInt(body.vacancies) : undefined,
        country: body.country !== undefined ? body.country.trim() : undefined,
        state: body.state !== undefined ? body.state.trim() : undefined,
        city: body.city !== undefined ? body.city.trim() : undefined,
        address: body.address !== undefined ? body.address : undefined,
        isRemoteEligible: body.isRemoteEligible !== undefined ? !!body.isRemoteEligible : undefined,
        minSalary: body.minSalary !== undefined ? (body.minSalary ? parseInt(body.minSalary) : null) : undefined,
        maxSalary: body.maxSalary !== undefined ? (body.maxSalary ? parseInt(body.maxSalary) : null) : undefined,
        currency: body.currency !== undefined ? body.currency : undefined,
        salaryPeriod: body.salaryPeriod !== undefined ? body.salaryPeriod : undefined,
        isSalaryVisible: body.isSalaryVisible !== undefined ? !!body.isSalaryVisible : undefined,
        summary: body.summary !== undefined ? body.summary : undefined,
        aboutRole: body.aboutRole !== undefined ? body.aboutRole : undefined,
        description: body.description !== undefined ? body.description : undefined,
        responsibilities: body.responsibilities !== undefined ? body.responsibilities : undefined,
        eligibility: body.eligibility !== undefined ? body.eligibility : undefined,
        benefits: body.benefits !== undefined ? body.benefits : undefined,
        hiringProcess: body.hiringProcess !== undefined ? body.hiringProcess : undefined,
        additionalInfo: body.additionalInfo !== undefined ? body.additionalInfo : undefined,
        requiredSkills: body.requiredSkills !== undefined ? body.requiredSkills : undefined,
        preferredSkills: body.preferredSkills !== undefined ? body.preferredSkills : undefined,
        educationQualification: body.educationQualification !== undefined ? body.educationQualification : undefined,
        educationDegree: body.educationDegree !== undefined ? body.educationDegree : undefined,
        educationBranch: body.educationBranch !== undefined ? body.educationBranch : undefined,
        graduationYear: body.graduationYear !== undefined ? (body.graduationYear ? parseInt(body.graduationYear) : null) : undefined,
        minCgpa: body.minCgpa !== undefined ? body.minCgpa : undefined,
        applicationMethod: body.applicationMethod !== undefined ? body.applicationMethod : undefined,
        applicationUrl: body.applicationUrl !== undefined ? body.applicationUrl : undefined,
        recruiterEmail: body.recruiterEmail !== undefined ? body.recruiterEmail : undefined,
        applicationDeadline: body.applicationDeadline !== undefined ? (body.applicationDeadline ? new Date(body.applicationDeadline) : null) : undefined,
        status: body.status !== undefined ? body.status : undefined,
        isFeatured: body.isFeatured !== undefined ? !!body.isFeatured : undefined,
        isUrgent: body.isUrgent !== undefined ? !!body.isUrgent : undefined,
        seoTitle: body.seoTitle !== undefined ? body.seoTitle : undefined,
        seoDescription: body.seoDescription !== undefined ? body.seoDescription : undefined,
        
        walkinDate: body.walkinDate !== undefined ? (body.walkinDate ? new Date(body.walkinDate) : null) : undefined,
        walkinStartTime: body.walkinStartTime !== undefined ? body.walkinStartTime : undefined,
        walkinEndTime: body.walkinEndTime !== undefined ? body.walkinEndTime : undefined,
        walkinVenue: body.walkinVenue !== undefined ? body.walkinVenue : undefined,
        walkinContactInfo: body.walkinContactInfo !== undefined ? body.walkinContactInfo : undefined,
        walkinDocuments: body.walkinDocuments !== undefined ? body.walkinDocuments : undefined,
        walkinInstructions: body.walkinInstructions !== undefined ? body.walkinInstructions : undefined,

        govOrganization: body.govOrganization !== undefined ? body.govOrganization : undefined,
        govNotificationNumber: body.govNotificationNumber !== undefined ? body.govNotificationNumber : undefined,
        govAgeLimit: body.govAgeLimit !== undefined ? body.govAgeLimit : undefined,
        govApplicationFee: body.govApplicationFee !== undefined ? body.govApplicationFee : undefined,
        govSelectionProcess: body.govSelectionProcess !== undefined ? body.govSelectionProcess : undefined,
        govOfficialNotificationUrl: body.govOfficialNotificationUrl !== undefined ? body.govOfficialNotificationUrl : undefined,
        govOfficialWebsiteUrl: body.govOfficialWebsiteUrl !== undefined ? body.govOfficialWebsiteUrl : undefined,

        updatedAt: new Date(),
      })
      .where(eq(jobs.id, id))
      .returning();

    // Log admin activity
    await db.insert(adminActivityLogs).values({
      adminName: session.name || session.email,
      action: "JOB_EDIT",
      entity: "jobs",
      entityId: id,
      details: `Edited job posting: ${updated[0].title}`,
    });

    return NextResponse.json({ success: true, data: updated[0] });
  } catch (error: any) {
    console.error("Error in PUT /api/admin/jobs/[id]:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
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

    const deleted = await db.delete(jobs).where(eq(jobs.id, id)).returning();

    // Log admin activity
    await db.insert(adminActivityLogs).values({
      adminName: session.name || session.email,
      action: "JOB_DELETE",
      entity: "jobs",
      entityId: id,
      details: `Deleted job posting: ${deleted[0]?.title}`,
    });

    return NextResponse.json({ success: true, message: "Job deleted successfully" });
  } catch (error: any) {
    console.error("Error in DELETE /api/admin/jobs/[id]:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
