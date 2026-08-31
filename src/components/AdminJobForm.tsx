"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Save,
  Sliders,
  Briefcase,
  Building2,
  MapPin,
  Link2,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useClickOutside } from "@/lib/hooks/useClickOutside";

const INDIA_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const SECTOR_OPTIONS = [
  "IT",
  "Non-IT",
  "Government",
  "Private",
  "Public Sector Undertaking (PSU)",
  "Banking & Finance",
  "Healthcare",
  "Education",
  "BPO / KPO",
  "Manufacturing",
  "Retail & E-commerce",
  "Construction & Real Estate",
  "Hospitality & Travel",
  "Media & Entertainment",
  "NGO / Non-Profit",
];

const POPULAR_INDIAN_CITIES = [
  "Ahmedabad",
  "Amritsar",
  "Bengaluru",
  "Bhopal",
  "Bhubaneswar",
  "Chandigarh",
  "Chennai",
  "Coimbatore",
  "Dehradun",
  "Delhi",
  "Faridabad",
  "Ghaziabad",
  "Gandhinagar",
  "Goa",
  "Gurugram",
  "Guwahati",
  "Hyderabad",
  "Indore",
  "Jaipur",
  "Jammu",
  "Jamshedpur",
  "Kanpur",
  "Kochi",
  "Kolkata",
  "Kozhikode",
  "Lucknow",
  "Ludhiana",
  "Madurai",
  "Mangaluru",
  "Meerut",
  "Mumbai",
  "Mysuru",
  "Nagpur",
  "Nashik",
  "Noida",
  "Patna",
  "Pimpri-Chinchwad",
  "Pune",
  "Raipur",
  "Rajkot",
  "Ranchi",
  "Salem",
  "Surat",
  "Thiruvananthapuram",
  "Thrissur",
  "Tiruchirappalli",
  "Udaipur",
  "Vadodara",
  "Varanasi",
  "Vijayawada",
  "Visakhapatnam",
  "Warangal",
];

type AdminJobFormProps = {
  initialData?: any;
  jobId?: number;
};

export default function AdminJobForm({
  initialData,
  jobId,
}: AdminJobFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("basic");

  // Options loaded from DB
  const [companies, setCompanies] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [sectorDropdownOpen, setSectorDropdownOpen] = useState(false);

  // Refs for the wrapper (input + options list) of each custom
  // autocomplete dropdown, so we can detect outside clicks per Part 8.
  const companyDropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const sectorDropdownRef = useRef<HTMLDivElement>(null);
  const stateDropdownRef = useRef<HTMLDivElement>(null);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(companyDropdownRef, companyDropdownOpen, () =>
    setCompanyDropdownOpen(false),
  );
  useClickOutside(categoryDropdownRef, categoryDropdownOpen, () =>
    setCategoryDropdownOpen(false),
  );
  useClickOutside(sectorDropdownRef, sectorDropdownOpen, () =>
    setSectorDropdownOpen(false),
  );
  useClickOutside(stateDropdownRef, stateDropdownOpen, () =>
    setStateDropdownOpen(false),
  );
  useClickOutside(cityDropdownRef, cityDropdownOpen, () =>
    setCityDropdownOpen(false),
  );

  // Opening one autocomplete should close the others (Part 8).
  const openCompanyDropdown = () => {
    setCategoryDropdownOpen(false);
    setSectorDropdownOpen(false);
    setStateDropdownOpen(false);
    setCityDropdownOpen(false);
    setCompanyDropdownOpen(true);
  };
  const openCategoryDropdown = () => {
    setCompanyDropdownOpen(false);
    setSectorDropdownOpen(false);
    setStateDropdownOpen(false);
    setCityDropdownOpen(false);
    setCategoryDropdownOpen(true);
  };
  const openSectorDropdown = () => {
    setCompanyDropdownOpen(false);
    setCategoryDropdownOpen(false);
    setStateDropdownOpen(false);
    setCityDropdownOpen(false);
    setSectorDropdownOpen(true);
  };
  const openStateDropdown = () => {
    setCompanyDropdownOpen(false);
    setCategoryDropdownOpen(false);
    setSectorDropdownOpen(false);
    setCityDropdownOpen(false);
    setStateDropdownOpen(true);
  };
  const openCityDropdown = () => {
    setCompanyDropdownOpen(false);
    setCategoryDropdownOpen(false);
    setSectorDropdownOpen(false);
    setStateDropdownOpen(false);
    setCityDropdownOpen(true);
  };

  // Form Field State
  const [form, setForm] = useState({
    companyId: initialData?.companyId ? String(initialData.companyId) : "",
    companyName: initialData?.companyName || "",
    categoryId: initialData?.categoryId ? String(initialData.categoryId) : "",
    categoryName: initialData?.categoryName || "",
    title: initialData?.title || "",
    sector: initialData?.sector || "IT", // free text now — see SECTOR_OPTIONS for suggestions
    employmentType: initialData?.employmentType || "Full-time", // Full-time, Part-time, Contract, Internship, Walk-In, Fresher
    experienceLevel: initialData?.experienceLevel || "Fresher", // Fresher, Experienced
    minExperienceYears: initialData?.minExperienceYears
      ? String(initialData.minExperienceYears)
      : "",
    maxExperienceYears: initialData?.maxExperienceYears
      ? String(initialData.maxExperienceYears)
      : "",
    workMode: initialData?.workMode || "Remote", // Remote, Hybrid, On-site
    vacancies: initialData?.vacancies ? String(initialData.vacancies) : "",

    country: initialData?.country || "India",
    state: initialData?.state || "",
    city: initialData?.city || "",
    address: initialData?.address || "",
    isRemoteEligible: initialData?.isRemoteEligible || false,

    minSalary: initialData?.minSalary ? String(initialData.minSalary) : "",
    maxSalary: initialData?.maxSalary ? String(initialData.maxSalary) : "",
    currency: initialData?.currency || "INR",
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
    graduationYear: initialData?.graduationYear
      ? String(initialData.graduationYear)
      : "",
    minCgpa: initialData?.minCgpa || "",

    applicationMethod: initialData?.applicationMethod || "INTERNAL", // EXTERNAL_URL, EMAIL, INTERNAL
    applicationUrl: initialData?.applicationUrl || "",
    recruiterEmail: initialData?.recruiterEmail || "",
    applicationDeadline: initialData?.applicationDeadline
      ? new Date(initialData.applicationDeadline).toISOString().split("T")[0]
      : "",

    status: initialData?.status || "PUBLISHED", // DRAFT, SCHEDULED, PUBLISHED, EXPIRED, ARCHIVED
    isFeatured: initialData?.isFeatured || false,
    isUrgent: initialData?.isUrgent || false,
    seoTitle: initialData?.seoTitle || "",
    seoDescription: initialData?.seoDescription || "",

    // Walk-In Specific
    walkinDate: initialData?.walkinDate
      ? new Date(initialData.walkinDate).toISOString().split("T")[0]
      : "",
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

    // Source tracking (Part 25) — every job identifies how it was created.
    sourceType: initialData?.externalSource || "MANUAL",
    externalJobId: initialData?.externalId || "",
    originalJobUrl: initialData?.originalJobUrl || "",
    originalApplyUrl: initialData?.originalApplyUrl || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Paste-a-URL-to-autofill state
  const [extractUrl, setExtractUrl] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extractWarnings, setExtractWarnings] = useState<string[]>([]);
  const [extractSource, setExtractSource] = useState<{
    sourceName: string;
    originalJobUrl: string;
  } | null>(null);
  const [extractedFields, setExtractedFields] = useState<{
    title: boolean;
    companyName: boolean;
    city: boolean;
    employmentType: boolean;
    minSalary: boolean;
    applicationDeadline: boolean;
    description: boolean;
    requiredSkills: boolean;
  } | null>(null);
  const [importDuplicate, setImportDuplicate] = useState<{
    id: number;
    title: string;
    companyName: string;
    city: string;
    status: string;
    slug: string;
  } | null>(null);
  const [duplicateAcknowledged, setDuplicateAcknowledged] = useState(false);

  // Duplicate Warning Modal states
  const [duplicateWarning, setDuplicateWarning] = useState<any | null>(null);

 useEffect(() => {
  // Load companies
  fetch("/api/admin/companies?all=true")
    .then((res) => res.json())
    .then((json) => {
      if (json.success) {
        const companyList = json.data || [];

        setCompanies(companyList);

        // When editing an existing job, populate company name
        // using the companyId stored in the job record (fallback in
        // case the initial join didn't resolve a name).
        if (initialData?.companyId && !initialData?.companyName) {
          const existingCompany = companyList.find(
            (company: any) =>
              String(company.id) === String(initialData.companyId),
          );

          if (existingCompany) {
            setForm((prev) => ({
              ...prev,
              companyName: existingCompany.name,
              companyId: String(existingCompany.id),
            }));
          }
        }
      }
    })
    .catch((error) => {
      console.error("Failed to load companies:", error);
    });

  // Load categories
  fetch("/api/admin/categories?all=true")
    .then((res) => res.json())
    .then((json) => {
      if (json.success) {
        const categoryList = json.data || [];

        setCategories(categoryList);

        // Same fallback for category.
        if (initialData?.categoryId && !initialData?.categoryName) {
          const existingCategory = categoryList.find(
            (category: any) =>
              String(category.id) === String(initialData.categoryId),
          );

          if (existingCategory) {
            setForm((prev) => ({
              ...prev,
              categoryName: existingCategory.name,
              categoryId: String(existingCategory.id),
            }));
          }
        }
      }
    })
    .catch((error) => {
      console.error("Failed to load categories:", error);
    });
}, [initialData]);

  const handleExtractFromUrl = async () => {
    if (!extractUrl.trim()) return;

    setExtracting(true);
    setExtractError(null);
    setExtractWarnings([]);
    setExtractSource(null);
    setExtractedFields(null);
    setImportDuplicate(null);
    setDuplicateAcknowledged(false);

    try {
      const res = await fetch("/api/admin/jobs/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: extractUrl.trim() }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setExtractError(json.error || "Extraction failed.");
        return;
      }

      const data = json.data;

      setExtractSource({
        sourceName: data.sourceName,
        originalJobUrl: data.originalJobUrl,
      });
      setExtractWarnings(data.warnings || []);
      setExtractedFields({
        title: Boolean(data.title),
        companyName: Boolean(data.companyName),
        city: Boolean(data.city),
        employmentType: Boolean(data.employmentType),
        minSalary: Boolean(data.minSalary),
        applicationDeadline: Boolean(data.applicationDeadline),
        description: Boolean(data.description),
        requiredSkills: Boolean(data.requiredSkills),
      });

      if (json.duplicate) {
        setImportDuplicate(json.duplicate);
      }

      // Only overwrite fields we actually got a value for — never
      // blank out something the admin may have already typed.
      setForm((prev) => {
        const next = { ...prev };

        if (data.title) next.title = data.title;
        if (data.companyName) {
          next.companyName = data.companyName;

          const existingCompany = companies.find(
            (c) =>
              c.name.trim().toLowerCase() ===
              data.companyName.trim().toLowerCase(),
          );
          next.companyId = existingCompany ? String(existingCompany.id) : "";
        }
        if (data.categoryName) {
          next.categoryName = data.categoryName;

          const existingCategory = categories.find(
            (c) =>
              c.name.trim().toLowerCase() ===
              data.categoryName.trim().toLowerCase(),
          );
          next.categoryId = existingCategory ? String(existingCategory.id) : "";
        }
        if (data.description) next.description = data.description;
        if (data.city) next.city = data.city;
        if (data.state) next.state = data.state;
        if (data.country) next.country = data.country;
        if (data.employmentType) next.employmentType = data.employmentType;
        if (data.experienceLevel) next.experienceLevel = data.experienceLevel;
        if (data.minExperienceYears) next.minExperienceYears = String(data.minExperienceYears);
        if (data.maxExperienceYears) next.maxExperienceYears = String(data.maxExperienceYears);
        if (data.workMode) next.workMode = data.workMode;
        if (data.isRemoteEligible) next.isRemoteEligible = true;
        if (data.minSalary) next.minSalary = String(data.minSalary);
        if (data.maxSalary) next.maxSalary = String(data.maxSalary);
        if (data.currency) next.currency = data.currency;
        if (data.salaryPeriod) next.salaryPeriod = data.salaryPeriod;
        if (data.requiredSkills) next.requiredSkills = data.requiredSkills;
        if (data.responsibilities) next.responsibilities = data.responsibilities;
        if (data.benefits) next.benefits = data.benefits;
        if (data.summary) next.summary = data.summary;
        // Auto-generated from what was actually extracted — never
        // overwrites an SEO title/description the admin already typed.
        if (data.seoTitle && !prev.seoTitle) next.seoTitle = data.seoTitle;
        if (data.seoDescription && !prev.seoDescription) {
          next.seoDescription = data.seoDescription;
        }
        if (data.applicationDeadline) {
          next.applicationDeadline = new Date(data.applicationDeadline)
            .toISOString()
            .split("T")[0];
        }

        // The apply link should be the source's own apply URL when
        // known, otherwise the page the admin pasted.
        next.applicationMethod = "EXTERNAL_URL";
        next.applicationUrl = data.originalApplyUrl || data.applicationUrl || extractUrl.trim();

        // Never let an apparently-expired posting default to Publish —
        // force it to Draft so the admin has to make a conscious choice.
        if (data.isLikelyExpired) {
          next.status = "DRAFT";
        }

        // Source provenance — never fabricated, always what the connector reported.
        next.sourceType = data.sourceType;
        next.externalJobId = data.externalJobId || "";
        next.originalJobUrl = data.originalJobUrl;
        next.originalApplyUrl = data.originalApplyUrl || "";

        return next;
      });
    } catch (err) {
      setExtractError(
        "Something went wrong reaching that page. Please fill the form manually.",
      );
    } finally {
      setExtracting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, force = false) => {
    if (e) e.preventDefault();

    // Core validations
    const missingFields: string[] = [];

    if (!form.companyName.trim()) {
      missingFields.push("Company");
    }

    if (!form.categoryName.trim()) {
      missingFields.push("Category");
    }

    if (!form.title.trim()) {
      missingFields.push("Title");
    }

    if (!form.city.trim()) {
      missingFields.push("City");
    }

    if (missingFields.length > 0) {
      setError(`Please fill in: ${missingFields.join(", ")}`);
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

      setSuccess(
        jobId
          ? "Job posting updated successfully!"
          : "New job posting published successfully!",
      );
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
        <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-md text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" /> {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 p-4 rounded-md text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="h-5 w-5 shrink-0" /> {success}
        </div>
      )}

      {/* Quick Import Job — only offered for brand new jobs. Reads
          Greenhouse/Lever/Ashby's own public APIs when the URL matches
          one of them, otherwise schema.org/JobPosting structured data
          (the same data Google for Jobs reads), with an OpenGraph
          fallback for pages with neither. Always leaves the form
          editable — nothing here auto-publishes or auto-creates a
          company/category until the admin actually saves the job. */}
      {!jobId && (
        <div className="rounded-lg border border-dashed border-[var(--color-primary)]/40 bg-[var(--color-primary-light)]/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-[var(--color-primary)]" />
            <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
              Quick Import Job
            </h3>
          </div>

          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-3">
            Paste the official/public job posting URL and we&apos;ll try to
            fill the details automatically. You can review and edit
            everything before saving — or just skip this and use manual
            entry below.
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="url"
                value={extractUrl}
                onChange={(e) => setExtractUrl(e.target.value)}
                placeholder="https://company.com/careers/job/software-engineer"
                className="w-full bg-white dark:bg-neutral-800 border rounded-md pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <button
              type="button"
              onClick={handleExtractFromUrl}
              disabled={extracting || !extractUrl.trim()}
              className="app-button-primary px-4 py-2.5 text-sm shrink-0 disabled:opacity-50 inline-flex items-center gap-1.5 justify-center"
            >
              {extracting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Fetching job details...
                </>
              ) : (
                "Fetch Job Details"
              )}
            </button>
          </div>

          {extractSource && (
            <div className="mt-3 rounded-md bg-white/70 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700 p-3 space-y-1">
              <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle className="h-3.5 w-3.5" /> Job details imported — review below before saving.
              </p>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                Source: {extractSource.sourceName}
              </p>
              <p className="text-[10px] text-neutral-400 truncate">
                Original URL: {extractSource.originalJobUrl}
              </p>
            </div>
          )}

          {extractedFields && (
            <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
              {[
                { key: "title", label: "Job title" },
                { key: "companyName", label: "Company" },
                { key: "city", label: "Location" },
                { key: "employmentType", label: "Employment type" },
                { key: "minSalary", label: "Salary" },
                { key: "applicationDeadline", label: "Application deadline" },
                { key: "requiredSkills", label: "Skills" },
              ].map((field) => {
                const found = extractedFields[field.key as keyof typeof extractedFields];
                return (
                  <li
                    key={field.key}
                    className={`text-[11px] flex items-center gap-1 ${
                      found ? "text-emerald-600" : "text-neutral-400"
                    }`}
                  >
                    {found ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <AlertCircle className="h-3 w-3" />
                    )}
                    {field.label} {found ? "detected" : "not found"}
                  </li>
                );
              })}
            </ul>
          )}

          {extractWarnings.length > 0 && (
            <ul className="mt-2 space-y-1">
              {extractWarnings.map((warning, i) => (
                <li
                  key={i}
                  className="text-[11px] font-semibold text-amber-600 flex items-start gap-1"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-px" /> {warning}
                </li>
              ))}
            </ul>
          )}

          {extractError && (
            <p className="mt-2 text-[11px] font-semibold text-red-600 flex items-start gap-1">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-px" /> {extractError}
            </p>
          )}

          {importDuplicate && !duplicateAcknowledged && (
            <div className="mt-3 rounded-md border border-amber-300 bg-amber-50 dark:bg-amber-950/20 p-3">
              <p className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-1">
                Possible duplicate job found
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 mb-2">
                {importDuplicate.title} — {importDuplicate.companyName} — {importDuplicate.city} (
                {importDuplicate.status})
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={`/admin/jobs/edit/${importDuplicate.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold px-3 py-1.5 rounded-md border border-amber-300 bg-white dark:bg-neutral-900 text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition-colors"
                >
                  View Existing Job
                </a>
                <button
                  type="button"
                  onClick={() => setDuplicateAcknowledged(true)}
                  className="text-[11px] font-bold px-3 py-1.5 rounded-md border border-amber-300 bg-white dark:bg-neutral-900 text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition-colors"
                >
                  Create Anyway
                </button>
              </div>
            </div>
          )}

          <p className="mt-2 text-[10px] text-neutral-400">
            Works best with Greenhouse, Lever, Ashby, and pages that publish
            structured job data (LinkedIn, Indeed, Naukri, most company
            career pages). Nothing is saved until you click Create Draft or
            Publish below.
          </p>
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
                ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                : "border-transparent hover:text-neutral-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => handleSubmit(e, false)}
        className="space-y-6 bg-white dark:bg-neutral-900 border p-6 rounded-lg"
      >
        {/* Tab 1: Basic */}
        {activeTab === "basic" && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-neutral-850 dark:text-neutral-100 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-[var(--color-primary)]" /> Core Position
              Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative" ref={companyDropdownRef}>
                <label
                  htmlFor="companyName"
                  className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1"
                >
                  Hiring Employer *
                </label>

                <input
                  id="companyName"
                  type="text"
                  required
                  value={form.companyName}
                  onFocus={openCompanyDropdown}
                  onChange={(e) => {
                    const value = e.target.value;

                    const existingCompany = companies.find(
                      (company) =>
                        company.name.trim().toLowerCase() ===
                        value.trim().toLowerCase(),
                    );

                    setForm({
                      ...form,
                      companyName: value,
                      companyId: existingCompany
                        ? String(existingCompany.id)
                        : "",
                    });

                    openCompanyDropdown();
                  }}
                  placeholder="Select existing company or type a new company name"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-md px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
                />

                {companyDropdownOpen && (
                  <div className="absolute z-50 left-0 right-0 mt-1 max-h-40 overflow-y-auto rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg">
                    {companies
                      .filter((company) =>
                        company.name
                          .toLowerCase()
                          .includes(form.companyName.toLowerCase()),
                      )
                      .map((company) => (
                        <button
                          key={company.id}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setForm({
                              ...form,
                              companyName: company.name,
                              companyId: String(company.id),
                            });

                            setCompanyDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        >
                          {company.name}
                        </button>
                      ))}

                    {companies.filter((company) =>
                      company.name
                        .toLowerCase()
                        .includes(form.companyName.toLowerCase()),
                    ).length === 0 && (
                      <div className="px-3 py-2 text-xs text-neutral-400">
                        No existing company found. You can create&ldquo;
                        {form.companyName}&ldquo;.
                      </div>
                    )}
                  </div>
                )}

                <p className="mt-1 text-[10px] text-neutral-400">
                  Select an existing company or type a new company name. New
                  companies will be created automatically when the job is
                  published.
                </p>
              </div>
              <div className="relative" ref={categoryDropdownRef}>
                <label
                  htmlFor="categoryName"
                  className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1"
                >
                  Industry Category *
                </label>

                <input
                  id="categoryName"
                  type="text"
                  required
                  value={form.categoryName}
                  onFocus={openCategoryDropdown}
                  onChange={(e) => {
                    const value = e.target.value;

                    const existingCategory = categories.find(
                      (category) =>
                        category.name.trim().toLowerCase() ===
                        value.trim().toLowerCase(),
                    );

                    setForm({
                      ...form,
                      categoryName: value,
                      categoryId: existingCategory
                        ? String(existingCategory.id)
                        : "",
                    });

                    openCategoryDropdown();
                  }}
                  placeholder="Select existing category or type a new one"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-md px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
                />

                {categoryDropdownOpen && (
                  <div className="absolute z-50 left-0 right-0 mt-1 max-h-40 overflow-y-auto rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg">
                    {categories
                      .filter((category) =>
                        category.name
                          .toLowerCase()
                          .includes(form.categoryName.toLowerCase()),
                      )
                      .map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setForm({
                              ...form,
                              categoryName: category.name,
                              categoryId: String(category.id),
                            });

                            setCategoryDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        >
                          {category.name}
                        </button>
                      ))}

                    {categories.filter((category) =>
                      category.name
                        .toLowerCase()
                        .includes(form.categoryName.toLowerCase()),
                    ).length === 0 &&
                      form.categoryName.trim() !== "" && (
                        <div className="px-3 py-2 text-xs text-neutral-400">
                          No existing category found. You can create &ldquo;
                          {form.categoryName}&rdquo;.
                        </div>
                      )}
                  </div>
                )}

                <p className="mt-1 text-[10px] text-neutral-400">
                  Select an existing category or type a new one. New
                  categories will be created automatically.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Job Title / Vacancy Title *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Senior Frontend Software Engineer"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-md px-3 py-2.5 text-sm outline-none text-neutral-850 dark:text-neutral-50 focus:border-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Vacancy Count
                </label>
                <input
                  type="number"
                  value={form.vacancies}
                  onChange={(e) =>
                    setForm({ ...form, vacancies: e.target.value })
                  }
                  placeholder="e.g. 3"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-md px-3 py-2.5 text-sm outline-none text-neutral-850 dark:text-neutral-50 focus:border-[var(--color-primary)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="relative" ref={sectorDropdownRef}>
                <label
                  htmlFor="sector"
                  className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1"
                >
                  Sector *
                </label>

                <input
                  id="sector"
                  type="text"
                  required
                  value={form.sector}
                  onFocus={openSectorDropdown}
                  onChange={(e) => {
                    setForm({ ...form, sector: e.target.value });
                    openSectorDropdown();
                  }}
                  placeholder="Type or select a sector"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-md px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
                />

                {sectorDropdownOpen && (
                  <div className="absolute z-50 left-0 right-0 mt-1 max-h-40 overflow-y-auto rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg">
                    {SECTOR_OPTIONS.filter((option) =>
                      option.toLowerCase().includes(form.sector.toLowerCase()),
                    ).map((option) => (
                      <button
                        key={option}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setForm({ ...form, sector: option });
                          setSectorDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      >
                        {option}
                      </button>
                    ))}

                    {SECTOR_OPTIONS.filter((option) =>
                      option.toLowerCase().includes(form.sector.toLowerCase()),
                    ).length === 0 &&
                      form.sector.trim() !== "" && (
                        <div className="px-3 py-2 text-xs text-neutral-400">
                          Using custom sector &ldquo;{form.sector}&rdquo;.
                        </div>
                      )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Work Mode *
                </label>
                <select
                  value={form.workMode}
                  onChange={(e) =>
                    setForm({ ...form, workMode: e.target.value })
                  }
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-md px-3 py-2 text-sm"
                >
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Employment Type *
                </label>
                <select
                  value={form.employmentType}
                  onChange={(e) =>
                    setForm({ ...form, employmentType: e.target.value })
                  }
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-md px-3 py-2 text-sm"
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
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Experience Level *
                </label>
                <select
                  value={form.experienceLevel}
                  onChange={(e) =>
                    setForm({ ...form, experienceLevel: e.target.value })
                  }
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-md px-3 py-2 text-sm"
                >
                  <option value="Fresher">Fresher (0-1 Years)</option>
                  <option value="Experienced">Experienced</option>
                </select>
              </div>
            </div>

            {form.experienceLevel === "Experienced" && (
              <div className="grid grid-cols-2 gap-4 rounded-md border border-dashed border-neutral-200 dark:border-neutral-700 p-3 bg-neutral-50/50 dark:bg-neutral-800/30">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Min Years of Experience
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={form.minExperienceYears}
                    onChange={(e) =>
                      setForm({ ...form, minExperienceYears: e.target.value })
                    }
                    placeholder="e.g. 2"
                    className="w-full bg-white dark:bg-neutral-800 border rounded-md px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Max Years of Experience
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={form.maxExperienceYears}
                    onChange={(e) =>
                      setForm({ ...form, maxExperienceYears: e.target.value })
                    }
                    placeholder="e.g. 5"
                    className="w-full bg-white dark:bg-neutral-800 border rounded-md px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
                  />
                </div>

                <p className="col-span-2 text-[10px] text-neutral-400">
                  Optional — leave blank if the years required aren&apos;t fixed. Fill just one to show &quot;3+ years&quot; style ranges.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Location */}
        {activeTab === "location" && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-neutral-850 dark:text-neutral-100 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-red-500" /> Geography Location
              Parameters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Country */}
              <div>
                <label
                  htmlFor="country"
                  className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1"
                >
                  Country *
                </label>

                <input
                  id="country"
                  type="text"
                  required
                  value={form.country}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      country: e.target.value,
                    })
                  }
                  placeholder="e.g. India"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-md px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              {/* State */}
              <div className="relative" ref={stateDropdownRef}>
                <label
                  htmlFor="state"
                  className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1"
                >
                  State / Province *
                </label>

                <input
                  id="state"
                  type="text"
                  required
                  value={form.state}
                  onFocus={openStateDropdown}
                  onChange={(e) => {
                    const value = e.target.value;

                    setForm({
                      ...form,
                      state: value,
                    });

                    openStateDropdown();
                  }}
                  placeholder="Type or select a state"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-md px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
                />

                {stateDropdownOpen && (
                  <div className="absolute z-50 left-0 right-0 mt-1 max-h-40 overflow-y-auto rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg">
                    {INDIA_STATES.filter((state) =>
                      state.toLowerCase().includes(form.state.toLowerCase()),
                    ).map((state) => (
                      <button
                        key={state}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setForm({
                            ...form,
                            state,
                          });

                          setStateDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      >
                        {state}
                      </button>
                    ))}

                    {INDIA_STATES.filter((state) =>
                      state.toLowerCase().includes(form.state.toLowerCase()),
                    ).length === 0 && (
                      <div className="px-3 py-2 text-xs text-neutral-400">
                        No matching state
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* City */}
              <div className="relative" ref={cityDropdownRef}>
                <label
                  htmlFor="city"
                  className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1"
                >
                  City *
                </label>

                <input
                  id="city"
                  type="text"
                  required
                  value={form.city}
                  onFocus={openCityDropdown}
                  onChange={(e) => {
                    const value = e.target.value;

                    setForm({
                      ...form,
                      city: value,
                    });

                    openCityDropdown();
                  }}
                  placeholder="Type or select a city"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-md px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
                />

                {cityDropdownOpen && (
                  <div className="absolute z-50 left-0 right-0 mt-1 max-h-40 overflow-y-auto rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg">
                    {POPULAR_INDIAN_CITIES.filter((city) =>
                      city.toLowerCase().includes(form.city.toLowerCase()),
                    ).map((city) => (
                      <button
                        key={city}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setForm({
                            ...form,
                            city,
                          });

                          setCityDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      >
                        {city}
                      </button>
                    ))}

                    {POPULAR_INDIAN_CITIES.filter((city) =>
                      city.toLowerCase().includes(form.city.toLowerCase()),
                    ).length === 0 && (
                      <div className="px-3 py-2 text-xs text-neutral-400">
                        No matching city
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                Detailed Venue / Street Address
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="e.g. 100 Congress Ave Suite 300"
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-md px-3 py-2.5 text-sm"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isRemoteEligible"
                checked={form.isRemoteEligible}
                onChange={(e) =>
                  setForm({ ...form, isRemoteEligible: e.target.checked })
                }
                className="rounded"
              />
              <label
                htmlFor="isRemoteEligible"
                className="text-xs font-semibold text-neutral-700 dark:text-neutral-300"
              >
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
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Min Annual / Hourly Salary
                </label>
                <input
                  type="number"
                  value={form.minSalary}
                  onChange={(e) =>
                    setForm({ ...form, minSalary: e.target.value })
                  }
                  placeholder="e.g. 60000"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-md px-3 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Max Annual / Hourly Salary
                </label>
                <input
                  type="number"
                  value={form.maxSalary}
                  onChange={(e) =>
                    setForm({ ...form, maxSalary: e.target.value })
                  }
                  placeholder="e.g. 90000"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-md px-3 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Currency Period
                </label>
                <div className="flex gap-2">
                  <select
                    value={form.currency}
                    onChange={(e) =>
                      setForm({ ...form, currency: e.target.value })
                    }
                    className="flex-1 bg-neutral-50 dark:bg-neutral-800 border rounded-md px-2 py-2 text-sm"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                  <select
                    value={form.salaryPeriod}
                    onChange={(e) =>
                      setForm({ ...form, salaryPeriod: e.target.value })
                    }
                    className="flex-1 bg-neutral-50 dark:bg-neutral-800 border rounded-md px-2 py-2 text-sm"
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
                onChange={(e) =>
                  setForm({ ...form, isSalaryVisible: e.target.checked })
                }
                className="rounded"
              />
              <label
                htmlFor="isSalaryVisible"
                className="text-xs font-semibold text-neutral-700 dark:text-neutral-300"
              >
                Show salary ranges on the public job listings and details cards
                (Salary visibility).
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
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                Short Role Summary
              </label>
              <textarea
                rows={2}
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                placeholder="Give a quick 1-2 sentence hook for this job card summary..."
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-md px-3 py-2 text-sm resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                Job Description (Rich-Text Markdown Compatible)
              </label>
              <textarea
                rows={6}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Provide full description, overview, team details, technology stack... (optional)"
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-md px-3 py-2 text-sm"
              ></textarea>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                Responsibilities & Scope
              </label>
              <textarea
                rows={4}
                value={form.responsibilities}
                onChange={(e) =>
                  setForm({ ...form, responsibilities: e.target.value })
                }
                placeholder="List core duties (each on a new line)..."
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-md px-3 py-2 text-sm"
              ></textarea>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                About the Team / Corporate Division
              </label>
              <textarea
                rows={3}
                value={form.aboutRole}
                onChange={(e) =>
                  setForm({ ...form, aboutRole: e.target.value })
                }
                placeholder="Describe team size, workflow model, work-life balance..."
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-md px-3 py-2 text-sm resize-none"
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
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Required Core Skills (Comma-separated)
                </label>
                <input
                  type="text"
                  value={form.requiredSkills}
                  onChange={(e) =>
                    setForm({ ...form, requiredSkills: e.target.value })
                  }
                  placeholder="e.g. React, TypeScript, Tailwind CSS, PostgreSQL"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-md px-3 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Preferred Stack / Tech (Comma-separated)
                </label>
                <input
                  type="text"
                  value={form.preferredSkills}
                  onChange={(e) =>
                    setForm({ ...form, preferredSkills: e.target.value })
                  }
                  placeholder="e.g. Next.js, Docker, AWS, Drizzle ORM"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-md px-3 py-2.5 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t">
              <div className="col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Education Degree Requirement
                </label>
                <input
                  type="text"
                  value={form.educationDegree}
                  onChange={(e) =>
                    setForm({ ...form, educationDegree: e.target.value })
                  }
                  placeholder="e.g. B.Tech, B.S., MCA"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Branch / Stream
                </label>
                <input
                  type="text"
                  value={form.educationBranch}
                  onChange={(e) =>
                    setForm({ ...form, educationBranch: e.target.value })
                  }
                  placeholder="e.g. Computer Science"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Min GPA / Marks
                </label>
                <input
                  type="text"
                  value={form.minCgpa}
                  onChange={(e) =>
                    setForm({ ...form, minCgpa: e.target.value })
                  }
                  placeholder="e.g. 3.0 / 4.0 or 60%"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                Special Eligibility Criteria & Restrictions
              </label>
              <textarea
                rows={3}
                value={form.eligibility}
                onChange={(e) =>
                  setForm({ ...form, eligibility: e.target.value })
                }
                placeholder="List special rules, age limits, visa requirements..."
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-md px-3 py-2 text-sm resize-none"
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
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Application Method *
                </label>
                <select
                  value={form.applicationMethod}
                  onChange={(e) =>
                    setForm({ ...form, applicationMethod: e.target.value })
                  }
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-md px-3 py-2.5 text-sm"
                >
                  <option value="INTERNAL">
                    INTERNAL RESUME (Apply on CareerDiscover)
                  </option>
                  <option value="EXTERNAL_URL">
                    EXTERNAL LINK redirection
                  </option>
                  <option value="EMAIL">
                    EMAIL application (Prefilled Recruit Mail)
                  </option>
                </select>
              </div>

              <div className="col-span-2">
                {form.applicationMethod === "EXTERNAL_URL" && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                      External Application URL *
                    </label>
                    <input
                      type="url"
                      required
                      value={form.applicationUrl}
                      onChange={(e) =>
                        setForm({ ...form, applicationUrl: e.target.value })
                      }
                      placeholder="https://acme.com/careers/job-apply"
                      className="w-full bg-neutral-50 dark:bg-neutral-800 border border-[var(--color-primary)]/30 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                )}

                {form.applicationMethod === "EMAIL" && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                      Hiring Recruiter Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={form.recruiterEmail}
                      onChange={(e) =>
                        setForm({ ...form, recruiterEmail: e.target.value })
                      }
                      placeholder="hiring@acme.com"
                      className="w-full bg-neutral-50 dark:bg-neutral-800 border border-[var(--color-primary)]/30 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                )}

                {form.applicationMethod === "INTERNAL" && (
                  <div className="bg-[var(--color-primary-light)]/50 p-3 rounded-md border border-dashed border-[var(--color-primary)]/30 text-xs text-[var(--color-primary-dark)]">
                    👍 Safe and automated first-party option! Candidates submit
                    standard PDF links, stored securely inside PostgreSQL for
                    recruiters.
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Application Deadline
                </label>
                <input
                  type="date"
                  value={form.applicationDeadline}
                  onChange={(e) =>
                    setForm({ ...form, applicationDeadline: e.target.value })
                  }
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Publishing Status *
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-md px-3 py-2 text-sm"
                >
                  <option value="PUBLISHED">
                    PUBLISHED (Instantly visible on portal)
                  </option>
                  <option value="DRAFT">
                    DRAFT (Hidden, pending admin edits)
                  </option>
                  <option value="EXPIRED">
                    EXPIRED (Archived from listings)
                  </option>
                </select>
              </div>
            </div>

            {/* Featured / Urgent Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
              {/* Featured Job */}
              <label
                htmlFor="isFeatured"
                className={`flex items-center gap-3 rounded-md border p-4 cursor-pointer transition-all ${
                  form.isFeatured
                    ? "border-yellow-400 bg-yellow-50 dark:border-yellow-600 dark:bg-yellow-950/20"
                    : "border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800"
                }`}
              >
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={form.isFeatured}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      isFeatured: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-neutral-300 text-yellow-500 focus:ring-yellow-500"
                />

                <div>
                  <p className="text-sm font-bold text-neutral-800 dark:text-neutral-100">
                    ⭐ Featured Job
                  </p>

                  <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                    Display this job in the Featured Careers section.
                  </p>
                </div>
              </label>

              {/* Urgent Job */}
              <label
                htmlFor="isUrgent"
                className={`flex items-center gap-3 rounded-md border p-4 cursor-pointer transition-all ${
                  form.isUrgent
                    ? "border-red-400 bg-red-50 dark:border-red-600 dark:bg-red-950/20"
                    : "border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800"
                }`}
              >
                <input
                  type="checkbox"
                  id="isUrgent"
                  checked={form.isUrgent}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      isUrgent: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-neutral-300 text-red-500 focus:ring-red-500"
                />

                <div>
                  <p className="text-sm font-bold text-neutral-800 dark:text-neutral-100">
                    🔥 Urgent Hiring
                  </p>

                  <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                    Mark this job as an urgent hiring opportunity.
                  </p>
                </div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Custom SEO Meta Title
                </label>
                <input
                  type="text"
                  value={form.seoTitle}
                  onChange={(e) =>
                    setForm({ ...form, seoTitle: e.target.value })
                  }
                  placeholder="e.g. Senior Node.js Developer | Acme Careers"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Custom SEO Meta Description
                </label>
                <input
                  type="text"
                  value={form.seoDescription}
                  onChange={(e) =>
                    setForm({ ...form, seoDescription: e.target.value })
                  }
                  placeholder="Summarize posting details for Google SERP crawls..."
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-md px-3 py-2 text-sm"
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
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Walk-In Date
                </label>
                <input
                  type="date"
                  value={form.walkinDate}
                  onChange={(e) =>
                    setForm({ ...form, walkinDate: e.target.value })
                  }
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Interview Start Time
                </label>
                <input
                  type="text"
                  value={form.walkinStartTime}
                  onChange={(e) =>
                    setForm({ ...form, walkinStartTime: e.target.value })
                  }
                  placeholder="e.g. 09:30 AM"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Interview End Time
                </label>
                <input
                  type="text"
                  value={form.walkinEndTime}
                  onChange={(e) =>
                    setForm({ ...form, walkinEndTime: e.target.value })
                  }
                  placeholder="e.g. 04:30 PM"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                Walk-In Exact Venue / Campus Hall
              </label>
              <input
                type="text"
                value={form.walkinVenue}
                onChange={(e) =>
                  setForm({ ...form, walkinVenue: e.target.value })
                }
                placeholder="e.g. Block C, Tech Hub Conference Room, Austin, TX"
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Required Physical Documents
                </label>
                <input
                  type="text"
                  value={form.walkinDocuments}
                  onChange={(e) =>
                    setForm({ ...form, walkinDocuments: e.target.value })
                  }
                  placeholder="e.g. 3 printed resumes, Gov photo ID card, Degree copies"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Walk-In Contact Phone / HR Helpline
                </label>
                <input
                  type="text"
                  value={form.walkinContactInfo}
                  onChange={(e) =>
                    setForm({ ...form, walkinContactInfo: e.target.value })
                  }
                  placeholder="e.g. Recruiting Desk: +1 (512) 555-0100"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                Walk-In Instructions & Rules
              </label>
              <textarea
                rows={3}
                value={form.walkinInstructions}
                onChange={(e) =>
                  setForm({ ...form, walkinInstructions: e.target.value })
                }
                placeholder="e.g. Smart casual dress code. Arrive 15 minutes before timings..."
                className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-md px-3 py-2 text-sm resize-none"
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
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Public Organization / Board
                </label>
                <input
                  type="text"
                  value={form.govOrganization}
                  onChange={(e) =>
                    setForm({ ...form, govOrganization: e.target.value })
                  }
                  placeholder="e.g. Department of Energy, State Civil Board"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-md px-3 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Notification / Gazette Reference Number
                </label>
                <input
                  type="text"
                  value={form.govNotificationNumber}
                  onChange={(e) =>
                    setForm({ ...form, govNotificationNumber: e.target.value })
                  }
                  placeholder="e.g. GAZETTE-DE-2026-904"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-md px-3 py-2.5 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Official Notification PDF Link
                </label>
                <input
                  type="url"
                  value={form.govOfficialNotificationUrl}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      govOfficialNotificationUrl: e.target.value,
                    })
                  }
                  placeholder="https://stateboards.gov/notif.pdf"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-md px-3 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Official Department Website Portal
                </label>
                <input
                  type="url"
                  value={form.govOfficialWebsiteUrl}
                  onChange={(e) =>
                    setForm({ ...form, govOfficialWebsiteUrl: e.target.value })
                  }
                  placeholder="https://stateboards.gov"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-md px-3 py-2.5 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Government Age Limits
                </label>
                <input
                  type="text"
                  value={form.govAgeLimit}
                  onChange={(e) =>
                    setForm({ ...form, govAgeLimit: e.target.value })
                  }
                  placeholder="e.g. 18 to 35 Years"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Application Fee Details
                </label>
                <input
                  type="text"
                  value={form.govApplicationFee}
                  onChange={(e) =>
                    setForm({ ...form, govApplicationFee: e.target.value })
                  }
                  placeholder="e.g. General: $50, Reserve: Waived"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Selection Test/Exam Process
                </label>
                <input
                  type="text"
                  value={form.govSelectionProcess}
                  onChange={(e) =>
                    setForm({ ...form, govSelectionProcess: e.target.value })
                  }
                  placeholder="e.g. Preliminary Screening followed by Written Exam"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-md px-3 py-2 text-sm"
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
              className="px-4 py-2 border rounded-md text-xs font-semibold text-neutral-500 hover:bg-neutral-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 app-button-primary rounded-md text-xs shadow-md"
            >
              <Save className="h-4 w-4" />
              {loading
                ? "Saving Posting..."
                : jobId
                  ? "Save Posting"
                  : "Publish Posting"}
            </button>
          </div>
        </div>
      </form>

      {/* Duplicate Alert Modal */}
      {duplicateWarning && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border rounded-lg max-w-md w-full p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
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
                className="px-5 py-2.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md text-xs font-extrabold cursor-pointer"
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
