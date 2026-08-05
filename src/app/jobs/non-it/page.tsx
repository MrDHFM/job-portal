import React, { Suspense } from "react";
import PublicLayout from "@/components/PublicLayout";
import JobListingView from "@/components/JobListingView";

export const dynamic = "force-dynamic";

export default function NonITJobsPage() {
  return (
    <PublicLayout>
      <Suspense fallback={<div className="p-12 text-center">Loading Non-IT Jobs...</div>}>
        <JobListingView
          title="Non-IT Jobs"
          subtitle="Explore careers in Operations, Marketing, Business Dev, and Administration."
          preappliedFilters={{ sector: "Non-IT" }}
        />
      </Suspense>
    </PublicLayout>
  );
}
