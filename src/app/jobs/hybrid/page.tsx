import React from "react";
import PublicLayout from "@/components/PublicLayout";
import JobListingView from "@/components/JobListingView";
import { getPublicJobs, getVisibleCategories } from "@/lib/jobs/get-public-jobs";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function HybridPage(props: Props) {
  const searchParams = await props.searchParams;

  const page =
    typeof searchParams.page === "string" ? parseInt(searchParams.page) : 1;

  const [{ jobs, pagination }, categories] = await Promise.all([
    getPublicJobs({
      page,
      limit: 10,
      workMode: "Hybrid",
      sort: "latest",
    }),
    getVisibleCategories(),
  ]);

  return (
    <PublicLayout>
      <JobListingView
        title="Hybrid Positions"
        subtitle="Balance your schedule with split office-and-home hybrid rosters."
        preappliedFilters={{ workMode: "Hybrid" }}
        initialJobs={jobs}
        initialPagination={pagination}
        initialCategories={categories}
      />
    </PublicLayout>
  );
}
