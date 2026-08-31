import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { importJobFromUrl } from "@/lib/job-import/url-import-router";
import { findDuplicateJob } from "@/lib/job-import/dedupe";

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const url = (body.url || "").trim();

    if (!url) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid job posting URL." },
        { status: 400 },
      );
    }

    // Extraction itself re-validates the URL for SSRF safety before
    // fetching anything — this endpoint never creates a database
    // record; it only returns data for the admin to review.
    const result = await importJobFromUrl(url);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 422 },
      );
    }

    const duplicate = await findDuplicateJob(result.data);

    return NextResponse.json({
      success: true,
      data: result.data,
      duplicate,
    });
  } catch (error) {
    // Never leak raw stack traces to the admin UI.
    console.error("Error in POST /api/admin/jobs/import:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong reading that page. Please fill the form manually.",
      },
      { status: 500 },
    );
  }
}
