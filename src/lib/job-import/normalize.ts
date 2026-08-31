// Shared normalization logic so every source connector (Greenhouse,
// Lever, Ashby, generic JSON-LD) maps onto this app's existing field
// conventions the same way, instead of each connector reinventing it.

export function normalizeEmploymentType(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const value = raw.toLowerCase();

  if (value.includes("intern")) return "Internship";
  if (value.includes("part")) return "Part-time";
  if (value.includes("contract") || value.includes("freelance") || value.includes("temp")) {
    return "Contract";
  }
  if (value.includes("full")) return "Full-time";

  return null; // don't guess if we don't recognize it — spec: never fabricate
}

export function normalizeExperienceLevel(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const value = raw.toLowerCase();

  if (
    value.includes("entry") ||
    value.includes("fresher") ||
    value.includes("0-1") ||
    value.includes("0 to 1") ||
    value.includes("no experience") ||
    value.includes("graduate")
  ) {
    return "Fresher";
  }

  if (
    value.match(/\d+\s*(\+|-)?\s*years?/) ||
    value.includes("senior") ||
    value.includes("mid") ||
    value.includes("experienced") ||
    value.includes("lead")
  ) {
    return "Experienced";
  }

  return null;
}

/**
 * Pulls a min/max years-of-experience range out of free text like
 * "0-2 years", "3+ years", "minimum 5 years experience". Returns nulls
 * if nothing resembling a range is found — never guesses a number.
 */
export function extractYearsOfExperience(
  raw: string | null | undefined,
): { min: number | null; max: number | null } {
  if (!raw) return { min: null, max: null };

  const rangeMatch = raw.match(/(\d+)\s*[-–to]+\s*(\d+)\s*years?/i);
  if (rangeMatch) {
    return { min: Number(rangeMatch[1]), max: Number(rangeMatch[2]) };
  }

  const plusMatch = raw.match(/(\d+)\s*\+\s*years?/i);
  if (plusMatch) {
    return { min: Number(plusMatch[1]), max: null };
  }

  const singleMatch = raw.match(/(\d+)\s*years?/i);
  if (singleMatch) {
    return { min: Number(singleMatch[1]), max: Number(singleMatch[1]) };
  }

  return { min: null, max: null };
}

/**
 * Detects remote/hybrid/on-site from free text, preserving compound
 * meanings like "Bengaluru / Remote" rather than collapsing them to
 * just the city (per spec section 12).
 */
export function normalizeWorkMode(
  ...textFields: (string | null | undefined)[]
): { workMode: string | null; isRemoteEligible: boolean } {
  const combined = textFields.filter(Boolean).join(" ").toLowerCase();

  const mentionsRemote =
    combined.includes("remote") ||
    combined.includes("work from home") ||
    combined.includes("wfh") ||
    combined.includes("telecommute");

  const mentionsHybrid = combined.includes("hybrid");
  const mentionsOnsite = combined.includes("on-site") || combined.includes("onsite");

  if (mentionsHybrid) return { workMode: "Hybrid", isRemoteEligible: false };
  if (mentionsRemote) return { workMode: "Remote", isRemoteEligible: true };
  if (mentionsOnsite) return { workMode: "On-site", isRemoteEligible: false };

  return { workMode: null, isRemoteEligible: false };
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  "$": "USD",
  "₹": "INR",
  "£": "GBP",
  "€": "EUR",
};

/**
 * Parses salary ranges only when explicit numbers are present.
 * Handles "$100,000 - $120,000", "₹8 LPA - ₹12 LPA", "80,000 INR/month".
 * Returns all nulls rather than guessing when the text is vague
 * ("competitive salary", "based on experience") — per spec section 15.
 */
export function parseSalaryText(raw: string | null | undefined): {
  minSalary: number | null;
  maxSalary: number | null;
  currency: string | null;
  salaryPeriod: string | null;
} {
  const empty = { minSalary: null, maxSalary: null, currency: null, salaryPeriod: null };
  if (!raw) return empty;

  const isLpa = /lpa|lakh/i.test(raw);
  const symbolMatch = raw.match(/[$₹£€]/);
  const codeMatch = raw.match(/\b(USD|INR|GBP|EUR)\b/i);
  const currency = symbolMatch
    ? CURRENCY_SYMBOLS[symbolMatch[0]]
    : codeMatch
      ? codeMatch[1].toUpperCase()
      : null;

  const period = /\/\s*month|monthly|per month/i.test(raw)
    ? "monthly"
    : /\/\s*hour|hourly|per hour/i.test(raw)
      ? "hourly"
      : "yearly";

  const numbers = raw
    .replace(/,/g, "")
    .match(/\d+(\.\d+)?/g)
    ?.map(Number);

  if (!numbers || numbers.length === 0) return empty;

  const multiplier = isLpa ? 100000 : 1;

  if (numbers.length >= 2) {
    return {
      minSalary: Math.round(numbers[0] * multiplier),
      maxSalary: Math.round(numbers[1] * multiplier),
      currency,
      salaryPeriod: period,
    };
  }

  return {
    minSalary: Math.round(numbers[0] * multiplier),
    maxSalary: null,
    currency,
    salaryPeriod: period,
  };
}

/**
 * Splits a raw job posting body into summary/description/
 * responsibilities/benefits sections by looking for common section
 * headers ("Responsibilities:", "What you'll do", "Benefits", etc).
 * If no recognizable headers are found, everything stays in
 * `description` — we never fabricate structure that isn't there.
 */
export function splitJobContentSections(raw: string | null | undefined): {
  summary: string | null;
  description: string | null;
  responsibilities: string | null;
  benefits: string | null;
} {
  const empty = { summary: null, description: raw || null, responsibilities: null, benefits: null };
  if (!raw) return empty;

  const lines = raw.split("\n");

  const headerPatterns: { key: "responsibilities" | "benefits"; pattern: RegExp }[] = [
    {
      key: "responsibilities",
      pattern: /^(key )?responsibilit(y|ies)|what you.?ll (be doing|do)|role (and )?responsibilit(y|ies)|duties/i,
    },
    {
      key: "benefits",
      pattern: /^(benefits|perks|what we offer|why join us|compensation (&|and) benefits)/i,
    },
  ];

  function isHeaderLine(line: string): "responsibilities" | "benefits" | "other-header" | null {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length > 60) return null;

    for (const { key, pattern } of headerPatterns) {
      if (pattern.test(trimmed)) return key;
    }

    if (/^[A-Z][A-Za-z ,&/'-]{2,50}:?\s*$/.test(trimmed) && /:$|^[A-Z][a-z]+( [A-Z][a-z]+){0,4}$/.test(trimmed)) {
      return "other-header";
    }

    return null;
  }

  const sections: { key: string; lines: string[] }[] = [{ key: "intro", lines: [] }];

  for (const line of lines) {
    const headerType = isHeaderLine(line);
    if (headerType) {
      sections.push({ key: headerType, lines: [] });
    } else {
      sections[sections.length - 1].lines.push(line);
    }
  }

  const introText = sections[0].lines.join("\n").trim();
  const responsibilitiesText = sections
    .filter((s) => s.key === "responsibilities")
    .map((s) => s.lines.join("\n").trim())
    .filter(Boolean)
    .join("\n\n") || null;
  const benefitsText = sections
    .filter((s) => s.key === "benefits")
    .map((s) => s.lines.join("\n").trim())
    .filter(Boolean)
    .join("\n\n") || null;

  // No headers found at all — everything stays as the description,
  // exactly as before. Don't force a split that isn't really there.
  if (sections.length === 1) {
    return empty;
  }

  const sentences = introText.match(/[^.!?]+[.!?]+/g) || [];
  const summary =
    sentences.length >= 2 ? sentences.slice(0, 3).join(" ").trim() : null;

  return {
    summary,
    description: raw, // full original text always preserved in description too
    responsibilities: responsibilitiesText,
    benefits: benefitsText,
  };
}

const SKILL_KEYWORDS = [
  "javascript", "typescript", "react", "react.js", "angular", "vue", "node.js", "nodejs",
  "python", "java", "c++", "c#", "go", "golang", "rust", "php", "ruby", "swift", "kotlin",
  "sql", "mysql", "postgresql", "mongodb", "redis", "aws", "azure", "gcp", "docker",
  "kubernetes", "terraform", "jenkins", "git", "graphql", "rest api", "microservices",
  "django", "flask", "spring", "spring boot", "express.js", "next.js", "html", "css",
  "sass", "tailwind", "figma", "machine learning", "data science", "tensorflow", "pytorch",
  "power bi", "tableau", "excel", "sap", "salesforce", "linux", "devops", "ci/cd",
  "sales", "marketing", "seo", "digital marketing", "content writing", "copywriting",
  "communication", "leadership", "project management", "agile", "scrum", "negotiation",
  "customer service", "accounting", "finance", "hr", "recruitment", "operations",
  "supply chain", "logistics", "teaching", "nursing", "graphic design", "video editing",
];

/**
 * Extracts a comma-separated skills list from free text by matching
 * against a broad known-skills list, when the source doesn't provide
 * a structured skills field. Never invents skills that aren't
 * literally mentioned in the text.
 */
export function extractSkillsFromText(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const text = raw.toLowerCase();

  const found = SKILL_KEYWORDS.filter((skill) => text.includes(skill));
  if (found.length === 0) return null;

  const seen = new Set<string>();
  const deduped = found.filter((skill) => {
    const normalized = skill.replace(/[.\s]/g, "");
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });

  return deduped.slice(0, 15).join(", ");
}

/**
 * Builds SEO title/description from what was actually extracted —
 * never fabricates facts, just formats real fields into SEO-friendly
 * copy. Kept within typical SEO length guidance (title ~60 chars,
 * description ~155 chars).
 */
export function generateSeoFields(input: {
  title: string | null;
  companyName: string | null;
  city: string | null;
  description: string | null;
  summary: string | null;
}): { seoTitle: string | null; seoDescription: string | null } {
  if (!input.title) return { seoTitle: null, seoDescription: null };

  const titleParts = [input.title];
  if (input.companyName) titleParts.push(`at ${input.companyName}`);
  if (input.city) titleParts.push(`in ${input.city}`);

  let seoTitle = titleParts.join(" ");
  if (seoTitle.length > 60) {
    seoTitle = `${input.title}${input.companyName ? ` at ${input.companyName}` : ""}`.slice(0, 60);
  }

  const bodyText = input.summary || input.description || "";
  const firstSentence = bodyText.match(/[^.!?]+[.!?]+/)?.[0]?.trim();
  let seoDescription = firstSentence || bodyText.slice(0, 155);

  if (seoDescription.length > 155) {
    seoDescription = `${seoDescription.slice(0, 152).trim()}...`;
  }

  return {
    seoTitle,
    seoDescription: seoDescription || null,
  };
}

/**
 * Removes common tracking parameters for de-duplication/canonical
 * comparison, without touching parameters the page actually needs to
 * resolve correctly (per spec section 31). The *stored* apply URL
 * should still be the original, untouched URL — this is only for
 * comparing "is this the same job" during dedupe.
 */
export function canonicalizeUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);
    const trackingParams = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "gh_src",
      "lever-origin",
      "ref",
      "fbclid",
      "gclid",
    ];

    trackingParams.forEach((param) => url.searchParams.delete(param));

    url.hostname = url.hostname.toLowerCase();
    let result = url.toString();
    if (result.endsWith("/") && url.pathname !== "/") {
      result = result.slice(0, -1);
    }

    return result;
  } catch {
    return rawUrl;
  }
}
