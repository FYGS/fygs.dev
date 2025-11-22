import { maintenanceConfig } from "@/config/maintenance";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { AccessService } from "@/lib/access-service";
import { AnalyticsHelper } from "@/lib/analytics-helper";
import { auth } from "@/lib/auth";

// Use Node.js runtime for DB + auth session lookup
export const runtime = "nodejs";

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
 * - Protected: requires authenticated user (dashboard, billing, profile, lesson content)
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

// const PUBLIC_PREFIXES = [
//   "/",
//   "/formations",
//   "/pricing",
//   "/blog",
//   "/projects",
//   "/tech-mastry",
//   "/contact",
//   "/me",
//   "/terms",
//   "/privacy",
// ];

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
  locale?: string
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

// Match lesson paths: /[locale]/formations/[course]/lessons/[lesson]
const LESSON_PATH_REGEX =
  /^\/(?:fr|en|es)\/formations\/[^\/]+\/lessons\/[^\/]+$/;

function isAuthRoute(path: string): boolean {
  const pathWithoutLocale = getPathWithoutLocale(path);
  return AUTH_ROUTE_PREFIXES.some((p) => pathWithoutLocale.startsWith(p));
}

function isProtectedRoute(path: string): boolean {
  if (LESSON_PATH_REGEX.test(path)) return true; // lesson pages always protected
  const pathWithoutLocale = getPathWithoutLocale(path);
  return PROTECTED_PREFIXES.some(
    (p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(p + "/")
  );
}

// function isPublicRoute(path: string): boolean {
//   return PUBLIC_PREFIXES.some(p => path === p || path.startsWith(p + '/'));
// }

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
  const ip = request.headers.get("x-forwarded-for") || "";
  if (maintenanceConfig.allowedIPs?.includes(ip)) return null;
  const now = new Date();
  if (maintenanceConfig.startTime && maintenanceConfig.endTime) {
    if (now < maintenanceConfig.startTime || now > maintenanceConfig.endTime)
      return null;
  }
  return NextResponse.rewrite(new URL("/maintenance", request.url));
}

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;
  const hostname = request.headers.get("host") || "";

  // Handle www subdomain redirect to non-www
  if (hostname.startsWith("www.")) {
    const newHostname = hostname.replace(/^www\./, "");
    const url = nextUrl.clone();
    url.host = newHostname;
    return NextResponse.redirect(url, {
      status: 301,
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
    });
  }

  // Early bypass for assets and API routes (before locale detection)
  if (shouldBypass(pathname)) return NextResponse.next();

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
      currentLocale
    );
    return NextResponse.redirect(
      callbackUrl ?? new URL(`/${currentLocale}/dashboard`, request.url)
    );
  }

  // If protected route and not authenticated → redirect to login with callback
  if (!isAuthenticated && isProtectedRoute(pathname)) {
    const loginUrl = new URL(`/${currentLocale}/auth/login`, request.url);
    // Preserve original path and query params for post-auth redirect
    loginUrl.searchParams.set(
      "callbackUrl",
      pathname + nextUrl.search
    );
    loginUrl.searchParams.set("reason", "auth_required");
    return NextResponse.redirect(loginUrl);
  }

  // Enhanced lesson access control with course-specific logic
  if (LESSON_PATH_REGEX.test(pathname)) {
    try {
      const pathSegments = pathname.split("/");
      // Path structure: /[locale]/formations/[course]/lessons/[lesson]
      const locale = pathSegments[1];
      const courseSlug = pathSegments[3];
      const lessonSlug = pathSegments[5];

      if (!courseSlug || !lessonSlug) {
        return NextResponse.redirect(
          new URL(`/${locale}/formations`, request.url)
        );
      }

      // Get lesson and course information
      const lesson = await db.lesson.findFirst({
        where: {
          slug: lessonSlug,
          course: { slug: courseSlug },
          published: true, // Only published lessons accessible
        },
        select: {
          id: true,
          order: true,
          courseId: true,
          course: {
            select: {
              id: true,
              accessTier: true,
              previewEnabled: true,
              category: true,
              level: true,
              published: true,
              tags: { include: { tag: true } },
            },
          },
        },
      });

      if (!lesson || !lesson.course.published) {
        // Lesson or course not found/published → redirect to formations
        const locale = pathSegments[1];
        return NextResponse.redirect(
          new URL(`/${locale}/formations`, request.url)
        );
      }

      // Only proceed with access evaluation if user is authenticated
      if (userId) {
        const accessResult = await AccessService.checkCourseAccess(
          userId,
          lesson.courseId
        );

        if (!accessResult.canAccessLessons) {
          // Check if this is the first lesson and preview is enabled
          const firstLesson = await db.lesson.findFirst({
            where: { courseId: lesson.courseId, published: true },
            orderBy: { order: "asc" },
            select: { slug: true, order: true },
          });

          const isFirstLesson = firstLesson && firstLesson.slug === lessonSlug;

          if (isFirstLesson && accessResult.canPreviewFirstLesson) {
            // Allow preview access and track analytics
            try {
              await AnalyticsHelper.recordRecommendationImpression(userId, {
                recommendationType: "similar_courses",
                courseIds: [lesson.courseId],
                position: 1,
                context: "course_page",
                timestamp: new Date().toISOString(),
              });
            } catch (analyticsError) {
              // Don't fail request for analytics errors
              console.warn("[middleware] Analytics error:", analyticsError);
            }
          } else {
            // No access → redirect to course page with upgrade prompt
            const locale = pathSegments[1];
            const courseUrl = new URL(
              `/${locale}/formations/${courseSlug}`,
              request.url
            );
            courseUrl.searchParams.set("locked", "1");
            if (!isFirstLesson) {
              courseUrl.searchParams.set("lesson", lessonSlug);
            }
            return NextResponse.redirect(courseUrl);
          }
        }
      }
    } catch (error) {
      console.error("[middleware] Lesson access evaluation failed:", error);
      // On error, redirect to course catalog to prevent access issues
      const locale = extractLocaleFromPath(pathname) || DEFAULT_LOCALE;
      return NextResponse.redirect(
        new URL(`/${locale}/formations`, request.url)
      );
    }
  }

  // Allow request to continue for public routes or authorized protected routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes for locale detection and redirect
    // Including: root (/), www subdomain, and all non-localized paths
    // Excluding: API routes, static files, Next.js internals, and file extensions
    "/",
    "/((?!api|static|assets|robots|sitemap|sw|service-worker|manifest|.*\\..*|_next).*)",
  ],
};
