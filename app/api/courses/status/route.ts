import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { AccessService } from "@/lib/access-service";
import { createLogger } from "@/lib/structured-logger";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const limited = await enforceRateLimit(req, "read", {
    limit: 120,
    windowSeconds: 60,
  });
  if (limited) return limited;

  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ unlocked: false, reason: "unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const courseId = searchParams.get("courseId");

    if (!slug && !courseId) {
      return NextResponse.json({ error: "Missing slug or courseId" }, { status: 400 });
    }

    const course = await db.course.findFirst({
      where: slug ? { slug } : { id: courseId as string },
      select: {
        id: true,
        slug: true,
        lessons: {
          where: { published: true },
          orderBy: { order: "asc" },
          select: { slug: true },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ unlocked: false, reason: "not_found" }, { status: 404 });
    }

    // Use AccessService for comprehensive access check
    const userAccess = await AccessService.checkCourseAccess(session.user.id, course.id);

    return NextResponse.json({
      unlocked: userAccess.canAccessCourse,
      hasActiveSubscription: userAccess.hasActiveSubscription,
      isEnrolledInCourse: userAccess.isEnrolledInCourse,
      canAccessLessons: userAccess.canAccessLessons,
      courseId: course.id,
      slug: course.slug,
      firstLessonSlug: course.lessons[0]?.slug || null,
      enrollmentDate: userAccess.enrollmentDate,
      subscriptionStatus: userAccess.subscriptionStatus,
    });
  } catch (error) {
    const apiLogger = createLogger({ operation: 'course-status-api', resourceType: 'api' });
    apiLogger.error("Course status error", {
      metadata: { error: error instanceof Error ? error.message : String(error) }
    }, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


