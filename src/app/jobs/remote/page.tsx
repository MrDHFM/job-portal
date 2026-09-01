import React from "react";
import PublicLayout from "@/components/PublicLayout";
import JobListingView from "@/components/JobListingView";
import { getPublicJobs, getVisibleCategories } from "@/lib/jobs/get-public-jobs";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function RemotePage(props: Props) {
  const searchParams = await props.searchParams;

  const page =
    typeof searchParams.page === "string" ? parseInt(searchParams.page) : 1;

  const [{ jobs, pagination }, categories] = await Promise.all([
    getPublicJobs({
      page,
      limit: 10,
      workMode: "Remote",
      sort: "latest",
    }),
    getVisibleCategories(),
  ]);

  return (
    <PublicLayout>
      <JobListingView
        title="Remote Jobs"
        subtitle="Work from anywhere with high-trust digital nomad and remote teams."
        preappliedFilters={{ workMode: "Remote" }}
        initialJobs={jobs}
        initialPagination={pagination}
        initialCategories={categories}
      />
    </PublicLayout>
  );
}
