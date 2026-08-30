import type {
  SocialJob,
  ManualSocialPost,
} from "./types";

import { buildTrackedJobUrl } from "./tracking-url";
import { TELEGRAM_GROUP_URL, TELEGRAM_GROUP_CTA } from "./constants";

function clean(value?: string | null) {
  return value?.trim() || "";
}

function makeHashtag(value: string) {
  return value
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .join("");
}

function getLocation(job: SocialJob) {
  /*
   * If the job is remote, only show "Remote".
   *
   * Otherwise:
   * Bengaluru, Karnataka
   */
  if (
    job.workMode
      ?.trim()
      .toLowerCase()
      .includes("remote")
  ) {
    return "Remote";
  }

  return [job.city, job.state]
    .map(clean)
    .filter(Boolean)
    .join(", ");
}

function getSkills(job: SocialJob) {
  if (!job.requiredSkills) {
    return "";
  }

  return job.requiredSkills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean)
    .slice(0, 8)
    .join(", ");
}

function getSalary(job: SocialJob) {
  if (!job.isSalaryVisible) {
    return "";
  }

  if (!job.minSalary && !job.maxSalary) {
    return "";
  }

  const currency =
    job.currency || "INR";

  const period =
    job.salaryPeriod || "year";

  if (
    job.minSalary &&
    job.maxSalary
  ) {
    return `${currency} ${job.minSalary.toLocaleString()} - ${job.maxSalary.toLocaleString()} / ${period}`;
  }

  if (job.minSalary) {
    return `From ${currency} ${job.minSalary.toLocaleString()} / ${period}`;
  }

  return `Up to ${currency} ${job.maxSalary?.toLocaleString()} / ${period}`;
}

/* =========================================================
   LINKEDIN
   ========================================================= */

export function buildLinkedInPost(
  job: SocialJob,
): ManualSocialPost {
  const jobUrl =
    buildTrackedJobUrl(
      job.slug,
      "linkedin",
    );

  const location =
    getLocation(job);

  const skills =
    getSkills(job);

  const salary =
    getSalary(job);

  const hashtags = [
    "#Hiring",
    "#JobOpening",
    "#CareerOpportunity",
    "#Jobs",
    "#Recruitment",

    job.city
      ? `#${makeHashtag(job.city)}Jobs`
      : "",

    job.sector
      ? `#${makeHashtag(job.sector)}Jobs`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  const lines = [
    `🚨 Hiring Alert!`,

    "",

    `${job.title}`,

    job.companyName
      ? `🏢 Company: ${job.companyName}`
      : "",

    location
      ? `📍 ${location}`
      : "",

    skills
      ? `🛠️ Skills: ${skills}`
      : "",

    job.experienceLevel
      ? `🎯 ${job.experienceLevel}`
      : "",

    job.workMode &&
    !job.workMode
      .toLowerCase()
      .includes("remote")
      ? `💼 ${job.workMode}`
      : "",

    salary
      ? `💰 Salary: ${salary}`
      : "",

    "",

    "Apply now 👇",

    jobUrl,

    "",

    `📲 ${TELEGRAM_GROUP_CTA}:`,

    TELEGRAM_GROUP_URL,

    "",

    "Follow CareerDiscoverJobs for more opportunities.",

    "",

    hashtags,
  ];

  return {
    platform: "linkedin",

    content: lines
      .filter(Boolean)
      .join("\n")
      .trim(),

    jobUrl,
  };
}

/* =========================================================
   X / TWITTER
   ========================================================= */

export function buildXPost(
  job: SocialJob,
): ManualSocialPost {
  const jobUrl =
    buildTrackedJobUrl(
      job.slug,
      "x",
    );

  const location =
    getLocation(job);

  const skills =
    getSkills(job);

  const hashtags = [
    "#Hiring",
    "#Jobs",
    "#JobAlert",

    job.city &&
    !location
      .toLowerCase()
      .includes("remote")
      ? `#${makeHashtag(job.city)}Jobs`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  const lines = [
    "🚨 Hiring Alert!",

    job.title,

    job.companyName
      ? `🏢 Company: ${job.companyName}`
      : "",

    location
      ? `📍 ${location}`
      : "",

    skills
      ? `Skills: ${skills}`
      : "",

    job.experienceLevel
      ? `🎯 ${job.experienceLevel}`
      : "",

    "",

    "Apply now 👇",

    jobUrl,

    "",

    `📲 ${TELEGRAM_GROUP_CTA}:`,

    TELEGRAM_GROUP_URL,

    "",

    hashtags,
  ];

  return {
    platform: "x",

    content: lines
      .filter(Boolean)
      .join("\n")
      .trim(),

    jobUrl,
  };
}