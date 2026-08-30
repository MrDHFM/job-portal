import {
  NextRequest,
  NextResponse,
} from "next/server";

import { db } from "@/db";
import { jobTrafficEvents, jobs } from "@/db/schema";

import {
  normalizeTrafficSource,
} from "@/lib/analytics/attribution";

import { eq, and, gte, sql } from "drizzle-orm";

// How long to suppress a repeat VIEW from the same browser session for
// the same job. Prevents React re-renders / StrictMode double-invokes /
// rapid refreshes from inflating the count, while still counting a
// genuine return visit later as a new view.
const VIEW_DEDUP_WINDOW_MS = 30 * 60 * 1000;

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

    const sessionId: string | null =
      body.sessionId || null;

    // Dedup check for VIEW events: if this session already viewed this
    // job within the window, skip both the event log AND the counter
    // increment — this is the single source of truth for jobs.viewsCount,
    // so double-firing here would double-count everywhere downstream.
    if (eventType === "VIEW" && sessionId) {
      const recentDuplicate = await db
        .select({ id: jobTrafficEvents.id })
        .from(jobTrafficEvents)
        .where(
          and(
            eq(jobTrafficEvents.jobId, jobId),
            eq(jobTrafficEvents.eventType, "VIEW"),
            eq(jobTrafficEvents.sessionId, sessionId),
            gte(
              jobTrafficEvents.createdAt,
              new Date(Date.now() - VIEW_DEDUP_WINDOW_MS),
            ),
          ),
        )
        .limit(1);

      if (recentDuplicate.length > 0) {
        return NextResponse.json({ success: true, deduped: true });
      }
    }

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
        sessionId,
      });

    // Keep the denormalized jobs.viewsCount column in sync with the
    // same event that drives the traffic-source breakdown, instead of
    // incrementing it from a separate, less reliable code path.
    if (eventType === "VIEW") {
      await db
        .update(jobs)
        .set({ viewsCount: sql`${jobs.viewsCount} + 1` })
        .where(eq(jobs.id, jobId));
    }

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