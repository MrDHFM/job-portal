import { put } from "@vercel/blob";

export async function uploadInstagramJobCard(
  jobId: number,
  slug: string,
  image: ArrayBuffer
) {
  const safeSlug = slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const pathname =
    `social/instagram/jobs/${jobId}-${safeSlug}-${Date.now()}.png`;

  const blob = await put(
    pathname,
    Buffer.from(image),
    {
      access: "public",
      contentType: "image/png",

      // We want a new asset during testing.
      addRandomSuffix: false,
    }
  );

  return {
    url: blob.url,
    pathname: blob.pathname,
  };
}