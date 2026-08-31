import { db } from "@/db";
import { jobs, companies } from "@/db/schema";
import { and, eq, ilike, or } from "drizzle-orm";
import { canonicalizeUrl } from "./normalize";
import type { NormalizedUrlImport } from "./import-types";

export type DuplicateMatch = {
  id: number;
  title: string;
  companyName: string;
  city: string;
  status: string;
  slug: string;
};

/**
 * Checks whether an imported job likely already exists, using — in
 * order of confidence — the exact external listing ID, a canonical
 * URL match, then a fuzzy company+title+city match (same heuristic
 * the manual job-creation flow already uses).
 */
export async function findDuplicateJob(
  data: NormalizedUrlImport,
): Promise<DuplicateMatch | null> {
  // 1. Exact same external listing already imported before.
  if (data.sourceType && data.externalJobId) {
    const exact = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        city: jobs.city,
        status: jobs.status,
        slug: jobs.slug,
        companyName: companies.name,
      })
      .from(jobs)
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .where(
        and(
          eq(jobs.externalSource, data.sourceType),
          eq(jobs.externalId, data.externalJobId),
        ),
      )
      .limit(1);

    if (exact.length > 0) return exact[0];
  }

  // 2. Canonical URL match (same job page, tracking params aside).
  // Skipped entirely when there's no real URL to compare (e.g. a
  // text-pasted job description) — matching on empty strings would
  // produce false-positive "duplicates" against other URL-less jobs.
  if (data.originalJobUrl) {
    const canonicalIncoming = canonicalizeUrl(data.originalJobUrl);

    const urlMatches = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        city: jobs.city,
        status: jobs.status,
        slug: jobs.slug,
        companyName: companies.name,
        originalJobUrl: jobs.originalJobUrl,
      })
      .from(jobs)
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .where(
        or(
          eq(jobs.originalJobUrl, data.originalJobUrl),
          eq(jobs.applicationUrl, data.originalJobUrl),
        ),
      )
      .limit(5);

    const canonicalMatch = urlMatches.find(
      (row) =>
        row.originalJobUrl && canonicalizeUrl(row.originalJobUrl) === canonicalIncoming,
    );

    if (canonicalMatch) {
      const { originalJobUrl, ...rest } = canonicalMatch;
      return rest;
    }
    if (urlMatches.length > 0) {
      const { originalJobUrl, ...rest } = urlMatches[0];
      return rest;
    }
  }

  // 3. Fuzzy match: same company + same title + same city, still live.
  if (data.title && data.companyName && data.city) {
    const fuzzy = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        city: jobs.city,
        status: jobs.status,
        slug: jobs.slug,
        companyName: companies.name,
      })
      .from(jobs)
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .where(
        and(
          ilike(companies.name, data.companyName.trim()),
          ilike(jobs.title, data.title.trim()),
          ilike(jobs.city, data.city.trim()),
          eq(jobs.status, "PUBLISHED"),
        ),
      )
      .limit(1);

    if (fuzzy.length > 0) return fuzzy[0];
  }

  return null;
}
