import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/rate-limit";
import { recordLessonProgress } from "@/lib/learning/lesson-progress";

export const runtime = "nodejs";

/**
 * Last report of a lesson's video when the tab is hidden or closed, sent with `navigator.sendBeacon` (a server
 * action may be dropped by the browser while the page unloads). Watch time and position only: completing a lesson
 * is an explicit action of the page.
 */
export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "progress-beacon", { limit: 60, windowSeconds: 60 });
  if (limited) return limited;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  let body: unknown;
  try {
    body = JSON.parse(await request.text());
  } catch {
    return NextResponse.json({ error: "VALIDATION_ERROR" }, { status: 400 });
  }
  const { lessonId, watchTimeDelta, lastPosition } = (body ?? {}) as Record<string, unknown>;
  const outcome = await recordLessonProgress(
    { id: session.user.id, role: session.user.role },
    { lessonId, watchTimeDelta, lastPosition },
  );
  if (outcome.success) return new NextResponse(null, { status: 204 });
  const status = outcome.error === "VALIDATION_ERROR" ? 400 : outcome.error === "INTERNAL_ERROR" ? 500 : 403;
  return NextResponse.json({ error: outcome.error }, { status });
}
