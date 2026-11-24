import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getLessonAccess } from "@/lib/learning/lesson-access";
import { mediaNotFound, redirectToMedia } from "@/lib/media/delivery";
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * The video of a lesson. The page never holds the stored address: it points the player here, this route checks the right
 * to open the lesson (same rule as the lesson page and the captions) and redirects to a short-lived signed address.
 * Whoever may not open the lesson gets the same 404 as a lesson that does not exist.
 */
export async function GET(request: Request, { params }: { params: Promise<{ lessonId: string }> }) {
  const limited = await enforceRateLimit(request, "learn-media", { limit: 120, windowSeconds: 60 });
  if (limited) return limited;

  const { lessonId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  const access = await getLessonAccess(session?.user ? { id: session.user.id, role: session.user.role } : null, lessonId);
  if (!access?.canOpen) return mediaNotFound();

  const lesson = await db.lesson.findUnique({ where: { id: lessonId }, select: { videoUrl: true } });
  if (!lesson?.videoUrl) return mediaNotFound();
  return redirectToMedia(lesson.videoUrl);
}
