import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";
import { enforceRateLimit } from "@/lib/rate-limit";
import { presignUpload, safeExtension, StorageUnavailableError } from "@/lib/s3-presign";
import {
  CAPTIONS_CONTENT_TYPE,
  CAPTIONS_MAX_BYTES,
  RESOURCE_CONTENT_TYPES,
  RESOURCE_MAX_BYTES,
} from "@/lib/resource-types";

const resourceSchema = z.object({
  purpose: z.literal("resource").default("resource"),
  filename: z.string().min(1).max(255),
  contentType: z.enum(Object.keys(RESOURCE_CONTENT_TYPES) as [keyof typeof RESOURCE_CONTENT_TYPES]),
  size: z.number().int().min(1).max(RESOURCE_MAX_BYTES),
});

const captionsSchema = z.object({
  purpose: z.literal("captions"),
  filename: z.string().min(1).max(255).regex(/\.vtt$/i),
  contentType: z.literal(CAPTIONS_CONTENT_TYPE),
  size: z.number().int().min(1).max(CAPTIONS_MAX_BYTES),
});

/** Lesson attachments (documents) and video captions (WebVTT): the browser uploads straight to the storage. */
export async function POST(req: NextRequest) {
  const limited = await enforceRateLimit(req, "upload", { limit: 40, windowSeconds: 600 });
  if (limited) return limited;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Connectez-vous pour envoyer un fichier." }, { status: 401 });
  if (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR") {
    return NextResponse.json({ error: "Vous n'avez pas les permissions pour envoyer des fichiers." }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as { purpose?: string } | null;
  const captions = body?.purpose === "captions";
  const parsed = (captions ? captionsSchema : resourceSchema).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: captions
          ? "Les sous-titres doivent être un fichier WebVTT (.vtt) de 2 Mo au plus."
          : "Ce type de fichier n'est pas accepté ou le fichier dépasse 50 Mo.",
      },
      { status: 400 },
    );
  }

  try {
    const data = parsed.data;
    const result = await presignUpload({
      folder: captions ? "captions" : "resources",
      userId: session.user.id,
      extension: captions ? "vtt" : safeExtension(data.filename, RESOURCE_CONTENT_TYPES[data.contentType as keyof typeof RESOURCE_CONTENT_TYPES]),
      contentType: data.contentType,
      size: data.size,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof StorageUnavailableError) {
      return NextResponse.json({ error: error.message, code: "STORAGE_UNAVAILABLE" }, { status: 503 });
    }
    console.error("File upload error:", error);
    return NextResponse.json({ error: "L'envoi n'a pas pu être préparé. Réessayez dans un instant." }, { status: 500 });
  }
}
