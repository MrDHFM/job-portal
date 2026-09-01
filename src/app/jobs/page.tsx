import React from "react";
import PublicLayout from "@/components/PublicLayout";
import JobListingView from "@/components/JobListingView";
import { getPublicJobs, getVisibleCategories } from "@/lib/jobs/get-public-jobs";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function JobsPage(props: Props) {
  const searchParams = await props.searchParams;

  const getParam = (key: string): string =>
    typeof searchParams[key] === "string" ? (searchParams[key] as string) : "";

  // Same default (page 1, "latest" sort, no filters) a fresh visit to
  // /jobs would show — this just renders it server-side first, so the
  // initial HTML has real listings instead of an empty shell. Every
  // client-side filter/sort/pagination interaction is unaffected.
  const [{ jobs, pagination }, categories] = await Promise.all([
    getPublicJobs({
      page: parseInt(getParam("page") || "1"),
      limit: 10,
      keyword: getParam("keyword"),
      sector: getParam("sector"),
      workMode: getParam("workMode"),
      employmentType: getParam("employmentType"),
      experienceLevel: getParam("experienceLevel"),
      categoryId: getParam("categoryId"),
      city: getParam("location"),
      minSalary: getParam("minSalary") ? parseInt(getParam("minSalary")) : null,
      sort: getParam("sort") || "latest",
    }),
    getVisibleCategories(),
  ]);

  return (
    <PublicLayout>
      <JobListingView
        initialJobs={jobs}
        initialPagination={pagination}
        initialCategories={categories}
      />
    </PublicLayout>
  );
}
