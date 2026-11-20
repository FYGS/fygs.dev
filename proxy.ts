import { maintenanceConfig } from "@/config/maintenance";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isTranslatedPath } from "@/lib/locale-utils";
import { LEARN_PATH_HEADER, learnPathOf } from "@/lib/learning/request-path";
import { getClientIp } from "@/lib/rate-limit";
import { ALLOW_HEADER, checkWriteOrigin, isCrossOriginExempt, isMethodAllowed, stripInboundHeaders } from "@/lib/request-guard";
import { buildNonceCsp, generateNonce, nonceEnforced, usesNonceCsp } from "@/lib/csp.mjs";


// Available locales from intlayer config
const AVAILABLE_LOCALES = ["fr", "en", "es"] as const;
const DEFAULT_LOCALE = "fr";
type Locale = (typeof AVAILABLE_LOCALES)[number];

/**
 * Extract locale from pathname or return null if not present
 */
function extractLocaleFromPath(pathname: string): Locale | null {
  const segments = pathname.split("/");
  const potentialLocale = segments[1];

  if (
    potentialLocale &&
    AVAILABLE_LOCALES.includes(potentialLocale as Locale)
  ) {
    return potentialLocale as Locale;
  }

  return null;
}

/**
 * Detect user's preferred locale from:
 * 1. Cookie (user's explicit choice - NEXT_LOCALE)
 * 2. Accept-Language header (browser preference)
 * 3. Default locale (fallback)
 */
function detectUserLocale(request: NextRequest): Locale {
  // Check cookie first (user's explicit choice has priority)
  const localeCookie = request.cookies.get("NEXT_LOCALE")?.value;
  if (localeCookie && AVAILABLE_LOCALES.includes(localeCookie as Locale)) {
    return localeCookie as Locale;
  }

  // Check Accept-Language header
  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) {
    // Parse Accept-Language header (e.g., "fr-FR,fr;q=0.9,en;q=0.8")
    const languages = acceptLanguage
      .split(",")
      .map((lang) => lang.split(";")[0].trim().split("-")[0]);

    for (const lang of languages) {
      if (AVAILABLE_LOCALES.includes(lang as Locale)) {
        return lang as Locale;
      }
    }
  }

  // Fallback to default
  return DEFAULT_LOCALE;
}

/**
 * ROUTE POLICY
 * - Public: accessible without auth (marketing, catalog, course page w/ preview)
 * - Protected: requires authenticated user (dashboard, billing, profile, back office)
 * - The learning area (/learn) is not gated here: its free sample lessons are open to visitors, and the page
 *   decides who may open what (lib/learning/page-context.ts, rule in lib/access/entitlement.ts)
 * - Auth: login/register/forgot/etc — redirect away if already authenticated
 * - Special: maintenance, API/static handled early
 */
const AUTH_ROUTE_PREFIXES = [
  "/auth/login",
  "/auth/register",
  "/auth/verify",
  "/auth/forgot-password",
  "/auth/reset-password",
];

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/profile",
  "/settings",
  "/certificates",
  "/admin",
];

// Anyone given a certificate code can check it: no sign-in
const PUBLIC_UNDER_PROTECTED = ["/certificates/verify/"];

/**
 * Remove locale prefix from path for route matching
 * Example: /fr/auth/login -> /auth/login
 */
function getPathWithoutLocale(pathname: string): string {
  const locale = extractLocaleFromPath(pathname);
  if (locale) {
    return pathname.replace(`/${locale}`, "") || "/";
  }
  return pathname;
}

// Utility: safe internal redirect (prevents open redirect)
function buildInternalRedirect(
  base: string,
  target: string | null | undefined,
  locale?: string,
): URL | null {
  if (!target) return null;
  try {
    const decoded = decodeURIComponent(target);
    if (!decoded.startsWith("/")) return null; // only allow internal relative paths

    // Ensure locale is preserved in redirect
    const finalPath =
      locale && !decoded.startsWith(`/${locale}`)
        ? `/${locale}${decoded}`
        : decoded;

    return new URL(finalPath, base);
  } catch {
    return null;
  }
}

function isAuthRoute(path: string): boolean {
  const pathWithoutLocale = getPathWithoutLocale(path);
  return AUTH_ROUTE_PREFIXES.some((p) => pathWithoutLocale.startsWith(p));
}

function isProtectedRoute(path: string): boolean {
  const pathWithoutLocale = getPathWithoutLocale(path);
  if (PUBLIC_UNDER_PROTECTED.some((p) => pathWithoutLocale.startsWith(p))) return false;
  return PROTECTED_PREFIXES.some(
    (p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(p + "/"),
  );
}

/** The playground and the code sandbox carry the policy of their own (next.config.mjs): the proxy leaves them alone. */
function hasOwnCsp(pathWithoutLocale: string): boolean {
  return pathWithoutLocale === "/tech-mastry/playground" || pathWithoutLocale.startsWith("/tech-mastry/playground/");
}

/**
 * Lets the request through with the headers a client must not control removed (the internal middleware header, any
 * Content-Security-Policy or nonce a client sent: only this proxy creates those), plus the extra ones it adds.
 */
function pass(request: NextRequest, extra: Record<string, string> = {}): NextResponse {
  const { headers, changed } = stripInboundHeaders(request.headers);
  for (const [name, value] of Object.entries(extra)) headers.set(name, value);
  if (!changed && Object.keys(extra).length === 0) return NextResponse.next();
  return NextResponse.next({ request: { headers } });
}

/**
 * Continues to a PAGE with its Content-Security-Policy.
 *  - Pages rendered for each request (signed-in areas, see lib/csp.mjs NONCE_ROUTE_PREFIXES) get a fresh nonce and an
 *    enforced policy without 'unsafe-inline' for scripts. The policy goes into the request headers too: that is where
 *    Next.js reads the nonce to stamp it on its own scripts. The response header replaces the static one of next.config.
 *  - Every other page keeps the static policy, and ALSO receives the nonce policy in Report-Only mode, so violations that
 *    enforcing it would cause are measured on real traffic (/api/csp-report).
 *  - CSP_NONCE_ENFORCE=0 turns the enforcement off everywhere (the nonce policy is then only reported).
 */
function pageResponse(request: NextRequest, pathWithoutLocale: string, extra: Record<string, string> = {}): NextResponse {
  if (hasOwnCsp(pathWithoutLocale)) return pass(request, extra);

  const { headers } = stripInboundHeaders(request.headers);
  for (const [name, value] of Object.entries(extra)) headers.set(name, value);

  const nonce = generateNonce();
  const perRequest = usesNonceCsp(pathWithoutLocale);

  if (perRequest && nonceEnforced()) {
    const policy = buildNonceCsp(nonce);
    headers.set("content-security-policy", policy);
    headers.set("x-nonce", nonce);
    const response = NextResponse.next({ request: { headers } });
    response.headers.set("Content-Security-Policy", policy);
    return response;
  }

  const reportOnly = buildNonceCsp(nonce, { reportOnly: true });
  if (perRequest) {
    // Enforcement switched off for a route rendered per request: Next still stamps the nonce, the policy only reports
    headers.set("content-security-policy-report-only", reportOnly);
    headers.set("x-nonce", nonce);
  }
  const response = NextResponse.next({ request: { headers } });
  response.headers.set("Content-Security-Policy-Report-Only", reportOnly);
  return response;
}

const jsonRefusal = (status: number, error: string) =>
  NextResponse.json({ error }, { status, headers: { "Cache-Control": "no-store" } });

// Determine if request should bypass middleware logic
function shouldBypass(path: string): boolean {
  return (
    path.startsWith("/api/") ||
    path.startsWith("/_next/") ||
    path.startsWith("/static/") ||
    path.includes(".") || // files (favicon, images, etc.)
    path === "/maintenance"
  );
}

// Maintenance gate (runs BEFORE heavy DB logic)
function checkMaintenance(request: NextRequest): NextResponse | null {
  if (!maintenanceConfig.enabled) return null;
  const path = request.nextUrl.pathname;
  if (path === "/maintenance") return null;
  if (maintenanceConfig.allowedPaths?.includes(path)) return null;
  // The address the trusted proxy saw, never the raw header (a client could write "127.0.0.1" in it)
  const ip = getClientIp(request.headers);
  if (maintenanceConfig.allowedIPs?.includes(ip)) return null;
  const now = new Date();
  if (maintenanceConfig.startTime && maintenanceConfig.endTime) {
    if (now < maintenanceConfig.startTime || now > maintenanceConfig.endTime)
      return null;
  }
  return NextResponse.rewrite(new URL("/maintenance", request.url));
}

export async function proxy(request: NextRequest) {
  if (!isMethodAllowed(request.method)) {
    return new NextResponse(null, { status: 405, headers: { Allow: ALLOW_HEADER, "Cache-Control": "no-store" } });
  }
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;
  const hostname = request.headers.get("host") || "";

  // Handle www subdomain redirect to non-www
  if (hostname.startsWith("www.")) {
    const newHostname = hostname.replace(/^www\./, "");
    const url = nextUrl.clone();
    url.host = newHostname;
    // Short-lived: the redirect is built from the Host header, so a cache must not remember it for a year
    return NextResponse.redirect(url, {
      status: 301,
      headers: { "Cache-Control": "public, max-age=3600", Vary: "Host" },
    });
  }

  // Cookie-authenticated JSON endpoints: a write must come from this site (see lib/request-guard.ts)
  if (pathname.startsWith("/api/") && !isCrossOriginExempt(pathname)) {
    const verdict = checkWriteOrigin(request.method, request.headers, nextUrl);
    if (!verdict.ok) return jsonRefusal(403, "cross_origin_request");
  }

  // Early bypass for assets and API routes (before locale detection)
  if (shouldBypass(pathname)) return pass(request);

  // Extract current locale from path
  let currentLocale = extractLocaleFromPath(pathname);

  // If no locale in path, redirect to detected locale
  if (!currentLocale) {
    const detectedLocale = detectUserLocale(request);
    const url = nextUrl.clone();

    // Special handling for specific redirects
    if (pathname === "/interview-prep") {
      url.pathname = `/${detectedLocale}/tech-mastry`;
      return NextResponse.redirect(url, {
        status: 301,
        headers: { "Cache-Control": "public, max-age=31536000, immutable" },
      });
    }

    // Handle root path explicitly
    if (pathname === "/" || pathname === "") {
      url.pathname = `/${detectedLocale}`;
      return NextResponse.redirect(url, {
        status: 307, // Temporary redirect to respect user's locale preference
      });
    }

    // General locale redirect for other paths
    url.pathname = `/${detectedLocale}${pathname}`;
    return NextResponse.redirect(url, {
      status: 307, // Temporary redirect to allow locale switching
    });
  }

  // Handle static redirect with locale (if someone tries /fr/interview-prep, etc.)
  if (pathname.endsWith("/interview-prep")) {
    const url = nextUrl.clone();
    url.pathname = url.pathname.replace("/interview-prep", "/tech-mastry");
    return NextResponse.redirect(url, {
      status: 301,
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
    });
  }

  // The application area is French only: /en/dashboard and /es/formations go to the French page
  if (currentLocale !== DEFAULT_LOCALE) {
    const rest = pathname.slice(currentLocale.length + 1) || "/";
    if (!isTranslatedPath(rest)) {
      const url = nextUrl.clone();
      url.pathname = `/${DEFAULT_LOCALE}${rest === "/" ? "" : rest}`;
      return NextResponse.redirect(url, { status: 307 });
    }
  }

  // Maintenance check before auth DB reads
  const maintenanceResponse = checkMaintenance(request);
  if (maintenanceResponse) return maintenanceResponse;

  // Get user session using Better Auth
  let userId: string | undefined;

  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (session?.user) {
      userId = session.user.id;
    }
  } catch (error) {
    // Session resolution failed - treat as unauthenticated
    console.warn("[middleware] Session resolution failed:", error);
  }

  const isAuthenticated = !!userId;
  // Update currentLocale if it wasn't set earlier
  if (!currentLocale) {
    currentLocale = extractLocaleFromPath(pathname) || DEFAULT_LOCALE;
  }

  // If already authenticated and hitting an auth page → redirect to callback or dashboard
  if (isAuthenticated && isAuthRoute(pathname)) {
    const callbackUrl = buildInternalRedirect(
      request.url,
      nextUrl.searchParams.get("callbackUrl"),
      currentLocale,
    );
    return NextResponse.redirect(
      callbackUrl ?? new URL(`/${currentLocale}/dashboard`, request.url),
    );
  }

  // If protected route and not authenticated → redirect to login with callback
  if (!isAuthenticated && isProtectedRoute(pathname)) {
    const loginUrl = new URL(`/${currentLocale}/auth/login`, request.url);
    // Preserve original path and query params for post-auth redirect
    loginUrl.searchParams.set("callbackUrl", pathname + nextUrl.search);
    loginUrl.searchParams.set("reason", "auth_required");
    return NextResponse.redirect(loginUrl);
  }

  // The learning area brings a visitor back to the exact step they asked for (lib/learning/request-path.ts)
  const learnPath = learnPathOf(pathname, nextUrl.search);

  // Allow request to continue for public routes or authorized protected routes
  return pageResponse(request, getPathWithoutLocale(pathname), learnPath ? { [LEARN_PATH_HEADER]: learnPath } : {});
}

export const config = {
  matcher: [
    // Match all routes for locale detection and redirect
    // Including: root (/), www subdomain, and all non-localized paths
    // Excluding: API routes, static files, Next.js internals, and file extensions
    "/",
    // The API is matched too, for the cross-site write check and the removal of internal headers (lib/request-guard.ts)
    "/api/:path*",
    "/((?!api|static|assets|robots|sitemap|sw|service-worker|manifest|.*\\..*|_next).*)",
  ],
};
