export type TrafficSource =
  | "instagram"
  | "telegram"
  | "linkedin"
  | "x"
  | "google"
  | "bing"
  | "facebook"
  | "referral"
  | "direct"
  | "other";

export type TrafficAttribution = {
  source: TrafficSource;
  medium: string | null;
  campaign: string | null;
  content: string | null;
};

const SOCIAL_SOURCES: TrafficSource[] = [
  "instagram",
  "telegram",
  "linkedin",
  "x",
  "facebook",
];

export function normalizeTrafficSource(
  source?: string | null,
): TrafficSource {
  const value = source?.trim().toLowerCase();

  if (!value) return "direct";

  if (
    value === "instagram" ||
    value === "ig"
  ) {
    return "instagram";
  }

  if (value === "telegram" || value === "tg") {
    return "telegram";
  }

  if (
    value === "linkedin" ||
    value === "linked-in"
  ) {
    return "linkedin";
  }

  if (
    value === "x" ||
    value === "twitter"
  ) {
    return "x";
  }

  if (value === "google") {
    return "google";
  }

  if (value === "bing") {
    return "bing";
  }

  if (value === "facebook" || value === "fb") {
    return "facebook";
  }

  if (value === "direct") {
    return "direct";
  }

  return "other";
}

export function getTrafficAttribution(
  searchParams: URLSearchParams,
  referer?: string | null,
): TrafficAttribution {
  const utmSource =
    searchParams.get("utm_source");

  const utmMedium =
    searchParams.get("utm_medium");

  const utmCampaign =
    searchParams.get("utm_campaign");

  const utmContent =
    searchParams.get("utm_content");

  if (utmSource) {
    return {
      source: normalizeTrafficSource(utmSource),
      medium: utmMedium || null,
      campaign: utmCampaign || null,
      content: utmContent || null,
    };
  }

  if (!referer) {
    return {
      source: "direct",
      medium: null,
      campaign: null,
      content: null,
    };
  }

  try {
    const hostname = new URL(referer)
      .hostname
      .toLowerCase();

    if (hostname.includes("google.")) {
      return {
        source: "google",
        medium: "organic",
        campaign: null,
        content: null,
      };
    }

    if (hostname.includes("bing.")) {
      return {
        source: "bing",
        medium: "organic",
        campaign: null,
        content: null,
      };
    }

    for (const social of SOCIAL_SOURCES) {
      if (hostname.includes(social)) {
        return {
          source: social,
          medium: "referral",
          campaign: null,
          content: null,
        };
      }
    }

    return {
      source: "referral",
      medium: "referral",
      campaign: null,
      content: hostname,
    };
  } catch {
    return {
      source: "other",
      medium: "referral",
      campaign: null,
      content: null,
    };
  }
}