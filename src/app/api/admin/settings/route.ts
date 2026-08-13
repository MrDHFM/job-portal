import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { siteSettings, adminActivityLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const settings = await db.select().from(siteSettings);
    // Convert to a nice key-value object
    const settingsObj: Record<string, string> = {};
    settings.forEach((s) => {
      settingsObj[s.key] = s.value;
    });

    // Provide default fallback settings
    const defaults = {
      siteName: "GlobalJob Discover",
      contactEmail: "recruiting@globaljobportal.com",
      logoUrl: "",
      socialLinkedin: "",
      socialTwitter: "",
      socialInstagram: "",
      socialTelegram: "",
      defaultSeoTitle: "GlobalJob Discover - Premium Job Board",
      defaultSeoDescription:
        "Find premium jobs, remote roles, government, Walk-Ins, and private positions worldwide.",
    };

    return NextResponse.json({
      success: true,
      data: { ...defaults, ...settingsObj },
    });
  } catch (error: any) {
    console.error("Error in GET /api/admin/settings:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json(); // Simple key-value pairs

    for (const key of Object.keys(body)) {
      const val = String(body[key]);

      // Upsert
      const existing = await db
        .select()
        .from(siteSettings)
        .where(eq(siteSettings.key, key))
        .limit(1);
      if (existing.length > 0) {
        await db
          .update(siteSettings)
          .set({ value: val, updatedAt: new Date() })
          .where(eq(siteSettings.key, key));
      } else {
        await db.insert(siteSettings).values({
          key,
          value: val,
        });
      }
    }

    // Log admin activity
    await db.insert(adminActivityLogs).values({
      adminName: session.name || session.email,
      action: "SETTINGS_EDIT",
      entity: "site_settings",
      details: "Updated general site configurations.",
    });

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully.",
    });
  } catch (error: any) {
    console.error("Error in POST /api/admin/settings:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
