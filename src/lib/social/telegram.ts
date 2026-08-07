import type { SocialPublishResult } from "./types";

type TelegramResponse = {
  ok: boolean;

  result?: {
    message_id: number;
  };

  description?: string;
};

type TelegramMessage = {
  text: string;
  jobUrl: string;
};

export async function publishToTelegram(
  message: TelegramMessage
): Promise<SocialPublishResult> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID;

  if (!botToken || !channelId) {
    return {
      success: false,
      platform: "telegram",
      error: "Telegram environment variables are not configured.",
    };
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          chat_id: channelId,

          text: message.text,

          disable_web_page_preview: false,

          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🔗 View Job & Apply",
                  url: message.jobUrl,
                },
              ],
            ],
          },
        }),

        cache: "no-store",
      }
    );

    const data = (await response.json()) as TelegramResponse;

    if (!response.ok || !data.ok) {
      console.error("Telegram publishing failed:", {
        status: response.status,
        description: data.description,
      });

      return {
        success: false,
        platform: "telegram",
        error:
          data.description ||
          "Telegram API request failed.",
      };
    }

    return {
      success: true,
      platform: "telegram",
      externalPostId: String(
        data.result?.message_id ?? ""
      ),
    };
  } catch (error) {
    console.error(
      "Telegram publishing error:",
      error
    );

    return {
      success: false,
      platform: "telegram",
      error:
        error instanceof Error
          ? error.message
          : "Unknown Telegram publishing error.",
    };
  }
}