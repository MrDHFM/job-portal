import React, { Suspense } from "react";
import PublicLayout from "@/components/PublicLayout";
import JobListingView from "@/components/JobListingView";

export const dynamic = "force-dynamic";

export default function OnSitePage() {
  return (
    <PublicLayout>
      <Suspense fallback={<div className="p-12 text-center">Loading On-Site Jobs...</div>}>
        <JobListingView
          title="On-Site Career Openings"
          subtitle="Discover positions based directly at employer physical facilities."
          preappliedFilters={{ workMode: "On-site" }}
        />
      </Suspense>
    </PublicLayout>
  );
}
