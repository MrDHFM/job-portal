import { validateUrlIsSafe } from "./validate";
import { detectGreenhouse, extractFromGreenhouse } from "./sources/greenhouse";
import { detectLever, extractFromLever } from "./sources/lever";
import { detectAshby, extractFromAshby } from "./sources/ashby";
import { extractGeneric } from "./sources/generic";
import type { ImportOutcome } from "./import-types";

/**
 * Detects which known ATS a URL belongs to (if any) and routes to the
 * matching connector, falling back to generic JSON-LD/meta extraction
 * for everything else — including if a known-provider connector fails
 * for some reason (its own API being down, a nonstandard URL, etc.).
 */
export async function importJobFromUrl(rawUrl: string): Promise<ImportOutcome> {
  const safety = await validateUrlIsSafe(rawUrl);
  if (!safety.safe) {
    return { success: false, error: safety.reason };
  }

  if (detectGreenhouse(rawUrl)) {
    const result = await extractFromGreenhouse(rawUrl);
    if (result.success) return result;
    // Fall through to generic extraction rather than dead-ending the admin.
  }

  if (detectLever(rawUrl)) {
    const result = await extractFromLever(rawUrl);
    if (result.success) return result;
  }

  if (detectAshby(rawUrl)) {
    const result = await extractFromAshby(rawUrl);
    if (result.success) return result;
  }

  return extractGeneric(rawUrl);
}
