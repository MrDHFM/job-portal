import { buildTelegramJobPost } from "./formatter";
import { publishToTelegram } from "./telegram";
import type {
  SocialJob,
  SocialPublishResult,
} from "./types";

export async function publishJobToSocialMedia(
  job: SocialJob
): Promise<SocialPublishResult[]> {
  const results: SocialPublishResult[] = [];

  try {
    const telegramMessage =
      buildTelegramJobPost(job);

    const telegramResult =
      await publishToTelegram(telegramMessage);

    results.push(telegramResult);
  } catch (error) {
    console.error(
      "Social publishing failed:",
      error
    );

    results.push({
      success: false,
      platform: "telegram",
      error:
        error instanceof Error
          ? error.message
          : "Unknown social publishing error.",
    });
  }

  return results;
}