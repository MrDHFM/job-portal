import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobs, companies, categories, adminActivityLogs } from "@/db/schema";
import { eq, and, ilike, sql, desc } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";
import { publishJobToSocialMedia } from "@/lib/social/publisher";

// Helper to make slug
function makeSlug(title: string, companyName: string, city: string): string {
  const combined = `${title}-at-${companyName}-in-${city}`;
  return combined
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function GET(req: Request) {
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

    const page = Math.max(
      1,
      Number(searchParams.get("page") || "1"),
    );

    const limit = Math.min(
      100,
      Math.max(
        1,
        Number(searchParams.get("limit") || "25"),
      ),
    );

    const offset = (page - 1) * limit;

    const search = (
      searchParams.get("search") || ""
    ).trim();

    const status =
      searchParams.get("status") || "";

    const conditions = [];

    if (search) {
      conditions.push(
        sql`(
          ${jobs.title} ILIKE ${`%${search}%`}
          OR ${companies.name} ILIKE ${`%${search}%`}
        )`,
      );
    }

    if (
      status &&
      ["PUBLISHED", "DRAFT", "ARCHIVED"].includes(status)
    ) {
      conditions.push(
        eq(jobs.status, status),
      );
    }

    const whereCondition =
      conditions.length > 0
        ? and(...conditions)
        : undefined;

    const [adminJobs, countResult] =
      await Promise.all([
        db
          .select({
            id: jobs.id,
            title: jobs.title,
            slug: jobs.slug,
            status: jobs.status,
            sector: jobs.sector,
            employmentType:
              jobs.employmentType,
            experienceLevel:
              jobs.experienceLevel,
            workMode: jobs.workMode,
            city: jobs.city,
            isFeatured: jobs.isFeatured,
            isUrgent: jobs.isUrgent,
            createdAt: jobs.createdAt,
            applicationDeadline:
              jobs.applicationDeadline,
            expiresAt: jobs.expiresAt,
            viewsCount: jobs.viewsCount,
            applyClicksCount:
              jobs.applyClicksCount,

            company: {
              id: companies.id,
              name: companies.name,
            },

            category: {
              id: categories.id,
              name: categories.name,
            },
          })
          .from(jobs)
          .innerJoin(
            companies,
            eq(jobs.companyId, companies.id),
          )
          .innerJoin(
            categories,
            eq(jobs.categoryId, categories.id),
          )
          .where(whereCondition)
          .orderBy(desc(jobs.createdAt))
          .limit(limit)
          .offset(offset),

        db
          .select({
            count: sql<number>`count(*)::int`,
          })
          .from(jobs)
          .innerJoin(
            companies,
            eq(jobs.companyId, companies.id),
          )
          .innerJoin(
            categories,
            eq(jobs.categoryId, categories.id),
          )
          .where(whereCondition),
      ]);

    const total = countResult[0]?.count || 0;

    const totalPages =
      Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: adminJobs,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error(
      "Error in GET /api/admin/jobs:",
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

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const {
      companyId,
      companyName,
      categoryId,
      title,
      sector,
      employmentType,
      experienceLevel,
      workMode,
      vacancies,
      country,
      state,
      city,
      address,
      isRemoteEligible,
      minSalary,
      maxSalary,
      currency,
      salaryPeriod,
      isSalaryVisible,
      summary,
      aboutRole,
      description,
      responsibilities,
      eligibility,
      benefits,
      hiringProcess,
      additionalInfo,
      requiredSkills,
      preferredSkills,
      educationQualification,
      educationDegree,
      educationBranch,
      graduationYear,
      minCgpa,
      applicationMethod,
      applicationUrl,
      recruiterEmail,
      applicationDeadline,
      status,
      isFeatured,
      isUrgent,
      seoTitle,
      seoDescription,

      // Walkin
      walkinDate,
      walkinStartTime,
      walkinEndTime,
      walkinVenue,
      walkinContactInfo,
      walkinDocuments,
      walkinInstructions,

      // Government
      govOrganization,
      govNotificationNumber,
      govAgeLimit,
      govApplicationFee,
      govSelectionProcess,
      govOfficialNotificationUrl,
      govOfficialWebsiteUrl,

      // Force create (skip duplicate warning)
      force,
    } = body;

    // Validation
    if (
      !companyName?.trim() ||
      !categoryId ||
      !title ||
      !sector ||
      !employmentType ||
      !experienceLevel ||
      !workMode ||
      !country ||
      !state ||
      !city ||
      !description ||
      !applicationMethod
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required core job details." },
        { status: 400 },
      );
    }

   

    // -----------------------------------------------------
    // Company handling
    // -----------------------------------------------------
    // Existing company:
    //   companyId is provided.
    //
    // New company:
    //   companyId is empty but companyName is provided.
    //   We first check whether the company already exists.
    //   If not, create it automatically.
    // -----------------------------------------------------

    const normalizedCompanyName = companyName.trim();

    let selectedCompanyId: number;
    let companyLogoUrl: string | null = null;

    if (companyId) {
      // Existing company selected from the form
      selectedCompanyId = parseInt(companyId);

      const existingCompany = await db
        .select()
        .from(companies)
        .where(eq(companies.id, selectedCompanyId))
        .limit(1);

      if (existingCompany.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Selected company was not found.",
          },
          { status: 400 },
        );
      }

      companyLogoUrl = existingCompany[0].logoUrl || null;
    } else {
      // New company typed manually
      // First check for an existing company with the same name.
      const existingCompany = await db
        .select()
        .from(companies)
        .where(ilike(companies.name, normalizedCompanyName))
        .limit(1);

      if (existingCompany.length > 0) {
        // Reuse existing company instead of creating duplicate
        selectedCompanyId = existingCompany[0].id;
        companyLogoUrl = existingCompany[0].logoUrl || null;
      } else {
        // Generate a unique company slug
        const baseSlug = normalizedCompanyName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");

        let companySlug = baseSlug || "company";
        let companySlugCount = 1;

        while (true) {
          const existingSlug = await db
            .select()
            .from(companies)
            .where(eq(companies.slug, companySlug))
            .limit(1);

          if (existingSlug.length === 0) {
            break;
          }

          companySlug = `${baseSlug}-${companySlugCount++}`;
        }

        const [newCompany] = await db
          .insert(companies)
          .values({
            name: normalizedCompanyName,
            slug: companySlug,
            isActive: true,
          })
          .returning();

        selectedCompanyId = newCompany.id;
        companyLogoUrl = newCompany.logoUrl || null;
      }
    }

     // Duplicate prevention check
    if (!force) {
      const possibleDuplicates = await db
        .select()
        .from(jobs)
        .where(
          and(
            eq(jobs.companyId, selectedCompanyId),
            ilike(jobs.title, title.trim()),
            ilike(jobs.city, city.trim()),
            eq(jobs.status, "PUBLISHED"),
          ),
        )
        .limit(1);

      if (possibleDuplicates.length > 0) {
        return NextResponse.json(
          {
            success: false,
            warning: "Possible duplicate job detected.",
            message: `A published job titled "${title}" at "${city}" already exists for this company. Are you sure you want to post this as a separate opening?`,
            duplicateId: possibleDuplicates[0].id,
          },
          { status: 409 },
        );
      }
    }

    const category = await db
      .select()
      .from(categories)
      .where(eq(categories.id, parseInt(categoryId)))
      .limit(1);

    const resolvedCompanyName = normalizedCompanyName;

    const categoryName = category[0]?.name || null;

    // Create unique slug
    let slug = makeSlug(title, resolvedCompanyName, city);
    let originalSlug = slug;
    let count = 1;
    while (true) {
      const match = await db
        .select()
        .from(jobs)
        .where(eq(jobs.slug, slug))
        .limit(1);
      if (match.length === 0) break;
      slug = `${originalSlug}-${count++}`;
    }

    const parsedApplicationDeadline = applicationDeadline
      ? new Date(applicationDeadline)
      : null;

    const requestedStatus = status || "PUBLISHED";

    const finalStatus =
      requestedStatus === "PUBLISHED" &&
      parsedApplicationDeadline &&
      parsedApplicationDeadline.getTime() < Date.now()
        ? "EXPIRED"
        : requestedStatus;

    const [newJob] = await db
      .insert(jobs)
      .values({
        companyId: selectedCompanyId,
        categoryId: parseInt(categoryId),
        title: title.trim(),
        slug,
        sector,
        employmentType,
        experienceLevel,
        workMode,
        vacancies: vacancies ? parseInt(vacancies) : 1,
        country: country.trim(),
        state: state.trim(),
        city: city.trim(),
        address: address || null,
        isRemoteEligible: !!isRemoteEligible,
        minSalary: minSalary ? parseInt(minSalary) : null,
        maxSalary: maxSalary ? parseInt(maxSalary) : null,
        currency: currency || "USD",
        salaryPeriod: salaryPeriod || "yearly",
        isSalaryVisible: !!isSalaryVisible,
        summary: summary || null,
        aboutRole: aboutRole || null,
        description: description,
        responsibilities: responsibilities || null,
        eligibility: eligibility || null,
        benefits: benefits || null,
        hiringProcess: hiringProcess || null,
        additionalInfo: additionalInfo || null,
        requiredSkills: requiredSkills || null,
        preferredSkills: preferredSkills || null,
        educationQualification: educationQualification || null,
        educationDegree: educationDegree || null,
        educationBranch: educationBranch || null,
        graduationYear: graduationYear ? parseInt(graduationYear) : null,
        minCgpa: minCgpa || null,
        applicationMethod,
        applicationUrl: applicationUrl || null,
        recruiterEmail: recruiterEmail || null,
        applicationDeadline: parsedApplicationDeadline,
        status: finalStatus,
        isFeatured: !!isFeatured,
        isUrgent: !!isUrgent,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,

        walkinDate: walkinDate ? new Date(walkinDate) : null,
        walkinStartTime: walkinStartTime || null,
        walkinEndTime: walkinEndTime || null,
        walkinVenue: walkinVenue || null,
        walkinContactInfo: walkinContactInfo || null,
        walkinDocuments: walkinDocuments || null,
        walkinInstructions: walkinInstructions || null,

        govOrganization: govOrganization || null,
        govNotificationNumber: govNotificationNumber || null,
        govAgeLimit: govAgeLimit || null,
        govApplicationFee: govApplicationFee || null,
        govSelectionProcess: govSelectionProcess || null,
        govOfficialNotificationUrl: govOfficialNotificationUrl || null,
        govOfficialWebsiteUrl: govOfficialWebsiteUrl || null,

        viewsCount: 0,
        applyClicksCount: 0,
        publishedAt: new Date(),
      })
      .returning();

    // Log admin activity
    await db.insert(adminActivityLogs).values({
      adminName: session.name || session.email,
      action: "JOB_CREATE",
      entity: "jobs",
      entityId: newJob.id,
      details: `Created job posting: ${newJob.title}`,
    });

    // -----------------------------------------------------
    // Social media publishing
    // -----------------------------------------------------
    //
    // Important:
    // The job has already been successfully created.
    //
    // Social media failures MUST NOT cause the job creation
    // request itself to fail.
    //
    let socialResults = null;

    if (newJob.status === "PUBLISHED") {
      try {
        socialResults = await publishJobToSocialMedia({
          id: newJob.id,
          title: newJob.title,
          slug: newJob.slug,

          companyName,

          city: newJob.city,
          state: newJob.state,
          country: newJob.country,

          employmentType: newJob.employmentType,
          workMode: newJob.workMode,
          experienceLevel: newJob.experienceLevel,

          requiredSkills: newJob.requiredSkills,

          minSalary: newJob.minSalary,
          maxSalary: newJob.maxSalary,
          currency: newJob.currency,
          salaryPeriod: newJob.salaryPeriod,
          isSalaryVisible: newJob.isSalaryVisible,

          applicationDeadline: newJob.applicationDeadline,
          companyLogoUrl,
          categoryName,

          isUrgent: newJob.isUrgent,
          isFeatured: newJob.isFeatured,
        });

        console.log("Social publishing results:", socialResults);
      } catch (socialError) {
        // Never fail job creation because a social platform failed.
        console.error(
          "Job created successfully, but social publishing failed:",
          socialError,
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: newJob,
      socialPublishing: socialResults,
    });
  } catch (error: any) {
    console.error("Error in POST /api/admin/jobs:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
