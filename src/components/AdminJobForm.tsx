"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle, ArrowRight, ArrowLeft, Save, Sliders, Briefcase, Building2, MapPin } from "lucide-react";

type AdminJobFormProps = {
  initialData?: any;
  jobId?: number;
};

export default function AdminJobForm({ initialData, jobId }: AdminJobFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("basic");

  // Options loaded from DB
  const [companies, setCompanies] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Form Field State
  const [form, setForm] = useState({
    companyId: initialData?.companyId ? String(initialData.companyId) : "",
    categoryId: initialData?.categoryId ? String(initialData.categoryId) : "",
    title: initialData?.title || "",
    sector: initialData?.sector || "IT", // IT, Non-IT
    employmentType: initialData?.employmentType || "Full-time", // Full-time, Part-time, Contract, Internship, Walk-In, Fresher
    experienceLevel: initialData?.experienceLevel || "Fresher", // Fresher, Experienced
    workMode: initialData?.workMode || "Remote", // Remote, Hybrid, On-site
    vacancies: initialData?.vacancies ? String(initialData.vacancies) : "1",
    
    country: initialData?.country || "United States",
    state: initialData?.state || "",
    city: initialData?.city || "",
    address: initialData?.address || "",
    isRemoteEligible: initialData?.isRemoteEligible || false,

    minSalary: initialData?.minSalary ? String(initialData.minSalary) : "",
    maxSalary: initialData?.maxSalary ? String(initialData.maxSalary) : "",
    currency: initialData?.currency || "USD",
    salaryPeriod: initialData?.salaryPeriod || "yearly",
    isSalaryVisible: initialData?.isSalaryVisible || false,

    summary: initialData?.summary || "",
    aboutRole: initialData?.aboutRole || "",
    description: initialData?.description || "",
    responsibilities: initialData?.responsibilities || "",
    eligibility: initialData?.eligibility || "",
    benefits: initialData?.benefits || "",
    hiringProcess: initialData?.hiringProcess || "",
    additionalInfo: initialData?.additionalInfo || "",

    requiredSkills: initialData?.requiredSkills || "",
    preferredSkills: initialData?.preferredSkills || "",

    educationQualification: initialData?.educationQualification || "",
    educationDegree: initialData?.educationDegree || "",
    educationBranch: initialData?.educationBranch || "",
    graduationYear: initialData?.graduationYear ? String(initialData.graduationYear) : "",
    minCgpa: initialData?.minCgpa || "",

    applicationMethod: initialData?.applicationMethod || "INTERNAL", // EXTERNAL_URL, EMAIL, INTERNAL
    applicationUrl: initialData?.applicationUrl || "",
    recruiterEmail: initialData?.recruiterEmail || "",
    applicationDeadline: initialData?.applicationDeadline ? new Date(initialData.applicationDeadline).toISOString().split("T")[0] : "",

    status: initialData?.status || "PUBLISHED", // DRAFT, SCHEDULED, PUBLISHED, EXPIRED, ARCHIVED
    isFeatured: initialData?.isFeatured || false,
    isUrgent: initialData?.isUrgent || false,
    seoTitle: initialData?.seoTitle || "",
    seoDescription: initialData?.seoDescription || "",

    // Walk-In Specific
    walkinDate: initialData?.walkinDate ? new Date(initialData.walkinDate).toISOString().split("T")[0] : "",
    walkinStartTime: initialData?.walkinStartTime || "",
    walkinEndTime: initialData?.walkinEndTime || "",
    walkinVenue: initialData?.walkinVenue || "",
    walkinContactInfo: initialData?.walkinContactInfo || "",
    walkinDocuments: initialData?.walkinDocuments || "",
    walkinInstructions: initialData?.walkinInstructions || "",

    // Government Specific
    govOrganization: initialData?.govOrganization || "",
    govNotificationNumber: initialData?.govNotificationNumber || "",
    govAgeLimit: initialData?.govAgeLimit || "",
    govApplicationFee: initialData?.govApplicationFee || "",
    govSelectionProcess: initialData?.govSelectionProcess || "",
    govOfficialNotificationUrl: initialData?.govOfficialNotificationUrl || "",
    govOfficialWebsiteUrl: initialData?.govOfficialWebsiteUrl || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Duplicate Warning Modal states
  const [duplicateWarning, setDuplicateWarning] = useState<any | null>(null);

  useEffect(() => {
    // Load companies
    fetch("/api/admin/companies")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setCompanies(json.data);
      });

    // Load categories
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setCategories(json.data);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent, force = false) => {
    if (e) e.preventDefault();
    
    // Core validations
    if (!form.companyId || !form.categoryId || !form.title || !form.city || !form.description) {
      setError("Please fill in all core fields (Company, Category, Title, City, and Job Description).");
      setActiveTab("basic");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const payload = {
      ...form,
      force, // Skip duplicate checks if force is enabled
    };

    try {
      const url = jobId ? `/api/admin/jobs/${jobId}` : "/api/admin/jobs";
      const method = jobId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      
      // Handle Duplicate Job Warning
      if (res.status === 409 && json.warning) {
        setDuplicateWarning(json);
        setLoading(false);
        return;
      }

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to persist job details.");
      }

      setSuccess(jobId ? "Job posting updated successfully!" : "New job posting published successfully!");
      setDuplicateWarning(null);

      setTimeout(() => {
        router.push("/admin/jobs");
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Alert indicators */}
      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" /> {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="h-5 w-5 shrink-0" /> {success}
        </div>
      )}

      {/* Tabs list */}
      <div className="flex border-b overflow-x-auto text-xs font-bold tracking-wider uppercase text-neutral-400">
        {[
          { id: "basic", label: "Basic Details" },
          { id: "location", label: "Location" },
          { id: "compensation", label: "Compensation" },
          { id: "content", label: "Role Contents" },
          { id: "requirements", label: "Skills & Education" },
          { id: "application", label: "Application & SEO" },
          { id: "walkin", label: "Walk-In Info" },
          { id: "gov", label: "Government Info" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3.5 border-b-2 shrink-0 transition-colors ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent hover:text-neutral-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6 bg-white dark:bg-neutral-900 border p-6 rounded-2xl">
        
        {/* Tab 1: Basic */}
        {activeTab === "basic" && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-neutral-850 dark:text-neutral-100 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-600" /> Core Position Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Hiring Employer *</label>
                <select
                  required
                  value={form.companyId}
                  onChange={(e) => setForm({ ...form, companyId: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2.5 text-sm"
                >
                  <option value="">-- Choose Corporate Company --</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Industry Category *</label>
                <select
                  required
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2.5 text-sm"
                >
                  <option value="">-- Choose Industry Category --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Job Title / Vacancy Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Senior Frontend Software Engineer"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2.5 text-sm outline-none text-neutral-850 dark:text-neutral-50 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Vacancy Count</label>
                <input
                  type="number"
                  value={form.vacancies}
                  onChange={(e) => setForm({ ...form, vacancies: e.target.value })}
                  placeholder="e.g. 3"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2.5 text-sm outline-none text-neutral-850 dark:text-neutral-50 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Sector *</label>
                <select
                  value={form.sector}
                  onChange={(e) => setForm({ ...form, sector: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2 text-sm"
                >
                  <option value="IT">IT Sector</option>
                  <option value="Non-IT">Non-IT Sector</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Work Mode *</label>
                <select
                  value={form.workMode}
                  onChange={(e) => setForm({ ...form, workMode: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2 text-sm"
                >
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Employment Type *</label>
                <select
                  value={form.employmentType}
                  onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2 text-sm"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                  <option value="Walk-In">Walk-In</option>
                  <option value="Fresher">Fresher Opening</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Experience Level *</label>
                <select
                  value={form.experienceLevel}
                  onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2 text-sm"
                >
                  <option value="Fresher">Fresher (0-1 Years)</option>
                  <option value="Experienced">Experienced</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Location */}
        {activeTab === "location" && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-neutral-850 dark:text-neutral-100 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-red-500" /> Geography Location Parameters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Country *</label>
                <input
                  type="text"
                  required
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  placeholder="e.g. United States"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">State / Province *</label>
                <input
                  type="text"
                  required
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  placeholder="e.g. Texas"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="e.g. Austin"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2.5 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Detailed Venue / Street Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="e.g. 100 Congress Ave Suite 300"
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2.5 text-sm"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isRemoteEligible"
                checked={form.isRemoteEligible}
                onChange={(e) => setForm({ ...form, isRemoteEligible: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="isRemoteEligible" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                This position is eligible for full work-from-home models.
              </label>
            </div>
          </div>
        )}

        {/* Tab 3: Compensation */}
        {activeTab === "compensation" && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-neutral-850 dark:text-neutral-100 flex items-center gap-2">
              💰 Salary & Compensation
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Min Annual / Hourly Salary</label>
                <input
                  type="number"
                  value={form.minSalary}
                  onChange={(e) => setForm({ ...form, minSalary: e.target.value })}
                  placeholder="e.g. 60000"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Max Annual / Hourly Salary</label>
                <input
                  type="number"
                  value={form.maxSalary}
                  onChange={(e) => setForm({ ...form, maxSalary: e.target.value })}
                  placeholder="e.g. 90000"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Currency Period</label>
                <div className="flex gap-2">
                  <select
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    className="flex-1 bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-2 py-2 text-sm"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                  <select
                    value={form.salaryPeriod}
                    onChange={(e) => setForm({ ...form, salaryPeriod: e.target.value })}
                    className="flex-1 bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-2 py-2 text-sm"
                  >
                    <option value="yearly">/ year</option>
                    <option value="monthly">/ month</option>
                    <option value="hourly">/ hour</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isSalaryVisible"
                checked={form.isSalaryVisible}
                onChange={(e) => setForm({ ...form, isSalaryVisible: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="isSalaryVisible" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Show salary ranges on the public job listings and details cards (Salary visibility).
              </label>
            </div>
          </div>
        )}

        {/* Tab 4: Content */}
        {activeTab === "content" && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-neutral-850 dark:text-neutral-100">
              📝 Text Editor Summary & Contents
            </h3>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Short Role Summary</label>
              <textarea
                rows={2}
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                placeholder="Give a quick 1-2 sentence hook for this job card summary..."
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2 text-sm resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Job Description (Rich-Text Markdown Compatible) *</label>
              <textarea
                rows={6}
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Provide full description, overview, team details, technology stack..."
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2 text-sm"
              ></textarea>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Responsibilities & Scope</label>
              <textarea
                rows={4}
                value={form.responsibilities}
                onChange={(e) => setForm({ ...form, responsibilities: e.target.value })}
                placeholder="List core duties (each on a new line)..."
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2 text-sm"
              ></textarea>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">About the Team / Corporate Division</label>
              <textarea
                rows={3}
                value={form.aboutRole}
                onChange={(e) => setForm({ ...form, aboutRole: e.target.value })}
                placeholder="Describe team size, workflow model, work-life balance..."
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2 text-sm resize-none"
              ></textarea>
            </div>
          </div>
        )}

        {/* Tab 5: Requirements */}
        {activeTab === "requirements" && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-neutral-850 dark:text-neutral-100">
              🛠️ Skills Tags & Education Criteria
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Required Core Skills (Comma-separated)</label>
                <input
                  type="text"
                  value={form.requiredSkills}
                  onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })}
                  placeholder="e.g. React, TypeScript, Tailwind CSS, PostgreSQL"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Preferred Stack / Tech (Comma-separated)</label>
                <input
                  type="text"
                  value={form.preferredSkills}
                  onChange={(e) => setForm({ ...form, preferredSkills: e.target.value })}
                  placeholder="e.g. Next.js, Docker, AWS, Drizzle ORM"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2.5 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t">
              <div className="col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Education Degree Requirement</label>
                <input
                  type="text"
                  value={form.educationDegree}
                  onChange={(e) => setForm({ ...form, educationDegree: e.target.value })}
                  placeholder="e.g. B.Tech, B.S., MCA"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Branch / Stream</label>
                <input
                  type="text"
                  value={form.educationBranch}
                  onChange={(e) => setForm({ ...form, educationBranch: e.target.value })}
                  placeholder="e.g. Computer Science"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Min GPA / Marks</label>
                <input
                  type="text"
                  value={form.minCgpa}
                  onChange={(e) => setForm({ ...form, minCgpa: e.target.value })}
                  placeholder="e.g. 3.0 / 4.0 or 60%"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Special Eligibility Criteria & Restrictions</label>
              <textarea
                rows={3}
                value={form.eligibility}
                onChange={(e) => setForm({ ...form, eligibility: e.target.value })}
                placeholder="List special rules, age limits, visa requirements..."
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2 text-sm resize-none"
              ></textarea>
            </div>
          </div>
        )}

        {/* Tab 6: Application & SEO */}
        {activeTab === "application" && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-neutral-850 dark:text-neutral-100">
              ⚡ Application Routing & Search Engine optimization
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Application Method *</label>
                <select
                  value={form.applicationMethod}
                  onChange={(e) => setForm({ ...form, applicationMethod: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2.5 text-sm"
                >
                  <option value="INTERNAL">INTERNAL RESUME (Apply on CareerDiscover)</option>
                  <option value="EXTERNAL_URL">EXTERNAL LINK redirection</option>
                  <option value="EMAIL">EMAIL application (Prefilled Recruit Mail)</option>
                </select>
              </div>

              <div className="col-span-2">
                {form.applicationMethod === "EXTERNAL_URL" && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">External Application URL *</label>
                    <input
                      type="url"
                      required
                      value={form.applicationUrl}
                      onChange={(e) => setForm({ ...form, applicationUrl: e.target.value })}
                      placeholder="https://acme.com/careers/job-apply"
                      className="w-full bg-neutral-50 dark:bg-neutral-800 border border-blue-200 rounded-xl px-3 py-2 text-sm"
                    />
                  </div>
                )}

                {form.applicationMethod === "EMAIL" && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Hiring Recruiter Email *</label>
                    <input
                      type="email"
                      required
                      value={form.recruiterEmail}
                      onChange={(e) => setForm({ ...form, recruiterEmail: e.target.value })}
                      placeholder="hiring@acme.com"
                      className="w-full bg-neutral-50 dark:bg-neutral-800 border border-blue-200 rounded-xl px-3 py-2 text-sm"
                    />
                  </div>
                )}

                {form.applicationMethod === "INTERNAL" && (
                  <div className="bg-blue-50/50 p-3 rounded-xl border border-dashed border-blue-200 text-xs text-blue-800">
                    👍 Safe and automated first-party option! Candidates submit standard PDF links, stored securely inside PostgreSQL for recruiters.
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Application Deadline</label>
                <input
                  type="date"
                  value={form.applicationDeadline}
                  onChange={(e) => setForm({ ...form, applicationDeadline: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Publishing Status *</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2 text-sm"
                >
                  <option value="PUBLISHED">PUBLISHED (Instantly visible on portal)</option>
                  <option value="DRAFT">DRAFT (Hidden, pending admin edits)</option>
                  <option value="EXPIRED">EXPIRED (Archived from listings)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Custom SEO Meta Title</label>
                <input
                  type="text"
                  value={form.seoTitle}
                  onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                  placeholder="e.g. Senior Node.js Developer | Acme Careers"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Custom SEO Meta Description</label>
                <input
                  type="text"
                  value={form.seoDescription}
                  onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                  placeholder="Summarize posting details for Google SERP crawls..."
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: Walk-In Drive Specific */}
        {activeTab === "walkin" && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-neutral-850 dark:text-neutral-100">
              🚶 Walk-In Direct Spot Hiring Venue & Timing (Optional)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Walk-In Date</label>
                <input
                  type="date"
                  value={form.walkinDate}
                  onChange={(e) => setForm({ ...form, walkinDate: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Interview Start Time</label>
                <input
                  type="text"
                  value={form.walkinStartTime}
                  onChange={(e) => setForm({ ...form, walkinStartTime: e.target.value })}
                  placeholder="e.g. 09:30 AM"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Interview End Time</label>
                <input
                  type="text"
                  value={form.walkinEndTime}
                  onChange={(e) => setForm({ ...form, walkinEndTime: e.target.value })}
                  placeholder="e.g. 04:30 PM"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Walk-In Exact Venue / Campus Hall</label>
              <input
                type="text"
                value={form.walkinVenue}
                onChange={(e) => setForm({ ...form, walkinVenue: e.target.value })}
                placeholder="e.g. Block C, Tech Hub Conference Room, Austin, TX"
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Required Physical Documents</label>
                <input
                  type="text"
                  value={form.walkinDocuments}
                  onChange={(e) => setForm({ ...form, walkinDocuments: e.target.value })}
                  placeholder="e.g. 3 printed resumes, Gov photo ID card, Degree copies"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Walk-In Contact Phone / HR Helpline</label>
                <input
                  type="text"
                  value={form.walkinContactInfo}
                  onChange={(e) => setForm({ ...form, walkinContactInfo: e.target.value })}
                  placeholder="e.g. Recruiting Desk: +1 (512) 555-0100"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Walk-In Instructions & Rules</label>
              <textarea
                rows={3}
                value={form.walkinInstructions}
                onChange={(e) => setForm({ ...form, walkinInstructions: e.target.value })}
                placeholder="e.g. Smart casual dress code. Arrive 15 minutes before timings..."
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2 text-sm resize-none"
              ></textarea>
            </div>
          </div>
        )}

        {/* Tab 8: Government Sectors */}
        {activeTab === "gov" && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-neutral-850 dark:text-neutral-100">
              🏛️ Government & Public Sector Official Specific Fields (Optional)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Public Organization / Board</label>
                <input
                  type="text"
                  value={form.govOrganization}
                  onChange={(e) => setForm({ ...form, govOrganization: e.target.value })}
                  placeholder="e.g. Department of Energy, State Civil Board"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Notification / Gazette Reference Number</label>
                <input
                  type="text"
                  value={form.govNotificationNumber}
                  onChange={(e) => setForm({ ...form, govNotificationNumber: e.target.value })}
                  placeholder="e.g. GAZETTE-DE-2026-904"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2.5 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Official Notification PDF Link</label>
                <input
                  type="url"
                  value={form.govOfficialNotificationUrl}
                  onChange={(e) => setForm({ ...form, govOfficialNotificationUrl: e.target.value })}
                  placeholder="https://stateboards.gov/notif.pdf"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Official Department Website Portal</label>
                <input
                  type="url"
                  value={form.govOfficialWebsiteUrl}
                  onChange={(e) => setForm({ ...form, govOfficialWebsiteUrl: e.target.value })}
                  placeholder="https://stateboards.gov"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2.5 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Government Age Limits</label>
                <input
                  type="text"
                  value={form.govAgeLimit}
                  onChange={(e) => setForm({ ...form, govAgeLimit: e.target.value })}
                  placeholder="e.g. 18 to 35 Years"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Application Fee Details</label>
                <input
                  type="text"
                  value={form.govApplicationFee}
                  onChange={(e) => setForm({ ...form, govApplicationFee: e.target.value })}
                  placeholder="e.g. General: $50, Reserve: Waived"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Selection Test/Exam Process</label>
                <input
                  type="text"
                  value={form.govSelectionProcess}
                  onChange={(e) => setForm({ ...form, govSelectionProcess: e.target.value })}
                  placeholder="e.g. Preliminary Screening followed by Written Exam"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Form Controls / Navigation Footer */}
        <div className="flex justify-between items-center pt-6 border-t">
          <div className="text-xs text-neutral-400 font-medium">
            * Indicates required core input fields.
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => router.push("/admin/jobs")}
              className="px-4 py-2 border rounded-xl text-xs font-semibold text-neutral-500 hover:bg-neutral-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Save className="h-4 w-4" />
              {loading ? "Saving Posting..." : jobId ? "Save Posting" : "Publish Posting"}
            </button>
          </div>
        </div>

      </form>

      {/* Duplicate Alert Modal */}
      {duplicateWarning && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 mb-4">
              <AlertCircle className="h-6 w-6" />
            </div>
            
            <h4 className="text-lg font-extrabold text-neutral-900 dark:text-white mb-2">
              Possible Duplicate Job Detected
            </h4>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 leading-relaxed">
              {duplicateWarning.message}
            </p>

            <div className="flex gap-2 justify-end pt-4 border-t">
              <button
                type="button"
                onClick={() => setDuplicateWarning(null)}
                className="px-4 py-2 text-neutral-500 hover:text-neutral-700 text-xs font-bold cursor-pointer"
              >
                No, Go Back
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                className="px-5 py-2.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl text-xs font-extrabold cursor-pointer"
              >
                Yes, Post Anyway
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
