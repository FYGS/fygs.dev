import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CourseCompletionService } from "@/lib/course-completion.service";

// Nodemailer (indirect via auth/email) requires Node.js runtime (stream module)
export const runtime = "nodejs";

/*
 * Progress summary for dashboard.
 * - Without courseId: Returns bulk progress for all enrolled courses (legacy format)
 * - With courseId: Returns detailed completion breakdown for specific course
 */
export async function GET(request: Request) {
  const ifNoneMatch = new Headers(request.headers).get("if-none-match");
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;
  if (!userId)
    return NextResponse.json(
      { ok: false, error: "UNAUTHENTICATED" },
      { status: 401 }
    );

  // Check if specific courseId requested
  const url = new URL(request.url);
  const courseId = url.searchParams.get("courseId");

  // Single course detailed progress
  if (courseId) {
    try {
      const completion =
        await CourseCompletionService.calculateCourseCompletion(
          userId,
          courseId
        );
      const existingCertificate = await db.certificate.findUnique({
        where: { userId_courseId: { userId, courseId } },
      });

      return NextResponse.json(
        {
          ok: true,
          completion: completion.overall.percentage,
          breakdown: completion,
          hasCertificate: !!existingCertificate,
          justEarnedCertificate:
            completion.overall.isComplete && !existingCertificate,
        },
        {
          headers: { "Cache-Control": "no-store" },
        }
      );
    } catch (error) {
      console.error("Error calculating course completion:", error);
      return NextResponse.json(
        { ok: false, error: "Failed to calculate completion" },
        { status: 500 }
      );
    }
  }

  // Fetch all published lessons + progresses in two queries then aggregate in memory
  const [enrollments, progresses, certificates, lessons] = await Promise.all([
    db.enrollment.findMany({ where: { userId }, select: { courseId: true } }),
    db.progress.findMany({
      where: { userId },
      select: {
        lessonId: true,
        completed: true,
        lesson: { select: { courseId: true } },
      },
    }),
    db.certificate.findMany({ where: { userId }, select: { courseId: true } }),
    db.lesson.findMany({
      where: { published: true },
      select: { id: true, courseId: true },
    }),
  ]);

  const certSet = new Set(certificates.map((c) => c.courseId));

  // Group lessons per course
  const lessonsByCourse = new Map<string, string[]>();
  for (const l of lessons) {
    const arr = lessonsByCourse.get(l.courseId) || [];
    arr.push(l.id);
    lessonsByCourse.set(l.courseId, arr);
  }
  // Group completed per course
  const completedMap = new Map<string, Set<string>>();
  for (const p of progresses) {
    if (!p.completed) continue;
    const set = completedMap.get(p.lesson.courseId) || new Set<string>();
    set.add(p.lessonId);
    completedMap.set(p.lesson.courseId, set);
  }

  let justEarnedCertificate = false;
  const summaries = enrollments.map((e) => {
    const lessonIds = lessonsByCourse.get(e.courseId) || [];
    const completedSet = completedMap.get(e.courseId) || new Set<string>();
    const totalLessons = lessonIds.length;
    const completedLessons = completedSet.size;
    const percent =
      totalLessons === 0
        ? 0
        : Math.round((completedLessons / totalLessons) * 100);
    const hasCert = certSet.has(e.courseId) || percent === 100;
    if (percent === 100 && !certSet.has(e.courseId))
      justEarnedCertificate = true;
    return {
      courseId: e.courseId,
      totalLessons,
      completedLessons,
      percent,
      hasCertificate: hasCert,
    };
  });
  // Generate ETag simple hash
  const etagSource = JSON.stringify(
    summaries.map((s) => [s.courseId, s.percent, s.hasCertificate])
  );
  // Lightweight hash (FNV-1a like) for ETag; sufficient for change detection
  let hash = 2166136261;
  for (let i = 0; i < etagSource.length; i++) {
    hash ^= etagSource.charCodeAt(i);
    hash = (hash * 16777619) >>> 0;
  }
  const etag = 'W/"' + hash.toString(16) + '"';
  if (ifNoneMatch && ifNoneMatch === etag) {
    return new NextResponse(null, { status: 304, headers: { ETag: etag } });
  }
  return NextResponse.json(
    { ok: true, summaries, justEarnedCertificate },
    { headers: { ETag: etag, "Cache-Control": "no-store" } }
  );
}
