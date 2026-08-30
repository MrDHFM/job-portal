/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

import {
  Briefcase,
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  MousePointerClick,
  ExternalLink,
  SlidersHorizontal,
  Search,
  Check,
  Grid3X3,
  List,
  Trash,
  X,
} from "lucide-react";

import SocialMediaPostManager from "@/components/SocialMediaPostManager";
import { isJobExpired } from "@/lib/jobs/job-expiry";

import Pagination from "@/components/admin/Pagination";
import { TableSkeleton } from "@/components/Skeletons";

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);

  const JOBS_PER_PAGE = 6;
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // View mode
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Selected jobs
  const [selectedJobIds, setSelectedJobIds] = useState<number[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const loadJobs = (requestedPage = page) => {
    setLoading(true);

    const params = new URLSearchParams();

    params.set("page", String(requestedPage));

    params.set("limit", String(JOBS_PER_PAGE));

    if (searchTerm.trim()) {
      params.set("search", searchTerm.trim());
    }

    if (statusFilter) {
      params.set("status", statusFilter);
    }

    fetch(`/api/admin/jobs?${params.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setJobs(json.data || []);

          setTotalPages(json.pagination?.totalPages || 1);

          setTotalJobs(json.pagination?.total || 0);

          setPage(json.pagination?.page || requestedPage);
        }
      })
      .catch((e) => console.error("Error loading jobs:", e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadJobs(1);
  }, [searchTerm, statusFilter]);

  const handleDuplicate = async (id: number, title: string) => {
    if (
      !confirm(
        `Are you sure you want to duplicate "${title}"? A copy will be created as a DRAFT.`,
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/jobs/${id}/duplicate`, {
        method: "POST",
      });

      const json = await res.json();

      if (json.success) {
        alert("Job duplicated as DRAFT.");
        loadJobs();
      } else {
        alert(json.error || "Failed to duplicate job.");
      }
    } catch {
      alert("Error duplicating job.");
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";

    try {
      const res = await fetch(`/api/admin/jobs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      const json = await res.json();

      if (json.success) {
        loadJobs();
      } else {
        alert(json.error || "Failed to update status.");
      }
    } catch {
      alert("Error updating status.");
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${title}"? This cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/jobs/${id}`, {
        method: "DELETE",
      });

      const json = await res.json();

      if (json.success) {
        setSelectedJobIds((current) => current.filter((jobId) => jobId !== id));

        loadJobs();
      } else {
        alert(json.error || "Failed to delete job.");
      }
    } catch {
      alert("Error deleting job.");
    }
  };

  /*
   * Filter jobs
   */
  // Status filtering now happens server-side via the effective-status
  // SQL expression (see /api/admin/jobs), so pagination totals are
  // correct even for the "Expired" tab. This client-side pass only
  // re-checks search as a defensive no-op; isJobExpired below is used
  // purely for badge/label display, not for filtering.
  const filteredJobs = jobs.filter((job) => {
    const title = String(job.title || "").toLowerCase();
    const company = String(job.company?.name || "").toLowerCase();
    const search = searchTerm.toLowerCase();

    return !search || title.includes(search) || company.includes(search);
  });

  /*
   * Selected jobs that are currently visible
   *
   * This is important because Select All should only select
   * jobs currently displayed after search/filter.
   */
  const visibleJobIds = filteredJobs.map((job) => Number(job.id));

  const selectedVisibleCount = visibleJobIds.filter((id) =>
    selectedJobIds.includes(id),
  ).length;

  const allVisibleSelected =
    filteredJobs.length > 0 && selectedVisibleCount === filteredJobs.length;

  const someVisibleSelected =
    selectedVisibleCount > 0 && selectedVisibleCount < filteredJobs.length;

  /*
   * Select / deselect one job
   */
  const toggleJobSelection = (id: number) => {
    setSelectedJobIds((current) => {
      if (current.includes(id)) {
        return current.filter((jobId) => jobId !== id);
      }

      return [...current, id];
    });
  };

  /*
   * Select / deselect all currently visible jobs
   */
  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedJobIds((current) =>
        current.filter((id) => !visibleJobIds.includes(id)),
      );

      return;
    }

    setSelectedJobIds((current) => [
      ...new Set([...current, ...visibleJobIds]),
    ]);
  };

  /*
   * Clear selection
   */
  const clearSelection = () => {
    setSelectedJobIds([]);
  };

  /*
   * Bulk delete
   */
  const handleBulkDelete = async () => {
    if (selectedJobIds.length === 0) {
      return;
    }

    const selectedJobs = jobs.filter((job) =>
      selectedJobIds.includes(Number(job.id)),
    );

    const count = selectedJobs.length;

    const confirmed = confirm(
      `Are you sure you want to permanently delete ${count} selected job${
        count === 1 ? "" : "s"
      }?\n\nThis action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setBulkDeleting(true);

    try {
      /*
       * Delete jobs one by one using your existing DELETE API.
       */
      const results = await Promise.all(
        selectedJobIds.map(async (id) => {
          const res = await fetch(`/api/admin/jobs/${id}`, {
            method: "DELETE",
          });

          const json = await res.json();

          return {
            success: res.ok && json.success,
            id,
            error: json.error,
          };
        }),
      );

      const failed = results.filter((result) => !result.success);

      if (failed.length > 0) {
        alert(
          `${count - failed.length} job${
            count - failed.length === 1 ? "" : "s"
          } deleted successfully.\n\n${failed.length} job${
            failed.length === 1 ? "" : "s"
          } could not be deleted.`,
        );
      }

      setSelectedJobIds([]);
      loadJobs();
    } catch (error) {
      console.error("Bulk delete error:", error);
      alert("Something went wrong while deleting the jobs.");
    } finally {
      setBulkDeleting(false);
    }
  };

  /*
   * Status badge
   */
  const StatusBadge = ({ job }: { job: any }) => {
    const expired = isJobExpired(job);

    const effectiveStatus = expired ? "EXPIRED" : job.status;

    const classes =
      effectiveStatus === "PUBLISHED"
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : effectiveStatus === "DRAFT"
          ? "bg-amber-50 text-amber-700 border-amber-200"
          : effectiveStatus === "EXPIRED"
            ? "bg-red-50 text-red-700 border-red-200"
            : "bg-neutral-100 text-neutral-600 border-neutral-200";

    return (
      <button
        type="button"
        disabled={expired}
        onClick={() => {
          if (!expired) {
            handleToggleStatus(job.id, job.status);
          }
        }}
        className={`inline-flex items-center rounded-md border px-2 py-1 text-[10px] font-black tracking-wider uppercase ${classes} ${
          expired ? "cursor-default" : "cursor-pointer hover:opacity-80"
        }`}
        title={expired ? "This job has expired" : "Click to toggle status"}
      >
        {effectiveStatus}
      </button>
    );
  };

  /*
   * Job selection checkbox
   */
  const JobCheckbox = ({ job }: { job: any }) => {
    const id = Number(job.id);
    const checked = selectedJobIds.includes(id);

    return (
      <button
        type="button"
        onClick={() => toggleJobSelection(id)}
        aria-label={checked ? `Deselect ${job.title}` : `Select ${job.title}`}
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
          checked
            ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
            : "border-neutral-300 bg-white hover:border-[var(--color-primary)] dark:border-neutral-600 dark:bg-neutral-900"
        }`}
      >
        {checked && <Check className="h-3 w-3" />}
      </button>
    );
  };

  /*
   * Job actions
   */
  const JobActions = ({ job }: { job: any }) => {
    return (
      <div className="flex items-center justify-end gap-0.5">
        <Link
          href={`/jobs/detail/${job.slug}`}
          target="_blank"
          className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          title="Preview on Public Site"
        >
          <ExternalLink className="h-4 w-4" />
        </Link>

        <button
          type="button"
          onClick={() => handleDuplicate(job.id, job.title)}
          className="rounded-md p-1.5 text-neutral-500 transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
          title="Duplicate as DRAFT"
        >
          <Copy className="h-4 w-4" />
        </button>

        <Link
          href={`/admin/jobs/edit/${job.id}`}
          className="rounded-md p-1.5 text-neutral-500 transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
          title="Edit Job Details"
        >
          <Edit className="h-4 w-4" />
        </Link>

        <button
          type="button"
          onClick={() => handleDelete(job.id, job.title)}
          className="rounded-md p-1.5 text-neutral-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
          title="Delete Permanently"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-black text-neutral-900 dark:text-white">
            <Briefcase className="h-6 w-6 text-[var(--color-primary)]" />
            Jobs Management
          </h1>

          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Create, duplicate, edit, or archive job postings. Duplicating a job
            creates a new draft.
          </p>
        </div>

        <Link
          href="/admin/jobs/new"
          className="app-button-primary rounded-lg px-4 py-2.5 text-xs shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Create New Job
        </Link>
      </div>

      {/* Filters + View Toggle */}
      <div className="rounded-lg border border-neutral-200 bg-white p-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {/* Search */}
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />

            <input
              type="text"
              placeholder="Search job title or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2 pl-9 pr-4 text-sm text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-[var(--color-primary)] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 shrink-0 text-neutral-400" />

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                clearSelection();
              }}
              className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-800 outline-none transition focus:border-[var(--color-primary)] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
            >
              <option value="">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="EXPIRED">Expired</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          {/* View toggle */}
          <div className="flex items-center rounded-lg border border-neutral-200 bg-neutral-50 p-1 dark:border-neutral-700 dark:bg-neutral-800">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition ${
                viewMode === "list"
                  ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              }`}
            >
              <List className="h-4 w-4" />
              List
            </button>

            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition ${
                viewMode === "grid"
                  ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
              Grid
            </button>
          </div>
        </div>
      </div>

      {/* Selection toolbar */}
      {!loading && filteredJobs.length > 0 && (
        <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {/* Select all */}
            <button
              type="button"
              onClick={toggleSelectAll}
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
                allVisibleSelected
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                  : someVisibleSelected
                    ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                    : "border-neutral-300 bg-white hover:border-[var(--color-primary)] dark:border-neutral-600 dark:bg-neutral-900"
              }`}
              aria-label={
                allVisibleSelected
                  ? "Deselect all visible jobs"
                  : "Select all visible jobs"
              }
            >
              {allVisibleSelected && <Check className="h-3 w-3" />}

              {someVisibleSelected && !allVisibleSelected && (
                <span className="h-0.5 w-2 bg-[var(--color-primary)]" />
              )}
            </button>

            <button
              type="button"
              onClick={toggleSelectAll}
              className="text-xs font-bold text-neutral-700 hover:text-[var(--color-primary)] dark:text-neutral-300"
            >
              {allVisibleSelected ? "Deselect All" : "Select All"}
            </button>

            <span className="text-xs text-neutral-400">
              {filteredJobs.length} {filteredJobs.length === 1 ? "job" : "jobs"}{" "}
              shown
            </span>
          </div>

          {selectedJobIds.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300">
                {selectedJobIds.length} selected
              </span>

              <button
                type="button"
                onClick={clearSelection}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-semibold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </button>

              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash className="h-3.5 w-3.5" />

                {bulkDeleting
                  ? "Deleting..."
                  : `Delete ${selectedJobIds.length}`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <TableSkeleton rows={6} columns={6} />
      ) : filteredJobs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-16 text-center dark:border-neutral-700 dark:bg-neutral-900">
          <Briefcase className="mx-auto mb-4 h-12 w-12 text-neutral-300" />

          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
            No jobs match your filter
          </h3>

          <p className="mx-auto mt-1 max-w-sm text-xs text-neutral-500 dark:text-neutral-400">
            All positions come from legitimate PostgreSQL records. Create your
            first job by tapping the button above.
          </p>
        </div>
      ) : viewMode === "list" ? (
        /*
         * LIST VIEW
         */
        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-400">
                <th className="w-12 px-4 py-3">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className={`flex h-4 w-4 items-center justify-center rounded border ${
                      allVisibleSelected
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                        : someVisibleSelected
                          ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]"
                          : "border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-900"
                    }`}
                    aria-label="Select all jobs"
                  >
                    {allVisibleSelected && <Check className="h-3 w-3" />}

                    {someVisibleSelected && !allVisibleSelected && (
                      <span className="h-0.5 w-2 bg-[var(--color-primary)]" />
                    )}
                  </button>
                </th>

                <th className="px-4 py-3">Job Posting</th>

                <th className="px-4 py-3">Category</th>

                <th className="px-4 py-3">Location</th>

                <th className="px-4 py-3">Status</th>

                <th className="px-4 py-3">Social</th>

                <th className="px-4 py-3 text-center">Views</th>

                <th className="px-4 py-3 text-center">Apply Clicks</th>

                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {filteredJobs.map((job) => (
                <tr
                  key={job.id}
                  className={`transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40 ${
                    selectedJobIds.includes(Number(job.id))
                      ? "bg-[var(--color-primary-light)]/40"
                      : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <JobCheckbox job={job} />
                  </td>

                  <td className="px-4 py-3">
                    <div>
                      <span className="block font-extrabold text-neutral-850 dark:text-neutral-200">
                        {job.title}
                      </span>

                      <span className="text-xs font-bold text-[var(--color-primary)]">
                        {job.company?.name}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">
                    {job.category?.name}
                  </td>

                  <td className="px-4 py-3 text-xs font-bold text-neutral-600 dark:text-neutral-400">
                    {job.city}
                  </td>

                  <td className="px-4 py-3">
                    <StatusBadge job={job} />
                  </td>

                  <td className="px-4 py-3">
                    <SocialMediaPostManager
                      jobId={job.id}
                      jobTitle={job.title}
                    />
                  </td>

                  <td className="px-4 py-3 text-center text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    <span className="inline-flex items-center gap-1">
                      <Eye className="h-3 w-3 text-neutral-400" />
                      {Number(job.viewsCount ?? 0).toLocaleString()}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    <span className="inline-flex items-center gap-1">
                      <MousePointerClick className="h-3 w-3 text-neutral-400" />
                      {Number(job.applyClicksCount ?? 0).toLocaleString()}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <JobActions job={job} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /*
         * GRID VIEW
         */
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredJobs.map((job) => {
            const selected = selectedJobIds.includes(Number(job.id));

            return (
              <div
                key={job.id}
                className={`rounded-lg border bg-white p-4 shadow-sm transition dark:bg-neutral-900 ${
                  selected
                    ? "border-[var(--color-primary)] ring-1 ring-[var(--color-primary)]/30"
                    : "border-neutral-200 dark:border-neutral-800"
                }`}
              >
                {/* Card top */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <JobCheckbox job={job} />

                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-extrabold text-neutral-900 dark:text-white">
                        {job.title}
                      </h3>

                      <p className="mt-0.5 truncate text-xs font-bold text-[var(--color-primary)]">
                        {job.company?.name}
                      </p>
                    </div>
                  </div>

                  <StatusBadge job={job} />
                </div>

                {/* Details */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-md border border-neutral-100 bg-neutral-50 p-2.5 dark:border-neutral-800 dark:bg-neutral-800/50">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">
                      Category
                    </p>

                    <p className="mt-1 truncate font-semibold text-neutral-700 dark:text-neutral-300">
                      {job.category?.name || "—"}
                    </p>
                  </div>

                  <div className="rounded-md border border-neutral-100 bg-neutral-50 p-2.5 dark:border-neutral-800 dark:bg-neutral-800/50">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">
                      Location
                    </p>

                    <p className="mt-1 truncate font-semibold text-neutral-700 dark:text-neutral-300">
                      {job.city || "—"}
                    </p>
                  </div>
                </div>

                {/* Analytics */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 rounded-md border border-neutral-100 px-3 py-2 dark:border-neutral-800">
                    <Eye className="h-4 w-4 text-neutral-400" />

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">
                        Views
                      </p>

                      <p className="text-sm font-black text-neutral-800 dark:text-neutral-200">
                        {Number(job.viewsCount ?? 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-md border border-neutral-100 px-3 py-2 dark:border-neutral-800">
                    <MousePointerClick className="h-4 w-4 text-neutral-400" />

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">
                        Applies
                      </p>

                      <p className="text-sm font-black text-neutral-800 dark:text-neutral-200">
                        {Number(job.applyClicksCount ?? 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Social */}
                <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">
                    Social
                  </span>

                  <SocialMediaPostManager jobId={job.id} jobTitle={job.title} />
                </div>

                {/* Actions */}
                <div className="mt-3 flex items-center justify-end border-t border-neutral-100 pt-3 dark:border-neutral-800">
                  <JobActions job={job} />
                </div>
              </div>
            );
          })}
        </div>
      )}
      {!loading && jobs.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <Pagination
            page={page}
            totalPages={totalPages}
            total={totalJobs}
            limit={JOBS_PER_PAGE}
            onPageChange={(nextPage) => {
              setPage(nextPage);
              setSelectedJobIds([]);
              loadJobs(nextPage);
            }}
          />
        </div>
      )}
    </div>
  );
}
