/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import type { SocialJob } from "./types";

function truncate(value: string, max: number) {
  if (!value) return "";
  return value.length <= max ? value : `${value.slice(0, max - 1).trim()}…`;
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

function isValidImageUrl(value?: string | null) {
  if (!value) return false;

  try {
    const url = new URL(value);

    if (!["http:", "https:"].includes(url.protocol)) {
      return false;
    }

    if (url.hostname === "google.com" || url.hostname === "www.google.com") {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function generateInstagramJobCard(
  job: SocialJob,
): Promise<ArrayBuffer> {
  const location = formatLocation(job);
  const skills = formatSkills(job.requiredSkills);
  const salary = formatSalary(job);
  const opportunityLabel = getOpportunityLabel(job);

  return new ImageResponse(
    <div
      style={{
        width: "1080px",
        height: "1350px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        padding: "62px 70px 54px",
        background:
          "linear-gradient(145deg,#050713 0%,#080d1d 48%,#07131d 100%)",
        color: "#f8fafc",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Ambient background */}
      <div
        style={{
          position: "absolute",
          display: "flex",
          width: 650,
          height: 650,
          borderRadius: 999,
          right: -250,
          top: -320,
          background:
            "radial-gradient(circle,rgba(99,102,241,.40),rgba(99,102,241,.08) 48%,transparent 72%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          display: "flex",
          width: 560,
          height: 560,
          borderRadius: 999,
          left: -260,
          bottom: -270,
          background:
            "radial-gradient(circle,rgba(14,165,233,.22),rgba(14,165,233,.04) 50%,transparent 72%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          display: "flex",
          inset: 0,
          opacity: 0.035,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.8) 1px,transparent 1px)",
          backgroundSize: "55px 55px",
        }}
      />

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 27,
            fontWeight: 800,
            letterSpacing: "-1px",
          }}
        >
          <div
            style={{
              display: "flex",
              width: 42,
              height: 42,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 14,
              background: "linear-gradient(135deg,#6366f1,#38bdf8)",
              fontWeight: 900,
            }}
          >
            C
          </div>
          CareerDiscover
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "11px 20px",
            borderRadius: 999,
            background: "rgba(255,255,255,.055)",
            border: "1px solid rgba(255,255,255,.1)",
            color: "#cbd5e1",
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: "1.5px",
          }}
        >
          JOB ALERT
        </div>
      </div>

      {/* Company */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          position: "relative",
          marginTop: 55,
        }}
      >
        <div
          style={{
            display: "flex",
            width: 94,
            height: 94,
            borderRadius: 23,
            flexShrink: 0,
            alignItems: "center",
            justifyContent: "center",
            background: "#fff",
            overflow: "hidden",
            boxShadow: "0 16px 42px rgba(0,0,0,.3)",
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
                color: "#111827",
              }}
            >
              {getInitials(job.companyName)}
            </div>
          )}
        </div>

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
              color: job.isUrgent ? "#fb7185" : "#818cf8",
              fontSize: 17,
              fontWeight: 800,
              letterSpacing: "2.4px",
              marginBottom: 8,
            }}
          >
            {opportunityLabel}
          </div>

          <div
            style={{
              display: "flex",
              color: "#e2e8f0",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            {truncate(job.companyName, 50)}
          </div>
        </div>
      </div>

      {/* Job title */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "relative",
          marginTop: 43,
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
            color: "#f8fafc",
          }}
        >
          {truncate(job.title, 105)}
        </div>

        <div
          style={{
            display: "flex",
            width: 92,
            height: 5,
            borderRadius: 999,
            marginTop: 22,
            background: "linear-gradient(90deg,#818cf8,#38bdf8)",
          }}
        />
      </div>

      {/* Main metadata */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 13,
          position: "relative",
          marginTop: 39,
        }}
      >
        {location && (
          <InfoCard icon={<LocationIcon />} label="LOCATION" value={location} />
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

      {/* Skills */}
      {skills.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "relative",
            marginTop: 34,
          }}
        >
          <div
            style={{
              display: "flex",
              color: "#64748b",
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: "2.2px",
              marginBottom: 14,
            }}
          >
            KEY SKILLS
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 9,
            }}
          >
            {skills.map((skill) => (
              <div
                key={skill}
                style={{
                  display: "flex",
                  padding: "9px 16px",
                  borderRadius: 999,
                  background: "rgba(99,102,241,.1)",
                  border: "1px solid rgba(129,140,248,.22)",
                  color: "#c7d2fe",
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                {truncate(skill, 25)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Optional salary */}
      {salary && (
        <div
          style={{
            display: "flex",
            position: "relative",
            alignItems: "center",
            marginTop: 27,
            padding: "15px 18px",
            borderRadius: 17,
            background: "rgba(34,197,94,.055)",
            border: "1px solid rgba(74,222,128,.15)",
          }}
        >
          <div
            style={{
              display: "flex",
              color: "#86efac",
              marginRight: 14,
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
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "1.5px",
              }}
            >
              COMPENSATION
            </div>

            <div
              style={{
                display: "flex",
                color: "#dcfce7",
                fontSize: 18,
                fontWeight: 700,
                marginTop: 4,
              }}
            >
              {salary}
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <div
        style={{
          display: "flex",
          position: "relative",
          marginTop: "auto",
          padding: "25px 28px",
          borderRadius: 23,
          alignItems: "center",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg,rgba(99,102,241,.16),rgba(56,189,248,.08))",
          border: "1px solid rgba(255,255,255,.11)",
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
              color: "#94a3b8",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "1.3px",
              marginBottom: 6,
            }}
          >
            READY FOR YOUR NEXT OPPORTUNITY?
          </div>

          <div
            style={{
              display: "flex",
              color: "#f8fafc",
              fontSize: 21,
              fontWeight: 800,
            }}
          >
            View full job details & apply
          </div>
        </div>

        <div
          style={{
            display: "flex",
            padding: "15px 22px",
            borderRadius: 14,
            background: "#f8fafc",
            color: "#111827",
            fontSize: 17,
            fontWeight: 900,
          }}
        >
          LINK IN BIO
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          position: "relative",
          justifyContent: "space-between",
          marginTop: 19,
          color: "#64748b",
          fontSize: 13,
        }}
      >
        <div style={{ display: "flex" }}>CareerDiscover</div>

        <div style={{ display: "flex" }}>Save • Share • Apply</div>
      </div>
    </div>,
    {
      width: 1080,
      height: 1350,
    },
  ).arrayBuffer();
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        width: 463,
        minHeight: 82,
        alignItems: "center",
        padding: "15px 17px",
        borderRadius: 17,
        background: "rgba(255,255,255,.045)",
        border: "1px solid rgba(255,255,255,.08)",
      }}
    >
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
          background: "rgba(99,102,241,.13)",
          color: "#a5b4fc",
        }}
      >
        {icon}
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
            fontWeight: 800,
            letterSpacing: "1.5px",
            marginBottom: 5,
          }}
        >
          {label}
        </div>

        <div
          style={{
            display: "flex",
            color: "#e2e8f0",
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          {truncate(value, 36)}
        </div>
      </div>
    </div>
  );
}
