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

// Greenhouse's public Job Board API is documented and explicitly meant
// for reading a company's own published postings — not an
// undocumented scrape. Docs: https://developers.greenhouse.io/job-board.html
// URL patterns: boards.greenhouse.io/{board}/jobs/{id}
//               job-boards.greenhouse.io/{board}/jobs/{id}

export function detectGreenhouse(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host.endsWith("greenhouse.io");
  } catch {
    return false;
  }
}

function extractIds(url: string): { board: string; jobId: string } | null {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);
    // .../{board}/jobs/{id}
    const jobsIdx = parts.indexOf("jobs");
    if (jobsIdx === -1 || jobsIdx === 0 || !parts[jobsIdx + 1]) return null;

    return { board: parts[jobsIdx - 1], jobId: parts[jobsIdx + 1] };
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

export async function extractFromGreenhouse(url: string): Promise<ImportOutcome> {
  const ids = extractIds(url);
  if (!ids) {
    return { success: false, error: "Could not identify the Greenhouse job ID from that URL." };
  }

  const apiUrl = `https://boards-api.greenhouse.io/v1/boards/${ids.board}/jobs/${ids.jobId}?content=true`;
  const result = await safeFetch(apiUrl, { headers: { Accept: "application/json" } });

  if (!result.ok) {
    return { success: false, error: result.error };
  }

  let json: any;
  try {
    json = JSON.parse(result.text);
  } catch {
    return { success: false, error: "Greenhouse returned an unexpected response." };
  }

  if (!json?.title) {
    return { success: false, error: "That Greenhouse posting could not be read — it may be closed." };
  }

  const description = json.content ? stripHtml(json.content) : null;
  const locationText = json.location?.name || null;
  const workMode = normalizeWorkMode(locationText, description || "");
  const years = extractYearsOfExperience(description);

  const contentSections = splitJobContentSections(description);
  const detectedSkills = extractSkillsFromText(description);
  const seo = generateSeoFields({
    title: json.title,
    companyName: ids.board,
    city: locationText,
    description: contentSections.description,
    summary: contentSections.summary,
  });

  const warnings: string[] = [];
  if (!json.location?.name) warnings.push("Location could not be detected precisely — please confirm.");

  const data: NormalizedUrlImport = {
    title: json.title,
    companyName: ids.board, // Greenhouse board tokens are usually the company slug; admin can correct casing
    companyWebsite: null,
    categoryName: json.departments?.[0]?.name || null,

    employmentType: normalizeEmploymentType(json.metadata?.find((m: any) => /employment/i.test(m.name))?.value),
    experienceLevel: normalizeExperienceLevel(description),
    minExperienceYears: years.min,
    maxExperienceYears: years.max,
    workMode: workMode.workMode,
    isRemoteEligible: workMode.isRemoteEligible,

    country: null,
    state: null,
    city: locationText,
    address: null,

    minSalary: null,
    maxSalary: null,
    currency: null,
    salaryPeriod: null,

    description: contentSections.description,
    summary: contentSections.summary,
    responsibilities: contentSections.responsibilities,
    benefits: contentSections.benefits,
    requiredSkills: detectedSkills,
    seoTitle: seo.seoTitle,
    seoDescription: seo.seoDescription,

    applicationUrl: json.absolute_url || url,
    applicationDeadline: null,
    recruiterEmail: null,

    sourceType: "GREENHOUSE",
    sourceName: "Greenhouse Job Board",
    sourceUrl: apiUrl,
    originalJobUrl: url,
    originalApplyUrl: json.absolute_url || null,
    externalJobId: String(json.id || ids.jobId),
    sourcePublishedAt: json.updated_at || null,

    isLikelyExpired: false,
    fieldConfidence: {
      title: "high",
      companyName: "medium",
      city: locationText ? "high" : "low",
      description: description ? "high" : "low",
    },
    warnings,
  };

  return { success: true, data };
}
