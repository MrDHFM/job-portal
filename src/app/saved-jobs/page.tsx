"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Briefcase, Trash2, ArrowUpRight, RotateCcw } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("saved-jobs") || "[]");
      setSavedJobs(saved);
    } catch (e) {
      setSavedJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRemove = (id: number) => {
    try {
      const saved = JSON.parse(localStorage.getItem("saved-jobs") || "[]");
      const filtered = saved.filter((item: any) => item.id !== id);
      localStorage.setItem("saved-jobs", JSON.stringify(filtered));
      setSavedJobs(filtered);
      
      // Notify other components (Navbar)
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      console.error("Failed to remove saved job:", e);
    }
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear your saved list?")) {
      localStorage.setItem("saved-jobs", "[]");
      setSavedJobs([]);
      window.dispatchEvent(new Event("storage"));
    }
  };

  return (
    <PublicLayout>
      <div className="bg-neutral-50 dark:bg-neutral-950 min-h-screen py-10 transition-colors">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          
          <div className="mb-10 flex items-end justify-between border-b pb-4">
            <div>
              <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
                <Heart className="h-8 w-8 text-red-500 fill-current" /> Saved Careers
              </h1>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Manage your bookmarked job postings. Saved careers are persisted on this browser.
              </p>
            </div>
            {savedJobs.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs font-semibold text-neutral-500 hover:text-red-500 flex items-center gap-0.5 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Clear List
              </button>
            )}
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((n) => (
                <div key={n} className="bg-white p-6 rounded-2xl h-24 animate-pulse"></div>
              ))}
            </div>
          ) : savedJobs.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl p-16 text-center">
              <Heart className="mx-auto h-12 w-12 text-neutral-300 dark:text-neutral-750 mb-4" />
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Your saved list is empty</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
                No jobs saved yet. Bookmark verified openings by tapping the "Save Job" action on details pages.
              </p>
              <Link
                href="/jobs"
                className="mt-6 inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold px-4 py-2 shadow"
              >
                Browse Active Jobs
              </Link>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-250">
              {savedJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-xs transition-shadow"
                >
                  <div>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white hover:text-blue-600">
                      <Link href={`/jobs/detail/${job.slug}`}>{job.title}</Link>
                    </h3>
                    <p className="text-xs font-semibold text-blue-600 mt-0.5">{job.companyName}</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {job.city}, {job.country} • {job.workMode} • {job.employmentType}
                    </p>
                  </div>

                  <div className="flex gap-2 items-center w-full sm:w-auto shrink-0 border-t sm:border-0 pt-3 sm:pt-0 justify-end">
                    <button
                      onClick={() => handleRemove(job.id)}
                      className="p-2 border border-neutral-100 hover:bg-red-50 hover:text-red-600 dark:border-neutral-800 dark:hover:bg-red-950/20 rounded-xl text-neutral-400 transition-colors cursor-pointer"
                      title="Remove Bookmark"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <Link
                      href={`/jobs/detail/${job.slug}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl inline-flex items-center gap-1 transition-colors"
                    >
                      Apply Now <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </PublicLayout>
  );
}
