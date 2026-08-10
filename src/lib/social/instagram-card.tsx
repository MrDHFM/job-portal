/* eslint-disable @next/next/no-img-element */

import { ImageResponse } from "next/og";
import type { SocialJob } from "./types";

function truncate(value: string | null | undefined, max: number) {
  if (!value) return "";
  return value.length <= max
    ? value
    : `${value.slice(0, max - 1).trim()}…`;
}

function formatLocation(job: SocialJob) {
  return [job.city, job.state].filter(Boolean).join(", ");
}

function formatSkills(skills?: string | null) {
  if (!skills) return [];

  return skills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean)
    .slice(0, 5);
}

function getInitials(company: string) {
  return company
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

function getOpportunityLabel(job: SocialJob) {
  const employment = job.employmentType?.toLowerCase() || "";
  const category = job.categoryName?.toLowerCase() || "";

  if (job.isUrgent) return "URGENT HIRING";
  if (employment.includes("walk")) return "WALK-IN DRIVE";
  if (employment.includes("intern")) return "INTERNSHIP OPPORTUNITY";
  if (category.includes("government")) return "GOVERNMENT OPPORTUNITY";
  if (job.isFeatured) return "FEATURED OPPORTUNITY";

  return "NOW HIRING";
}

function getTitleSize(title: string) {
  if (title.length > 80) return 46;
  if (title.length > 60) return 51;
  if (title.length > 42) return 57;
  if (title.length > 28) return 64;

  return 70;
}

function formatSalary(job: SocialJob) {
  if (!job.isSalaryVisible) return null;
  if (!job.minSalary && !job.maxSalary) return null;

  const currency = job.currency || "INR";

  if (job.minSalary && job.maxSalary) {
    return `${currency} ${job.minSalary.toLocaleString()} – ${job.maxSalary.toLocaleString()}`;
  }

  if (job.minSalary) {
    return `From ${currency} ${job.minSalary.toLocaleString()}`;
  }

  return `Up to ${currency} ${job.maxSalary?.toLocaleString()}`;
}

/* ---------------- ICONS ---------------- */

function LocationIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24">
      <path
        d="M12 21s7-6.1 7-12A7 7 0 1 0 5 9c0 5.9 7 12 7 12Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle
        cx="12"
        cy="9"
        r="2.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function ExperienceIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24">
      <circle
        cx="12"
        cy="12"
        r="8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 7v5l3 2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EmploymentIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24">
      <rect
        x="4"
        y="7"
        width="16"
        height="12"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M9 7V5h6v2M4 12h16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function WorkModeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24">
      <rect
        x="3"
        y="4"
        width="18"
        height="13"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M8 21h8M12 17v4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function SalaryIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24">
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M14.5 8.5c-.6-.6-1.4-.9-2.5-.9-1.5 0-2.5.7-2.5 1.8 0 2.8 5.2 1.1 5.2 4.1 0 1.2-1.1 2-2.7 2-1.2 0-2.2-.4-2.9-1.1M12 6v12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ---------------- IMAGE VALIDATION ---------------- */

function isValidImageUrl(value?: string | null) {
  if (!value) return false;

  try {
    const url = new URL(value);

    if (!["http:", "https:"].includes(url.protocol)) {
      return false;
    }

    if (
      url.hostname === "google.com" ||
      url.hostname === "www.google.com"
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/* ============================================================
   PREMIUM INSTAGRAM JOB CARD
   1080 x 1350 — 4:5
============================================================ */

export async function generateInstagramJobCard(
  job: SocialJob,
): Promise<ArrayBuffer> {
  const location = formatLocation(job);
  const skills = formatSkills(job.requiredSkills);
  const salary = formatSalary(job);
  const opportunityLabel = getOpportunityLabel(job);

  return new ImageResponse(
    (
      <div
        style={{
          width: "1080px",
          height: "1350px",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",

          padding: "48px 70px 42px",

          background:
            "linear-gradient(145deg, #ffffff 0%, #f8fbff 48%, #eef6ff 100%)",

          color: "#0f172a",

          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >

        {/* =====================================================
            PREMIUM AMBIENT BACKGROUND
        ====================================================== */}

        {/* Top-right blue glow */}
        <div
          style={{
            position: "absolute",
            display: "flex",

            width: 620,
            height: 620,

            right: -310,
            top: -350,

            borderRadius: 999,

            background:
              "radial-gradient(circle, rgba(99,102,241,.16) 0%, rgba(96,165,250,.09) 38%, rgba(255,255,255,0) 72%)",
          }}
        />

        {/* Bottom-left cyan glow */}
        <div
          style={{
            position: "absolute",
            display: "flex",

            width: 560,
            height: 560,

            left: -300,
            bottom: -330,

            borderRadius: 999,

            background:
              "radial-gradient(circle, rgba(14,165,233,.12) 0%, rgba(56,189,248,.06) 42%, rgba(255,255,255,0) 72%)",
          }}
        />

        {/* Subtle decorative grid */}
        <div
          style={{
            position: "absolute",
            display: "flex",
            inset: 0,

            opacity: 0.028,

            backgroundImage:
              "linear-gradient(#64748b 1px, transparent 1px), linear-gradient(90deg, #64748b 1px, transparent 1px)",

            backgroundSize: "55px 55px",
          }}
        />

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",

            position: "relative",
            zIndex: 2,
          }}
        >

          {/* CareerDiscover Brand */}
          <div
            style={{
              display: "flex",
              alignItems: "center",

              fontSize: 27,
              fontWeight: 800,

              letterSpacing: "-1px",

              color: "#0f172a",
            }}
          >

            {/* Logo */}
            <div
              style={{
                display: "flex",

                width: 42,
                height: 42,

                borderRadius: 12,

                alignItems: "center",
                justifyContent: "center",

                marginRight: 14,

                background:
                  "linear-gradient(135deg, #4f46e5 0%, #3b82f6 48%, #38bdf8 100%)",

                color: "#ffffff",

                fontWeight: 900,

                boxShadow:
                  "0 10px 24px rgba(59,130,246,.24)",
              }}
            >
              C
            </div>

            CareerDiscover
          </div>

          {/* Job Alert Pill */}
          <div
            style={{
              display: "flex",

              alignItems: "center",

              padding: "11px 20px",

              borderRadius: 999,

              background:
                "rgba(255,255,255,.88)",

              border:
                "1px solid rgba(148,163,184,.25)",

              color: "#475569",

              fontSize: 15,

              fontWeight: 800,

              letterSpacing: "1.5px",

              boxShadow:
                "0 8px 25px rgba(15,23,42,.06)",
            }}
          >
            JOB ALERT
          </div>
        </div>


        {/* =====================================================
            COMPANY
        ====================================================== */}

        <div
          style={{
            display: "flex",

            alignItems: "center",

            position: "relative",

            marginTop: 46,

            zIndex: 2,
          }}
        >

          {/* Company Logo */}
          <div
            style={{
              display: "flex",

              width: 94,
              height: 94,

              borderRadius: 23,

              flexShrink: 0,

              alignItems: "center",
              justifyContent: "center",

              background: "#ffffff",

              overflow: "hidden",

              border:
                "1px solid rgba(148,163,184,.22)",

              boxShadow:
                "0 18px 42px rgba(15,23,42,.10)",
            }}
          >

            {isValidImageUrl(job.companyLogoUrl) ? (
              <img
                src={job.companyLogoUrl ?? undefined}
                width={76}
                height={76}
                alt=""
                style={{
                  objectFit: "contain",
                }}
              />
            ) : (
              <div
                style={{
                  display: "flex",

                  fontSize: 30,

                  fontWeight: 900,

                  color: "#0f172a",
                }}
              >
                {getInitials(job.companyName)}
              </div>
            )}
          </div>


          {/* Company Name */}
          <div
            style={{
              display: "flex",

              flexDirection: "column",

              marginLeft: 24,
            }}
          >

            <div
              style={{
                display: "flex",

                color: job.isUrgent
                  ? "#dc2626"
                  : "#4f46e5",

                fontSize: 17,

                fontWeight: 900,

                letterSpacing: "2.4px",

                marginBottom: 8,
              }}
            >
              {opportunityLabel}
            </div>

            <div
              style={{
                display: "flex",

                color: "#334155",

                fontSize: 28,

                fontWeight: 750,
              }}
            >
              {truncate(job.companyName, 50)}
            </div>
          </div>
        </div>


        {/* =====================================================
            JOB TITLE
        ====================================================== */}

        <div
          style={{
            display: "flex",

            flexDirection: "column",

            position: "relative",

            marginTop: 38,

            zIndex: 2,
          }}
        >

          <div
            style={{
              display: "flex",

              maxWidth: 900,

              fontSize: getTitleSize(job.title),

              lineHeight: 1.04,

              fontWeight: 900,

              letterSpacing: "-2.4px",

              color: "#0f172a",
            }}
          >
            {truncate(job.title, 105)}
          </div>


          {/* Accent Line */}
          <div
            style={{
              display: "flex",

              width: 92,

              height: 5,

              borderRadius: 999,

              marginTop: 20,

              background:
                "linear-gradient(90deg, #4f46e5, #3b82f6, #38bdf8)",

              boxShadow:
                "0 4px 12px rgba(59,130,246,.22)",
            }}
          />
        </div>


        {/* =====================================================
            JOB INFORMATION
        ====================================================== */}

        <div
          style={{
            display: "flex",

            flexWrap: "wrap",

            gap: 13,

            position: "relative",

            marginTop: 31,

            zIndex: 2,
          }}
        >

          {location && (
            <InfoCard
              icon={<LocationIcon />}
              label="LOCATION"
              value={location}
            />
          )}

          <InfoCard
            icon={<ExperienceIcon />}
            label="EXPERIENCE"
            value={job.experienceLevel}
          />

          <InfoCard
            icon={<EmploymentIcon />}
            label="EMPLOYMENT"
            value={job.employmentType}
          />

          <InfoCard
            icon={<WorkModeIcon />}
            label="WORK MODE"
            value={job.workMode}
          />
        </div>


        {/* =====================================================
            SKILLS
        ====================================================== */}

        {skills.length > 0 && (
          <div
            style={{
              display: "flex",

              flexDirection: "column",

              position: "relative",

              marginTop: 27,

              zIndex: 2,
            }}
          >

            <div
              style={{
                display: "flex",

                color: "#64748b",

                fontSize: 13,

                fontWeight: 900,

                letterSpacing: "2px",

                marginBottom: 12,
              }}
            >
              KEY SKILLS
            </div>


            <div
              style={{
                display: "flex",

                flexWrap: "wrap",

                gap: 8,
              }}
            >

              {skills.map((skill) => (
                <div
                  key={skill}
                  style={{
                    display: "flex",

                    padding: "8px 14px",

                    borderRadius: 999,

                    background:
                      "linear-gradient(135deg, #eef2ff, #eff6ff)",

                    border:
                      "1px solid rgba(99,102,241,.14)",

                    color: "#3730a3",

                    fontSize: 14,

                    fontWeight: 700,
                  }}
                >
                  {truncate(skill, 25)}
                </div>
              ))}

            </div>
          </div>
        )}


        {/* =====================================================
            SALARY
        ====================================================== */}

        {salary && (
          <div
            style={{
              display: "flex",

              alignItems: "center",

              position: "relative",

              marginTop: 22,

              padding: "15px 18px",

              borderRadius: 17,

              background:
                "linear-gradient(135deg, #f0fdf4, #ecfeff)",

              border:
                "1px solid rgba(16,185,129,.16)",

              zIndex: 2,
            }}
          >

            <div
              style={{
                display: "flex",

                width: 42,
                height: 42,

                alignItems: "center",
                justifyContent: "center",

                borderRadius: 12,

                marginRight: 14,

                background: "#ffffff",

                color: "#059669",

                border:
                  "1px solid rgba(16,185,129,.14)",
              }}
            >
              <SalaryIcon />
            </div>


            <div
              style={{
                display: "flex",

                flexDirection: "column",
              }}
            >

              <div
                style={{
                  display: "flex",

                  color: "#64748b",

                  fontSize: 11,

                  fontWeight: 900,

                  letterSpacing: "1.5px",
                }}
              >
                COMPENSATION
              </div>

              <div
                style={{
                  display: "flex",

                  color: "#047857",

                  fontSize: 18,

                  fontWeight: 800,

                  marginTop: 4,
                }}
              >
                {salary}
              </div>

            </div>
          </div>
        )}


        {/* =====================================================
            CTA
        ====================================================== */}

        <div
          style={{
            display: "flex",

            position: "relative",

            marginTop: "auto",

            padding: "24px 28px",

            borderRadius: 23,

            alignItems: "center",

            justifyContent: "space-between",

            background:
              "linear-gradient(135deg, #eef2ff 0%, #eff6ff 52%, #ecfeff 100%)",

            border:
              "1px solid rgba(99,102,241,.14)",

            boxShadow:
              "0 18px 45px rgba(59,130,246,.10)",

            zIndex: 2,
          }}
        >

          <div
            style={{
              display: "flex",

              flexDirection: "column",
            }}
          >

            <div
              style={{
                display: "flex",

                color: "#64748b",

                fontSize: 13,

                fontWeight: 800,

                letterSpacing: "1.3px",

                marginBottom: 6,
              }}
            >
              READY FOR YOUR NEXT OPPORTUNITY?
            </div>

            <div
              style={{
                display: "flex",

                color: "#0f172a",

                fontSize: 21,

                fontWeight: 850,
              }}
            >
              View full job details & apply
            </div>
          </div>


          {/* CTA Button */}
          <div
            style={{
              display: "flex",

              padding: "15px 22px",

              borderRadius: 14,

              background:
                "linear-gradient(135deg, #111827, #1e293b)",

              color: "#ffffff",

              fontSize: 16,

              fontWeight: 900,

              boxShadow:
                "0 10px 22px rgba(15,23,42,.16)",
            }}
          >
            LINK IN BIO
          </div>
        </div>


        {/* =====================================================
            FOOTER
        ====================================================== */}

        <div
          style={{
            display: "flex",

            position: "relative",

            justifyContent: "space-between",

            marginTop: 16,

            color: "#94a3b8",

            fontSize: 12,

            fontWeight: 600,

            zIndex: 2,
          }}
        >

          <div style={{ display: "flex" }}>
            CareerDiscover
          </div>

          <div style={{ display: "flex" }}>
            Save • Share • Apply
          </div>

        </div>

      </div>
    ),
    {
      width: 1080,
      height: 1350,
    },
  ).arrayBuffer();
}


/* ============================================================
   PREMIUM INFORMATION CARD
============================================================ */

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) {
  if (!value) return null;

  return (
    <div
      style={{
        display: "flex",

        width: 463,

        minHeight: 82,

        alignItems: "center",

        padding: "15px 17px",

        borderRadius: 17,

        background:
          "rgba(255,255,255,.90)",

        border:
          "1px solid rgba(148,163,184,.20)",

        boxShadow:
          "0 10px 28px rgba(15,23,42,.055)",
      }}
    >

      {/* Icon Container */}
      <div
        style={{
          display: "flex",

          width: 45,
          height: 45,

          flexShrink: 0,

          alignItems: "center",
          justifyContent: "center",

          marginRight: 15,

          borderRadius: 13,

          background:
            "linear-gradient(135deg, #eef2ff, #eff6ff)",

          color: "#4f46e5",

          border:
            "1px solid rgba(99,102,241,.10)",
        }}
      >
        {icon}
      </div>


      {/* Text */}
      <div
        style={{
          display: "flex",

          flexDirection: "column",

          minWidth: 0,
        }}
      >

        <div
          style={{
            display: "flex",

            color: "#94a3b8",

            fontSize: 10,

            fontWeight: 900,

            letterSpacing: "1.6px",

            marginBottom: 5,
          }}
        >
          {label}
        </div>


        <div
          style={{
            display: "flex",

            color: "#334155",

            fontSize: 17,

            fontWeight: 750,
          }}
        >
          {truncate(value, 36)}
        </div>

      </div>

    </div>
  );
}