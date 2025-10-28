import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { minioService, MinIOService } from "@/lib/minio-service";
import { logger } from "@/lib/structured-logger";

export const runtime = "nodejs";

interface UploadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<UploadResponse>> {
  const correlationId = logger.generateCorrelationId();
  const uploadLogger = logger.withContext({
    operation: "image-upload",
    correlationId,
    resourceType: "file",
  });

  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      uploadLogger.warn("Unauthorized upload attempt");
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only allow admins and instructors to upload images
    if (
      !session.user.role ||
      !["ADMIN", "INSTRUCTOR"].includes(session.user.role)
    ) {
      uploadLogger.warn("Forbidden upload attempt", {
        metadata: { userId: session.user.id, userRole: session.user.role },
      });
      return NextResponse.json(
        { success: false, error: "Forbidden: Insufficient permissions" },
        { status: 403 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "images";
    const prefix = (formData.get("prefix") as string) || "course";

    if (!file) {
      uploadLogger.warn("No file provided in upload request");
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file
    const validationResult = validateImageFile(file);
    if (!validationResult.valid) {
      uploadLogger.warn("Invalid file upload attempt", {
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          error: validationResult.error,
        },
      });
      return NextResponse.json(
        { success: false, error: validationResult.error },
        { status: 400 }
      );
    }

    // Generate safe file name
    const safeFileName = MinIOService.generateSafeFileName(file.name, prefix);

    uploadLogger.info("Starting file upload", {
      metadata: {
        originalFileName: file.name,
        safeFileName,
        fileSize: file.size,
        fileType: file.type,
        folder,
        userId: session.user.id,
      },
    });

    // Ensure MinIO service is initialized
    try {
      await minioService.initialize();
    } catch (initError) {
      uploadLogger.warn("MinIO service initialization during upload", {
        metadata: {
          error:
            initError instanceof Error ? initError.message : String(initError),
        },
      });
    }

    // Upload file to MinIO
    const fileUrl = await minioService.uploadImage(file, safeFileName, folder);

    uploadLogger.info("File uploaded successfully", {
      metadata: {
        fileUrl,
        safeFileName,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      url: fileUrl,
    });
  } catch (error) {
    uploadLogger.error("Upload failed", {
      metadata: {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
    });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 }
    );
  }
}

/**
 * Validate image file
 */
function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { valid: false, error: "File size must be less than 5MB" };
  }

  // Check file type
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error:
        "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed",
    };
  }

  // Check file name extension
  if (!MinIOService.isValidImageFile(file.name)) {
    return {
      valid: false,
      error:
        "Invalid file extension. Only .jpg, .jpeg, .png, .gif, and .webp files are allowed",
    };
  }

  return { valid: true };
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const correlationId = logger.generateCorrelationId();
  const deleteLogger = logger.withContext({
    operation: "image-delete",
    correlationId,
    resourceType: "file",
  });

  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only allow admins and instructors to delete images
    if (
      !session.user.role ||
      !["ADMIN", "INSTRUCTOR"].includes(session.user.role)
    ) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Insufficient permissions" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const objectName = searchParams.get("objectName");

    if (!objectName) {
      return NextResponse.json(
        { success: false, error: "Object name is required" },
        { status: 400 }
      );
    }

    deleteLogger.info("Starting file deletion", {
      metadata: { objectName, userId: session.user.id },
    });

    await minioService.deleteFile(objectName);

    deleteLogger.info("File deleted successfully", {
      metadata: { objectName, userId: session.user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    deleteLogger.error("File deletion failed", {
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Deletion failed",
      },
      { status: 500 }
    );
  }
}
