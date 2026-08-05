"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Plus,
  Edit,
  Trash2,
  Copy,
  CheckCircle,
  XCircle,
  Eye,
  MousePointerClick,
  ExternalLink,
  SlidersHorizontal,
  Search,
  AlertTriangle
} from "lucide-react";

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const loadJobs = () => {
    setLoading(true);
    // Fetch all jobs for administrator (includes drafts, expired, etc.)
    fetch("/api/admin/jobs")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setJobs(json.data);
        }
      })
      .catch((e) => console.error("Error loading jobs:", e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleDuplicate = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to duplicate "${title}"? A copy will be created as a DRAFT.`)) return;

    try {
      const res = await fetch(`/api/admin/jobs/${id}/duplicate`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        alert("Job duplicated as DRAFT.");
        loadJobs();
      } else {
        alert(json.error || "Failed to duplicate job.");
      }
    } catch (e) {
      alert("Error duplicating job.");
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const res = await fetch(`/api/admin/jobs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        loadJobs();
      } else {
        alert(json.error || "Failed to update status.");
      }
    } catch (e) {
      alert("Error updating status.");
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/admin/jobs/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        loadJobs();
      } else {
        alert(json.error || "Failed to delete job.");
      }
    } catch (e) {
      alert("Error deleting job.");
    }
  };

  // Filter list on client
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.company?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-neutral-900 border p-6 rounded-2xl shadow-xs">
        <div>
          <h1 className="text-xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-blue-600" /> Jobs Management
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Create, duplicate, edit, or archive job postings. Duplicating a job creates a new draft.
          </p>
        </div>
        <Link
          href="/admin/jobs/new"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2.5 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-md"
        >
          <Plus className="h-4 w-4" /> Create New Job
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 rounded-xl shadow-xs flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search job title or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:border-blue-500 text-neutral-850 dark:text-neutral-50"
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-neutral-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500 text-neutral-800 dark:text-neutral-300"
          >
            <option value="">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="EXPIRED">Expired</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-12 text-center rounded-2xl animate-pulse">Loading jobs database...</div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 border border-dashed rounded-2xl p-16 text-center">
          <Briefcase className="mx-auto h-12 w-12 text-neutral-300 mb-4" />
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">No jobs match your filter</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
            All positions come from legitimate PostgreSQL records. Create your first job by tapping the button above.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border overflow-x-auto shadow-sm">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-850 text-neutral-500 dark:text-neutral-400 border-b border-neutral-100 dark:border-neutral-800 text-xs uppercase font-bold tracking-wider">
                <th className="p-4 pl-6">Job Posting</th>
                <th className="p-4">Category</th>
                <th className="p-4">Location</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Views</th>
                <th className="p-4 text-center">Apply Clicks</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-850/50 transition-colors">
                  <td className="p-4 pl-6">
                    <div>
                      <span className="font-extrabold text-neutral-850 dark:text-neutral-200 block">{job.title}</span>
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">{job.company?.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-neutral-600 dark:text-neutral-400 font-medium">{job.category?.name}</td>
                  <td className="p-4 text-neutral-600 dark:text-neutral-400 text-xs font-bold">{job.city}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleStatus(job.id, job.status)}
                      className={`text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded cursor-pointer ${
                        job.status === "PUBLISHED"
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          : job.status === "DRAFT"
                          ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                          : "bg-red-50 text-red-700"
                      }`}
                      title="Click to toggle status"
                    >
                      {job.status}
                    </button>
                  </td>
                  <td className="p-4 text-center text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3 text-neutral-400" /> {job.viewsCount}</span>
                  </td>
                  <td className="p-4 text-center text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    <span className="inline-flex items-center gap-1"><MousePointerClick className="h-3 w-3 text-neutral-400" /> {job.applyClicksCount}</span>
                  </td>
                  <td className="p-4 pr-6 text-right space-x-1 shrink-0">
                    <Link
                      href={`/jobs/detail/${job.slug}`}
                      target="_blank"
                      className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-neutral-400 inline-block"
                      title="Preview on Public Site"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>

                    <button
                      onClick={() => handleDuplicate(job.id, job.title)}
                      className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-neutral-500 cursor-pointer"
                      title="Duplicate as DRAFT"
                    >
                      <Copy className="h-4 w-4" />
                    </button>

                    <Link
                      href={`/admin/jobs/edit/${job.id}`}
                      className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-neutral-500 inline-block"
                      title="Edit Job Details"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>

                    <button
                      onClick={() => handleDelete(job.id, job.title)}
                      className="p-2 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 rounded-lg text-neutral-400 cursor-pointer"
                      title="Delete Permanently"
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
    </div>
  );
}
