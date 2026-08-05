import React, { Suspense } from "react";
import PublicLayout from "@/components/PublicLayout";
import JobListingView from "@/components/JobListingView";

export const dynamic = "force-dynamic";

export default function HybridPage() {
  return (
    <PublicLayout>
      <Suspense fallback={<div className="p-12 text-center">Loading Hybrid Jobs...</div>}>
        <JobListingView
          title="Hybrid Positions"
          subtitle="Balance your schedule with split office-and-home hybrid rosters."
          preappliedFilters={{ workMode: "Hybrid" }}
        />
      </Suspense>
    </PublicLayout>
  );
}
