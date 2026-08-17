import { NextRequest } from "next/server";
import { generateInstagramJobCard } from "@/lib/social/instagram-card";
import type { SocialJob } from "@/lib/social/types";

const DEFAULT_JOB = {
  id: 999999,

  title: "Quality Assurance Automation Engineer",

  companyName: "TCS",

  city: "Bengaluru",
  state: "Karnataka",
  country: "India",

  experienceLevel: "Experienced",

  workMode: "On-site",

  employmentType: "Full-time",

  requiredSkills:
    "Playwright, Java, TypeScript, Cucumber, SQL",

  isUrgent: true,
  isFeatured: false,

  categoryName: "Technology",

  slug: "instagram-preview",

  companyId: 999999,
  categoryId: 999999,

  sector: "IT",
  vacancies: 1,

  applicationMethod: "external",
  applicationUrl: "https://example.com/apply",

  description:
    "Sample job used only for Instagram card preview.",

  status: "PUBLISHED",
};

function makePreviewJob(
  input: Record<string, unknown> = {},
): SocialJob {
  return {
    ...DEFAULT_JOB,
    ...input,
  } as SocialJob;
}

export async function GET() {
  try {
    const job = makePreviewJob();

    console.log(
      "Instagram preview GET job:",
      job,
    );

    const image =
      await generateInstagramJobCard(job);

    return new Response(image, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control":
          "no-store, max-age=0, must-revalidate",
      },
    });
  } catch (error) {
    console.error(
      "Instagram preview GET ERROR:",
      error,
    );

    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : String(error),
        stack:
          error instanceof Error
            ? error.stack
            : undefined,
      }),
      {
        status: 500,
        headers: {
          "Content-Type":
            "application/json",
        },
      },
    );
  }
}

export async function POST(
  request: NextRequest,
) {
  try {
    const body = await request.json();

    console.log(
      "Instagram preview POST body:",
      body,
    );

    const job = makePreviewJob(body);

    console.log(
      "Instagram preview generated job:",
      job,
    );

    const image =
      await generateInstagramJobCard(job);

    return new Response(image, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control":
          "no-store, max-age=0, must-revalidate",
      },
    });
  } catch (error) {
    console.error(
      "Instagram preview POST ERROR:",
      error,
    );

    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : String(error),
        stack:
          error instanceof Error
            ? error.stack
            : undefined,
      }),
      {
        status: 500,
        headers: {
          "Content-Type":
            "application/json",
        },
      },
    );
  }
}