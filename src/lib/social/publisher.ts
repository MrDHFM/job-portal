import { buildTelegramJobPost } from "./formatter";
import { publishToTelegram } from "./telegram";
import { publishToInstagram } from "./instagram";
import { publishToLinkedIn } from "./linkedin";
import { db } from "@/db";
import { jobSocialPosts } from "@/db/schema";

import type {
  SocialJob,
  SocialPublishResult,
} from "./types";

export async function saveSocialPostStatus(
  jobId: number,
  result: SocialPublishResult
) {
  try {
    const now = new Date();

    await db
      .insert(jobSocialPosts)
      .values({
        jobId,
        platform: result.platform,

        status: result.success
          ? "PUBLISHED"
          : "FAILED",

        externalPostId:
          result.externalPostId || null,

        externalPostUrl:
          result.externalPostUrl || null,

        errorMessage:
          result.error || null,

        postedAt:
          result.success
            ? now
            : null,

        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [
          jobSocialPosts.jobId,
          jobSocialPosts.platform,
        ],

        set: {
          status: result.success
            ? "PUBLISHED"
            : "FAILED",

          externalPostId:
            result.externalPostId || null,

          externalPostUrl:
            result.externalPostUrl || null,

          errorMessage:
            result.error || null,

          postedAt:
            result.success
              ? now
              : null,

          updatedAt: now,
        },
      });

    console.log(
      `Social post status saved: ${result.platform}`,
      {
        jobId,
        status: result.success
          ? "PUBLISHED"
          : "FAILED",
        externalPostId:
          result.externalPostId,
      }
    );
  } catch (error) {
    console.error(
      `Failed to save ${result.platform} social post status:`,
      error
    );

    // Important:
    // Do NOT throw here.
    //
    // The actual social media post may already
    // have been published successfully.
  }
}

export async function publishJobToSocialMedia(
  job: SocialJob
): Promise<SocialPublishResult[]> {
  const results: SocialPublishResult[] = [];

  // ==================================================
  // TELEGRAM
  // ==================================================

  let telegramResult: SocialPublishResult;

  try {
    const telegramMessage =
      buildTelegramJobPost(job);

    telegramResult =
      await publishToTelegram(
        telegramMessage
      );

    console.log(
      "Telegram publishing result:",
      telegramResult
    );
  } catch (error) {
    console.error(
      "Telegram publishing failed:",
      error
    );

    telegramResult = {
      success: false,
      platform: "telegram",
      error:
        error instanceof Error
          ? error.message
          : "Telegram publishing failed.",
    };
  }

  results.push(telegramResult);

  // Always attempt to save the result
  await saveSocialPostStatus(
    job.id,
    telegramResult
  );

  // ==================================================
  // INSTAGRAM
  // ==================================================

  let instagramResult: SocialPublishResult;

  try {
    instagramResult =
      await publishToInstagram(job);

    console.log(
      "Instagram publishing result:",
      instagramResult
    );
  } catch (error) {
    console.error(
      "Instagram publishing failed:",
      error
    );

    instagramResult = {
      success: false,
      platform: "instagram",
      error:
        error instanceof Error
          ? error.message
          : "Instagram publishing failed.",
    };
  }

  results.push(instagramResult);

  // Always attempt to save the result
  await saveSocialPostStatus(
    job.id,
    instagramResult
  );

  // ==================================================
  // LINKEDIN (Company Page)
  // ==================================================

  let linkedinResult: SocialPublishResult;

  try {
    linkedinResult = await publishToLinkedIn(job);

    console.log(
      "LinkedIn publishing result:",
      linkedinResult
    );
  } catch (error) {
    console.error(
      "LinkedIn publishing failed:",
      error
    );

    linkedinResult = {
      success: false,
      platform: "linkedin",
      error:
        error instanceof Error
          ? error.message
          : "LinkedIn publishing failed.",
    };
  }

  results.push(linkedinResult);

  // Always attempt to save the result
  await saveSocialPostStatus(
    job.id,
    linkedinResult
  );

  // ==================================================
  // FINAL RESULTS
  // ==================================================

  console.log(
    "Final social publishing results:",
    results
  );

  return results;
}

/**
 * (Re)publishes a job to a single automated platform.
 * Used by the admin "Retry" button when one platform failed
 * but the others succeeded — avoids re-posting everywhere.
 */
export async function publishSinglePlatform(
  job: SocialJob,
  platform: "telegram" | "instagram" | "linkedin",
): Promise<SocialPublishResult> {
  let result: SocialPublishResult;

  try {
    if (platform === "telegram") {
      const telegramMessage = buildTelegramJobPost(job);
      result = await publishToTelegram(telegramMessage);
    } else if (platform === "instagram") {
      result = await publishToInstagram(job);
    } else {
      result = await publishToLinkedIn(job);
    }
  } catch (error) {
    console.error(`${platform} retry failed:`, error);

    result = {
      success: false,
      platform,
      error:
        error instanceof Error
          ? error.message
          : `${platform} publishing failed.`,
    };
  }

  await saveSocialPostStatus(job.id, result);

  return result;
}