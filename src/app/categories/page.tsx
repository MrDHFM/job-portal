import React from "react";
import { db } from "@/db";
import { categories, jobs } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import PublicLayout from "@/components/PublicLayout";
import CategoriesGrid from "@/components/CategoriesGrid";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  let list: any[] = [];
  try {
    list = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        activeJobsCount: sql<number>`cast(count(${jobs.id}) as integer)`,
      })
      .from(categories)
      .leftJoin(jobs, and(eq(jobs.categoryId, categories.id), eq(jobs.status, "PUBLISHED")))
      .where(eq(categories.isVisible, true))
      .groupBy(categories.id)
      .orderBy(categories.displayOrder, categories.name);
  } catch (e) {
    console.error("Failed to load categories:", e);
  }

  return (
    <PublicLayout>
      <div className="bg-neutral-50 dark:bg-neutral-950 min-h-screen py-10 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="mb-10 text-center md:text-left">
            <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white">
              Job Categories
            </h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Browse professional career postings grouped dynamically by business divisions and sectors.
            </p>
          </div>

          {list.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg p-16 text-center max-w-lg mx-auto">
              <p className="text-lg font-bold text-neutral-900 dark:text-white">No categories available</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Categories appear here once they are registered and marked as visible in the Admin dashboard.
              </p>
            </div>
          ) : (
            <CategoriesGrid categories={list} />
          )}

        </div>
      </div>
    </PublicLayout>
  );
}
