import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { extractJobFromText } from "@/lib/job-import/text-extractor";
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
    const text = (body.text || "").trim();

    if (!text) {
      return NextResponse.json(
        { success: false, error: "Please paste a job description first." },
        { status: 400 },
      );
    }

    const result = await extractJobFromText(text);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 422 },
      );
    }

    // Fuzzy company+title+city match only — there's no URL to compare
    // for a pasted-text import, so exact/canonical matching is skipped
    // automatically inside findDuplicateJob.
    const duplicate = await findDuplicateJob(result.data);

    return NextResponse.json({
      success: true,
      data: result.data,
      duplicate,
    });
  } catch (error) {
    console.error("Error in POST /api/admin/jobs/import-from-text:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong extracting that text. Please fill the form manually.",
      },
      { status: 500 },
    );
  }
}
