import React, { Suspense } from "react";
import PublicLayout from "@/components/PublicLayout";
import JobListingView from "@/components/JobListingView";

export const dynamic = "force-dynamic";

export default function ExperiencedPage() {
  return (
    <PublicLayout>
      <Suspense fallback={<div className="p-12 text-center">Loading Experienced Jobs...</div>}>
        <JobListingView
          title="Experienced Roles"
          subtitle="Discover mid-to-senior positions matching your specialized technical skills."
          preappliedFilters={{ experienceLevel: "Experienced" }}
        />
      </Suspense>
    </PublicLayout>
  );
}
