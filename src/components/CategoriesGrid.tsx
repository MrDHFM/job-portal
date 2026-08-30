"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Layers, Briefcase, ChevronRight, Search } from "lucide-react";
import Pagination from "@/components/admin/Pagination";

type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  activeJobsCount: number;
};

const CATEGORIES_PER_PAGE = 9;

export default function CategoriesGrid({ categories }: { categories: Category[] }) {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Debounce the search box.
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim().toLowerCase()), 250);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset to page 1 whenever the search query changes (Part 7).
  // Adjusting state during render (React's recommended pattern for this)
  // instead of in an effect, so it doesn't trigger an extra render pass.
  const [prevSearch, setPrevSearch] = useState(search);
  if (search !== prevSearch) {
    setPrevSearch(search);
    setPage(1);
  }

  const filtered = useMemo(() => {
    if (!search) return categories;
    return categories.filter((cat) => cat.name.toLowerCase().includes(search));
  }, [categories, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / CATEGORIES_PER_PAGE));
  const pageItems = filtered.slice(
    (page - 1) * CATEGORIES_PER_PAGE,
    page * CATEGORIES_PER_PAGE,
  );

  return (
    <>
      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search categories..."
          className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md pl-9 pr-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] text-neutral-850 dark:text-neutral-50"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg p-16 text-center max-w-lg mx-auto">
          <Layers className="mx-auto h-12 w-12 text-neutral-300 mb-4" />
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
            No categories match your search
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Try a different keyword or clear the search box.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pageItems.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-lg flex flex-col justify-between hover:border-[var(--color-primary)] hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex gap-3 items-center mb-3">
                    <div className="h-10 w-10 rounded-md bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center shrink-0">
                      <Layers className="h-5 w-5" />
                    </div>
                    <h3 className="font-extrabold text-neutral-900 dark:text-white truncate group-hover:text-[var(--color-primary)] transition-colors">
                      {cat.name}
                    </h3>
                  </div>

                  <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed mb-4">
                    {cat.description || "Browse career openings and internships in this industrial category."}
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--color-primary)] inline-flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" /> {cat.activeJobsCount} Active Jobs
                  </span>
                  <span className="text-xs font-bold text-neutral-400 group-hover:text-[var(--color-primary)] flex items-center gap-0.5 transition-colors">
                    Explore Jobs <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 overflow-hidden rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
              <Pagination
                page={page}
                totalPages={totalPages}
                total={filtered.length}
                limit={CATEGORIES_PER_PAGE}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </>
  );
}
