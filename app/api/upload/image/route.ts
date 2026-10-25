import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { isImageStorageConfigured, minioService, MinIOService } from "@/lib/minio-service";
import { STORAGE_UNAVAILABLE_MESSAGE } from "@/lib/s3-presign";
import { logger } from "@/lib/structured-logger";
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

interface UploadResponse {
  success: boolean;
  url?: string;
  error?: string;
  code?: "STORAGE_UNAVAILABLE";
}

const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
/** Only these folders exist for images; anything else sent by the browser is ignored. */
const FOLDERS = new Set(["images", "courses", "lessons", "paths", "avatars"]);

/** Network failures that mean "the storage is not there", as opposed to a refused file. */
const UNREACHABLE = new Set(["ECONNREFUSED", "ENOTFOUND", "EAI_AGAIN", "ETIMEDOUT", "ECONNRESET", "InvalidAccessKeyId", "SignatureDoesNotMatch"]);

function unavailable() {
  return NextResponse.json<UploadResponse>(
    { success: false, error: STORAGE_UNAVAILABLE_MESSAGE, code: "STORAGE_UNAVAILABLE" },
    { status: 503 },
  );
}

async function requireAuthor(): Promise<{ id: string } | NextResponse<UploadResponse>> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Connectez-vous pour envoyer une image." }, { status: 401 });
  }
  if (!session.user.role || !["ADMIN", "INSTRUCTOR"].includes(session.user.role)) {
    return NextResponse.json({ success: false, error: "Vous n'avez pas les permissions pour envoyer des images." }, { status: 403 });
  }
  return { id: session.user.id };
}

export async function POST(request: NextRequest): Promise<NextResponse<UploadResponse>> {
  const limited = await enforceRateLimit(request, "upload", { limit: 20, windowSeconds: 600 });
  if (limited) return limited as NextResponse<UploadResponse>;

  const uploadLogger = logger.withContext({
    operation: "image-upload",
    correlationId: logger.generateCorrelationId(),
    resourceType: "file",
  });

  const author = await requireAuthor();
  if (author instanceof NextResponse) return author;
  if (!isImageStorageConfigured()) return unavailable();

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, error: "Aucune image reçue." }, { status: 400 });
  }
  const problem = validateImageFile(file);
  if (problem) return NextResponse.json({ success: false, error: problem }, { status: 400 });

  const requestedFolder = String(formData?.get("folder") ?? "images");
  const folder = FOLDERS.has(requestedFolder) ? requestedFolder : "images";
  const prefix = String(formData?.get("prefix") ?? "course").replace(/[^a-z0-9-]/gi, "").slice(0, 20) || "image";
  const safeFileName = MinIOService.generateSafeFileName(file.name, prefix);

  try {
    await minioService.initialize();
    const url = await minioService.uploadImage(file, safeFileName, folder);
    uploadLogger.info("Image uploaded", { metadata: { safeFileName, folder, userId: author.id } });
    return NextResponse.json({ success: true, url });
  } catch (error) {
    const code = (error as { code?: string }).code;
    uploadLogger.error("Image upload failed", {
      metadata: { code, error: error instanceof Error ? error.message : String(error) },
    });
    if (code && UNREACHABLE.has(code)) return unavailable();
    return NextResponse.json({ success: false, error: "L'envoi de l'image a échoué. Réessayez dans un instant." }, { status: 500 });
  }
}

/** The reason the file is refused, in French, or null when it can be stored. */
function validateImageFile(file: File): string | null {
  if (file.size > MAX_BYTES) return "L'image dépasse 5 Mo.";
  if (!TYPES.includes(file.type) || !MinIOService.isValidImageFile(file.name)) {
    return "Format non pris en charge : utilisez une image JPEG, PNG, GIF ou WebP.";
  }
  return null;
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const limited = await enforceRateLimit(request, "upload", { limit: 20, windowSeconds: 600 });
  if (limited) return limited as NextResponse<UploadResponse>;

  const author = await requireAuthor();
  if (author instanceof NextResponse) return author;
  if (!isImageStorageConfigured()) return unavailable();

  const objectName = new URL(request.url).searchParams.get("objectName");
  if (!objectName) {
    return NextResponse.json({ success: false, error: "Indiquez l'image à supprimer." }, { status: 400 });
  }

  try {
    await minioService.deleteFile(objectName);
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Image deletion failed", {
      metadata: { error: error instanceof Error ? error.message : String(error), userId: author.id },
    });
    return NextResponse.json({ success: false, error: "La suppression de l'image a échoué." }, { status: 500 });
  }
}
