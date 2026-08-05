"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Layers, CheckCircle, AlertTriangle } from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal forms
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    displayOrder: "0",
    isVisible: true,
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadCategories = () => {
    setLoading(true);
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setCategories(json.data);
      })
      .catch((e) => console.error("Error loading categories:", e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateModal = () => {
    setEditId(null);
    setForm({
      name: "",
      description: "",
      displayOrder: "0",
      isVisible: true,
    });
    setError(null);
    setSuccess(null);
    setModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setEditId(cat.id);
    setForm({
      name: cat.name || "",
      description: cat.description || "",
      displayOrder: String(cat.displayOrder),
      isVisible: cat.isVisible !== undefined ? cat.isVisible : true,
    });
    setError(null);
    setSuccess(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) {
      setError("Category name is required.");
      return;
    }

    setError(null);
    setSuccess(null);

    const method = editId ? "PUT" : "POST";
    const url = editId ? `/api/admin/categories/${editId}` : "/api/admin/categories";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to persist category.");
      }

      setSuccess(editId ? "Category updated successfully!" : "Category created successfully!");
      setTimeout(() => {
        setModalOpen(false);
        loadCategories();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This will check if any jobs depend on it.`)) return;

    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Deletion failed.");
      }
      alert("Category deleted successfully.");
      loadCategories();
    } catch (err: any) {
      alert(err.message || "Cannot delete category. Verify there are no active jobs inside this category.");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-neutral-900 border p-6 rounded-2xl shadow-xs">
        <div>
          <h1 className="text-xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <Layers className="h-6 w-6 text-blue-600" /> Categories Management
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Group jobs into industry categories. Order display sequences for public listings.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2.5 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-md"
        >
          <Plus className="h-4 w-4" /> Create Category
        </button>
      </div>

      {loading ? (
        <div className="bg-white p-12 text-center rounded-2xl animate-pulse">Loading categories database...</div>
      ) : categories.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 border border-dashed rounded-2xl p-16 text-center">
          <Layers className="mx-auto h-12 w-12 text-neutral-300 mb-4" />
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">No Registered Categories</h3>
          <p className="text-xs text-neutral-500 mt-1">
            Build your first industry classification to host active jobs.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border overflow-x-auto shadow-sm">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-850 text-neutral-500 dark:text-neutral-400 border-b border-neutral-100 dark:border-neutral-800 text-xs uppercase font-bold tracking-wider">
                <th className="p-4 pl-6">Category Name</th>
                <th className="p-4">Slug Identifier</th>
                <th className="p-4">Short Description</th>
                <th className="p-4 text-center">Display Order</th>
                <th className="p-4 text-center">Visible</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-850/50 transition-colors">
                  <td className="p-4 pl-6 font-extrabold text-neutral-850 dark:text-neutral-200">{cat.name}</td>
                  <td className="p-4 text-xs font-mono text-neutral-500">{cat.slug}</td>
                  <td className="p-4 text-neutral-600 dark:text-neutral-400 truncate max-w-xs">{cat.description || "—"}</td>
                  <td className="p-4 text-center font-bold text-neutral-700 dark:text-neutral-300">{cat.displayOrder}</td>
                  <td className="p-4 text-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${cat.isVisible ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                      {cat.isVisible ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right space-x-1">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-neutral-500 cursor-pointer"
                      title="Edit Category"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="p-2 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 rounded-lg text-neutral-400 cursor-pointer"
                      title="Delete Category"
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

      {/* Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-md w-full border p-6 shadow-xl relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700">✕</button>

            <h3 className="text-lg font-black text-neutral-900 dark:text-white mb-2">
              {editId ? "Edit Category Details" : "Create Industry Category"}
            </h3>
            <p className="text-xs text-neutral-500 mb-6">
              Establish classification titles for job routing.
            </p>

            {error && (
              <div className="mb-4 bg-red-50 text-red-700 border border-red-200 p-3 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" /> {error}
              </div>
            )}

            {success && (
              <div className="mb-4 bg-emerald-50 text-emerald-700 border border-emerald-200 p-3 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4" /> {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Software Development"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2 text-sm text-neutral-850 dark:text-neutral-50 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Display Sequence</label>
                  <input
                    type="number"
                    value={form.displayOrder}
                    onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2 text-sm text-neutral-850 dark:text-neutral-50 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Visible on Portal</label>
                  <select
                    value={form.isVisible ? "true" : "false"}
                    onChange={(e) => setForm({ ...form, isVisible: e.target.value === "true" })}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2 text-sm focus:border-blue-500"
                  >
                    <option value="true">Yes, Visible</option>
                    <option value="false">No, Hidden</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Summary Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Technical roles, engineering careers, coder stacks..."
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2 text-sm text-neutral-850 dark:text-neutral-50 focus:border-blue-500 resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-neutral-500 hover:text-neutral-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
