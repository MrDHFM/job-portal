import React, { Suspense } from "react";
import PublicLayout from "@/components/PublicLayout";
import JobListingView from "@/components/JobListingView";

export const dynamic = "force-dynamic";

export default function JobsPage() {
  return (
    <PublicLayout>
      <Suspense fallback={
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <span className="h-8 w-8 border-4 border-[var(--color-primary)] border-t-transparent animate-spin rounded-full inline-block"></span>
          <p className="mt-2 text-sm text-neutral-500">Loading Job Matrix...</p>
        </div>
      }>
        <JobListingView />
      </Suspense>
    </PublicLayout>
  );
}
