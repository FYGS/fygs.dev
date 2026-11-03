import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";
import { enforceRateLimit } from "@/lib/rate-limit";
import { buildObjectKey, presignUpload, StorageUnavailableError } from "@/lib/s3-presign";
import { QuotaExceededError, quotaMessage, releaseMedia, reserveMedia } from "@/lib/media/quota";
import { VIDEO_CONTENT_TYPES, VIDEO_FORMATS_LABEL, VIDEO_MAX_BYTES } from "@/lib/resource-types";

const uploadSchema = z.object({
  contentType: z.enum(Object.keys(VIDEO_CONTENT_TYPES) as [keyof typeof VIDEO_CONTENT_TYPES]),
  size: z.number().int().min(1).max(VIDEO_MAX_BYTES),
});

/** A lesson video: the browser uploads it straight to the storage with the presigned address returned here. */
export async function POST(req: NextRequest) {
  const limited = await enforceRateLimit(req, "upload", { limit: 20, windowSeconds: 600 });
  if (limited) return limited;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Connectez-vous pour envoyer une vidéo." }, { status: 401 });
  if (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR") {
    return NextResponse.json({ error: "Vous n'avez pas les permissions pour envoyer des vidéos." }, { status: 403 });
  }
  // Rotating addresses must not give more room: the account is the limit
  const limitedUser = await enforceRateLimit(req, "upload-video", { limit: 20, windowSeconds: 600, subject: `user:${session.user.id}` });
  if (limitedUser) return limitedUser;

  const parsed = uploadSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: `Format accepté : ${VIDEO_FORMATS_LABEL}, 500 Mo au plus.` }, { status: 400 });
  }

  // The name sent by the browser plays no part: the extension follows the accepted content type
  const key = buildObjectKey({ folder: "videos", userId: session.user.id, extension: VIDEO_CONTENT_TYPES[parsed.data.contentType] });
  try {
    await reserveMedia({ key, userId: session.user.id, role: session.user.role, kind: "VIDEO", contentType: parsed.data.contentType, sizeBytes: parsed.data.size });
    try {
      return NextResponse.json(await presignUpload({ key, contentType: parsed.data.contentType, size: parsed.data.size }));
    } catch (error) {
      await releaseMedia(key);
      throw error;
    }
  } catch (error) {
    if (error instanceof QuotaExceededError) {
      return NextResponse.json({ error: quotaMessage(error.kind, error.limit), code: "QUOTA_EXCEEDED" }, { status: 413 });
    }
    if (error instanceof StorageUnavailableError) {
      return NextResponse.json({ error: error.message, code: "STORAGE_UNAVAILABLE" }, { status: 503 });
    }
    console.error("Video upload error:", error);
    return NextResponse.json({ error: "L'envoi n'a pas pu être préparé. Réessayez dans un instant." }, { status: 500 });
  }
}
