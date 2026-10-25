/**
 * The address is set by an instructor and fetched by the server: only public HTTPS hosts by name (no IP literal,
 * no local or internal name), so it cannot be used to reach the platform's own network.
 */
export function isFetchableCaptionsUrl(address: string): boolean {
  let url: URL;
  try {
    url = new URL(address);
  } catch {
    return false;
  }
  if (url.protocol !== "https:" || url.username || url.password) return false;
  const host = url.hostname.toLowerCase();
  if (!host.includes(".") || /^[\d.]+$/.test(host) || host.startsWith("[")) return false;
  return !/(^|\.)(localhost|local|internal|lan|home|corp)$/.test(host);
}

/** Same-origin address the player and the download link use for a lesson's captions. */
export const lessonCaptionsPath = (lessonId: string) => `/api/learn/captions/${lessonId}`;
