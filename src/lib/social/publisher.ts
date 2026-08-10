import { buildTelegramJobPost } from "./formatter";
import { publishToTelegram } from "./telegram";
import { publishToInstagram } from "./instagram";
import { db } from "@/db";
import { jobSocialPosts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

import type {
  SocialJob,
  SocialPublishResult,
} from "./types";

async function saveSocialPostStatus(
  jobId: number,
  result: SocialPublishResult
) {
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
      postedAt: result.success
        ? new Date()
        : null,
      updatedAt: new Date(),
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

        postedAt: result.success
          ? new Date()
          : null,

        updatedAt: new Date(),
      },
    });
}

export async function publishJobToSocialMedia(
  job: SocialJob
): Promise<SocialPublishResult[]> {
  const results: SocialPublishResult[] = [];

  // --------------------------------------------------
  // Telegram
  // --------------------------------------------------

  try {
    const telegramMessage =
      buildTelegramJobPost(job);

    const telegramResult =
      await publishToTelegram(telegramMessage);

    results.push(telegramResult);

await saveSocialPostStatus(
  job.id,
  telegramResult
);
  } catch (error) {
    console.error(
      "Telegram publishing failed:",
      error
    );

    results.push({
      success: false,
      platform: "telegram",
      error:
        error instanceof Error
          ? error.message
          : "Telegram publishing failed.",
    });
  }

  // --------------------------------------------------
  // Instagram
  // --------------------------------------------------

  try {
    const instagramResult =
      await publishToInstagram(job);

    results.push(instagramResult);

await saveSocialPostStatus(
  job.id,
  instagramResult
);
  } catch (error) {
    console.error(
      "Instagram publishing failed:",
      error
    );

    results.push({
      success: false,
      platform: "instagram",
      error:
        error instanceof Error
          ? error.message
          : "Instagram publishing failed.",
    });
  }

  return results;
}