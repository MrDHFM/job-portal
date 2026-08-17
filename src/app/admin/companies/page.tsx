"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Globe,
  Users,
  ExternalLink,
  X,
  CheckCircle,
  AlertTriangle,
  Search,
} from "lucide-react";
import Pagination from "@/components/admin/Pagination";

export default function AdminCompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [totalCompanies, setTotalCompanies] = useState(0);

  const COMPANIES_PER_PAGE = 5;

  // Form modal states
  const [modalOpen, setFormModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    logoUrl: "",
    description: "",
    website: "",
    industry: "",
    size: "11-50",
    foundedYear: "",
    headquarters: "",
    linkedin: "",
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Load Companies list
  const loadCompanies = (requestedPage = page) => {
    setLoading(true);

    const params = new URLSearchParams();

    params.set("page", String(requestedPage));

    params.set("limit", String(COMPANIES_PER_PAGE));

    if (searchTerm.trim()) {
      params.set("search", searchTerm.trim());
    }

    fetch(`/api/admin/companies?${params.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setCompanies(json.data || []);

          setPage(json.pagination?.page || requestedPage);

          setTotalPages(json.pagination?.totalPages || 1);

          setTotalCompanies(json.pagination?.total || 0);
        }
      })
      .catch((e) => console.error("Error loading companies:", e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadCompanies(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const openCreateModal = () => {
    setEditId(null);
    setForm({
      name: "",
      logoUrl: "",
      description: "",
      website: "",
      industry: "",
      size: "11-50",
      foundedYear: "",
      headquarters: "",
      linkedin: "",
    });
    setFormError(null);
    setFormSuccess(null);
    setFormModalOpen(true);
  };

  const openEditModal = (comp: any) => {
    setEditId(comp.id);
    setForm({
      name: comp.name || "",
      logoUrl: comp.logoUrl || "",
      description: comp.description || "",
      website: comp.website || "",
      industry: comp.industry || "",
      size: comp.size || "11-50",
      foundedYear: comp.foundedYear ? String(comp.foundedYear) : "",
      headquarters: comp.headquarters || "",
      linkedin: comp.linkedin || "",
    });
    setFormError(null);
    setFormSuccess(null);
    setFormModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) {
      setFormError("Company name is required.");
      return;
    }

    setFormError(null);
    setFormSuccess(null);

    const method = editId ? "PUT" : "POST";
    const url = editId
      ? `/api/admin/companies/${editId}`
      : "/api/admin/companies";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save company registry.");
      }

      setFormSuccess(
        editId
          ? "Company details updated successfully!"
          : "New company registered successfully!",
      );
      setTimeout(() => {
        setFormModalOpen(false);
        loadCompanies();
      }, 1000);
    } catch (err: any) {
      setFormError(err.message || "Something went wrong.");
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${name}"? This action is permanent.`,
      )
    )
      return;

    try {
      const res = await fetch(`/api/admin/companies/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Deletion blocked.");
      }
      alert("Company removed from database.");
      loadCompanies();
    } catch (err: any) {
      alert(
        err.message ||
          "Failed to delete company. Verify it has no job dependencies.",
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-neutral-900 border p-6 rounded-2xl">
        <div>
          <h1 className="text-xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
            🏢 Companies Registry
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Register and manage hiring employers. Companies must be registered
            before posting jobs.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search companies..."
            className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-9 pr-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          />
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2.5 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-md"
        >
          <Plus className="h-4 w-4" /> Register Employer
        </button>
      </div>

      {loading ? (
        <div className="bg-white p-12 text-center rounded-2xl animate-pulse">
          Loading companies database...
        </div>
      ) : companies.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 border border-dashed rounded-2xl p-16 text-center">
          <Building2 className="mx-auto h-12 w-12 text-neutral-300 mb-4" />
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
            No Registered Companies
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
            You haven&apos;t registered any hiring companies yet. Tap the button
            above to register your first corporate entity!
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border overflow-x-auto shadow-sm">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-850 text-neutral-500 dark:text-neutral-400 border-b border-neutral-100 dark:border-neutral-800 text-xs uppercase font-bold tracking-wider">
                <th className="p-4 pl-6">Company</th>
                <th className="p-4">Industry Sector</th>
                <th className="p-4">HQ Headquarters</th>
                <th className="p-4">Staff Size</th>
                <th className="p-4">Website</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {companies.map((comp) => (
                <tr
                  key={comp.id}
                  className="hover:bg-neutral-50/50 dark:hover:bg-neutral-850/50 transition-colors"
                >
                  <td className="p-4 pl-6 flex items-center gap-3">
                    <div className="h-9 w-9 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center border shrink-0">
                      {comp.logoUrl ? (
                        <img
                          src={comp.logoUrl}
                          alt={comp.name}
                          className="h-6 w-6 object-contain rounded"
                        />
                      ) : (
                        <Building2 className="h-5 w-5 text-neutral-400" />
                      )}
                    </div>
                    <span className="font-extrabold text-neutral-850 dark:text-neutral-200">
                      {comp.name}
                    </span>
                  </td>
                  <td className="p-4 text-neutral-600 dark:text-neutral-400">
                    {comp.industry || "General"}
                  </td>
                  <td className="p-4 text-neutral-600 dark:text-neutral-400">
                    {comp.headquarters || "Global HQ"}
                  </td>
                  <td className="p-4 text-neutral-600 dark:text-neutral-400">
                    {comp.size || "11-50"}
                  </td>
                  <td className="p-4">
                    {comp.website ? (
                      <a
                        href={comp.website}
                        target="_blank"
                        rel="noopener"
                        className="text-blue-600 hover:underline inline-flex items-center gap-0.5 text-xs font-bold"
                      >
                        Visit <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-neutral-400 text-xs italic">
                        Not set
                      </span>
                    )}
                  </td>
                  <td className="p-4 pr-6 text-right space-x-1 shrink-0">
                    <button
                      onClick={() => openEditModal(comp)}
                      className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-neutral-500 cursor-pointer"
                      title="Edit Company Details"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(comp.id, comp.name)}
                      className="p-2 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 rounded-lg text-neutral-400 cursor-pointer"
                      title="Delete Company Safely"
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
      {!loading && companies.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <Pagination
            page={page}
            totalPages={totalPages}
            total={totalCompanies}
            limit={COMPANIES_PER_PAGE}
            onPageChange={(nextPage) => {
              setPage(nextPage);
              loadCompanies(nextPage);
            }}
          />
        </div>
      )}

      {/* Slide-In Modal Form for Create/Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-lg w-full border border-neutral-200 dark:border-neutral-800 p-6 shadow-xl relative animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setFormModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700"
            >
              ✕
            </button>

            <h3 className="text-lg font-black text-neutral-900 dark:text-white mb-2">
              {editId ? "Edit Company Details" : "Register New Employer"}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-6">
              Fill in the company profile attributes. All inputs are sanitized
              and stored in PostgreSQL.
            </p>

            {formError && (
              <div className="mb-4 bg-red-50 text-red-700 border border-red-200 p-3 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" /> {formError}
              </div>
            )}

            {formSuccess && (
              <div className="mb-4 bg-emerald-50 text-emerald-700 border border-emerald-200 p-3 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4" /> {formSuccess}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Acme Tech Limited"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2 text-sm outline-none text-neutral-850 dark:text-neutral-50 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    value={form.logoUrl}
                    onChange={(e) =>
                      setForm({ ...form, logoUrl: e.target.value })
                    }
                    placeholder="https://acme.com/logo.png"
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2 text-sm outline-none text-neutral-850 dark:text-neutral-50 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Corporate Website
                  </label>
                  <input
                    type="url"
                    value={form.website}
                    onChange={(e) =>
                      setForm({ ...form, website: e.target.value })
                    }
                    placeholder="https://acme.com"
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2 text-sm outline-none text-neutral-850 dark:text-neutral-50 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Industry Sector
                  </label>
                  <input
                    type="text"
                    value={form.industry}
                    onChange={(e) =>
                      setForm({ ...form, industry: e.target.value })
                    }
                    placeholder="e.g. Software, Healthcare"
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2 text-sm outline-none text-neutral-850 dark:text-neutral-50 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Corporate Size
                  </label>
                  <select
                    value={form.size}
                    onChange={(e) => setForm({ ...form, size: e.target.value })}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501-1000">501-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    HQ Headquarters
                  </label>
                  <input
                    type="text"
                    value={form.headquarters}
                    onChange={(e) =>
                      setForm({ ...form, headquarters: e.target.value })
                    }
                    placeholder="e.g. San Francisco, CA"
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2 text-sm outline-none text-neutral-850 dark:text-neutral-50 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Founded Year
                  </label>
                  <input
                    type="number"
                    value={form.foundedYear}
                    onChange={(e) =>
                      setForm({ ...form, foundedYear: e.target.value })
                    }
                    placeholder="e.g. 2018"
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2 text-sm outline-none text-neutral-850 dark:text-neutral-50 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={form.linkedin}
                  onChange={(e) =>
                    setForm({ ...form, linkedin: e.target.value })
                  }
                  placeholder="https://linkedin.com/company/acme"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2 text-sm outline-none text-neutral-850 dark:text-neutral-50 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Corporate Biography
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Summarize corporate history, products, or vision..."
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2 text-sm outline-none text-neutral-850 dark:text-neutral-50 focus:border-blue-500 resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setFormModalOpen(false)}
                  className="px-4 py-2 text-neutral-500 hover:text-neutral-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 cursor-pointer"
                >
                  {editId ? "Save Updates" : "Register Firm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
