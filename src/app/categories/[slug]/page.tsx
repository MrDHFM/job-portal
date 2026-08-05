import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import PublicLayout from "@/components/PublicLayout";
import JobListingView from "@/components/JobListingView";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function CategoryJobsPage(props: Props) {
  const params = await props.params;
  const { slug } = params;

  // Retrieve category info
  const results = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);

  if (results.length === 0) {
    return notFound();
  }

  const category = results[0];

  return (
    <PublicLayout>
      <Suspense fallback={<div className="p-12 text-center">Loading Category Jobs...</div>}>
        <JobListingView
          title={`${category.name} Jobs`}
          subtitle={category.description || `Browse verified vacancies and career opportunities under ${category.name}.`}
          preappliedFilters={{ categoryId: String(category.id) }}
        />
      </Suspense>
    </PublicLayout>
  );
}
