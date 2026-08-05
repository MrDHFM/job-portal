import React from "react";
import Link from "next/link";
import { db } from "@/db";
import { categories, jobs } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { Layers, Briefcase, ChevronRight } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";

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
            <div className="bg-white dark:bg-neutral-900 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl p-16 text-center max-w-lg mx-auto">
              <Layers className="mx-auto h-12 w-12 text-neutral-300 mb-4" />
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">No categories available</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Categories appear here once they are registered and marked as visible in the Admin dashboard.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {list.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl flex flex-col justify-between hover:border-blue-400 dark:hover:border-blue-500/50 hover:shadow-md transition-all group"
                >
                  <div>
                    <div className="flex gap-3 items-center mb-3">
                      <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <Layers className="h-5 w-5" />
                      </div>
                      <h3 className="font-extrabold text-neutral-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                        {cat.name}
                      </h3>
                    </div>

                    <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed mb-4">
                      {cat.description || "Browse career openings and internships in this industrial category."}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 inline-flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5" /> {cat.activeJobsCount} Active Jobs
                    </span>
                    <span className="text-xs font-bold text-neutral-400 group-hover:text-blue-600 flex items-center gap-0.5 transition-colors">
                      Explore Jobs <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

        </div>
      </div>
    </PublicLayout>
  );
}
