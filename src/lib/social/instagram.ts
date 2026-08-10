import type { SocialJob, SocialPublishResult } from "./types";
import { generateInstagramJobCard } from "./instagram-card";
import { uploadInstagramJobCard } from "./instagram-storage";

type InstagramApiResponse = {
  id?: string;
  permalink?: string;

  error?: {
    message?: string;
    type?: string;
    code?: number;
    error_subcode?: number;
    error_user_title?: string;
    error_user_msg?: string;
  };
};

const API_VERSION = process.env.INSTAGRAM_API_VERSION || "v24.0";

const BASE_URL = `https://graph.instagram.com/${API_VERSION}`;

function getConfig() {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const instagramAccountId = process.env.INSTAGRAM_ACCOUNT_ID;

  if (!accessToken || !instagramAccountId) {
    throw new Error("Instagram environment variables are not configured.");
  }

  return {
    accessToken,
    instagramAccountId,
  };
}

function buildCaption(job: SocialJob) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://job-portal-zeta-two-46.vercel.app";

  const jobUrl = `${siteUrl.replace(/\/$/, "")}/jobs/detail/${job.slug}`;

  const location = [job.city, job.state].filter(Boolean).join(", ");

  const skills = job.requiredSkills
    ? job.requiredSkills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
        .slice(0, 8)
        .join(" • ")
    : "";

  let salary = "";

  if (job.isSalaryVisible && (job.minSalary || job.maxSalary)) {
    const currency = job.currency || "INR";

    if (job.minSalary && job.maxSalary) {
      salary =
        `${currency} ${job.minSalary.toLocaleString()} - ` +
        `${job.maxSalary.toLocaleString()}`;
    } else if (job.minSalary) {
      salary = `From ${currency} ${job.minSalary.toLocaleString()}`;
    } else {
      salary = `Up to ${currency} ${job.maxSalary?.toLocaleString()}`;
    }
  }

  const lines = [
    `🚀 NOW HIRING`,
    "",
    `💼 ${job.title}`,
    `🏢 ${job.companyName}`,
    location ? `📍 ${location}` : "",
    job.experienceLevel ? `🎯 ${job.experienceLevel}` : "",
    job.employmentType ? `💼 ${job.employmentType}` : "",
    job.workMode ? `🏠 ${job.workMode}` : "",
    salary ? `💰 ${salary}` : "",
    "",
    skills ? `🛠️ Skills: ${skills}` : "",
    "",
    `🔗 Apply here:`,
    jobUrl,
    "",
    "#CareerDiscover #Hiring #Jobs #JobOpening",
    job.city ? `#${job.city.replace(/[^a-zA-Z0-9]/g, "")}Jobs` : "",
    "#Careers #JobSearch",
  ];

  return lines.filter(Boolean).join("\n").slice(0, 2200);
}

async function parseResponse(
  response: Response,
): Promise<InstagramApiResponse> {
  const data = (await response.json()) as InstagramApiResponse;

  if (!response.ok || data.error) {
    console.error("Instagram API FULL ERROR:", {
      status: response.status,
      statusText: response.statusText,
      response: data,
    });

    throw new Error(
      data.error?.error_user_msg ||
        data.error?.message ||
        JSON.stringify(data) ||
        `Instagram API request failed with status ${response.status}`,
    );
  }

  return data;
}

async function waitForMediaReady(containerId: string, accessToken: string) {
  const maxAttempts = 10;
  const delayMs = 3000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const statusUrl =
      `${BASE_URL}/${containerId}` +
      `?fields=status_code,status` +
      `&access_token=${encodeURIComponent(accessToken)}`;

    const response = await fetch(statusUrl, {
      method: "GET",
      cache: "no-store",
    });

    const data = await response.json();

    console.log(`Instagram media status attempt ${attempt}:`, data);

    if (!response.ok || data.error) {
      throw new Error(
        data.error?.message || "Failed to check Instagram media status.",
      );
    }

    if (data.status_code === "FINISHED") {
      return;
    }

    if (data.status_code === "ERROR" || data.status_code === "EXPIRED") {
      throw new Error(`Instagram media processing failed: ${data.status_code}`);
    }

    // IN_PROGRESS / other processing state
    if (attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw new Error(
    "Instagram media is still processing after waiting. Please try again.",
  );
}

export async function publishToInstagram(
  job: SocialJob,
): Promise<SocialPublishResult> {
  try {
    const { accessToken, instagramAccountId } = getConfig();

    // --------------------------------------------------
    // 1. Generate 4:5 Instagram image
    // --------------------------------------------------

    const image = await generateInstagramJobCard(job);

    // --------------------------------------------------
    // 2. Upload image to a public URL
    // --------------------------------------------------

    const uploaded = await uploadInstagramJobCard(job.id, job.slug, image);

    console.log("Instagram uploaded image URL:", uploaded.url);

    // --------------------------------------------------
    // 3. Create Instagram media container
    // --------------------------------------------------

    const containerUrl = `${BASE_URL}/${instagramAccountId}/media`;

    const containerParams = new URLSearchParams();

    containerParams.set("image_url", uploaded.url);

    containerParams.set("caption", buildCaption(job));

    containerParams.set("access_token", accessToken);

    const containerResponse = await fetch(containerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: containerParams.toString(),
      cache: "no-store",
    });

    const container = await parseResponse(containerResponse);

    if (!container.id) {
      throw new Error("Instagram did not return a media container ID.");
    }

    console.log("Instagram media container created:", container.id);

    // Wait until Instagram finishes processing the image
    await waitForMediaReady(container.id, accessToken);

    console.log("Instagram media is ready. Publishing...");

    // --------------------------------------------------
    // 4. Publish the media container
    // --------------------------------------------------

    const publishUrl = `${BASE_URL}/${instagramAccountId}/media_publish`;

    const publishParams = new URLSearchParams();

    publishParams.set("creation_id", container.id);

    publishParams.set("access_token", accessToken);

    const publishResponse = await fetch(publishUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: publishParams.toString(),
      cache: "no-store",
    });

    const published = await parseResponse(publishResponse);

    if (!published.id) {
      throw new Error(
        "Instagram published successfully but did not return a media ID.",
      );
    }

    console.log("Instagram published media ID:", published.id);

    // Get the REAL Instagram post URL
    const permalinkUrl =
      `${BASE_URL}/${published.id}` +
      `?fields=permalink` +
      `&access_token=${encodeURIComponent(accessToken)}`;

    const permalinkResponse = await fetch(permalinkUrl, {
      method: "GET",
      cache: "no-store",
    });

    const permalinkData = await parseResponse(permalinkResponse);

    console.log("Instagram real post permalink:", permalinkData.permalink);

    return {
      success: true,
      platform: "instagram",
      externalPostId: published.id,
      externalPostUrl: permalinkData.permalink || undefined,
    };
  } catch (error) {
    console.error("Instagram publishing failed:", error);

    return {
      success: false,
      platform: "instagram",
      error:
        error instanceof Error
          ? error.message
          : "Unknown Instagram publishing error.",
    };
  }
}
