import { SafeFetchError, validateOutboundUrl } from "@/lib/net/safe-fetch";

/**
 * Cheap check, made when an instructor saves the address and again before the fetch: HTTPS on port 443, a public-looking
 * name (no IP literal, no credentials, no internal name). It does NOT replace the connection-time check of
 * `safeFetchText`, which resolves the name and refuses private addresses.
 */
export function isFetchableCaptionsUrl(address: string): boolean {
  try {
    validateOutboundUrl(address);
    return true;
  } catch (error) {
    if (error instanceof SafeFetchError) return false;
    throw error;
  }
}

// Same-origin addresses live in a module with no server dependency (client components use them too)
export { lessonCaptionsPath, lessonMediaPath, lessonResourcePath } from "./media-paths";
