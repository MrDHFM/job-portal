import type { SocialJob } from "./types";

function clean(value?: string | null) {
  return value?.trim() || "";
}

function formatSkills(skills?: string | null) {
  if (!skills) return "";

  return skills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean)
    .slice(0, 8)
    .join(" • ");
}

function formatSalary(job: SocialJob) {
  if (!job.isSalaryVisible) return "";
  if (!job.minSalary && !job.maxSalary) return "";

  const currency = job.currency || "INR";

  if (job.minSalary && job.maxSalary) {
    return `${currency} ${job.minSalary.toLocaleString()} - ${job.maxSalary.toLocaleString()} / ${
      job.salaryPeriod || "year"
    }`;
  }

  if (job.minSalary) {
    return `From ${currency} ${job.minSalary.toLocaleString()} / ${
      job.salaryPeriod || "year"
    }`;
  }

  return `Up to ${currency} ${job.maxSalary?.toLocaleString()} / ${
    job.salaryPeriod || "year"
  }`;
}

function makeHashtag(value: string) {
  return value
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .join("");
}

export function buildTelegramJobPost(job: SocialJob) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://job-portal-zeta-two-46.vercel.app";

  const jobUrl = `${siteUrl.replace(/\/$/, "")}/jobs/detail/${job.slug}`;

  const skills = formatSkills(job.requiredSkills);
  const salary = formatSalary(job);

  const location = [job.city, job.state]
    .map(clean)
    .filter(Boolean)
    .join(", ");

  // Keep hashtags useful and readable.
  // Avoid converting a very long job title into one giant hashtag.
  const hashtags = [
    "#Hiring",
    "#Jobs",
    job.companyName
      ? `#${makeHashtag(job.companyName)}`
      : "",
    job.city
      ? `#${makeHashtag(job.city)}Jobs`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  const lines = [
  "🚀 NEW JOB OPPORTUNITY",
  "",
  `💼 ${job.title}`,
  `🏢 ${job.companyName}`,
  "",
  location ? `📍 Location: ${location}` : "",
  job.experienceLevel
    ? `🎯 Experience: ${job.experienceLevel}`
    : "",
  job.employmentType
    ? `🧑‍💻 Employment: ${job.employmentType}`
    : "",
  job.workMode
    ? `🌐 Work Mode: ${job.workMode}`
    : "",
  salary
    ? `💰 Salary: ${salary}`
    : "",
  skills
    ? `🛠 Skills: ${skills}`
    : "",
  "",
  "👇 View complete job details and apply:",
  jobUrl,
  "",
  hashtags,
];

  const text = lines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return {
    text,
    jobUrl,
  };
}