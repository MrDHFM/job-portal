import {
  NextRequest,
  NextResponse,
} from "next/server";

import { db } from "@/db";
import { jobTrafficEvents } from "@/db/schema";

import {
  normalizeTrafficSource,
} from "@/lib/analytics/attribution";

import { eq } from "drizzle-orm";

export async function POST(
  request: NextRequest,
) {
  try {
    const body = await request.json();

    const jobId = Number(body.jobId);

    const eventType =
      body.eventType === "APPLY_CLICK"
        ? "APPLY_CLICK"
        : body.eventType === "VIEW"
          ? "VIEW"
          : null;

    if (!jobId || !eventType) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid analytics event.",
        },
        { status: 400 },
      );
    }

    const source =
      normalizeTrafficSource(
        body.source,
      );

    await db
      .insert(jobTrafficEvents)
      .values({
        jobId,
        eventType,
        source,
        medium:
          body.medium || null,
        campaign:
          body.campaign || null,
        content:
          body.content || null,
        sessionId:
          body.sessionId || null,
      });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Analytics event failed:",
      error,
    );

    // Analytics must NEVER break the website.
    return NextResponse.json({
      success: false,
    });
  }
}