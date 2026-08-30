import type { SocialJob, SocialPublishResult } from "./types";
import { buildLinkedInPost } from "./manual-formatter";

// LinkedIn's current REST API for creating posts (replaces the deprecated
// /v2/ugcPosts endpoint). Docs: https://learn.microsoft.com/linkedin/marketing/community-management/shares/posts-api
const LINKEDIN_API_VERSION = process.env.LINKEDIN_API_VERSION || "202405";
const LINKEDIN_POSTS_URL = "https://api.linkedin.com/rest/posts";

type LinkedInErrorResponse = {
  message?: string;
  serviceErrorCode?: number;
  status?: number;
};

/**
 * Publishes a job to the configured LinkedIn Company Page.
 *
 * Requires:
 *  - LINKEDIN_ACCESS_TOKEN   an access token with the w_organization_social
 *                            scope, generated for a Company Page admin via
 *                            LinkedIn's Community Management API product.
 *  - LINKEDIN_ORGANIZATION_ID the numeric LinkedIn organization/company ID
 *                            (found in the Company Page admin URL or via
 *                            GET /v2/organizationAcls).
 *
 * This posts to the ORGANIZATION's feed, not the authenticated member's
 * personal profile — the `author` URN below is what controls that.
 */
export async function publishToLinkedIn(
  job: SocialJob,
): Promise<SocialPublishResult> {
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
  const organizationId = process.env.LINKEDIN_ORGANIZATION_ID;

  if (!accessToken || !organizationId) {
    return {
      success: false,
      platform: "linkedin",
      error:
        "LinkedIn is not configured. Set LINKEDIN_ACCESS_TOKEN and LINKEDIN_ORGANIZATION_ID.",
    };
  }

  try {
    const { content, jobUrl } = buildLinkedInPost(job);
    const authorUrn = `urn:li:organization:${organizationId}`;

    const body = {
      author: authorUrn,
      commentary: content,
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      content: {
        article: {
          source: jobUrl,
          title: job.title,
          description: job.companyName
            ? `Hiring at ${job.companyName}`
            : undefined,
        },
      },
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false,
    };

    const response = await fetch(LINKEDIN_POSTS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "LinkedIn-Version": LINKEDIN_API_VERSION,
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    // Success responses (201 Created) return an empty body; the post's
    // URN comes back in the `x-restli-id` / `x-linkedin-id` response header.
    if (response.ok) {
      const postUrn =
        response.headers.get("x-restli-id") ||
        response.headers.get("x-linkedin-id") ||
        "";

      // Turn "urn:li:share:12345" / "urn:li:ugcPost:12345" into a viewable URL.
      const externalPostUrl = postUrn
        ? `https://www.linkedin.com/feed/update/${postUrn}`
        : undefined;

      return {
        success: true,
        platform: "linkedin",
        externalPostId: postUrn || undefined,
        externalPostUrl,
      };
    }

    let errorData: LinkedInErrorResponse = {};
    try {
      errorData = await response.json();
    } catch {
      // response body wasn't JSON; fall through with a generic message
    }

    console.error("LinkedIn API error:", {
      status: response.status,
      response: errorData,
    });

    return {
      success: false,
      platform: "linkedin",
      error:
        errorData.message ||
        `LinkedIn API returned ${response.status}. Check that the access token has w_organization_social scope and hasn't expired.`,
    };
  } catch (error) {
    console.error("LinkedIn publishing failed:", error);

    return {
      success: false,
      platform: "linkedin",
      error:
        error instanceof Error
          ? error.message
          : "LinkedIn publishing failed.",
    };
  }
}
