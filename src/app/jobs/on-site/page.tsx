import React from "react";
import PublicLayout from "@/components/PublicLayout";
import JobListingView from "@/components/JobListingView";
import { getPublicJobs, getVisibleCategories } from "@/lib/jobs/get-public-jobs";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function OnSitePage(props: Props) {
  const searchParams = await props.searchParams;

  const page =
    typeof searchParams.page === "string" ? parseInt(searchParams.page) : 1;

  const [{ jobs, pagination }, categories] = await Promise.all([
    getPublicJobs({
      page,
      limit: 10,
      workMode: "On-site",
      sort: "latest",
    }),
    getVisibleCategories(),
  ]);

  return (
    <PublicLayout>
      <JobListingView
        title="On-Site Career Openings"
        subtitle="Discover positions based directly at employer physical facilities."
        preappliedFilters={{ workMode: "On-site" }}
        initialJobs={jobs}
        initialPagination={pagination}
        initialCategories={categories}
      />
    </PublicLayout>
  );
}
