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

// Fallback connector for job pages that don't match a known ATS
// provider. Reads schema.org/JobPosting JSON-LD first — the same
// structured data Google for Jobs indexes, meant to be machine-read —
// then falls back to basic OpenGraph meta tags for pages without it.

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractJsonLdBlocks(html: string): any[] {
  const blocks: any[] = [];
  const regex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

  let match;
  while ((match = regex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim());
      if (Array.isArray(parsed)) blocks.push(...parsed);
      else if (parsed["@graph"] && Array.isArray(parsed["@graph"])) blocks.push(...parsed["@graph"]);
      else blocks.push(parsed);
    } catch {
      continue; // malformed JSON-LD on the page — skip, don't fail the whole extraction
    }
  }

  return blocks;
}

function findJobPosting(blocks: any[]): any | null {
  return (
    blocks.find(
      (block) =>
        block?.["@type"] === "JobPosting" ||
        (Array.isArray(block?.["@type"]) && block["@type"].includes("JobPosting")),
    ) || null
  );
}

function extractMetaTag(html: string, property: string): string | null {
  const regex = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']*)["']`,
    "i",
  );
  const match = html.match(regex);
  return match ? match[1] : null;
}

export async function extractGeneric(url: string): Promise<ImportOutcome> {
  const result = await safeFetch(url);

  if (!result.ok) {
    return { success: false, error: result.error };
  }

  const html = result.text;
  const jsonLdBlocks = extractJsonLdBlocks(html);
  const jobPosting = findJobPosting(jsonLdBlocks);

  if (jobPosting) {
    const org = jobPosting.hiringOrganization;
    const companyName = typeof org === "string" ? org : org?.name || null;

    const location = Array.isArray(jobPosting.jobLocation)
      ? jobPosting.jobLocation[0]
      : jobPosting.jobLocation;
    const address = location?.address;

    const description = jobPosting.description ? stripHtml(jobPosting.description) : null;

    const workMode = normalizeWorkMode(
      jobPosting.jobLocationType === "TELECOMMUTE" ? "remote" : "",
      description || "",
    );

    const years = extractYearsOfExperience(description);
    const salary = jobPosting.baseSalary?.value;

    const contentSections = splitJobContentSections(description);
    const detectedSkills =
      jobPosting.skills || extractSkillsFromText(description);
    const seo = generateSeoFields({
      title: jobPosting.title || null,
      companyName,
      city: address?.addressLocality || null,
      description: contentSections.description,
      summary: contentSections.summary,
    });

    const now = Date.now();
    const isLikelyExpired = jobPosting.validThrough
      ? new Date(jobPosting.validThrough).getTime() < now
      : false;

    const warnings: string[] = [];
    if (!salary?.minValue) warnings.push("Salary could not be detected.");
    if (!jobPosting.validThrough) warnings.push("Application deadline could not be detected.");
    if (isLikelyExpired) warnings.push("This job appears to be expired based on its listed deadline.");

    const data: NormalizedUrlImport = {
      title: jobPosting.title || null,
      companyName,
      companyWebsite: org?.sameAs || org?.url || null,
      categoryName: jobPosting.occupationalCategory || jobPosting.industry || null,

      employmentType: normalizeEmploymentType(
        Array.isArray(jobPosting.employmentType)
          ? jobPosting.employmentType[0]
          : jobPosting.employmentType,
      ),
      experienceLevel: normalizeExperienceLevel(
        jobPosting.experienceRequirements?.description || description,
      ),
      minExperienceYears: years.min,
      maxExperienceYears: years.max,
      workMode: workMode.workMode,
      isRemoteEligible: workMode.isRemoteEligible,

      country: address?.addressCountry || null,
      state: address?.addressRegion || null,
      city: address?.addressLocality || null,
      address: address?.streetAddress || null,

      minSalary: salary?.minValue ? Math.round(salary.minValue) : null,
      maxSalary: salary?.maxValue ? Math.round(salary.maxValue) : null,
      currency: jobPosting.baseSalary?.currency || null,
      salaryPeriod:
        salary?.unitText === "MONTH" ? "monthly" : salary?.unitText === "HOUR" ? "hourly" : "yearly",

      description: contentSections.description,
      summary: contentSections.summary,
      responsibilities: contentSections.responsibilities,
      benefits: contentSections.benefits,
      requiredSkills: detectedSkills,
      seoTitle: seo.seoTitle,
      seoDescription: seo.seoDescription,

      applicationUrl: jobPosting.url || url,
      applicationDeadline: jobPosting.validThrough || null,
      recruiterEmail: null,

      sourceType: "URL_IMPORT",
      sourceName: "Structured job data (JobPosting)",
      sourceUrl: url,
      originalJobUrl: url,
      originalApplyUrl: jobPosting.url || null,
      externalJobId: jobPosting.identifier?.value || jobPosting.identifier || null,
      sourcePublishedAt: jobPosting.datePosted || null,

      isLikelyExpired,
      fieldConfidence: {
        title: "high",
        companyName: companyName ? "high" : "low",
        city: address?.addressLocality ? "high" : "low",
        minSalary: salary?.minValue ? "medium" : "low",
        applicationDeadline: jobPosting.validThrough ? "medium" : "low",
        description: description ? "high" : "low",
      },
      warnings,
    };

    return { success: true, data };
  }

  // ---- Fallback: Open Graph meta tags ----
  const ogTitle = extractMetaTag(html, "og:title");
  const ogDescription = extractMetaTag(html, "og:description");
  const ogSiteName = extractMetaTag(html, "og:site_name");

  if (ogTitle || ogDescription) {
    const seo = generateSeoFields({
      title: ogTitle,
      companyName: ogSiteName,
      city: null,
      description: ogDescription,
      summary: null,
    });

    const data: NormalizedUrlImport = {
      title: ogTitle,
      companyName: ogSiteName,
      companyWebsite: null,
      categoryName: null,
      employmentType: null,
      experienceLevel: null,
      minExperienceYears: null,
      maxExperienceYears: null,
      workMode: null,
      isRemoteEligible: false,
      country: null,
      state: null,
      city: null,
      address: null,
      minSalary: null,
      maxSalary: null,
      currency: null,
      salaryPeriod: null,
      description: ogDescription,
      summary: null,
      responsibilities: null,
      benefits: null,
      requiredSkills: extractSkillsFromText(ogDescription),
      seoTitle: seo.seoTitle,
      seoDescription: seo.seoDescription,
      applicationUrl: url,
      applicationDeadline: null,
      recruiterEmail: null,
      sourceType: "URL_IMPORT",
      sourceName: "Generic page metadata",
      sourceUrl: url,
      originalJobUrl: url,
      originalApplyUrl: null,
      externalJobId: null,
      sourcePublishedAt: null,
      isLikelyExpired: false,
      fieldConfidence: {
        title: "medium",
        companyName: "low",
        description: "low",
      },
      warnings: [
        "This page doesn't publish structured job data, so only basic details could be pulled. Please review every field carefully.",
      ],
    };

    return { success: true, data };
  }

  return {
    success: false,
    error: "We couldn't find enough job information on this page. Please enter the details manually.",
  };
}
