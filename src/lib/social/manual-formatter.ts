import type { SocialJob, ManualSocialPost } from "./types";

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

function getJobUrl(job: SocialJob) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://job-portal-zeta-two-46.vercel.app";

  return `${siteUrl.replace(/\/$/, "")}/jobs/detail/${job.slug}`;
}

function getLocation(job: SocialJob) {
  return [job.city, job.state]
    .map(clean)
    .filter(Boolean)
    .join(", ");
}

function getSkills(job: SocialJob) {
  if (!job.requiredSkills) return "";

  return job.requiredSkills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean)
    .slice(0, 8)
    .join(", ");
}

function getSalary(job: SocialJob) {
  if (!job.isSalaryVisible) return "";
  if (!job.minSalary && !job.maxSalary) return "";

  const currency = job.currency || "INR";
  const period = job.salaryPeriod || "year";

  if (job.minSalary && job.maxSalary) {
    return `${currency} ${job.minSalary.toLocaleString()} - ${job.maxSalary.toLocaleString()} / ${period}`;
  }

  if (job.minSalary) {
    return `From ${currency} ${job.minSalary.toLocaleString()} / ${period}`;
  }

  return `Up to ${currency} ${job.maxSalary?.toLocaleString()} / ${period}`;
}

/**
 * LinkedIn
 *
 * More professional / detailed format.
 */
export function buildLinkedInPost(
  job: SocialJob
): ManualSocialPost {
  const jobUrl = getJobUrl(job);
  const location = getLocation(job);
  const skills = getSkills(job);
  const salary = getSalary(job);

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
    `🚀 We're Hiring: ${job.title}`,

    "",

    `🏢 Company: ${job.companyName}`,

    location
      ? `📍 Location: ${location}`
      : "",

    job.workMode
      ? `💻 Work Mode: ${job.workMode}`
      : "",

    job.employmentType
      ? `🧑‍💼 Employment Type: ${job.employmentType}`
      : "",

    job.experienceLevel
      ? `🎯 Experience: ${job.experienceLevel}`
      : "",

    salary
      ? `💰 Salary: ${salary}`
      : "",

    skills
      ? `🛠️ Skills: ${skills}`
      : "",

    "",

    `Looking for your next career opportunity?`,
    `This could be the role you've been waiting for.`,

    "",

    `👉 Apply here:`,
    jobUrl,

    "",

    `Know someone who could be a great fit?`,
    `Share this opportunity with them.`,

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

/**
 * X / Twitter
 *
 * Short, punchy format.
 */
export function buildXPost(
  job: SocialJob
): ManualSocialPost {
  const jobUrl = getJobUrl(job);
  const location = getLocation(job);

  const hashtags = [
    "#Hiring",
    "#Jobs",
    "#JobAlert",
    job.city
      ? `#${makeHashtag(job.city)}Jobs`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  const lines = [
    `🚨 Hiring Alert!`,

    `${job.title}`,

    job.companyName
      ? `🏢 ${job.companyName}`
      : "",

    location
      ? `📍 ${location}`
      : "",

    job.experienceLevel
      ? `🎯 ${job.experienceLevel}`
      : "",

    job.workMode
      ? `💻 ${job.workMode}`
      : "",

    "",

    `Apply now 👇`,
    jobUrl,

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