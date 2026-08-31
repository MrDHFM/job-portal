import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobs, companies, siteSettings, adminActivityLogs } from "@/db/schema";
import { eq, and, lte } from "drizzle-orm";
import { publishJobToSocialMedia } from "@/lib/social/publisher";
import { fetchAdzunaJobs } from "@/lib/job-import/adzuna";
import { importJobs } from "@/lib/job-import/importer";

// Accepts either:
//  - Vercel's own auto-provisioned CRON_SECRET (sent as
//    `Authorization: Bearer <CRON_SECRET>` when triggered by Vercel Cron), or
//  - a custom secret you set yourself (sent the same way), so an external
//    scheduler (cron-job.org, GitHub Actions, etc.) can trigger this too —
//    useful since Vercel's Hobby plan only allows once-a-day cron.
function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();

  const validSecrets = [process.env.CRON_SECRET].filter(Boolean);

  return validSecrets.length > 0 && validSecrets.includes(token);
}

async function publishDueScheduledJobs() {
  const now = new Date();

  const due = await db
    .select()
    .from(jobs)
    .innerJoin(companies, eq(jobs.companyId, companies.id))
    .where(
      and(eq(jobs.status, "SCHEDULED"), lte(jobs.scheduledPublishAt, now)),
    );

  let published = 0;

  for (const row of due) {
    const job = row.jobs;
    const company = row.companies;

    try {
      await db
        .update(jobs)
        .set({ status: "PUBLISHED", publishedAt: now, updatedAt: now })
        .where(eq(jobs.id, job.id));

      await db.insert(adminActivityLogs).values({
        adminName: "Cron",
        action: "JOB_AUTO_PUBLISHED",
        entity: "jobs",
        entityId: job.id,
        details: `Scheduled job "${job.title}" auto-published at its scheduled time.`,
      });

      // Same social pipeline manual publishing uses.
      await publishJobToSocialMedia({
        id: job.id,
        title: job.title,
        slug: job.slug,
        companyName: company.name,
        city: job.city,
        state: job.state,
        country: job.country,
        employmentType: job.employmentType,
        workMode: job.workMode,
        experienceLevel: job.experienceLevel,
        requiredSkills: job.requiredSkills,
        minSalary: job.minSalary,
        maxSalary: job.maxSalary,
        currency: job.currency,
        isSalaryVisible: job.isSalaryVisible,
      });

      published++;
    } catch (error) {
      console.error(`Failed to auto-publish scheduled job ${job.id}:`, error);
    }
  }

  return { checked: due.length, published };
}

async function getImportSettings() {
  const rows = await db.select().from(siteSettings);
  const settings: Record<string, string> = {};
  rows.forEach((r) => (settings[r.key] = r.value));

  return {
    enabled: settings.jobImportEnabled === "true",
    keywords: settings.jobImportKeywords || "",
    country: settings.jobImportCountry || "in",
    publishImmediately: settings.jobImportMode !== "draft",
    resultsPerPage: Number(settings.jobImportResultsPerPage || "20"),
  };
}

async function runJobImport() {
  const config = await getImportSettings();

  if (!config.enabled) {
    return { skipped: true, reason: "Auto-import is disabled in Settings." };
  }

  const result = await fetchAdzunaJobs({
    country: config.country,
    keywords: config.keywords || undefined,
    resultsPerPage: config.resultsPerPage,
    maxDaysOld: 3,
  });

  if (result.error) {
    return { skipped: true, reason: result.error };
  }

  const summary = await importJobs(result.jobs, {
    publishImmediately: config.publishImmediately,
  });

  return { skipped: false, summary };
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [scheduledResult, importResult] = await Promise.all([
      publishDueScheduledJobs(),
      runJobImport(),
    ]);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      scheduledPublishing: scheduledResult,
      jobImport: importResult,
    });
  } catch (error) {
    console.error("Cron run failed:", error);

    return NextResponse.json(
      { success: false, error: "Cron run failed." },
      { status: 500 },
    );
  }
}
