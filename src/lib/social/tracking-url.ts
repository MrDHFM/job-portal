type SocialSource =
  | "instagram"
  | "telegram"
  | "linkedin"
  | "x";

export function buildTrackedJobUrl(
  slug: string,
  source: SocialSource,
) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://job-portal-zeta-two-46.vercel.app";

  const url = new URL(
    `/jobs/detail/${slug}`,
    siteUrl,
  );

  url.searchParams.set(
    "utm_source",
    source,
  );

  url.searchParams.set(
    "utm_medium",
    "social",
  );

  url.searchParams.set(
    "utm_campaign",
    "job_post",
  );

  url.searchParams.set(
    "utm_content",
    slug,
  );

  return url.toString();
}