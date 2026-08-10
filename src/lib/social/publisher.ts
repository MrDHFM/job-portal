import { buildTelegramJobPost } from "./formatter";
import { publishToTelegram } from "./telegram";
import { publishToInstagram } from "./instagram";

import type {
  SocialJob,
  SocialPublishResult,
} from "./types";

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