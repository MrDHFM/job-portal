import { safeFetch } from "../validate";
import {
  normalizeEmploymentType,
  normalizeWorkMode,
  extractYearsOfExperience,
  normalizeExperienceLevel,
  splitJobContentSections,
  extractSkillsFromText,
  generateSeoFields,
} from "../normalize";
import type { ImportOutcome, NormalizedUrlImport } from "../import-types";

// Ashby's public Job Board API is documented for this purpose.
// Docs: https://developers.ashbyhq.com/docs/public-job-posting-api
// URL pattern: jobs.ashbyhq.com/{company}/{jobId}

export function detectAshby(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host.endsWith("ashbyhq.com");
  } catch {
    return false;
  }
}

function extractIds(url: string): { company: string; jobId: string } | null {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    return { company: parts[0], jobId: parts[1] };
  } catch {
    return null;
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|li|div)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function extractFromAshby(url: string): Promise<ImportOutcome> {
  const ids = extractIds(url);
  if (!ids) {
    return { success: false, error: "Could not identify the Ashby job board from that URL." };
  }

  // Ashby's public board endpoint returns the whole board; we find the
  // matching posting by ID/slug from the URL rather than there being a
  // single-job endpoint.
  const apiUrl = `https://api.ashbyhq.com/posting-api/job-board/${ids.company}`;
  const result = await safeFetch(apiUrl, { headers: { Accept: "application/json" } });

  if (!result.ok) {
    return { success: false, error: result.error };
  }

  let json: any;
  try {
    json = JSON.parse(result.text);
  } catch {
    return { success: false, error: "Ashby returned an unexpected response." };
  }

  const postings: any[] = json?.jobs || [];
  const posting = postings.find(
    (job) => job.id === ids.jobId || job.jobUrl?.includes(ids.jobId),
  );

  if (!posting) {
    return {
      success: false,
      error: "That Ashby posting could not be found on the company's board — it may be closed.",
    };
  }

  const description = posting.descriptionHtml
    ? stripHtml(posting.descriptionHtml)
    : posting.descriptionPlain || null;

  const workMode = normalizeWorkMode(
    posting.location,
    posting.isRemote ? "remote" : "",
    description || "",
  );
  const years = extractYearsOfExperience(description);

  const contentSections = splitJobContentSections(description);
  const detectedSkills = extractSkillsFromText(description);
  const seo = generateSeoFields({
    title: posting.title,
    companyName: ids.company,
    city: posting.location || null,
    description: contentSections.description,
    summary: contentSections.summary,
  });

  const warnings: string[] = [];
  if (!posting.location) warnings.push("Location could not be detected precisely — please confirm.");

  const data: NormalizedUrlImport = {
    title: posting.title,
    companyName: ids.company,
    companyWebsite: null,
    categoryName: posting.department || posting.team || null,

    employmentType: normalizeEmploymentType(posting.employmentType),
    experienceLevel: normalizeExperienceLevel(description),
    minExperienceYears: years.min,
    maxExperienceYears: years.max,
    workMode: workMode.workMode,
    isRemoteEligible: posting.isRemote || workMode.isRemoteEligible,

    country: null,
    state: null,
    city: posting.location || null,
    address: null,

    minSalary: posting.compensation?.summaryComponents?.[0]?.minValue
      ? Math.round(posting.compensation.summaryComponents[0].minValue)
      : null,
    maxSalary: posting.compensation?.summaryComponents?.[0]?.maxValue
      ? Math.round(posting.compensation.summaryComponents[0].maxValue)
      : null,
    currency: posting.compensation?.summaryComponents?.[0]?.currencyCode || null,
    salaryPeriod: null,

    description: contentSections.description,
    summary: contentSections.summary,
    responsibilities: contentSections.responsibilities,
    benefits: contentSections.benefits,
    requiredSkills: detectedSkills,
    seoTitle: seo.seoTitle,
    seoDescription: seo.seoDescription,

    applicationUrl: posting.applyUrl || posting.jobUrl || url,
    applicationDeadline: null,
    recruiterEmail: null,

    sourceType: "ASHBY",
    sourceName: "Ashby Job Board",
    sourceUrl: apiUrl,
    originalJobUrl: url,
    originalApplyUrl: posting.applyUrl || null,
    externalJobId: posting.id || ids.jobId,
    sourcePublishedAt: posting.publishedAt || null,

    isLikelyExpired: false,
    fieldConfidence: {
      title: "high",
      companyName: "medium",
      city: posting.location ? "high" : "low",
      description: description ? "high" : "low",
    },
    warnings,
  };

  return { success: true, data };
}
