import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";
import { enforceRateLimit } from "@/lib/rate-limit";
import { presignUpload, safeExtension, StorageUnavailableError } from "@/lib/s3-presign";
import { VIDEO_CONTENT_TYPES, VIDEO_FORMATS_LABEL, VIDEO_MAX_BYTES } from "@/lib/resource-types";

const uploadSchema = z.object({
  filename: z.string().min(1).max(255),
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

  const parsed = uploadSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: `Format accepté : ${VIDEO_FORMATS_LABEL}, 500 Mo au plus.` }, { status: 400 });
  }

  try {
    const result = await presignUpload({
      folder: "videos",
      userId: session.user.id,
      extension: safeExtension(parsed.data.filename, VIDEO_CONTENT_TYPES[parsed.data.contentType]),
      contentType: parsed.data.contentType,
      size: parsed.data.size,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof StorageUnavailableError) {
      return NextResponse.json({ error: error.message, code: "STORAGE_UNAVAILABLE" }, { status: 503 });
    }
    console.error("Video upload error:", error);
    return NextResponse.json({ error: "L'envoi n'a pas pu être préparé. Réessayez dans un instant." }, { status: 500 });
  }
}
