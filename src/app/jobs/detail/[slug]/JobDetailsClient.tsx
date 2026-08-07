"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Heart,
  Share2,
  Calendar,
  Building,
  MapPin,
  Clock,
  ArrowUpRight,
  Mail,
  FileText,
  User,
  Phone,
  Paperclip,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  Send,
  ExternalLink,
  Info,
  Copy,
} from "lucide-react";

type JobDetailsClientProps = {
  job: any;
  company: any;
  category: any;
  similarJobs: any[];
};

export default function JobDetailsClient({
  job,
  company,
  category,
  similarJobs,
}: JobDetailsClientProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);

  // Application Modal state
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applyForm, setApplyForm] = useState({
    name: "",
    email: "",
    phone: "",
    resumeUrl: "",
    coverLetter: "",
    linkedinUrl: "",
    portfolioUrl: "",
  });
  const [applyLoading, setApplyLoading] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  // Read save status
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("saved-jobs") || "[]");
      setIsSaved(saved.some((item: any) => item.id === job.id));
    } catch (e) {
      setIsSaved(false);
    }
  }, [job.id]);

  // Handle Save / Unsave
  const handleSaveToggle = () => {
    try {
      const saved = JSON.parse(localStorage.getItem("saved-jobs") || "[]");
      if (isSaved) {
        const filtered = saved.filter((item: any) => item.id !== job.id);
        localStorage.setItem("saved-jobs", JSON.stringify(filtered));
        setIsSaved(false);
      } else {
        saved.push({
          id: job.id,
          title: job.title,
          slug: job.slug,
          companyName: company.name,
          city: job.city,
          country: job.country,
          workMode: job.workMode,
          employmentType: job.employmentType,
          savedAt: new Date().toISOString(),
        });
        localStorage.setItem("saved-jobs", JSON.stringify(saved));
        setIsSaved(true);
      }
      // Trigger storage event for Navbar update
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      console.error("Failed to save job:", e);
    }
  };

  // Handle Share copy link
  const handleShare = () => {
    try {
      const shareUrl = `${window.location.origin}/jobs/detail/${job.slug}`;

      if (navigator.share) {
        navigator
          .share({
            title: job.title,
            text: `Check out this opening for ${job.title} at ${company.name}!`,
            url: shareUrl,
          })
          .catch(() => {});
      } else {
        navigator.clipboard.writeText(shareUrl).then(() => {
          setShareSuccess(true);
          setTimeout(() => setShareSuccess(false), 3000);
        });
      }
    } catch (e) {
      console.error("Sharing failed:", e);
    }
  };

  const handleCopyRecruiterEmail = async () => {
    if (!job.recruiterEmail) return;

    try {
      await navigator.clipboard.writeText(job.recruiterEmail);

      setEmailCopied(true);

      setTimeout(() => {
        setEmailCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy recruiter email:", error);
    }
  };

  // Handle Apply click or form trigger
  const handleApplyClick = () => {
    if (job.applicationMethod === "EXTERNAL_URL") {
      if (job.applicationUrl) {
        // Safe redirect
        window.open(job.applicationUrl, "_blank", "noopener,noreferrer");
        // Log apply click analytic in backend
        fetch(`/api/v1/jobs/${job.slug}/apply`, {
          method: "POST",
          body: JSON.stringify({ isInternal: false }),
        });
      }
    } else if (job.applicationMethod === "EMAIL") {
      if (job.recruiterEmail) {
        const subject = encodeURIComponent(
          `Application for ${job.title} - ${company.name}`,
        );

        const body = encodeURIComponent(
          `Hello Hiring Team,

I am writing to apply for the ${job.title} position at ${company.name}.

Please find my latest resume attached for your consideration.

I would appreciate the opportunity to discuss my suitability for this role.

Thank you for your time and consideration.

Best regards`,
        );

        window.location.href = `mailto:${job.recruiterEmail}?subject=${subject}&body=${body}`;

        fetch(`/api/v1/jobs/${job.slug}/apply`, {
          method: "POST",
          body: JSON.stringify({
            isInternal: false,
          }),
        });
      }
    } else if (job.applicationMethod === "INTERNAL") {
      setApplyModalOpen(true);
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !applyForm.name ||
      !applyForm.email ||
      !applyForm.phone ||
      !applyForm.resumeUrl
    ) {
      setApplyError(
        "Please fill in name, email, phone, and standard Resume URL.",
      );
      return;
    }

    setApplyLoading(true);
    setApplyError(null);

    try {
      const response = await fetch(`/api/v1/jobs/${job.slug}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...applyForm,
          isInternal: true,
        }),
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || "Failed to submit resume.");
      }

      setApplySuccess(true);
    } catch (e: any) {
      setApplyError(
        e.message || "An unexpected error occurred during submission.",
      );
    } finally {
      setApplyLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Premium Job Header Card */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        {/* Urgent/Featured Badges Row */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-300 text-xs font-bold px-3 py-1 rounded-full">
            {job.sector} Sector
          </span>
          <span className="bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-xs font-bold px-3 py-1 rounded-full">
            {category.name}
          </span>
          {job.isUrgent && (
            <span className="bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-extrabold px-3 py-1 rounded-full animate-pulse">
              Urgent Hiring
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white leading-tight">
              {job.title}
            </h1>
            <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-1.5">
              {company.name} • {job.city}, {job.country}
            </p>
          </div>

          {/* Action Row */}
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleSaveToggle}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                isSaved
                  ? "bg-red-50 border-red-200 text-red-600 dark:bg-red-950/20 dark:border-red-900"
                  : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50 dark:bg-neutral-800 dark:border-neutral-750 dark:text-neutral-300 dark:hover:bg-neutral-700"
              }`}
            >
              <Heart
                className={`h-4 w-4 ${isSaved ? "fill-current text-red-500" : ""}`}
              />
              {isSaved ? "Saved" : "Save Job"}
            </button>

            <button
              onClick={handleShare}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-bold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-750 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 transition-all cursor-pointer"
            >
              <Share2 className="h-4 w-4" />
              {shareSuccess ? "Copied Link!" : "Share"}
            </button>
          </div>
        </div>

        {/* Core details row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-neutral-100 dark:border-neutral-850 text-sm mb-6">
          <div>
            <span className="block text-xs font-bold uppercase text-neutral-400">
              Work Mode
            </span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              {job.workMode}
            </span>
          </div>
          <div>
            <span className="block text-xs font-bold uppercase text-neutral-400">
              Employment Type
            </span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              {job.employmentType}
            </span>
          </div>
          <div>
            <span className="block text-xs font-bold uppercase text-neutral-400">
              Experience Level
            </span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              {job.experienceLevel}
            </span>
          </div>
          <div>
            <span className="block text-xs font-bold uppercase text-neutral-400">
              Offered Salary
            </span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              {job.isSalaryVisible && job.minSalary
                ? `${job.currency} ${job.minSalary.toLocaleString()} - ${job.maxSalary?.toLocaleString()}`
                : "Not Disclosed"}
            </span>
          </div>
        </div>

       {/* Application Action */}
<div className="space-y-4">

  {job.applicationMethod === "EMAIL" && job.recruiterEmail ? (
    <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 p-4 sm:p-5 dark:border-blue-900/40 dark:from-blue-950/20 dark:to-indigo-950/10">

      <div className="flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-8">

        {/* Apply button */}
        <div className="shrink-0">
          <button
            onClick={handleApplyClick}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-7 py-3.5 rounded-xl transition-all shadow-md shadow-blue-600/15 flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            <Mail className="h-4 w-4" />

            Apply via Email

            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

        {/* Email information */}
        <div className="flex-1 min-w-0">

          <div className="flex items-center gap-2 mb-1.5">
            <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />

            <p className="text-xs font-bold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Send your resume to
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2">

            <a
              href={`mailto:${job.recruiterEmail}`}
              className="text-sm sm:text-base font-extrabold text-blue-700 dark:text-blue-400 hover:underline break-all"
            >
              {job.recruiterEmail}
            </a>

            <button
              type="button"
              onClick={handleCopyRecruiterEmail}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer dark:border-blue-800 dark:bg-neutral-900 dark:text-blue-400 dark:hover:bg-blue-950/40"
            >
              {emailCopied ? (
                <>
                  <CheckCircle className="h-3.5 w-3.5" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </>
              )}
            </button>

          </div>

          <p className="mt-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
            Please send your latest resume to this email address to apply for
            this position. Clicking{" "}
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">
              Apply via Email
            </span>{" "}
            will open your email app with the application details pre-filled.
          </p>

        </div>

      </div>

    </div>
  ) : (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4">

      <button
        onClick={handleApplyClick}
        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-8 py-3.5 rounded-xl transition-all shadow-md shadow-blue-600/15 flex items-center justify-center gap-2 text-sm cursor-pointer"
      >
        {job.applicationMethod === "INTERNAL"
          ? "Apply Now"
          : "Apply on Company Website"}

        <ArrowUpRight className="h-4 w-4" />
      </button>

      <span className="text-xs text-neutral-400">
        {job.applicationMethod === "EXTERNAL_URL" &&
          "You will be redirected to the official application page."}

        {job.applicationMethod === "INTERNAL" &&
          "Apply directly through CareerDiscover's secure application system."}
      </span>

    </div>
  )}

</div>
      </div>

      {/* Government Specific Information Block */}
      {job.govOrganization && (
        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2 mb-4">
            🏛️ Government Sector Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {job.govOrganization && (
              <p>
                <strong className="text-neutral-500">Department:</strong>{" "}
                {job.govOrganization}
              </p>
            )}
            {job.govNotificationNumber && (
              <p>
                <strong className="text-neutral-500">
                  Ref / Notification No:
                </strong>{" "}
                {job.govNotificationNumber}
              </p>
            )}
            {job.govAgeLimit && (
              <p>
                <strong className="text-neutral-500">Age Limit:</strong>{" "}
                {job.govAgeLimit}
              </p>
            )}
            {job.govApplicationFee && (
              <p>
                <strong className="text-neutral-500">Application Fee:</strong>{" "}
                {job.govApplicationFee}
              </p>
            )}
            {job.govSelectionProcess && (
              <p className="sm:col-span-2">
                <strong className="text-neutral-500">
                  Selection Criteria:
                </strong>{" "}
                {job.govSelectionProcess}
              </p>
            )}
          </div>

          <div className="flex gap-3 mt-4 pt-4 border-t border-emerald-500/15 flex-wrap">
            {job.govOfficialNotificationUrl && (
              <a
                href={job.govOfficialNotificationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-1"
              >
                Official Notification PDF <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {job.govOfficialWebsiteUrl && (
              <a
                href={job.govOfficialWebsiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-neutral-100 dark:bg-neutral-850 hover:bg-neutral-200 text-neutral-800 dark:text-neutral-200 px-4 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-1"
              >
                Official Portal Website <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Walk-In Specific Information Block */}
      {job.walkinVenue && (
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2 mb-4">
            🚶 Walk-In Interview Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
            {job.walkinDate && (
              <p>
                <strong className="text-neutral-500">Walk-In Date:</strong>{" "}
                <span className="font-bold text-amber-700 dark:text-amber-400">
                  {new Date(job.walkinDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </p>
            )}
            {job.walkinStartTime && (
              <p>
                <strong className="text-neutral-500">Timings:</strong>{" "}
                {job.walkinStartTime}{" "}
                {job.walkinEndTime ? `to ${job.walkinEndTime}` : ""}
              </p>
            )}
            {job.walkinContactInfo && (
              <p className="sm:col-span-2">
                <strong className="text-neutral-500">
                  Contact Information:
                </strong>{" "}
                {job.walkinContactInfo}
              </p>
            )}
            {job.walkinVenue && (
              <p className="sm:col-span-2">
                <strong className="text-neutral-500">Interview Venue:</strong>{" "}
                {job.walkinVenue}
              </p>
            )}
            {job.walkinDocuments && (
              <p className="sm:col-span-2">
                <strong className="text-neutral-500">
                  Documents Required:
                </strong>{" "}
                {job.walkinDocuments}
              </p>
            )}
            {job.walkinInstructions && (
              <p className="sm:col-span-2">
                <strong className="text-neutral-500">
                  Candidate Instructions:
                </strong>{" "}
                {job.walkinInstructions}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Job Description & Long Texts */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6">
        {job.summary && (
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
              Role Summary
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-line">
              {job.summary}
            </p>
          </div>
        )}

        {job.aboutRole && (
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
              About the Team
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-line">
              {job.aboutRole}
            </p>
          </div>
        )}

        <div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
            Detailed Job Description
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-line">
            {job.description}
          </p>
        </div>

        {job.responsibilities && (
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
              Responsibilities & Scope
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-line">
              {job.responsibilities}
            </p>
          </div>
        )}

        {job.eligibility && (
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
              Eligibility & Qualifications
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-line">
              {job.eligibility}
            </p>
          </div>
        )}

        {/* Skills Tag block */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t">
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-2">
              Required Core Skills
            </h4>
            {job.requiredSkills ? (
              <div className="flex flex-wrap gap-1.5">
                {job.requiredSkills.split(",").map((s: string, i: number) => (
                  <span
                    key={i}
                    className="text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-850 dark:text-neutral-200 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700"
                  >
                    {s.trim()}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-neutral-400 italic">
                None specified
              </span>
            )}
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-2">
              Preferred Tech Stack
            </h4>
            {job.preferredSkills ? (
              <div className="flex flex-wrap gap-1.5">
                {job.preferredSkills.split(",").map((s: string, i: number) => (
                  <span
                    key={i}
                    className="text-xs font-semibold bg-blue-50/50 dark:bg-neutral-800 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-neutral-700"
                  >
                    {s.trim()}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-neutral-400 italic">
                None specified
              </span>
            )}
          </div>
        </div>

        {job.benefits && (
          <div className="pt-4 border-t">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
              Employee Benefits
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-line">
              {job.benefits}
            </p>
          </div>
        )}

        {job.hiringProcess && (
          <div className="pt-4 border-t">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">
              Recruitment Stages
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              {job.hiringProcess
                .split("→")
                .map((stage: string, idx: number) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <span className="text-neutral-400">&gt;</span>}
                    <div className="bg-blue-50 dark:bg-neutral-800 border border-blue-100 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-xs font-bold text-blue-800 dark:text-blue-300">
                      Stage {idx + 1}: {stage.trim()}
                    </div>
                  </React.Fragment>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Similar Jobs block */}
      <div>
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">
          Similar verified career listings
        </h3>

        {similarJobs.length === 0 ? (
          <p className="text-xs text-neutral-500 italic bg-white dark:bg-neutral-900 border p-4 rounded-xl text-center">
            No similar jobs available at the moment. All listings come from
            genuine entries.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {similarJobs.map((item) => (
              <Link
                key={item.id}
                href={`/jobs/detail/${item.slug}`}
                className="block p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl hover:border-blue-500 transition-all shadow-xs"
              >
                <h4 className="font-extrabold text-neutral-900 dark:text-white text-sm line-clamp-1 group-hover:text-blue-600">
                  {item.title}
                </h4>
                <p className="text-xs font-semibold text-blue-600 mt-1">
                  {item.companyName}
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  {item.city}, {item.country}
                </p>

                <div className="mt-4 pt-3 border-t flex items-center justify-between text-[11px] text-neutral-500">
                  <span>{item.workMode}</span>
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">
                    {item.isSalaryVisible && item.minSalary
                      ? `$${(item.minSalary / 1000).toFixed(0)}k+`
                      : "Undisclosed"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Resume submit dialog for internal application */}
      {applyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-lg w-full border border-neutral-200 dark:border-neutral-850 p-6 shadow-xl relative animate-in zoom-in-95 duration-200">
            {/* Close button */}
            <button
              onClick={() => {
                setApplyModalOpen(false);
                setApplySuccess(false);
                setApplyError(null);
              }}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700"
            >
              ✕
            </button>

            {applySuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-10 w-10 text-emerald-600" />
                </div>
                <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white">
                  Submission Succeeded!
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                  Your application and resume details have been safely logged in
                  CareerDiscover's backend database. Recruiter personnel will
                  contact you soon.
                </p>
                <button
                  onClick={() => {
                    setApplyModalOpen(false);
                    setApplySuccess(false);
                  }}
                  className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700"
                >
                  Done
                </button>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">
                  Apply for {job.title}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-6">
                  Submit your candidate application. Authorized hiring
                  recruiters will inspect your profile directly from the
                  PostgreSQL board.
                </p>

                {applyError && (
                  <div className="mb-4 bg-red-50 text-red-700 border border-red-200 p-3 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 shrink-0" /> {applyError}
                  </div>
                )}

                <form onSubmit={applyFormSubmitCheck} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
                        Your Full Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                        <input
                          type="text"
                          required
                          value={applyForm.name}
                          onChange={(e) =>
                            setApplyForm({ ...applyForm, name: e.target.value })
                          }
                          placeholder="Jane Doe"
                          className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl pl-9 pr-3 py-2 text-sm outline-none text-neutral-850 dark:text-neutral-50 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                        <input
                          type="email"
                          required
                          value={applyForm.email}
                          onChange={(e) =>
                            setApplyForm({
                              ...applyForm,
                              email: e.target.value,
                            })
                          }
                          placeholder="jane@doe.com"
                          className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl pl-9 pr-3 py-2 text-sm outline-none text-neutral-850 dark:text-neutral-50 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                        <input
                          type="tel"
                          required
                          value={applyForm.phone}
                          onChange={(e) =>
                            setApplyForm({
                              ...applyForm,
                              phone: e.target.value,
                            })
                          }
                          placeholder="+1 (555) 012-3456"
                          className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl pl-9 pr-3 py-2 text-sm outline-none text-neutral-850 dark:text-neutral-50 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
                        Resume Document Link (PDF) *
                      </label>
                      <div className="relative">
                        <Paperclip className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                        <input
                          type="url"
                          required
                          value={applyForm.resumeUrl}
                          onChange={(e) =>
                            setApplyForm({
                              ...applyForm,
                              resumeUrl: e.target.value,
                            })
                          }
                          placeholder="https://drive.google.com/resume.pdf"
                          className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl pl-9 pr-3 py-2 text-sm outline-none text-neutral-850 dark:text-neutral-50 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
                        LinkedIn Profile
                      </label>
                      <input
                        type="url"
                        value={applyForm.linkedinUrl}
                        onChange={(e) =>
                          setApplyForm({
                            ...applyForm,
                            linkedinUrl: e.target.value,
                          })
                        }
                        placeholder="https://linkedin.com/in/username"
                        className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2 text-sm outline-none text-neutral-850 dark:text-neutral-50 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
                        Portfolio or GitHub Link
                      </label>
                      <input
                        type="url"
                        value={applyForm.portfolioUrl}
                        onChange={(e) =>
                          setApplyForm({
                            ...applyForm,
                            portfolioUrl: e.target.value,
                          })
                        }
                        placeholder="https://github.com/username"
                        className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2 text-sm outline-none text-neutral-850 dark:text-neutral-50 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
                      Short Cover Letter
                    </label>
                    <textarea
                      rows={3}
                      value={applyForm.coverLetter}
                      onChange={(e) =>
                        setApplyForm({
                          ...applyForm,
                          coverLetter: e.target.value,
                        })
                      }
                      placeholder="Why are you a good fit for this role?"
                      className="w-full bg-neutral-50 dark:bg-neutral-800 border rounded-xl px-3 py-2 text-sm outline-none text-neutral-850 dark:text-neutral-50 focus:border-blue-500 resize-none"
                    ></textarea>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setApplyModalOpen(false)}
                      className="px-4 py-2 text-neutral-500 hover:text-neutral-700 text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={applyLoading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:bg-blue-400 inline-flex items-center gap-1.5"
                    >
                      {applyLoading ? (
                        "Submitting..."
                      ) : (
                        <>
                          Submit Resume <Send className="h-3 w-3" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  function applyFormSubmitCheck(e: React.FormEvent) {
    handleApplySubmit(e);
  }
}
