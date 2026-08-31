import type { NormalizedImportedJob, ImportConnectorResult } from "./types";

// Adzuna Job Search API — free tier, instant App ID/Key at
// https://developer.adzuna.com. Covers India (country code "in") among
// ~20 markets. Docs: https://developer.adzuna.com/docs/search
//
// This is a legitimate, ToS-compliant source: Adzuna's API is built and
// licensed specifically for redistributing job ads on third-party sites,
// unlike scraping a job board without permission.

const ADZUNA_BASE_URL = "https://api.adzuna.com/v1/api/jobs";

type AdzunaJob = {
  id: string;
  title: string;
  description: string;
  redirect_url: string;
  created: string;
  salary_min?: number;
  salary_max?: number;
  contract_type?: string; // "permanent" | "contract"
  contract_time?: string; // "full_time" | "part_time"
  company?: { display_name?: string };
  location?: { area?: string[]; display_name?: string };
  category?: { label?: string; tag?: string };
};

type AdzunaSearchResponse = {
  results?: AdzunaJob[];
  count?: number;
};

function mapEmploymentType(job: AdzunaJob): string {
  if (job.contract_time === "part_time") return "Part-time";
  if (job.contract_type === "contract") return "Contract";
  return "Full-time";
}

function guessWorkMode(job: AdzunaJob): string {
  const haystack = `${job.title} ${job.description}`.toLowerCase();
  if (haystack.includes("remote") || haystack.includes("work from home")) {
    return "Remote";
  }
  if (haystack.includes("hybrid")) return "Hybrid";
  return "On-site";
}

function extractLocation(job: AdzunaJob): { city: string; state: string } {
  const area = job.location?.area || [];
  // Adzuna's `area` array is broad→specific, e.g.
  // ["India", "Karnataka", "Bengaluru"]. Last entry is usually the
  // most specific (city); second-to-last is usually the state/region.
  const city = area[area.length - 1] || job.location?.display_name || "";
  const state = area[area.length - 2] || "";
  return { city, state };
}

function extractSkills(job: AdzunaJob): string | null {
  // Adzuna doesn't provide a structured skills field; pull a handful of
  // common tech keywords out of the description as a best-effort tag list.
  const knownSkills = [
    "javascript", "typescript", "react", "node", "python", "java",
    "sql", "aws", "docker", "kubernetes", "go", "rust", "php",
    "angular", "vue", "django", "flask", "spring", "c++", "c#",
    "excel", "sales", "marketing", "communication", "seo",
  ];

  const text = job.description.toLowerCase();
  const found = knownSkills.filter((skill) => text.includes(skill));

  return found.length > 0 ? found.slice(0, 8).join(", ") : null;
}

export async function fetchAdzunaJobs(params: {
  country: string; // e.g. "in" for India, "gb", "us"
  keywords?: string;
  resultsPerPage?: number;
  maxDaysOld?: number;
}): Promise<ImportConnectorResult> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    return {
      source: "adzuna",
      jobs: [],
      error: "Adzuna is not configured. Set ADZUNA_APP_ID and ADZUNA_APP_KEY.",
    };
  }

  try {
    const url = new URL(
      `${ADZUNA_BASE_URL}/${params.country}/search/1`,
    );

    url.searchParams.set("app_id", appId);
    url.searchParams.set("app_key", appKey);
    url.searchParams.set(
      "results_per_page",
      String(params.resultsPerPage || 20),
    );
    url.searchParams.set("content-type", "application/json");

    if (params.keywords) {
      url.searchParams.set("what", params.keywords);
    }

    if (params.maxDaysOld) {
      url.searchParams.set("max_days_old", String(params.maxDaysOld));
    }

    const response = await fetch(url.toString(), { cache: "no-store" });

    if (!response.ok) {
      const text = await response.text();
      return {
        source: "adzuna",
        jobs: [],
        error: `Adzuna API returned ${response.status}: ${text.slice(0, 200)}`,
      };
    }

    const data = (await response.json()) as AdzunaSearchResponse;
    const rawJobs = data.results || [];

    const jobs: NormalizedImportedJob[] = rawJobs
      .filter((job) => job.id && job.title && job.company?.display_name)
      .map((job) => {
        const { city, state } = extractLocation(job);

        return {
          source: "adzuna",
          externalId: job.id,

          title: job.title.trim(),
          companyName: job.company!.display_name!.trim(),
          companyWebsite: null,

          description: job.description || "",
          applicationUrl: job.redirect_url,

          city: city || "Not specified",
          state: state || "",
          country: params.country === "in" ? "India" : params.country.toUpperCase(),

          employmentType: mapEmploymentType(job),
          workMode: guessWorkMode(job),
          experienceLevel: "Experienced",

          minSalary: job.salary_min ? Math.round(job.salary_min) : null,
          maxSalary: job.salary_max ? Math.round(job.salary_max) : null,
          currency: params.country === "in" ? "INR" : "USD",

          requiredSkills: extractSkills(job),
          categoryHint: job.category?.label || null,

          postedAt: job.created ? new Date(job.created) : null,
        };
      });

    return { source: "adzuna", jobs };
  } catch (error) {
    console.error("Adzuna fetch failed:", error);

    return {
      source: "adzuna",
      jobs: [],
      error:
        error instanceof Error ? error.message : "Adzuna fetch failed.",
    };
  }
}
