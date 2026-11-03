import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getLessonAccess } from "@/lib/learning/lesson-access";
import { SafeFetchError, safeFetchText } from "@/lib/net/safe-fetch";
import { logger } from "@/lib/structured-logger";

export const runtime = "nodejs";

const MAX_BYTES = 2 * 1024 * 1024;
/** What a captions file is served as; object storage often says octet-stream. */
const CAPTIONS_CONTENT_TYPES = ["text/vtt", "text/plain", "application/octet-stream", "binary/octet-stream"] as const;

/**
 * The WebVTT captions of a lesson's video, served from the site's own origin: a browser only shows a text track
 * fetched from another origin when that origin allows it (CORS), which object storage often does not. Same access
 * rule as the lesson. `?download=1` returns it as a file.
 */
export async function GET(request: Request, { params }: { params: Promise<{ lessonId: string }> }) {
  const limited = await enforceRateLimit(request, "captions", { limit: 60, windowSeconds: 60 });
  if (limited) return limited;

  const { lessonId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  const access = await getLessonAccess(session?.user ? { id: session.user.id, role: session.user.role } : null, lessonId);
  if (!access?.canOpen || !access.captionsUrl) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  // Every failure gets the same answer: which one it was would tell an attacker what the server can reach
  let source: string;
  try {
    source = await safeFetchText(access.captionsUrl, {
      maxBytes: MAX_BYTES,
      timeoutMs: 10_000,
      contentTypes: CAPTIONS_CONTENT_TYPES,
    });
    if (!source.trimStart().startsWith("WEBVTT")) throw new SafeFetchError("BAD_CONTENT_TYPE", "not WebVTT");
  } catch (error) {
    logger.warn("captions.fetch_failed", {
      metadata: { lessonId, reason: error instanceof SafeFetchError ? error.code : "ERROR" },
    });
    return NextResponse.json({ error: "UNAVAILABLE" }, { status: 502 });
  }

  const download = new URL(request.url).searchParams.get("download") === "1";
  return new NextResponse(source, {
    status: 200,
    headers: {
      "Content-Type": "text/vtt; charset=utf-8",
      "Cache-Control": "private, max-age=300",
      "X-Content-Type-Options": "nosniff",
      ...(download ? { "Content-Disposition": `attachment; filename=sous-titres-${lessonId}.vtt` } : {}),
    },
  });
}
