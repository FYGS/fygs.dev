/**
 * Request-level defences used by proxy.ts, kept free of Next.js types so they can be tested on plain Headers.
 *
 *  1. Cross-site writes. Cookies authenticate the JSON endpoints, and SameSite=Lax alone leaves same-site and
 *     older-browser gaps. A browser always tells where a write comes from: `Sec-Fetch-Site` (cannot be set by page
 *     script) and `Origin`. A write whose origin is not this site is refused. Clients that send neither header
 *     (curl, server-to-server) are not browsers and are not subject to this check; their credentials are explicit.
 *  2. Internal headers a client must never be able to set: `x-middleware-subrequest` (the header behind the 2025
 *     Next.js middleware bypass, CVE-2025-29927), and the CSP/nonce headers that proxy.ts itself creates.
 */

const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/** Endpoints called by machines or by the browser's reporting machinery, not by a page of this site. */
export const CROSS_ORIGIN_EXEMPT_PREFIXES = [
  "/api/stripe/webhook", // signed by Stripe, verified on the raw body
  "/api/cron/", // bearer secret
  "/api/csp-report", // sent by the browser itself, no credentials
  "/api/auth/", // better-auth runs its own origin and CSRF checks
  "/api/health",
] as const;

export function isCrossOriginExempt(pathname: string): boolean {
  return CROSS_ORIGIN_EXEMPT_PREFIXES.some((prefix) => {
    const base = prefix.replace(/\/$/, "");
    return pathname === base || pathname.startsWith(`${base}/`);
  });
}

function originOf(value: string | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

/** Origins that count as "this site": the configured public URLs, and the host the request was sent to. */
export function trustedOrigins(headers: Headers, requestUrl: URL, env: NodeJS.ProcessEnv = process.env): Set<string> {
  const origins = new Set<string>();
  for (const configured of [env.NEXT_PUBLIC_SITE_URL, env.BETTER_AUTH_URL]) {
    const origin = originOf(configured);
    if (origin) origins.add(origin);
  }
  const host = headers.get("host")?.trim();
  if (host && /^[A-Za-z0-9.-]+(:\d{1,5})?$/.test(host)) {
    const forwardedProto = headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
    const protocol = forwardedProto === "http" || forwardedProto === "https" ? forwardedProto : requestUrl.protocol.replace(":", "");
    origins.add(`${protocol}://${host}`);
    // Behind a TLS-terminating proxy the application may see http while the browser used https
    if (env.NODE_ENV === "production") origins.add(`https://${host}`);
  }
  return origins;
}

export type OriginVerdict = { ok: true } | { ok: false; reason: "cross_site" | "origin_mismatch" | "opaque_origin" };

/** Decides whether a write may proceed. Reads and preflights are never refused here. */
export function checkWriteOrigin(
  method: string,
  headers: Headers,
  requestUrl: URL,
  env: NodeJS.ProcessEnv = process.env,
): OriginVerdict {
  if (!WRITE_METHODS.has(method.toUpperCase())) return { ok: true };

  const fetchSite = headers.get("sec-fetch-site")?.toLowerCase();
  if (fetchSite === "cross-site") return { ok: false, reason: "cross_site" };

  const origin = headers.get("origin");
  if (origin === "null") return { ok: false, reason: "opaque_origin" };
  if (origin) {
    return trustedOrigins(headers, requestUrl, env).has(originOf(origin) ?? "") ? { ok: true } : { ok: false, reason: "origin_mismatch" };
  }
  // same-site (a sibling subdomain) with no Origin to confirm it: not this site
  if (fetchSite === "same-site") return { ok: false, reason: "origin_mismatch" };
  return { ok: true };
}

/** Headers a client may not set: removed from the request before it reaches pages, actions and route handlers. */
const FORBIDDEN_INBOUND = ["x-middleware-subrequest", "content-security-policy", "content-security-policy-report-only", "x-nonce"] as const;

/** A copy of the request headers without the internal ones. `changed` tells whether anything had to be removed. */
export function stripInboundHeaders(headers: Headers): { headers: Headers; changed: boolean } {
  const copy = new Headers(headers);
  let changed = false;
  for (const name of FORBIDDEN_INBOUND) {
    if (copy.has(name)) {
      copy.delete(name);
      changed = true;
    }
  }
  return { headers: copy, changed };
}
