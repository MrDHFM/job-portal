"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, Search, MapPin, Layers, ChevronRight, Briefcase } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams();
    if (searchTerm) query.set("search", searchTerm);
    if (industryFilter) query.set("industry", industryFilter);
    if (locationFilter) query.set("location", locationFilter);

    fetch(`/api/v1/companies?${query.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setCompanies(json.data);
        }
      })
      .catch((e) => console.error("Failed to load companies:", e))
      .finally(() => setLoading(false));
  }, [searchTerm, industryFilter, locationFilter]);

  // Derive unique industries list from active companies for the filter
  const industries = Array.from(new Set(companies.map((c) => c.industry).filter(Boolean)));

  return (
    <PublicLayout>
      <div className="bg-neutral-50 dark:bg-neutral-950 min-h-screen py-10 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white">
              Company Directory
            </h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Browse top verified hiring employers with active published openings in our system.
            </p>
          </div>

          {/* Interactive Filters Grid */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 rounded-2xl shadow-sm mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search company name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-blue-500 text-neutral-850 dark:text-neutral-50"
              />
            </div>

            <div className="relative">
              <Layers className="absolute left-3 top-3.5 h-4 w-4 text-neutral-400 pointer-events-none" />
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-blue-500 text-neutral-850 dark:text-neutral-50 appearance-none"
              >
                <option value="">All Industries</option>
                {industries.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="HQ Location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-blue-500 text-neutral-850 dark:text-neutral-50"
              />
            </div>
          </div>

          {/* Companies List */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="p-6 bg-white dark:bg-neutral-900 border rounded-2xl animate-pulse h-40"></div>
              ))}
            </div>
          ) : companies.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl p-16 text-center max-w-lg mx-auto">
              <Building2 className="mx-auto h-12 w-12 text-neutral-300 mb-4" />
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">No companies found</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                We have zero mock companies. New firms appear here dynamically as employers sign up and register active jobs.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map((comp) => (
                <div
                  key={comp.id}
                  className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl flex flex-col justify-between hover:border-blue-400 dark:hover:border-blue-500/50 hover:shadow-md transition-all group"
                >
                  <div>
                    <div className="flex gap-4 items-center mb-4">
                      <div className="h-12 w-12 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-150 dark:border-neutral-700 flex items-center justify-center shrink-0">
                        {comp.logoUrl ? (
                          <img src={comp.logoUrl} alt={comp.name} className="h-8 w-8 object-contain rounded" />
                        ) : (
                          <Building2 className="h-6 w-6 text-neutral-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-neutral-900 dark:text-white leading-tight group-hover:text-blue-600 transition-colors">
                          <Link href={`/companies/${comp.slug}`}>{comp.name}</Link>
                        </h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{comp.industry}</p>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed mb-4">
                      {comp.description || "No corporate description registered."}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                      <Briefcase className="h-3.5 w-3.5" /> {comp.activeJobsCount} Active Jobs
                    </span>
                    <Link
                      href={`/companies/${comp.slug}`}
                      className="text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:text-blue-600 inline-flex items-center gap-0.5"
                    >
                      View Profile <ChevronRight className="h-3 w-3" />
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
