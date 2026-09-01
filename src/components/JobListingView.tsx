/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  MapPin,
  Briefcase,
  SlidersHorizontal,
  ChevronDown,
  X,
  Building2,
  Calendar,
  DollarSign,
  Clock,
  RotateCcw,
  ArrowUpDown,
  BookOpen
} from "lucide-react";
import { JobListSkeleton } from "@/components/Skeletons";

type JobListingViewProps = {
  title?: string;
  subtitle?: string;
  preappliedFilters?: {
    sector?: string;
    workMode?: string;
    employmentType?: string;
    experienceLevel?: string;
    categoryId?: string;
    isFeatured?: boolean;
    isUrgent?: boolean;
  };
  // Seeded from the server component for the very first paint — real
  // job data (and a real total count) is already in the HTML before
  // any client JS runs, instead of an empty "Searching database..."
  // shell. All client-side filtering/pagination behavior below is
  // completely unchanged; this only affects what shows up first.
  initialJobs?: any[];
  initialPagination?: { total: number; totalPages: number; limit: number };
  initialCategories?: any[];
};

export default function JobListingView({
  title = "Explore Jobs",
  subtitle = "Find your next career move among our verified listings.",
  preappliedFilters,
  initialJobs,
  initialPagination,
  initialCategories,
}: JobListingViewProps) {
  const searchParams = useSearchParams();

  // Extract primitive preapplied filter values to prevent reference inequality loops
  const preSector = preappliedFilters?.sector || "";
  const preWorkMode = preappliedFilters?.workMode || "";
  const preEmploymentType = preappliedFilters?.employmentType || "";
  const preExperienceLevel = preappliedFilters?.experienceLevel || "";
  const preCategoryId = preappliedFilters?.categoryId || "";
  const preIsFeatured = !!preappliedFilters?.isFeatured;
  const preIsUrgent = !!preappliedFilters?.isUrgent;

  // Search & Filter State initialized from URL or preapplied filters
  const [keyword, setKeyword] = useState(() => searchParams.get("keyword") || "");
  const [location, setLocation] = useState(() => searchParams.get("location") || "");
  const [sector, setSector] = useState(() => preSector || searchParams.get("sector") || "");
  const [workMode, setWorkMode] = useState(() => preWorkMode || searchParams.get("workMode") || "");
  const [employmentType, setEmploymentType] = useState(() => preEmploymentType || searchParams.get("employmentType") || "");
  const [experienceLevel, setExperienceLevel] = useState(() => preExperienceLevel || searchParams.get("experienceLevel") || "");
  const [categoryId, setCategoryId] = useState(() => preCategoryId || searchParams.get("categoryId") || "");
  const [minSalary, setMinSalary] = useState(() => searchParams.get("minSalary") || "");
  const [sort, setSort] = useState(() => searchParams.get("sort") || "latest");
  const [page, setPage] = useState(() => parseInt(searchParams.get("page") || "1"));

  // API Data State — seeded from server-rendered props when available,
  // so first paint already shows real data instead of an empty state.
  const [jobs, setJobs] = useState<any[]>(() => initialJobs || []);
  const [categories, setCategories] = useState<any[]>(() => initialCategories || []);
  const [pagination, setPagination] = useState(
    () => initialPagination || { total: 0, totalPages: 1, limit: 10 },
  );
  const [loading, setLoading] = useState(() => !initialJobs);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Close the mobile filter drawer on Escape.
  useEffect(() => {
    if (!mobileFiltersOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileFiltersOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileFiltersOpen]);

  // Load Categories list once (skip if SSR already provided them)
  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) return;

    fetch("/api/v1/categories")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setCategories(json.data);
      })
      .catch((err) => console.error("Error loading categories:", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch Jobs from backend REST API
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      query.set("page", String(page));
      query.set("limit", "10");
      if (keyword) query.set("keyword", keyword);

      const finalSector = preSector || sector;
      const finalWorkMode = preWorkMode || workMode;
      const finalEmploymentType = preEmploymentType || employmentType;
      const finalExperienceLevel = preExperienceLevel || experienceLevel;
      const finalCategoryId = preCategoryId || categoryId;

      if (finalSector) query.set("sector", finalSector);
      if (finalWorkMode) query.set("workMode", finalWorkMode);
      if (finalEmploymentType) query.set("employmentType", finalEmploymentType);
      if (finalExperienceLevel) query.set("experienceLevel", finalExperienceLevel);
      if (finalCategoryId) query.set("categoryId", String(finalCategoryId));
      if (minSalary) query.set("minSalary", minSalary);
      if (sort) query.set("sort", sort);
      if (location) query.set("city", location);
      if (preIsFeatured) query.set("isFeatured", "true");
      if (preIsUrgent) query.set("isUrgent", "true");

      const res = await fetch(`/api/v1/jobs?${query.toString()}`);
      const json = await res.json();
      if (json.success) {
        setJobs(json.data);
        setPagination(json.pagination);
      }
    } catch (e) {
      console.error("Error fetching jobs:", e);
    } finally {
      setLoading(false);
    }
  }, [
    page,
    keyword,
    location,
    sector,
    workMode,
    employmentType,
    experienceLevel,
    categoryId,
    minSalary,
    sort,
    preSector,
    preWorkMode,
    preEmploymentType,
    preExperienceLevel,
    preCategoryId,
    preIsFeatured,
    preIsUrgent,
  ]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Safely update address bar URL without triggering App Router re-renders/flicker
  useEffect(() => {
    const isStaticLanding = Boolean(
      preSector || preWorkMode || preEmploymentType || preExperienceLevel || preCategoryId || preIsFeatured || preIsUrgent
    );

    if (!isStaticLanding && typeof window !== "undefined") {
      const params = new URLSearchParams();
      if (keyword) params.set("keyword", keyword);
      if (location) params.set("location", location);
      if (sector) params.set("sector", sector);
      if (workMode) params.set("workMode", workMode);
      if (employmentType) params.set("employmentType", employmentType);
      if (experienceLevel) params.set("experienceLevel", experienceLevel);
      if (categoryId) params.set("categoryId", String(categoryId));
      if (minSalary) params.set("minSalary", minSalary);
      if (sort && sort !== "latest") params.set("sort", sort);
      if (page > 1) params.set("page", String(page));

      const newRelativePathQuery = window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
      window.history.replaceState(null, "", newRelativePathQuery);
    }
  }, [
    keyword,
    location,
    sector,
    workMode,
    employmentType,
    experienceLevel,
    categoryId,
    minSalary,
    sort,
    page,
    preSector,
    preWorkMode,
    preEmploymentType,
    preExperienceLevel,
    preCategoryId,
    preIsFeatured,
    preIsUrgent,
  ]);

  const handleClearAll = () => {
    setKeyword("");
    setLocation("");
    if (!preSector) setSector("");
    if (!preWorkMode) setWorkMode("");
    if (!preEmploymentType) setEmploymentType("");
    if (!preExperienceLevel) setExperienceLevel("");
    if (!preCategoryId) setCategoryId("");
    setMinSalary("");
    setSort("latest");
    setPage(1);
  };

  const hasActiveFilters =
    keyword ||
    location ||
    (!preSector && sector) ||
    (!preWorkMode && workMode) ||
    (!preEmploymentType && employmentType) ||
    (!preExperienceLevel && experienceLevel) ||
    (!preCategoryId && categoryId) ||
    minSalary;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Info */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
          {title}
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {subtitle}
        </p>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters - Sidebar (Desktop) */}
        <aside className="hidden lg:block space-y-6 shrink-0">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-850 pb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-950 dark:text-neutral-200 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-[var(--color-primary)]" /> Filters
            </h2>
            {hasActiveFilters && (
              <button
                onClick={handleClearAll}
                className="text-xs font-semibold text-[var(--color-primary)] hover:opacity-80 flex items-center gap-0.5 cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" /> Clear All
              </button>
            )}
          </div>

          {/* Keyword & Location inputs inside Sidebar */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-500 mb-1.5">Keywords</label>
              <div className="relative">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Title, company, or skills..."
                  value={keyword}
                  onChange={(e) => {
                    setKeyword(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md pl-9 pr-4 py-2.5 text-sm text-neutral-850 dark:text-neutral-50 outline-none focus:border-[var(--color-primary)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-500 mb-1.5">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="City, state, or country..."
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md pl-9 pr-4 py-2.5 text-sm text-neutral-850 dark:text-neutral-50 outline-none focus:border-[var(--color-primary)]"
                />
              </div>
            </div>
          </div>

          {/* Category Filter */}
          {!preCategoryId && (
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-500 mb-1.5">Category</label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md px-3 py-2.5 text-sm text-neutral-850 dark:text-neutral-50 outline-none focus:border-[var(--color-primary)]"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sector (IT/Non-IT) */}
          {!preSector && (
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-500 mb-1.5">Sector</label>
              <select
                value={sector}
                onChange={(e) => {
                  setSector(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md px-3 py-2.5 text-sm text-neutral-850 dark:text-neutral-50 outline-none focus:border-[var(--color-primary)]"
              >
                <option value="">All Sectors</option>
                <option value="IT">IT Sector</option>
                <option value="Non-IT">Non-IT Sector</option>
              </select>
            </div>
          )}

          {/* Work Mode */}
          {!preWorkMode && (
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-500 mb-1.5">Work Mode</label>
              <select
                value={workMode}
                onChange={(e) => {
                  setWorkMode(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md px-3 py-2.5 text-sm text-neutral-850 dark:text-neutral-50 outline-none focus:border-[var(--color-primary)]"
              >
                <option value="">All Modes</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>
          )}

          {/* Employment Type */}
          {!preEmploymentType && (
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-500 mb-1.5">Employment Type</label>
              <select
                value={employmentType}
                onChange={(e) => {
                  setEmploymentType(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md px-3 py-2.5 text-sm text-neutral-850 dark:text-neutral-50 outline-none focus:border-[var(--color-primary)]"
              >
                <option value="">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Walk-In">Walk-In</option>
                <option value="Fresher">Fresher Opening</option>
              </select>
            </div>
          )}

          {/* Experience Level */}
          {!preExperienceLevel && (
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-500 mb-1.5">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => {
                  setExperienceLevel(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md px-3 py-2.5 text-sm text-neutral-850 dark:text-neutral-50 outline-none focus:border-[var(--color-primary)]"
              >
                <option value="">All Levels</option>
                <option value="Fresher">Fresher (0-1 Years)</option>
                <option value="Experienced">Experienced</option>
              </select>
            </div>
          )}

          {/* Minimum Salary */}
          <div>
            <label className="block text-xs font-bold uppercase text-neutral-500 mb-1.5">Minimum Annual Salary</label>
            <input
              type="number"
              placeholder="e.g. 50000"
              value={minSalary}
              onChange={(e) => {
                setMinSalary(e.target.value);
                setPage(1);
              }}
              className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md px-3 py-2.5 text-sm text-neutral-850 dark:text-neutral-50 outline-none focus:border-[var(--color-primary)]"
            />
          </div>
        </aside>

        {/* Results Area */}
        <section className="lg:col-span-3 space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 rounded-md">
            <div className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              {loading ? "Searching database..." : `${pagination.total} genuine positions found`}
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg text-xs font-bold text-neutral-700 dark:text-neutral-300 cursor-pointer"
              >
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </button>

              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-neutral-400" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg py-1.5 px-2 text-xs font-semibold outline-none text-neutral-800 dark:text-neutral-300"
                >
                  <option value="latest">Sort by: Latest</option>
                  <option value="oldest">Sort by: Oldest</option>
                  <option value="salary_high">Salary: High to Low</option>
                  <option value="salary_low">Salary: Low to High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Active Criteria:</span>
              {keyword && (
                <span className="app-badge app-badge-primary">
                  Keyword: "{keyword}" <X className="h-3 w-3 cursor-pointer" onClick={() => setKeyword("")} />
                </span>
              )}
              {location && (
                <span className="app-badge app-badge-primary">
                  Location: "{location}" <X className="h-3 w-3 cursor-pointer" onClick={() => setLocation("")} />
                </span>
              )}
              {sector && !preSector && (
                <span className="app-badge app-badge-primary">
                  Sector: {sector} <X className="h-3 w-3 cursor-pointer" onClick={() => setSector("")} />
                </span>
              )}
              {workMode && !preWorkMode && (
                <span className="app-badge app-badge-primary">
                  Mode: {workMode} <X className="h-3 w-3 cursor-pointer" onClick={() => setWorkMode("")} />
                </span>
              )}
              {employmentType && !preEmploymentType && (
                <span className="app-badge app-badge-primary">
                  Type: {employmentType} <X className="h-3 w-3 cursor-pointer" onClick={() => setEmploymentType("")} />
                </span>
              )}
              {experienceLevel && !preExperienceLevel && (
                <span className="app-badge app-badge-primary">
                  Level: {experienceLevel} <X className="h-3 w-3 cursor-pointer" onClick={() => setExperienceLevel("")} />
                </span>
              )}
              {categoryId && !preCategoryId && (
                <span className="app-badge app-badge-primary">
                  Category Filter <X className="h-3 w-3 cursor-pointer" onClick={() => setCategoryId("")} />
                </span>
              )}
              {minSalary && (
                <span className="app-badge app-badge-primary">
                  &gt;= ${minSalary} <X className="h-3 w-3 cursor-pointer" onClick={() => setMinSalary("")} />
                </span>
              )}
            </div>
          )}

          {/* Job Postings list */}
          {loading ? (
            <JobListSkeleton count={4} />
          ) : jobs.length === 0 ? (
            <div className="rounded-lg border border-dashed border-neutral-200 dark:border-neutral-800 p-16 text-center bg-white dark:bg-neutral-900">
              <Briefcase className="mx-auto h-12 w-12 text-neutral-300 dark:text-neutral-750 mb-4" />
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">No jobs match your search.</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
                Try removing some filters, editing your location, or broadening keywords. We never insert mock jobs.
              </p>
              <button
                onClick={handleClearAll}
                className="mt-6 app-button-primary text-xs shadow"
              >
                <RotateCcw className="h-3 w-3" /> Clear All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="group relative p-6 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-[var(--color-primary)] shadow-sm transition-all duration-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-md bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 border border-neutral-200 dark:border-neutral-700">
                      {job.company?.logoUrl ? (
                        <img src={job.company.logoUrl} alt={job.company.name} className="h-8 w-8 object-contain rounded" />
                      ) : (
                        <Building2 className="h-6 w-6 text-neutral-400 dark:text-neutral-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-neutral-900 dark:text-white group-hover:text-[var(--color-primary)] transition-colors">
                          <Link href={`/jobs/detail/${job.slug}`}>{job.title}</Link>
                        </h3>
                        {job.isFeatured && (
                          <span className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                            Featured
                          </span>
                        )}
                        {job.isUrgent && (
                          <span className="bg-red-500/10 text-red-600 dark:text-red-400 text-[9px] font-extrabold px-1.5 py-0.5 rounded animate-pulse">
                            Urgent
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                        {job.company?.name} • {job.city}, {job.country}
                      </p>

                      {/* Skills Tags */}
                      {job.requiredSkills && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {job.requiredSkills
                            .split(",")
                            .slice(0, 3)
                            .map((skill: string, i: number) => (
                              <span
                                key={i}
                                className="text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-2 py-0.5 rounded"
                              >
                                {skill.trim()}
                              </span>
                            ))}
                          {job.requiredSkills.split(",").length > 3 && (
                            <span className="text-[10px] text-neutral-400">
                              +{job.requiredSkills.split(",").length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right hand details */}
                  <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto border-t sm:border-0 border-neutral-100 dark:border-neutral-800 pt-3 sm:pt-0 shrink-0">
                    <span className="text-xs font-bold text-neutral-900 dark:text-white sm:mb-2">
                      {job.isSalaryVisible && job.minSalary
                        ? `${job.currency} ${(job.minSalary / 1000).toFixed(0)}k - ${(job.maxSalary ? job.maxSalary / 1000 : 0).toFixed(0)}k`
                        : "Salary Undisclosed"}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-neutral-400 font-medium">
                        {new Date(job.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                      <Link
                        href={`/jobs/detail/${job.slug}`}
                        className="app-button-primary px-3 py-1.5 text-xs shadow-sm"
                      >
                        View & Apply
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 pt-6 border-t border-neutral-100 dark:border-neutral-850">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 text-xs font-bold rounded-lg border border-neutral-200 dark:border-neutral-800 disabled:opacity-50 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
              >
                Previous
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg ${
                    page === p
                      ? "bg-[var(--color-primary)] text-white"
                      : "border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                disabled={page === pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 text-xs font-bold rounded-lg border border-neutral-200 dark:border-neutral-800 disabled:opacity-50 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
              >
                Next
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileFiltersOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex justify-end"
          onClick={() => setMobileFiltersOpen(false)}
          role="presentation"
        >
          <div
            className="bg-white dark:bg-neutral-900 w-full max-w-xs p-6 overflow-y-auto flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between border-b pb-4 mb-6">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <SlidersHorizontal className="h-4 w-4 text-[var(--color-primary)]" /> Filters
                </h3>
                <button onClick={() => setMobileFiltersOpen(false)} className="p-1 rounded hover:bg-neutral-100">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Keywords</label>
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => {
                      setKeyword(e.target.value);
                      setPage(1);
                    }}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md px-3 py-2 text-sm text-neutral-900 dark:text-neutral-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      setPage(1);
                    }}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md px-3 py-2 text-sm text-neutral-900 dark:text-neutral-50"
                  />
                </div>

                {/* Category select */}
                {!preCategoryId && (
                  <div>
                    <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Category</label>
                    <select
                      value={categoryId}
                      onChange={(e) => {
                        setCategoryId(e.target.value);
                        setPage(1);
                      }}
                      className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="">All Categories</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Sector */}
                {!preSector && (
                  <div>
                    <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Sector</label>
                    <select
                      value={sector}
                      onChange={(e) => {
                        setSector(e.target.value);
                        setPage(1);
                      }}
                      className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="">All Sectors</option>
                      <option value="IT">IT Sector</option>
                      <option value="Non-IT">Non-IT Sector</option>
                    </select>
                  </div>
                )}

                {/* Mode */}
                {!preWorkMode && (
                  <div>
                    <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Work Mode</label>
                    <select
                      value={workMode}
                      onChange={(e) => {
                        setWorkMode(e.target.value);
                        setPage(1);
                      }}
                      className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="">All Modes</option>
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="On-site">On-site</option>
                    </select>
                  </div>
                )}

                {/* Type */}
                {!preEmploymentType && (
                  <div>
                    <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Employment Type</label>
                    <select
                      value={employmentType}
                      onChange={(e) => {
                        setEmploymentType(e.target.value);
                        setPage(1);
                      }}
                      className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="">All Types</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                      <option value="Walk-In">Walk-In</option>
                      <option value="Fresher">Fresher</option>
                    </select>
                  </div>
                )}

                {/* Exp level */}
                {!preExperienceLevel && (
                  <div>
                    <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Experience Level</label>
                    <select
                      value={experienceLevel}
                      onChange={(e) => {
                        setExperienceLevel(e.target.value);
                        setPage(1);
                      }}
                      className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="">All Levels</option>
                      <option value="Fresher">Fresher (0-1 Years)</option>
                      <option value="Experienced">Experienced</option>
                    </select>
                  </div>
                )}

                {/* Sal */}
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Min Salary</label>
                  <input
                    type="number"
                    value={minSalary}
                    onChange={(e) => {
                      setMinSalary(e.target.value);
                      setPage(1);
                    }}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t mt-6 flex gap-2">
              <button
                onClick={handleClearAll}
                className="flex-1 py-2 rounded-md text-xs font-bold border hover:bg-neutral-50 text-neutral-700"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 py-2 rounded-md text-xs font-bold app-button-primary"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
