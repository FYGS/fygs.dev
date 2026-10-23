import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";
import { enforceRateLimit } from "@/lib/rate-limit";
import { presignUpload, safeExtension } from "@/lib/s3-presign";

const uploadSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.enum([
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/quicktime",
  ]),
  size: z
    .number()
    .int()
    .min(1)
    .max(500 * 1024 * 1024), // 500MB max
});

export async function POST(req: NextRequest) {
  const limited = await enforceRateLimit(req, "upload", {
    limit: 20,
    windowSeconds: 600,
  });
  if (limited) return limited;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR") {
    return NextResponse.json(
      { error: "Permissions insuffisantes" },
      { status: 403 },
    );
  }

  try {
    const body = await req.json();
    const validated = uploadSchema.parse(body);

    const result = await presignUpload({
      folder: "videos",
      userId: session.user.id,
      extension: safeExtension(validated.filename, "mp4"),
      contentType: validated.contentType,
      size: validated.size,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.flatten() },
        { status: 400 },
      );
    }
    console.error("Video upload error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
