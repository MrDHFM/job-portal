import { NextResponse } from "next/server";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";

export async function GET() {
  try {
    const settings = await db.select().from(siteSettings);

    const settingsObj: Record<string, string> = {};

    settings.forEach((setting) => {
      settingsObj[setting.key] = setting.value;
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          siteName: settingsObj.siteName || "CareerDiscoverJobs",
          contactEmail: settingsObj.contactEmail || "",

          socialLinkedin: settingsObj.socialLinkedin || "",
          socialTwitter: settingsObj.socialTwitter || "",
          socialInstagram: settingsObj.socialInstagram || "",
          socialTelegram: settingsObj.socialTelegram || "",
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("Error loading public site settings:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load site settings",
      },
      { status: 500 },
    );
  }
}