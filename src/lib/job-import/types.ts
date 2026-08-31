// Common shape every import connector (Adzuna, future sources) must
// normalize its results into, before the importer maps them onto the
// `jobs` table. Mirrors the pattern used in src/lib/social/ (one file
// per source, normalized through a shared type).

export type NormalizedImportedJob = {
  // Used together for de-duplication (jobs.externalSource + externalId).
  source: string; // e.g. "adzuna"
  externalId: string; // the source's own unique ID for this listing

  title: string;
  companyName: string;
  companyWebsite?: string | null;

  description: string;
  applicationUrl: string;

  city: string;
  state: string;
  country: string;

  employmentType: string; // mapped to your enum: "Full-time" | "Part-time" | "Contract" | "Internship"
  workMode: string; // "Remote" | "Hybrid" | "On-site"
  experienceLevel: string; // best-effort guess, defaults to "Experienced"

  minSalary?: number | null;
  maxSalary?: number | null;
  currency?: string | null;

  requiredSkills?: string | null;

  // Used to guess a category slug (IT / Non-IT / etc.) — the importer
  // falls back to a default category if no match is found.
  categoryHint?: string | null;

  postedAt?: Date | null;
};

export type ImportConnectorResult = {
  source: string;
  jobs: NormalizedImportedJob[];
  error?: string;
};
