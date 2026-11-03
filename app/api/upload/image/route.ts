import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { IMAGE_FOLDERS, isImageStorageConfigured, minioService } from "@/lib/minio-service";
import { STORAGE_UNAVAILABLE_MESSAGE } from "@/lib/s3-presign";
import { logger } from "@/lib/structured-logger";
import { enforceRateLimit } from "@/lib/rate-limit";
import { detectImageType, extensionFor } from "@/lib/media/image-signature";
import { authorizeImageDeletion, recordImageDeleted } from "@/lib/media/image-ownership";
import { QuotaExceededError, quotaMessage, releaseMedia, reserveMedia } from "@/lib/media/quota";

export const runtime = "nodejs";

interface UploadResponse {
  success: boolean;
  url?: string;
  error?: string;
  code?: "STORAGE_UNAVAILABLE" | "QUOTA_EXCEEDED";
}

const MAX_BYTES = 5 * 1024 * 1024;
/** The form around the file (boundaries, field names) is small: anything bigger than the file plus this is refused unread. */
const FORM_OVERHEAD_BYTES = 64 * 1024;
const FOLDERS = new Set<string>(IMAGE_FOLDERS);

/** Network failures that mean "the storage is not there", as opposed to a refused file. */
const UNREACHABLE = new Set(["ECONNREFUSED", "ENOTFOUND", "EAI_AGAIN", "ETIMEDOUT", "ECONNRESET", "InvalidAccessKeyId", "SignatureDoesNotMatch"]);

function unavailable() {
  return NextResponse.json<UploadResponse>(
    { success: false, error: STORAGE_UNAVAILABLE_MESSAGE, code: "STORAGE_UNAVAILABLE" },
    { status: 503 },
  );
}

async function requireAuthor(): Promise<{ id: string; role: string } | NextResponse<UploadResponse>> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Connectez-vous pour envoyer une image." }, { status: 401 });
  }
  if (!session.user.role || !["ADMIN", "INSTRUCTOR"].includes(session.user.role)) {
    return NextResponse.json({ success: false, error: "Vous n'avez pas les permissions pour envoyer des images." }, { status: 403 });
  }
  return { id: session.user.id, role: session.user.role };
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
  const limitedUser = await enforceRateLimit(request, "upload-image", { limit: 20, windowSeconds: 600, subject: `user:${author.id}` });
  if (limitedUser) return limitedUser as NextResponse<UploadResponse>;
  if (!isImageStorageConfigured()) return unavailable();

  // Refuse an oversized body before it is read into memory: the announced length is checked first
  const announced = Number(request.headers.get("content-length"));
  if (!Number.isFinite(announced) || announced <= 0) {
    return NextResponse.json({ success: false, error: "Envoi incomplet : réessayez." }, { status: 411 });
  }
  if (announced > MAX_BYTES + FORM_OVERHEAD_BYTES) {
    return NextResponse.json({ success: false, error: "L'image dépasse 5 Mo." }, { status: 413 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, error: "Aucune image reçue." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) return NextResponse.json({ success: false, error: "L'image dépasse 5 Mo." }, { status: 413 });

  // What the file is comes from its bytes: the type announced by the browser and the file name are only claims
  const buffer = Buffer.from(await file.arrayBuffer());
  const type = detectImageType(buffer);
  if (!type) {
    return NextResponse.json({ success: false, error: "Format non pris en charge : utilisez une image JPEG, PNG, GIF ou WebP." }, { status: 400 });
  }

  const requestedFolder = String(formData?.get("folder") ?? "images");
  const folder = FOLDERS.has(requestedFolder) ? requestedFolder : "images";
  const prefix = String(formData?.get("prefix") ?? "course").replace(/[^a-z0-9-]/gi, "").slice(0, 20) || "image";
  // The stored name is built here: nothing of the client's file name or extension is kept
  const objectName = `${folder}/${prefix}_${Date.now()}_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}.${extensionFor(type)}`;

  try {
    await reserveMedia({ key: objectName, userId: author.id, role: author.role, kind: "IMAGE", contentType: type, sizeBytes: buffer.length });
  } catch (error) {
    if (error instanceof QuotaExceededError) {
      return NextResponse.json({ success: false, error: quotaMessage(error.kind, error.limit), code: "QUOTA_EXCEEDED" }, { status: 413 });
    }
    throw error;
  }

  try {
    await minioService.initialize();
    const url = await minioService.putImage(objectName, buffer, type);
    uploadLogger.info("Image uploaded", { metadata: { objectName, folder, userId: author.id } });
    return NextResponse.json({ success: true, url });
  } catch (error) {
    await releaseMedia(objectName);
    const code = (error as { code?: string }).code;
    uploadLogger.error("Image upload failed", {
      metadata: { code, error: error instanceof Error ? error.message : String(error) },
    });
    if (code && UNREACHABLE.has(code)) return unavailable();
    return NextResponse.json({ success: false, error: "L'envoi de l'image a échoué. Réessayez dans un instant." }, { status: 500 });
  }
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

  // Only the owner of an image (or an administrator) deletes it, and only an object this route could have written
  const decision = await authorizeImageDeletion(author, objectName);
  if (!decision.allowed) {
    const status = decision.reason === "INVALID_KEY" ? 400 : 403;
    return NextResponse.json(
      { success: false, error: decision.reason === "INVALID_KEY" ? "Image inconnue." : "Vous ne pouvez supprimer que vos propres images." },
      { status },
    );
  }

  try {
    await minioService.deleteFile(decision.key);
    await recordImageDeleted(author, decision.key);
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Image deletion failed", {
      metadata: { error: error instanceof Error ? error.message : String(error), userId: author.id },
    });
    return NextResponse.json({ success: false, error: "La suppression de l'image a échoué." }, { status: 500 });
  }
}
