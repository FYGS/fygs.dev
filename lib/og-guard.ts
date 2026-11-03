import type { NextRequest } from "next/server";

import { cleanDisplayName } from "@/lib/html-escape";
import { enforceRateLimit } from "@/lib/rate-limit";

/**
 * Share images (Open Graph) built from the query string. Anyone can build such a URL, so whatever the image says
 * must stay inside what the page it announces could say: text is bounded and cleaned, choices come from a list,
 * the route is rate limited, and a given URL is rendered once then served from the cache.
 */

/** Cleaned, bounded text from a query parameter; `fallback` when it is absent or empty. */
export function ogText(request: NextRequest, name: string, fallback: string, maxLength: number): string {
  // Line breaks and tabs become spaces first (words must not run together), then invisible characters are removed
  const value = cleanDisplayName((request.nextUrl.searchParams.get(name) ?? "").replace(/\s+/g, " "), maxLength);
  return value || fallback;
}

/** One of `allowed`, else `fallback`. */
export function ogChoice<T extends string>(request: NextRequest, name: string, allowed: readonly T[], fallback: T): T {
  const value = request.nextUrl.searchParams.get(name);
  return allowed.find((candidate) => candidate === value) ?? fallback;
}

/** A whole number from a query parameter, kept in [min, max]. */
export function ogNumber(request: NextRequest, name: string, min: number, max: number): number {
  const value = parseInt(request.nextUrl.searchParams.get(name) ?? "", 10);
  return Math.min(Math.max(Number.isFinite(value) ? value : min, min), max);
}

/** A URL is rendered once for a day, then the CDN serves it; the browser keeps it an hour. */
export const OG_CACHE_HEADERS = {
  "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
};

/** The 429 to return when this client asks for too many images, else null. */
export function ogRateLimit(request: NextRequest) {
  return enforceRateLimit(request, "og-image", { limit: 60, windowSeconds: 60 });
}
