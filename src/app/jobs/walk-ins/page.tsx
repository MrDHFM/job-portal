import React, { Suspense } from "react";
import PublicLayout from "@/components/PublicLayout";
import JobListingView from "@/components/JobListingView";

export const dynamic = "force-dynamic";

export default function WalkInsPage() {
  return (
    <PublicLayout>
      <Suspense fallback={<div className="p-12 text-center">Loading Walk-In Drives...</div>}>
        <JobListingView
          title="Walk-In Job Drives"
          subtitle="Explore direct walk-in interview venues, contact details, and hiring schedules."
          preappliedFilters={{ employmentType: "Walk-In" }}
        />
      </Suspense>
    </PublicLayout>
  );
}
