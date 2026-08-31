import type { ImportOutcome, NormalizedUrlImport } from "./import-types";

// Extracts structured job data from arbitrary pasted text (LinkedIn
// posts, forwarded emails, Slack messages, etc.) using Google's Gemini
// API — the one major LLM provider with a genuine standing free tier
// that doesn't require a credit card, unlike OpenAI/Anthropic's
// expiring trial credits. Rate limits are generous enough for
// occasional admin-initiated pastes (this is not a bulk pipeline).
//
// Docs: https://ai.google.dev/gemini-api/docs

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string", nullable: true },
    companyName: { type: "string", nullable: true },
    city: { type: "string", nullable: true },
    state: { type: "string", nullable: true },
    country: { type: "string", nullable: true },
    employmentType: {
      type: "string",
      nullable: true,
      enum: ["Full-time", "Part-time", "Contract", "Internship", null],
    },
    experienceLevel: {
      type: "string",
      nullable: true,
      enum: ["Fresher", "Experienced", null],
    },
    minExperienceYears: { type: "integer", nullable: true },
    maxExperienceYears: { type: "integer", nullable: true },
    workMode: {
      type: "string",
      nullable: true,
      enum: ["Remote", "Hybrid", "On-site", null],
    },
    minSalary: { type: "integer", nullable: true },
    maxSalary: { type: "integer", nullable: true },
    currency: { type: "string", nullable: true },
    requiredSkills: { type: "string", nullable: true },
    recruiterEmail: { type: "string", nullable: true },
    applicationUrl: { type: "string", nullable: true },
    cleanedDescription: { type: "string", nullable: true },
    summary: { type: "string", nullable: true },
    categoryName: { type: "string", nullable: true },
  },
  required: [],
};

const SYSTEM_INSTRUCTION = `You extract job posting details from raw pasted text (LinkedIn posts, forwarded emails, Slack messages — any format).

STRICT RULES:
- Extract ONLY facts literally present in the text. Never guess, infer, or invent a value that isn't stated.
- If a field isn't mentioned, return null for it. Do not estimate salary, location, or experience years that aren't given.
- For companyName: look for explicit company mentions, hashtags like #CompanyName, or infer from the applicant email's domain (e.g. someone@capgemini.com -> "Capgemini") only if no explicit company name is stated.
- For recruiterEmail: extract any email address given for applications.
- For applicationUrl: extract any application link, but not social-media profile/hashtag links.
- cleanedDescription: rewrite the job content as clean, well-formatted plain text — remove hashtags, emoji bullets, social-media boilerplate ("connect with us", follow links) and tracking URLs, but preserve every actual fact about the role, responsibilities, and requirements. Do not summarize away real information.
- summary: a 1-2 sentence plain-language summary of the role, based only on what's stated.
- requiredSkills: a comma-separated list of skills/technologies explicitly mentioned.
- categoryName: a short best-guess industry category (e.g. "Data Engineering", "Software Development", "Sales") only if reasonably inferable from the role itself — otherwise null.

Return ONLY the JSON object matching the schema. No commentary.`;

export async function extractJobFromText(rawText: string): Promise<ImportOutcome> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: "Text extraction isn't configured yet. Set GEMINI_API_KEY to enable it.",
    };
  }

  if (!rawText || rawText.trim().length < 40) {
    return {
      success: false,
      error: "Please paste the full job description — that looks too short to extract from.",
    };
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: rawText.slice(0, 12000) }], // guard against pasting an entire webpage by accident
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: EXTRACTION_SCHEMA,
          // Not setting temperature/top_p/top_k — Google's current
          // guidance for the Gemini 3.x family is to leave these at
          // default, since the model's reasoning is tuned for them.
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);

      if (response.status === 429) {
        return {
          success: false,
          error: "The free extraction tier is rate-limited right now — please wait a moment and try again.",
        };
      }

      return {
        success: false,
        error: "Extraction failed. Please fill the form manually.",
      };
    }

    const json = await response.json();
    const rawJsonText = json?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawJsonText) {
      return { success: false, error: "Could not extract job details from that text." };
    }

    let extracted: any;
    try {
      extracted = JSON.parse(rawJsonText);
    } catch {
      return { success: false, error: "Extraction returned an unexpected format." };
    }

    if (!extracted.title && !extracted.cleanedDescription) {
      return {
        success: false,
        error: "We couldn't find enough job information in that text. Please enter the details manually.",
      };
    }

    const warnings: string[] = [];
    if (!extracted.city) warnings.push("Location could not be detected — please confirm.");
    if (!extracted.minSalary) warnings.push("Salary could not be detected.");
    if (!extracted.recruiterEmail && !extracted.applicationUrl) {
      warnings.push("No application email or link found — please add one.");
    }

    const data: NormalizedUrlImport = {
      title: extracted.title || null,
      companyName: extracted.companyName || null,
      companyWebsite: null,
      categoryName: extracted.categoryName || null,

      employmentType: extracted.employmentType || null,
      experienceLevel: extracted.experienceLevel || null,
      minExperienceYears: extracted.minExperienceYears ?? null,
      maxExperienceYears: extracted.maxExperienceYears ?? null,
      workMode: extracted.workMode || null,
      isRemoteEligible: extracted.workMode === "Remote",

      country: extracted.country || null,
      state: extracted.state || null,
      city: extracted.city || null,
      address: null,

      minSalary: extracted.minSalary ?? null,
      maxSalary: extracted.maxSalary ?? null,
      currency: extracted.currency || null,
      salaryPeriod: null,

      description: extracted.cleanedDescription || null,
      summary: extracted.summary || null,
      responsibilities: null,
      benefits: null,
      requiredSkills: extracted.requiredSkills || null,
      seoTitle: null,
      seoDescription: null,

      applicationUrl: extracted.applicationUrl || null,
      applicationDeadline: null,
      recruiterEmail: extracted.recruiterEmail || null,

      sourceType: "TEXT_PASTE",
      sourceName: "Pasted job description",
      sourceUrl: "",
      originalJobUrl: "",
      originalApplyUrl: extracted.applicationUrl || null,
      externalJobId: null,
      sourcePublishedAt: null,

      isLikelyExpired: false,
      fieldConfidence: {
        title: extracted.title ? "high" : "low",
        companyName: extracted.companyName ? "medium" : "low",
        city: extracted.city ? "medium" : "low",
        minSalary: extracted.minSalary ? "medium" : "low",
        description: extracted.cleanedDescription ? "high" : "low",
      },
      warnings,
    };

    return { success: true, data };
  } catch (error) {
    console.error("Text extraction failed:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Text extraction failed.",
    };
  }
}
