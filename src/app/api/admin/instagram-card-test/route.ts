import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth";

import { generateInstagramJobCard } from "@/lib/social/instagram-card";

import { uploadInstagramJobCard } from "@/lib/social/instagram-storage";

import type { SocialJob } from "@/lib/social/types";

export const runtime = "nodejs";

export async function POST() {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * Temporary preview data.
     *
     * This is NOT inserted into PostgreSQL.
     * It exists only so we can inspect the
     * Instagram card design.
     */
const testJob: SocialJob = {
  id: 999999,

  title:
    "US IT Recruiter / Domestic Recruiter / US IT Sourcer",

  slug:
    "us-it-recruiter-domestic-recruiter-us-it-sourcer-at-miracle-software-systems-in-visakhapatnam",

  companyName: "Miracle Software Systems",
  companyLogoUrl: null,

  city: "Visakhapatnam",
  state: "Andhra Pradesh",
  country: "India",

  sector: "Non-IT",
  categoryName: "Recruitment",

  employmentType: "Full-time",
  workMode: "On-site",
  experienceLevel: "0–2 Years",

  requiredSkills:
    "Recruitment, Talent Acquisition, Communication, Sourcing",

  isSalaryVisible: false,

  isUrgent: false,
  isFeatured: false,
};

    const image =
      await generateInstagramJobCard(testJob);

    const uploaded =
      await uploadInstagramJobCard(
        testJob.id,
        testJob.slug,
        image
      );

    return NextResponse.json({
      success: true,

      message:
        "Instagram job card generated successfully",

      imageUrl: uploaded.url,

      pathname: uploaded.pathname,

      dimensions: {
        width: 1080,
        height: 1350,
      },
    });
  } catch (error) {
    console.error(
      "Instagram card generation failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Instagram card generation failed",
      },
      {
        status: 500,
      }
    );
  }
}