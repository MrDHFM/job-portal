import { db } from "@/db";
import { jobs, companies, categories, adminActivityLogs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { publishJobToSocialMedia } from "@/lib/social/publisher";
import type { NormalizedImportedJob } from "./types";

function makeSlug(title: string, companyName: string, city: string): string {
  const combined = `${title}-at-${companyName}-in-${city}`;
  return combined
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function makeCompanySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "") || "company";
}

async function resolveCompanyId(companyName: string): Promise<number> {
  const existing = await db
    .select()
    .from(companies)
    .where(eq(companies.name, companyName))
    .limit(1);

  if (existing.length > 0) {
    return existing[0].id;
  }

  const baseSlug = makeCompanySlug(companyName);
  let slug = baseSlug;
  let count = 1;

  while (true) {
    const match = await db
      .select()
      .from(companies)
      .where(eq(companies.slug, slug))
      .limit(1);

    if (match.length === 0) break;
    slug = `${baseSlug}-${count++}`;
  }

  const [created] = await db
    .insert(companies)
    .values({
      name: companyName,
      slug,
      isActive: true,
      description: "Company profile auto-created from an imported job listing.",
    })
    .returning();

  return created.id;
}

async function resolveCategoryId(hint: string | null): Promise<number> {
  if (hint) {
    // Loose match against existing category names (e.g. "IT Jobs" hint
    // matching a "IT" category).
    const match = await db.select().from(categories);
    const found = match.find(
      (c) =>
        hint.toLowerCase().includes(c.name.toLowerCase()) ||
        c.name.toLowerCase().includes(hint.toLowerCase()),
    );
    if (found) return found.id;
  }

  // Fall back to the first visible category, or create a generic
  // "General" one if the site has none configured yet.
  const anyCategory = await db
    .select()
    .from(categories)
    .where(eq(categories.isVisible, true))
    .limit(1);

  if (anyCategory.length > 0) return anyCategory[0].id;

  const [created] = await db
    .insert(categories)
    .values({
      name: "General",
      slug: "general",
      displayOrder: 999,
      isVisible: true,
    })
    .returning();

  return created.id;
}

export type ImportRunSummary = {
  source: string;
  fetched: number;
  imported: number;
  skippedDuplicates: number;
  skippedInvalid: number;
  errors: string[];
};

/**
 * Imports a batch of normalized external jobs into the real `jobs`
 * table. Jobs that already exist (matched by externalSource+externalId)
 * are skipped. Newly imported jobs go through the exact same
 * DRAFT/PUBLISHED + social-publish pipeline as manually created ones —
 * this is what makes them show up on the site and auto-post to social
 * without anyone touching the admin panel.
 */
export async function importJobs(
  normalizedJobs: NormalizedImportedJob[],
  options: { publishImmediately: boolean; defaultCategoryHint?: string | null },
): Promise<ImportRunSummary> {
  const source = normalizedJobs[0]?.source || "unknown";

  const summary: ImportRunSummary = {
    source,
    fetched: normalizedJobs.length,
    imported: 0,
    skippedDuplicates: 0,
    skippedInvalid: 0,
    errors: [],
  };

  for (const job of normalizedJobs) {
    try {
      if (!job.title || !job.companyName || !job.applicationUrl) {
        summary.skippedInvalid++;
        continue;
      }

      // Dedup: has this exact external listing already been imported?
      const existing = await db
        .select({ id: jobs.id })
        .from(jobs)
        .where(
          and(
            eq(jobs.externalSource, job.source),
            eq(jobs.externalId, job.externalId),
          ),
        )
        .limit(1);

      if (existing.length > 0) {
        summary.skippedDuplicates++;
        continue;
      }

      const companyId = await resolveCompanyId(job.companyName);
      const categoryId = await resolveCategoryId(
        job.categoryHint || options.defaultCategoryHint || null,
      );

      let slug = makeSlug(job.title, job.companyName, job.city);
      const originalSlug = slug;
      let slugCount = 1;
      while (true) {
        const match = await db
          .select()
          .from(jobs)
          .where(eq(jobs.slug, slug))
          .limit(1);
        if (match.length === 0) break;
        slug = `${originalSlug}-${slugCount++}`;
      }

      const status = options.publishImmediately ? "PUBLISHED" : "DRAFT";

      const [newJob] = await db
        .insert(jobs)
        .values({
          companyId,
          categoryId,
          title: job.title,
          slug,
          sector: "Non-IT",
          employmentType: job.employmentType,
          experienceLevel: job.experienceLevel,
          workMode: job.workMode,
          country: job.country,
          state: job.state,
          city: job.city,
          isRemoteEligible: job.workMode === "Remote",
          minSalary: job.minSalary ?? null,
          maxSalary: job.maxSalary ?? null,
          currency: job.currency || "INR",
          isSalaryVisible: Boolean(job.minSalary || job.maxSalary),
          description: job.description || "See full details on the original posting.",
          requiredSkills: job.requiredSkills || null,
          applicationMethod: "EXTERNAL_URL",
          applicationUrl: job.applicationUrl,
          status,
          externalSource: job.source,
          externalId: job.externalId,
          publishedAt: job.postedAt || new Date(),
        })
        .returning();

      summary.imported++;

      await db.insert(adminActivityLogs).values({
        adminName: "Auto-Import",
        action: "JOB_AUTO_IMPORTED",
        entity: "jobs",
        entityId: newJob.id,
        details: `Imported "${job.title}" at ${job.companyName} from ${job.source}.`,
      });

      // Trigger the exact same social-publish pipeline manual jobs use —
      // this is what makes auto-imported jobs post to Telegram/
      // Instagram/LinkedIn without any human involvement.
      if (status === "PUBLISHED") {
        try {
          await publishJobToSocialMedia({
            id: newJob.id,
            title: newJob.title,
            slug: newJob.slug,
            companyName: job.companyName,
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
            isSalaryVisible: newJob.isSalaryVisible,
          });
        } catch (socialError) {
          console.error(
            `Social publish failed for imported job ${newJob.id}:`,
            socialError,
          );
          // Don't fail the import over a social-posting hiccup —
          // the job itself was created successfully.
        }
      }
    } catch (error) {
      console.error(`Failed to import job "${job.title}":`, error);
      summary.errors.push(
        error instanceof Error ? error.message : "Unknown import error",
      );
    }
  }

  return summary;
}
