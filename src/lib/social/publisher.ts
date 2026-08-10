import { buildTelegramJobPost } from "./formatter";
import { publishToTelegram } from "./telegram";
import { publishToInstagram } from "./instagram";
import { db } from "@/db";
import { jobSocialPosts } from "@/db/schema";

import type {
  SocialJob,
  SocialPublishResult,
} from "./types";

async function saveSocialPostStatus(
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
  // FINAL RESULTS
  // ==================================================

  console.log(
    "Final social publishing results:",
    results
  );

  return results;
}