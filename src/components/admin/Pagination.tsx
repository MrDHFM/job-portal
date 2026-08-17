"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) {
    return (
      <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <p className="text-xs text-neutral-500">
          {total === 0
            ? "No records"
            : `Showing 1-${Math.min(limit, total)} of ${total}`}
        </p>
      </div>
    );
  }

  const pages: (number | "...")[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);

    if (page > 4) {
      pages.push("...");
    }

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (page < totalPages - 3) {
      pages.push("...");
    }

    pages.push(totalPages);
  }

  const startRecord = total === 0 ? 0 : (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, total);

  return (
    <div className="flex flex-col gap-3 border-t border-neutral-200 px-4 py-3 dark:border-neutral-800 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        Showing{" "}
        <span className="font-bold text-neutral-700 dark:text-neutral-200">
          {startRecord}-{endRecord}
        </span>{" "}
        of{" "}
        <span className="font-bold text-neutral-700 dark:text-neutral-200">
          {total}
        </span>
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex h-8 items-center gap-1 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-semibold text-neutral-600 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Previous
        </button>

        {pages.map((item, index) =>
          item === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="flex h-8 w-8 items-center justify-center text-xs text-neutral-400"
            >
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={`h-8 min-w-8 rounded-md border px-2 text-xs font-bold transition ${
                item === page
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
              }`}
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex h-8 items-center gap-1 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-semibold text-neutral-600 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}