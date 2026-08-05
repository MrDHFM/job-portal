import React, { Suspense } from "react";
import PublicLayout from "@/components/PublicLayout";
import JobListingView from "@/components/JobListingView";

export const dynamic = "force-dynamic";

export default function RemotePage() {
  return (
    <PublicLayout>
      <Suspense fallback={<div className="p-12 text-center">Loading Remote Jobs...</div>}>
        <JobListingView
          title="Remote Jobs"
          subtitle="Work from anywhere with high-trust digital nomad and remote teams."
          preappliedFilters={{ workMode: "Remote" }}
        />
      </Suspense>
    </PublicLayout>
  );
}
