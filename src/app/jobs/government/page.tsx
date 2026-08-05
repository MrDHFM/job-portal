import React, { Suspense } from "react";
import PublicLayout from "@/components/PublicLayout";
import JobListingView from "@/components/JobListingView";

export const dynamic = "force-dynamic";

export default function GovernmentJobsPage() {
  return (
    <PublicLayout>
      <Suspense fallback={<div className="p-12 text-center">Loading Government Jobs...</div>}>
        <JobListingView
          title="Government Jobs"
          subtitle="Discover active civil service notices, examinations, and public department vacancies."
          preappliedFilters={{ sector: "Government" }}
        />
      </Suspense>
    </PublicLayout>
  );
}
