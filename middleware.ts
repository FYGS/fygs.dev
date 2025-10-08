import { maintenanceConfig } from "@/config/maintenance";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { AccessService } from "@/lib/access-service";
import { AnalyticsHelper } from "@/lib/analytics-helper";
import { auth } from "@/lib/auth";

// Use Node.js runtime for DB + auth session lookup
export const runtime = "nodejs";

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
];

const PUBLIC_PREFIXES = [
  "/",
  "/formations",
  "/pricing",
  "/blog", 
  "/projects",
  "/tech-mastry",
  "/contact",
  "/resume",
  "/terms",
  "/privacy",
];

// Utility: safe internal redirect (prevents open redirect)
function buildInternalRedirect(base: string, target: string | null | undefined): URL | null {
  if (!target) return null;
  try {
    const decoded = decodeURIComponent(target);
    if (!decoded.startsWith('/')) return null; // only allow internal relative paths
    return new URL(decoded, base);
  } catch { return null; }
}

// Match lesson paths: /formations/[course]/lessons/[lesson]
const LESSON_PATH_REGEX = /^\/formations\/[^\/]+\/lessons\/[^\/]+$/;

function isAuthRoute(path: string): boolean {
  return AUTH_ROUTE_PREFIXES.some(p => path.startsWith(p));
}

function isProtectedRoute(path: string): boolean {
  if (LESSON_PATH_REGEX.test(path)) return true; // lesson pages always protected
  return PROTECTED_PREFIXES.some(p => path === p || path.startsWith(p + '/'));
}

function isPublicRoute(path: string): boolean {
  return PUBLIC_PREFIXES.some(p => path === p || path.startsWith(p + '/'));
}

// Determine if request should bypass middleware logic
function shouldBypass(path: string): boolean {
  return (
    path.startsWith('/api/') ||
    path.startsWith('/_next/') ||
    path.startsWith('/static/') ||
    path.includes('.') || // files (favicon, images, etc.)
    path === '/maintenance'
  );
}

// Maintenance gate (runs BEFORE heavy DB logic)
function checkMaintenance(request: NextRequest): NextResponse | null {
  if (!maintenanceConfig.enabled) return null;
  const path = request.nextUrl.pathname;
  if (path === '/maintenance') return null;
  if (maintenanceConfig.allowedPaths?.includes(path)) return null;
  const ip = request.headers.get('x-forwarded-for') || '';
  if (maintenanceConfig.allowedIPs?.includes(ip)) return null;
  const now = new Date();
  if (maintenanceConfig.startTime && maintenanceConfig.endTime) {
    if (now < maintenanceConfig.startTime || now > maintenanceConfig.endTime) return null;
  }
  return NextResponse.rewrite(new URL('/maintenance', request.url));
}

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;

  // Simple static redirect
  if (pathname === '/interview-prep') {
    const url = nextUrl.clone();
    url.pathname = '/tech-mastry';
    return NextResponse.redirect(url, {
      status: 301,
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' }
    });
  }

  // Early bypass for assets and API routes
  if (shouldBypass(pathname)) return NextResponse.next();

  // Maintenance check before auth DB reads
  const maintenanceResponse = checkMaintenance(request);
  if (maintenanceResponse) return maintenanceResponse;

  // Get user session using Better Auth
  let userId: string | undefined;
  let userRole: string | undefined;

  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (session?.user) {
      userId = session.user.id;
      userRole = session.user.role as string;
    }
  } catch (error) {
    // Session resolution failed - treat as unauthenticated
    console.warn('[middleware] Session resolution failed:', error);
  }

  const isAuthenticated = !!userId;

  // If already authenticated and hitting an auth page → redirect to callback or dashboard
  if (isAuthenticated && isAuthRoute(pathname)) {
    const callbackUrl = buildInternalRedirect(request.url, nextUrl.searchParams.get('callbackUrl'));
    return NextResponse.redirect(callbackUrl ?? new URL('/dashboard', request.url));
  }

  // If protected route and not authenticated → redirect to login with callback
  if (!isAuthenticated && isProtectedRoute(pathname)) {
    const loginUrl = new URL('/auth/login', request.url);
    // Preserve original path and query params for post-auth redirect
    loginUrl.searchParams.set('callbackUrl', encodeURIComponent(pathname + nextUrl.search));
    loginUrl.searchParams.set('reason', 'auth_required');
    return NextResponse.redirect(loginUrl);
  }

  // Enhanced lesson access control with course-specific logic
  if (LESSON_PATH_REGEX.test(pathname)) {
    try {
      const pathSegments = pathname.split('/');
      const courseSlug = pathSegments[2];
      const lessonSlug = pathSegments[4];

      if (!courseSlug || !lessonSlug) {
        return NextResponse.redirect(new URL('/formations', request.url));
      }

      // Get lesson and course information
      const lesson = await db.lesson.findFirst({
        where: {
          slug: lessonSlug,
          course: { slug: courseSlug },
          published: true // Only published lessons accessible
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
              tags: { include: { tag: true } }
            }
          }
        }
      });

      if (!lesson || !lesson.course.published) {
        // Lesson or course not found/published → redirect to formations
        return NextResponse.redirect(new URL('/formations', request.url));
      }

      // Only proceed with access evaluation if user is authenticated
      if (userId) {
        const accessResult = await AccessService.checkCourseAccess(userId, lesson.courseId);

        if (!accessResult.canAccessLessons) {
          // Check if this is the first lesson and preview is enabled
          const firstLesson = await db.lesson.findFirst({
            where: { courseId: lesson.courseId, published: true },
            orderBy: { order: 'asc' },
            select: { slug: true, order: true }
          });

          const isFirstLesson = firstLesson && firstLesson.slug === lessonSlug;

          if (isFirstLesson && accessResult.canPreviewFirstLesson) {
            // Allow preview access and track analytics
            try {
              await AnalyticsHelper.recordRecommendationImpression(userId, {
                recommendationType: 'similar_courses',
                courseIds: [lesson.courseId],
                position: 1,
                context: 'course_page',
                timestamp: new Date().toISOString()
              });
            } catch (analyticsError) {
              // Don't fail request for analytics errors
              console.warn('[middleware] Analytics error:', analyticsError);
            }
          } else {
            // No access → redirect to course page with upgrade prompt
            const courseUrl = new URL(`/formations/${courseSlug}`, request.url);
            courseUrl.searchParams.set('locked', '1');
            if (!isFirstLesson) {
              courseUrl.searchParams.set('lesson', lessonSlug);
            }
            return NextResponse.redirect(courseUrl);
          }
        }
      }
    } catch (error) {
      console.error('[middleware] Lesson access evaluation failed:', error);
      // On error, redirect to course catalog to prevent access issues
      return NextResponse.redirect(new URL('/formations', request.url));
    }
  }

  // Allow request to continue for public routes or authorized protected routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Include all routes except API, Next.js internals, static files, and common assets
    '/((?!api/|_next/|static/|.*\\..*$).*)',
    // Specific redirects that need handling
    '/interview-prep',
  ],
};
