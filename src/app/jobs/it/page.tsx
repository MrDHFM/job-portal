import React, { Suspense } from "react";
import PublicLayout from "@/components/PublicLayout";
import JobListingView from "@/components/JobListingView";

export const dynamic = "force-dynamic";

export default function ITJobsPage() {
  return (
    <PublicLayout>
      <Suspense fallback={<div className="p-12 text-center">Loading IT Jobs...</div>}>
        <JobListingView
          title="IT & Software Jobs"
          subtitle="Explore high-impact careers in Software, Cloud, Cyber, and Systems Engineering."
          preappliedFilters={{ sector: "IT" }}
        />
      </Suspense>
    </PublicLayout>
  );
}
