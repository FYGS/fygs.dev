import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getLessonAccess } from "@/lib/learning/lesson-access";
import { mediaNotFound, redirectToMedia } from "@/lib/media/delivery";
import { storageKeyFromUrl } from "@/lib/media/storage";
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * A file attached to a lesson, as a download. Same rule as the lesson: whoever may open it gets a short-lived signed
 * address that asks the browser to save the file; everyone else gets a 404. Links to other sites (kind LINK) are
 * opened directly by the page and are not served here, so this route is not a redirector.
 */
export async function GET(request: Request, { params }: { params: Promise<{ resourceId: string }> }) {
  const limited = await enforceRateLimit(request, "learn-resource", { limit: 60, windowSeconds: 60 });
  if (limited) return limited;

  const { resourceId } = await params;
  const resource = await db.lessonResource.findUnique({
    where: { id: resourceId },
    select: { url: true, title: true, kind: true, lessonId: true },
  });
  if (!resource || resource.kind !== "FILE") return mediaNotFound();

  const session = await auth.api.getSession({ headers: await headers() });
  const access = await getLessonAccess(session?.user ? { id: session.user.id, role: session.user.role } : null, resource.lessonId);
  if (!access?.canOpen) return mediaNotFound();

  const extension = storageKeyFromUrl(resource.url)?.split(".").pop() ?? resource.url.split(/[?#]/)[0].split(".").pop() ?? "";
  const name = /^[a-z0-9]{1,8}$/i.test(extension) ? `${resource.title}.${extension}` : resource.title;
  return redirectToMedia(resource.url, { downloadAs: name });
}
