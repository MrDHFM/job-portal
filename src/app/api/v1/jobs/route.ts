import { NextRequest, NextResponse } from "next/server";
import { getPublicJobs } from "@/lib/jobs/get-public-jobs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const result = await getPublicJobs({
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "10"),
      keyword: searchParams.get("keyword") || "",
      sector: searchParams.get("sector") || "",
      workMode: searchParams.get("workMode") || "",
      employmentType: searchParams.get("employmentType") || "",
      experienceLevel: searchParams.get("experienceLevel") || "",
      categoryId: searchParams.get("categoryId") || "",
      companyId: searchParams.get("companyId") || "",
      city: searchParams.get("city") || "",
      state: searchParams.get("state") || "",
      country: searchParams.get("country") || "",
      isFeatured: searchParams.get("isFeatured") === "true",
      isUrgent: searchParams.get("isUrgent") === "true",
      minSalary: searchParams.get("minSalary")
        ? parseInt(searchParams.get("minSalary") || "0")
        : null,
      sort: searchParams.get("sort") || "latest",
      status: searchParams.get("status") || "",
    });

    return NextResponse.json({
      success: true,
      data: result.jobs,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error("Error in GET /api/v1/jobs:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
