// Normalized intermediate structure every source connector returns.
// Deliberately mirrors this app's own job-form field names (not a
// separate parallel schema) so mapping into AdminJobForm/jobs table is
// a direct assignment, not a translation layer.

export type FieldConfidence = "high" | "medium" | "low";

export type NormalizedUrlImport = {
  // Core
  title: string | null;
  companyName: string | null;
  companyWebsite: string | null;
  categoryName: string | null; // best-effort guess only; never fabricated

  employmentType: string | null;
  experienceLevel: string | null;
  minExperienceYears: number | null;
  maxExperienceYears: number | null;
  workMode: string | null;
  isRemoteEligible: boolean;

  // Location
  country: string | null;
  state: string | null;
  city: string | null;
  address: string | null;

  // Compensation
  minSalary: number | null;
  maxSalary: number | null;
  currency: string | null;
  salaryPeriod: string | null;

  // Content
  description: string | null;
  summary: string | null;
  responsibilities: string | null;
  benefits: string | null;
  requiredSkills: string | null;
  seoTitle: string | null;
  seoDescription: string | null;

  // Application
  applicationUrl: string | null;
  applicationDeadline: string | null; // ISO date string

  // Provenance (Part 24/25 of the spec) — maps onto existing
  // externalSource/externalId columns plus the new provenance fields.
  sourceType: "URL_IMPORT" | "GREENHOUSE" | "LEVER" | "ASHBY";
  sourceName: string;
  sourceUrl: string;
  originalJobUrl: string;
  originalApplyUrl: string | null;
  externalJobId: string | null;
  sourcePublishedAt: string | null;

  // Signals for the admin, not hard failures
  isLikelyExpired: boolean;
  fieldConfidence: Partial<Record<keyof NormalizedUrlImportCoreFields, FieldConfidence>>;
  warnings: string[];
};

// Subset of fields we track per-field confidence for (the ones that
// matter most for the admin's trust in what got auto-filled).
export type NormalizedUrlImportCoreFields = Pick<
  NormalizedUrlImport,
  | "title"
  | "companyName"
  | "city"
  | "employmentType"
  | "minSalary"
  | "applicationDeadline"
  | "description"
>;

export type ImportOutcome =
  | { success: true; data: NormalizedUrlImport }
  | { success: false; error: string };
