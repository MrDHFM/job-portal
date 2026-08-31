import { safeFetch } from "../validate";
import {
  normalizeEmploymentType,
  normalizeWorkMode,
  extractYearsOfExperience,
  normalizeExperienceLevel,
  parseSalaryText,
  splitJobContentSections,
  extractSkillsFromText,
  generateSeoFields,
} from "../normalize";
import type { ImportOutcome, NormalizedUrlImport } from "../import-types";

// Lever's public postings API is documented for exactly this purpose.
// Docs: https://github.com/lever/postings-api
// URL pattern: jobs.lever.co/{company}/{postingId}

export function detectLever(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host.endsWith("lever.co");
  } catch {
    return false;
  }
}

function extractIds(url: string): { company: string; postingId: string } | null {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    return { company: parts[0], postingId: parts[1] };
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

export async function extractFromLever(url: string): Promise<ImportOutcome> {
  const ids = extractIds(url);
  if (!ids) {
    return { success: false, error: "Could not identify the Lever posting from that URL." };
  }

  const apiUrl = `https://api.lever.co/v0/postings/${ids.company}/${ids.postingId}?mode=json`;
  const result = await safeFetch(apiUrl, { headers: { Accept: "application/json" } });

  if (!result.ok) {
    return { success: false, error: result.error };
  }

  let json: any;
  try {
    json = JSON.parse(result.text);
  } catch {
    return { success: false, error: "Lever returned an unexpected response." };
  }

  if (!json?.text) {
    return { success: false, error: "That Lever posting could not be read — it may be closed." };
  }

  const descriptionParts = [
    json.description,
    ...(json.lists || []).map((section: any) =>
      `${section.text ? `${section.text}\n` : ""}${(section.content || "")}`,
    ),
  ]
    .filter(Boolean)
    .join("\n\n");

  const description = descriptionParts ? stripHtml(descriptionParts) : null;

  const locationText = json.categories?.location || null;
  const workMode = normalizeWorkMode(locationText, json.workplaceType, description || "");
  const years = extractYearsOfExperience(description);

  const salaryText = json.salaryRange
    ? `${json.salaryRange.min ?? ""}-${json.salaryRange.max ?? ""} ${json.salaryRange.currency ?? ""}`
    : json.additionalPlain
      ? json.additionalPlain
      : null;
  const salary = parseSalaryText(salaryText);

  const contentSections = splitJobContentSections(description);
  const detectedSkills = extractSkillsFromText(description);
  const seo = generateSeoFields({
    title: json.text,
    companyName: ids.company,
    city: locationText,
    description: contentSections.description,
    summary: contentSections.summary,
  });

  const warnings: string[] = [];
  if (!json.categories?.location) warnings.push("Location could not be detected precisely — please confirm.");
  if (!salary.minSalary) warnings.push("Salary could not be detected.");

  const data: NormalizedUrlImport = {
    title: json.text,
    companyName: ids.company,
    companyWebsite: null,
    categoryName: json.categories?.team || json.categories?.department || null,

    employmentType: normalizeEmploymentType(json.categories?.commitment),
    experienceLevel: normalizeExperienceLevel(description),
    minExperienceYears: years.min,
    maxExperienceYears: years.max,
    workMode: workMode.workMode,
    isRemoteEligible: workMode.isRemoteEligible,

    country: json.country || null,
    state: null,
    city: locationText,
    address: null,

    minSalary: salary.minSalary,
    maxSalary: salary.maxSalary,
    currency: salary.currency,
    salaryPeriod: salary.salaryPeriod,

    description: contentSections.description,
    summary: contentSections.summary,
    responsibilities: contentSections.responsibilities,
    benefits: contentSections.benefits,
    requiredSkills: detectedSkills,
    seoTitle: seo.seoTitle,
    seoDescription: seo.seoDescription,

    applicationUrl: json.applyUrl || json.hostedUrl || url,
    applicationDeadline: null,

    sourceType: "LEVER",
    sourceName: "Lever Job Board",
    sourceUrl: apiUrl,
    originalJobUrl: url,
    originalApplyUrl: json.applyUrl || null,
    externalJobId: json.id || ids.postingId,
    sourcePublishedAt: json.createdAt
      ? new Date(json.createdAt).toISOString()
      : null,

    isLikelyExpired: false,
    fieldConfidence: {
      title: "high",
      companyName: "medium",
      city: locationText ? "high" : "low",
      description: description ? "high" : "low",
      minSalary: salary.minSalary ? "medium" : "low",
    },
    warnings,
  };

  return { success: true, data };
}
