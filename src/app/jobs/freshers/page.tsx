import React, { Suspense } from "react";
import PublicLayout from "@/components/PublicLayout";
import JobListingView from "@/components/JobListingView";

export const dynamic = "force-dynamic";

export default function FreshersPage() {
  return (
    <PublicLayout>
      <Suspense fallback={<div className="p-12 text-center">Loading Entry-Level Jobs...</div>}>
        <JobListingView
          title="Fresher Jobs"
          subtitle="Discover entry-level roles designed for candidates with 0-1 years of experience."
          preappliedFilters={{ experienceLevel: "Fresher" }}
        />
      </Suspense>
    </PublicLayout>
  );
}
