import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getLessonAccess } from "@/lib/learning/lesson-access";
import { isFetchableCaptionsUrl } from "@/lib/learning/captions";

export const runtime = "nodejs";

const MAX_BYTES = 2 * 1024 * 1024;

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

  let source: string;
  try {
    if (!isFetchableCaptionsUrl(access.captionsUrl)) throw new Error("address");
    const upstream = await fetch(access.captionsUrl, { cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10_000) });
    if (!upstream.ok) throw new Error(`upstream ${upstream.status}`);
    source = await upstream.text();
  } catch {
    return NextResponse.json({ error: "UNAVAILABLE" }, { status: 502 });
  }
  if (source.length > MAX_BYTES || !source.trimStart().startsWith("WEBVTT")) {
    return NextResponse.json({ error: "NOT_WEBVTT" }, { status: 422 });
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
