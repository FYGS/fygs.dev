import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { enforceRateLimit } from "@/lib/rate-limit";
import { loadLearnerCourseState } from "@/lib/learning/course-state";
import { toBreakdown } from "@/lib/learning/completion";
import { getUserCoursesProgress } from "@/lib/progress-summary";
import { progressEtag } from "@/lib/learning/etag";

// Nodemailer (indirect via auth/email) requires Node.js runtime (stream module)
export const runtime = "nodejs";

/*
 * Progress summary for the dashboard.
 * - Without courseId: progress of every enrolled course.
 * - With courseId: the breakdown of one course (lessons, quizzes, exam) and its certificate.
 * Both read the single progress rule of lib/learning/outline.ts. Certificates are issued by the
 * actions that finish a course (lesson, quiz, exam), never by reading this endpoint.
 */
export async function GET(request: Request) {
  const limited = await enforceRateLimit(request, "read", {
    limit: 120,
    windowSeconds: 60,
  });
  if (limited) return limited;

  const ifNoneMatch = new Headers(request.headers).get("if-none-match");
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;
  if (!userId)
    return NextResponse.json(
      { ok: false, error: "UNAUTHENTICATED" },
      { status: 401 }
    );

  const courseId = new URL(request.url).searchParams.get("courseId");

  if (courseId) {
    try {
      const enrolled = await db.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId } },
        select: { id: true },
      });
      if (!enrolled) {
        return NextResponse.json({ ok: false, error: "NOT_ENROLLED" }, { status: 403 });
      }
      const [{ progress }, certificate] = await Promise.all([
        loadLearnerCourseState(userId, courseId),
        db.certificate.findUnique({
          where: { userId_courseId: { userId, courseId } },
          select: { id: true, code: true },
        }),
      ]);

      return NextResponse.json(
        {
          ok: true,
          completion: progress.percent,
          breakdown: toBreakdown(progress),
          hasCertificate: !!certificate,
          certificateCode: certificate?.code ?? null,
        },
        { headers: { "Cache-Control": "no-store" } }
      );
    } catch (error) {
      console.error("Error calculating course completion:", error);
      return NextResponse.json(
        { ok: false, error: "Failed to calculate completion" },
        { status: 500 }
      );
    }
  }

  const summaries = await getUserCoursesProgress(userId);
  const etag = progressEtag(summaries);
  if (ifNoneMatch && ifNoneMatch === etag) {
    return new NextResponse(null, { status: 304, headers: { ETag: etag } });
  }
  return NextResponse.json(
    { ok: true, summaries },
    { headers: { ETag: etag, "Cache-Control": "no-store" } }
  );
}
