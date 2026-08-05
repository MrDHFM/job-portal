import React, { Suspense } from "react";
import PublicLayout from "@/components/PublicLayout";
import JobListingView from "@/components/JobListingView";

export const dynamic = "force-dynamic";

export default function InternshipsPage() {
  return (
    <PublicLayout>
      <Suspense fallback={<div className="p-12 text-center">Loading Internships...</div>}>
        <JobListingView
          title="Student Internships"
          subtitle="Kickstart your journey with learning-rich student internships and co-ops."
          preappliedFilters={{ employmentType: "Internship" }}
        />
      </Suspense>
    </PublicLayout>
  );
}
