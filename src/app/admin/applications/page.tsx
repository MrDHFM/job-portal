/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Trash2,
  Mail,
  Phone,
  ExternalLink,
  SlidersHorizontal,
  Search,
} from "lucide-react";

import Pagination from "@/components/admin/Pagination";
import { ApplicationSkeleton } from "@/components/Skeletons";
export default function AdminApplicationsPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [totalApplications, setTotalApplications] = useState(0);

  const APPLICATIONS_PER_PAGE = 5;

  const loadApplications = (requestedPage = page) => {
    setLoading(true);

    const params = new URLSearchParams();

    params.set("page", String(requestedPage));

    params.set("limit", String(APPLICATIONS_PER_PAGE));

    if (statusFilter) {
      params.set("status", statusFilter);
    }

    if (search) {
      params.set("search", search);
    }

    fetch(`/api/admin/applications?${params.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setApps(json.data || []);

          setPage(json.pagination?.page || requestedPage);

          setTotalPages(json.pagination?.totalPages || 1);

          setTotalApplications(json.pagination?.total || 0);
        }
      })
      .catch((e) => console.error("Error loading apps:", e))
      .finally(() => setLoading(false));
  };

  // Debounce the search box so we don't fire a request on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset to page 1 whenever a filter changes (Part 7).
  useEffect(() => {
    setPage(1);
    loadApplications(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, search]);

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        loadApplications();
      } else {
        alert(json.error || "Failed to update status.");
      }
    } catch (e) {
      alert("Error updating status.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this candidate application?"))
      return;

    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        loadApplications();
      } else {
        alert(json.error || "Failed to delete.");
      }
    } catch (e) {
      alert("Error deleting application.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-neutral-900 border p-6 rounded-lg shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <FileText className="h-6 w-6 text-[var(--color-primary)]" /> Candidate
            Applications
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Audit standard candidate resume links submitted internally for
            published positions.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search name, email, job..."
              className="app-input pl-8 py-2 text-sm w-full sm:w-56"
            />
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-neutral-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white dark:bg-neutral-800 border rounded-md px-3 py-2 text-sm text-neutral-800 dark:text-neutral-300 outline-none"
            >
              <option value="">All Applications</option>
              <option value="pending">Pending Review</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="rejected">Rejected</option>
              <option value="offered">Offered</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <ApplicationSkeleton key={i} />
          ))}
        </div>
      ) : apps.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 border border-dashed rounded-lg p-16 text-center">
          <FileText className="mx-auto h-12 w-12 text-neutral-300 mb-4" />
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
            {search || statusFilter
              ? "No applications match your search"
              : "No applications available yet"}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {search || statusFilter
              ? "Try clearing the search or filter above."
              : "Applications appear here once job hunters apply internally for PUBLISHED positions."}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-lg border overflow-x-auto shadow-sm">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-850 text-neutral-500 dark:text-neutral-400 border-b border-neutral-100 dark:border-neutral-800 text-xs uppercase font-bold tracking-wider">
                <th className="p-4 pl-6">Candidate</th>
                <th className="p-4">Contact Info</th>
                <th className="p-4">Applied Job</th>
                <th className="p-4">Resume</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {apps.map((app) => (
                <tr
                  key={app.id}
                  className="hover:bg-neutral-50/50 dark:hover:bg-neutral-850/50 transition-colors"
                >
                  <td className="p-4 pl-6">
                    <span className="font-extrabold text-neutral-850 dark:text-neutral-200 block">
                      {app.name}
                    </span>
                    <span className="text-xs text-neutral-400">
                      Received: {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="p-4 text-xs font-semibold text-neutral-600 dark:text-neutral-400 space-y-1">
                    <p className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" /> {app.email}
                    </p>
                    <p className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" /> {app.phone}
                    </p>
                  </td>
                  <td className="p-4">
                    <span className="font-extrabold text-neutral-850 dark:text-neutral-200 block truncate max-w-xs">
                      {app.job?.title}
                    </span>
                    <span className="text-xs text-[var(--color-primary)] font-bold">
                      {app.company?.name}
                    </span>
                  </td>
                  <td className="p-4">
                    <a
                      href={app.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[var(--color-primary-light)] dark:bg-neutral-800 text-[var(--color-primary)] hover:underline px-2.5 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1"
                    >
                      View PDF <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                  <td className="p-4 text-center">
                    <select
                      value={app.status}
                      onChange={(e) =>
                        handleUpdateStatus(app.id, e.target.value)
                      }
                      className={`text-xs font-bold rounded-lg border px-2 py-1 text-center outline-none ${
                        app.status === "shortlisted"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : app.status === "rejected"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-neutral-50 text-neutral-700 border-neutral-200"
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="rejected">Rejected</option>
                      <option value="offered">Offered</option>
                    </select>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <button
                      onClick={() => handleDelete(app.id)}
                      className="p-2 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 rounded-lg text-neutral-400 cursor-pointer"
                      title="Delete Application"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!loading && apps.length > 0 && (
        <div className="overflow-hidden rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <Pagination
            page={page}
            totalPages={totalPages}
            total={totalApplications}
            limit={APPLICATIONS_PER_PAGE}
            onPageChange={(nextPage) => {
              setPage(nextPage);
              loadApplications(nextPage);
            }}
          />
        </div>
      )}
    </div>
  );
}
