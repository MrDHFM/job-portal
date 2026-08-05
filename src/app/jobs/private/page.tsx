import React, { Suspense } from "react";
import PublicLayout from "@/components/PublicLayout";
import JobListingView from "@/components/JobListingView";

export const dynamic = "force-dynamic";

export default function PrivateJobsPage() {
  return (
    <PublicLayout>
      <Suspense fallback={<div className="p-12 text-center">Loading Private Jobs...</div>}>
        <JobListingView
          title="Private Sector Jobs"
          subtitle="Explore careers inside private limited firms, startups, and international enterprises."
          preappliedFilters={{ sector: "Private" }}
        />
      </Suspense>
    </PublicLayout>
  );
}
