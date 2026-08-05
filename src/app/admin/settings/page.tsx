"use client";

import React, { useState, useEffect } from "react";
import { Settings, Save, CheckCircle, AlertTriangle } from "lucide-react";

export default function AdminSettingsPage() {
  const [form, setForm] = useState({
    siteName: "",
    contactEmail: "",
    defaultSeoTitle: "",
    defaultSeoDescription: "",
    socialLinkedin: "",
    socialTwitter: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setForm(json.data);
        }
      })
      .catch((e) => console.error("Error loading settings:", e))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save configurations.");
      }

      setSuccess("Site configurations saved successfully.");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-neutral-900 border p-6 rounded-2xl shadow-xs">
        <h1 className="text-xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
          <Settings className="h-6 w-6 text-blue-600" /> Portal Settings
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Adjust corporate branding, helpline channels, and SEO parameters.
        </p>
      </div>

      {loading ? (
        <div className="bg-white p-12 text-center rounded-2xl animate-pulse">Loading settings...</div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-900 border p-6 sm:p-8 rounded-2xl space-y-6 shadow-sm">
          
          {error && (
            <div className="bg-red-50 text-red-700 border border-red-200 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 animate-in fade-in duration-150">
              <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 animate-in fade-in duration-150">
              <CheckCircle className="h-4 w-4 shrink-0" /> {success}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Platform Site Name</label>
              <input
                type="text"
                required
                value={form.siteName}
                onChange={(e) => setForm({ ...form, siteName: e.target.value })}
                placeholder="CareerDiscover"
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Support Help Email</label>
              <input
                type="email"
                required
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                placeholder="support@jobportal.com"
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">LinkedIn Handle</label>
              <input
                type="url"
                value={form.socialLinkedin}
                onChange={(e) => setForm({ ...form, socialLinkedin: e.target.value })}
                placeholder="https://linkedin.com"
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Twitter / X Handle</label>
              <input
                type="url"
                value={form.socialTwitter}
                onChange={(e) => setForm({ ...form, socialTwitter: e.target.value })}
                placeholder="https://twitter.com"
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Default SEO Meta Title</label>
              <input
                type="text"
                required
                value={form.defaultSeoTitle}
                onChange={(e) => setForm({ ...form, defaultSeoTitle: e.target.value })}
                placeholder="GlobalJob Discover - Premium Job Board"
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Default SEO Meta Description</label>
              <textarea
                rows={3}
                required
                value={form.defaultSeoDescription}
                onChange={(e) => setForm({ ...form, defaultSeoDescription: e.target.value })}
                placeholder="Write default description text for index crawlers..."
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3.5 py-2.5 text-sm resize-none"
              ></textarea>
            </div>
          </div>

          <div className="pt-6 border-t flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl px-5 py-2.5 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Save className="h-4 w-4" /> {saving ? "Saving settings..." : "Save Settings"}
            </button>
          </div>

        </form>
      )}

    </div>
  );
}
