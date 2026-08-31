import { promises as dns } from "dns";
import { isIP } from "net";

// SSRF protection for the URL-import feature. This endpoint fetches
// whatever URL an admin pastes in, so it must never be usable to reach
// internal infrastructure (localhost, private IP ranges, cloud metadata
// endpoints like 169.254.169.254, etc.) — including via redirects.

const MAX_REDIRECTS = 4;
const FETCH_TIMEOUT_MS = 8000;
const MAX_RESPONSE_BYTES = 3 * 1024 * 1024; // 3MB — job posting pages are text/HTML, never need more

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "ip6-localhost",
  "metadata.google.internal",
]);

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p))) return true; // malformed = treat as unsafe

  const [a, b] = parts;

  if (a === 127) return true; // loopback
  if (a === 10) return true; // private
  if (a === 0) return true; // "this network"
  if (a === 169 && b === 254) return true; // link-local incl. cloud metadata (169.254.169.254)
  if (a === 172 && b >= 16 && b <= 31) return true; // private
  if (a === 192 && b === 168) return true; // private
  if (a === 100 && b >= 64 && b <= 127) return true; // carrier-grade NAT
  if (a >= 224) return true; // multicast/reserved

  return false;
}

function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  if (normalized === "::1") return true; // loopback
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true; // unique local
  if (normalized.startsWith("fe80")) return true; // link-local
  if (normalized === "::") return true;
  // IPv4-mapped IPv6 (::ffff:127.0.0.1 etc.) — check the embedded IPv4 too.
  const mapped = normalized.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateIPv4(mapped[1]);
  return false;
}

async function resolvesToPrivateAddress(hostname: string): Promise<boolean> {
  const ipVersion = isIP(hostname);
  if (ipVersion === 4) return isPrivateIPv4(hostname);
  if (ipVersion === 6) return isPrivateIPv6(hostname);

  // Not a literal IP — resolve it and check every address it maps to,
  // since DNS can return multiple records (or an attacker-controlled
  // domain could resolve to a private IP — "DNS rebinding").
  try {
    const records = await dns.lookup(hostname, { all: true, verbatim: true });
    if (records.length === 0) return true; // couldn't resolve = treat as unsafe

    return records.some((record) =>
      record.family === 4
        ? isPrivateIPv4(record.address)
        : isPrivateIPv6(record.address),
    );
  } catch {
    return true; // DNS failure = treat as unsafe rather than silently proceeding
  }
}

export type UrlSafetyResult = { safe: true } | { safe: false; reason: string };

export async function validateUrlIsSafe(
  rawUrl: string,
): Promise<UrlSafetyResult> {
  let url: URL;

  try {
    url = new URL(rawUrl);
  } catch {
    return { safe: false, reason: "That doesn't look like a valid URL." };
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    return {
      safe: false,
      reason: "Only http:// and https:// URLs are supported.",
    };
  }

  const hostname = url.hostname.toLowerCase();

  if (BLOCKED_HOSTNAMES.has(hostname)) {
    return {
      safe: false,
      reason: "That host is not allowed.",
    };
  }

  if (await resolvesToPrivateAddress(hostname)) {
    return {
      safe: false,
      reason: "That URL resolves to a private or internal address and cannot be fetched.",
    };
  }

  return { safe: true };
}

export type SafeFetchResult =
  | { ok: true; status: number; finalUrl: string; text: string }
  | { ok: false; error: string };

/**
 * Fetches a URL an admin pasted in, with SSRF protection applied to
 * both the initial URL and every redirect hop, plus a timeout and a
 * response-size cap so a malicious or huge page can't hang the request.
 */
export async function safeFetch(
  initialUrl: string,
  options: { headers?: Record<string, string> } = {},
): Promise<SafeFetchResult> {
  let currentUrl = initialUrl;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const safety = await validateUrlIsSafe(currentUrl);
    if (!safety.safe) {
      return { ok: false, error: safety.reason };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let response: Response;

    try {
      response = await fetch(currentUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; JobPortalAdminImporter/1.0)",
          Accept: "text/html,application/json,application/ld+json,*/*",
          ...options.headers,
        },
        redirect: "manual",
        signal: controller.signal,
      });
    } catch (error) {
      clearTimeout(timeout);
      return {
        ok: false,
        error:
          error instanceof Error && error.name === "AbortError"
            ? "That page took too long to respond."
            : "Could not reach that URL.",
      };
    }

    clearTimeout(timeout);

    // Manually follow redirects so every hop gets SSRF-checked —
    // fetch's built-in redirect following would skip this entirely.
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location) {
        return { ok: false, error: "Redirect with no destination." };
      }

      currentUrl = new URL(location, currentUrl).toString();
      continue;
    }

    if (!response.ok) {
      return { ok: false, error: `That page returned an error (${response.status}).` };
    }

    const contentType = response.headers.get("content-type") || "";
    if (
      !contentType.includes("text/html") &&
      !contentType.includes("application/json") &&
      !contentType.includes("text/plain")
    ) {
      return {
        ok: false,
        error: "That URL didn't return a web page we can read.",
      };
    }

    // Enforce a response-size cap while streaming, rather than trusting
    // Content-Length (which a server can misreport).
    const reader = response.body?.getReader();
    if (!reader) {
      return { ok: false, error: "Could not read that page's content." };
    }

    const chunks: Uint8Array[] = [];
    let totalBytes = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalBytes += value.byteLength;
      if (totalBytes > MAX_RESPONSE_BYTES) {
        reader.cancel();
        return { ok: false, error: "That page is too large to process." };
      }

      chunks.push(value);
    }

    const text = Buffer.concat(chunks).toString("utf-8");

    return { ok: true, status: response.status, finalUrl: currentUrl, text };
  }

  return { ok: false, error: "Too many redirects." };
}
