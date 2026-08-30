import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobs, companies, categories, adminActivityLogs } from "@/db/schema";
import { eq, ilike } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";
import { publishJobToSocialMedia } from "@/lib/social/publisher";

export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const params = await props.params;
    const id = parseInt(params.id);
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const existing = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, id))
      .limit(1);
    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: "Job posting not found." },
        { status: 404 },
      );
    }

    const existingJob = existing[0];

    const companyResult = await db
      .select({
        id: companies.id,
        name: companies.name,
        logoUrl: companies.logoUrl,
      })
      .from(companies)
      .where(eq(companies.id, existingJob.companyId))
      .limit(1);

    const categoryResult = await db
      .select({
        id: categories.id,
        name: categories.name,
      })
      .from(categories)
      .where(eq(categories.id, existingJob.categoryId))
      .limit(1);

    const companyName = companyResult[0]?.name || "Company";

    const companyLogoUrl = companyResult[0]?.logoUrl || null;

    const categoryName = categoryResult[0]?.name || null;

    // -----------------------------------------------------
    // Company + Category resolve-or-create — same pattern as the
    // create (POST) route. Previously this route only accepted an
    // existing companyId/categoryId, so typing a brand-new company or
    // category name while editing a job silently failed to save.
    // -----------------------------------------------------
    let resolvedCompanyId: number | undefined = undefined;
    let resolvedCompanyName = companyName;
    let resolvedCompanyLogoUrl = companyLogoUrl;

    if (body.companyId) {
      resolvedCompanyId = parseInt(body.companyId);
    } else if (body.companyName?.trim()) {
      const typedName = body.companyName.trim();

      const existingCompany = await db
        .select()
        .from(companies)
        .where(ilike(companies.name, typedName))
        .limit(1);

      if (existingCompany.length > 0) {
        resolvedCompanyId = existingCompany[0].id;
        resolvedCompanyName = existingCompany[0].name;
        resolvedCompanyLogoUrl = existingCompany[0].logoUrl || null;
      } else {
        const baseSlug = typedName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");

        let companySlug = baseSlug || "company";
        let slugCount = 1;

        while (true) {
          const existingSlug = await db
            .select()
            .from(companies)
            .where(eq(companies.slug, companySlug))
            .limit(1);

          if (existingSlug.length === 0) break;
          companySlug = `${baseSlug}-${slugCount++}`;
        }

        const [newCompany] = await db
          .insert(companies)
          .values({ name: typedName, slug: companySlug, isActive: true })
          .returning();

        resolvedCompanyId = newCompany.id;
        resolvedCompanyName = newCompany.name;
        resolvedCompanyLogoUrl = newCompany.logoUrl || null;
      }
    }

    let resolvedCategoryId: number | undefined = undefined;
    let resolvedCategoryName = categoryName;

    if (body.categoryId) {
      resolvedCategoryId = parseInt(body.categoryId);
    } else if (body.categoryName?.trim()) {
      const typedName = body.categoryName.trim();

      const existingCategory = await db
        .select()
        .from(categories)
        .where(ilike(categories.name, typedName))
        .limit(1);

      if (existingCategory.length > 0) {
        resolvedCategoryId = existingCategory[0].id;
        resolvedCategoryName = existingCategory[0].name;
      } else {
        const baseSlug = typedName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");

        let categorySlug = baseSlug || "category";
        let slugCount = 1;

        while (true) {
          const existingSlug = await db
            .select()
            .from(categories)
            .where(eq(categories.slug, categorySlug))
            .limit(1);

          if (existingSlug.length === 0) break;
          categorySlug = `${baseSlug}-${slugCount++}`;
        }

        const [newCategory] = await db
          .insert(categories)
          .values({ name: typedName, slug: categorySlug, isVisible: true })
          .returning();

        resolvedCategoryId = newCategory.id;
        resolvedCategoryName = newCategory.name;
      }
    }

    const nextDeadline =
      body.applicationDeadline !== undefined
        ? body.applicationDeadline
          ? new Date(body.applicationDeadline)
          : null
        : existingJob.applicationDeadline;

    const previousStatus = existingJob.status;

    let nextStatus =
      body.status !== undefined ? body.status : existingJob.status;

    // If admin tries to publish a job with an old deadline,
    // keep it expired.
    if (
      nextStatus === "PUBLISHED" &&
      nextDeadline &&
      new Date(nextDeadline).getTime() < Date.now()
    ) {
      nextStatus = "EXPIRED";
    }

    const updated = await db
      .update(jobs)
      .set({
        companyId: resolvedCompanyId,
        categoryId: resolvedCategoryId,
        title: body.title !== undefined ? body.title.trim() : undefined,
        sector: body.sector !== undefined ? body.sector : undefined,
        employmentType:
          body.employmentType !== undefined ? body.employmentType : undefined,
        experienceLevel:
          body.experienceLevel !== undefined ? body.experienceLevel : undefined,
        minExperienceYears:
          body.minExperienceYears !== undefined
            ? body.minExperienceYears
              ? parseInt(body.minExperienceYears)
              : null
            : undefined,
        maxExperienceYears:
          body.maxExperienceYears !== undefined
            ? body.maxExperienceYears
              ? parseInt(body.maxExperienceYears)
              : null
            : undefined,
        workMode: body.workMode !== undefined ? body.workMode : undefined,
        vacancies:
          body.vacancies !== undefined ? parseInt(body.vacancies) : undefined,
        country: body.country !== undefined ? body.country.trim() : undefined,
        state: body.state !== undefined ? body.state.trim() : undefined,
        city: body.city !== undefined ? body.city.trim() : undefined,
        address: body.address !== undefined ? body.address : undefined,
        isRemoteEligible:
          body.isRemoteEligible !== undefined
            ? !!body.isRemoteEligible
            : undefined,
        minSalary:
          body.minSalary !== undefined
            ? body.minSalary
              ? parseInt(body.minSalary)
              : null
            : undefined,
        maxSalary:
          body.maxSalary !== undefined
            ? body.maxSalary
              ? parseInt(body.maxSalary)
              : null
            : undefined,
        currency: body.currency !== undefined ? body.currency : undefined,
        salaryPeriod:
          body.salaryPeriod !== undefined ? body.salaryPeriod : undefined,
        isSalaryVisible:
          body.isSalaryVisible !== undefined
            ? !!body.isSalaryVisible
            : undefined,
        summary: body.summary !== undefined ? body.summary : undefined,
        aboutRole: body.aboutRole !== undefined ? body.aboutRole : undefined,
        description:
          body.description !== undefined ? body.description : undefined,
        responsibilities:
          body.responsibilities !== undefined
            ? body.responsibilities
            : undefined,
        eligibility:
          body.eligibility !== undefined ? body.eligibility : undefined,
        benefits: body.benefits !== undefined ? body.benefits : undefined,
        hiringProcess:
          body.hiringProcess !== undefined ? body.hiringProcess : undefined,
        additionalInfo:
          body.additionalInfo !== undefined ? body.additionalInfo : undefined,
        requiredSkills:
          body.requiredSkills !== undefined ? body.requiredSkills : undefined,
        preferredSkills:
          body.preferredSkills !== undefined ? body.preferredSkills : undefined,
        educationQualification:
          body.educationQualification !== undefined
            ? body.educationQualification
            : undefined,
        educationDegree:
          body.educationDegree !== undefined ? body.educationDegree : undefined,
        educationBranch:
          body.educationBranch !== undefined ? body.educationBranch : undefined,
        graduationYear:
          body.graduationYear !== undefined
            ? body.graduationYear
              ? parseInt(body.graduationYear)
              : null
            : undefined,
        minCgpa: body.minCgpa !== undefined ? body.minCgpa : undefined,
        applicationMethod:
          body.applicationMethod !== undefined
            ? body.applicationMethod
            : undefined,
        applicationUrl:
          body.applicationUrl !== undefined ? body.applicationUrl : undefined,
        recruiterEmail:
          body.recruiterEmail !== undefined ? body.recruiterEmail : undefined,
        applicationDeadline:
          body.applicationDeadline !== undefined ? nextDeadline : undefined,

        status: nextStatus,
        isFeatured:
          body.isFeatured !== undefined ? !!body.isFeatured : undefined,
        isUrgent: body.isUrgent !== undefined ? !!body.isUrgent : undefined,
        seoTitle: body.seoTitle !== undefined ? body.seoTitle : undefined,
        seoDescription:
          body.seoDescription !== undefined ? body.seoDescription : undefined,

        walkinDate:
          body.walkinDate !== undefined
            ? body.walkinDate
              ? new Date(body.walkinDate)
              : null
            : undefined,
        walkinStartTime:
          body.walkinStartTime !== undefined ? body.walkinStartTime : undefined,
        walkinEndTime:
          body.walkinEndTime !== undefined ? body.walkinEndTime : undefined,
        walkinVenue:
          body.walkinVenue !== undefined ? body.walkinVenue : undefined,
        walkinContactInfo:
          body.walkinContactInfo !== undefined
            ? body.walkinContactInfo
            : undefined,
        walkinDocuments:
          body.walkinDocuments !== undefined ? body.walkinDocuments : undefined,
        walkinInstructions:
          body.walkinInstructions !== undefined
            ? body.walkinInstructions
            : undefined,

        govOrganization:
          body.govOrganization !== undefined ? body.govOrganization : undefined,
        govNotificationNumber:
          body.govNotificationNumber !== undefined
            ? body.govNotificationNumber
            : undefined,
        govAgeLimit:
          body.govAgeLimit !== undefined ? body.govAgeLimit : undefined,
        govApplicationFee:
          body.govApplicationFee !== undefined
            ? body.govApplicationFee
            : undefined,
        govSelectionProcess:
          body.govSelectionProcess !== undefined
            ? body.govSelectionProcess
            : undefined,
        govOfficialNotificationUrl:
          body.govOfficialNotificationUrl !== undefined
            ? body.govOfficialNotificationUrl
            : undefined,
        govOfficialWebsiteUrl:
          body.govOfficialWebsiteUrl !== undefined
            ? body.govOfficialWebsiteUrl
            : undefined,

        updatedAt: new Date(),
      })
      .where(eq(jobs.id, id))
      .returning();

    let socialPublishing = null;

    /*
     * Publish automatically when a job transitions
     * from DRAFT/other non-published status to PUBLISHED.
     *
     * This is especially important for duplicated jobs:
     *
     * Duplicate → DRAFT → PUBLISHED
     */
    const shouldPublishToSocial =
      previousStatus !== "PUBLISHED" && nextStatus === "PUBLISHED";

    if (shouldPublishToSocial && updated[0]) {
      try {
        socialPublishing = await publishJobToSocialMedia({
          id: updated[0].id,
          title: updated[0].title,
          slug: updated[0].slug,

          companyName: resolvedCompanyName,

          city: updated[0].city,
          state: updated[0].state,
          country: updated[0].country,

          employmentType: updated[0].employmentType,

          workMode: updated[0].workMode,

          experienceLevel: updated[0].experienceLevel,

          requiredSkills: updated[0].requiredSkills,

          minSalary: updated[0].minSalary,

          maxSalary: updated[0].maxSalary,

          currency: updated[0].currency,

          salaryPeriod: updated[0].salaryPeriod,

          isSalaryVisible: updated[0].isSalaryVisible,

          applicationDeadline: updated[0].applicationDeadline,

          companyLogoUrl: resolvedCompanyLogoUrl,

          categoryName: resolvedCategoryName,

          isUrgent: updated[0].isUrgent,

          isFeatured: updated[0].isFeatured,
        });

        console.log("Social publishing after status change:", socialPublishing);
      } catch (socialError) {
        /*
         * The job is already successfully published.
         * Social failure must not make the status update fail.
         */
        console.error(
          "Job published successfully, but social publishing failed:",
          socialError,
        );
      }
    }

    // Log admin activity
    await db.insert(adminActivityLogs).values({
      adminName: session.name || session.email,
      action: "JOB_EDIT",
      entity: "jobs",
      entityId: id,
      details: `Edited job posting: ${updated[0].title}`,
    });

    return NextResponse.json({
      success: true,
      data: updated[0],
      socialPublishing,
    });
  } catch (error: any) {
    console.error("Error in PUT /api/admin/jobs/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const params = await props.params;
    const id = parseInt(params.id);
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
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

    return NextResponse.json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error: any) {
    console.error("Error in DELETE /api/admin/jobs/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}