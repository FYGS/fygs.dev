import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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

const s3 = new S3Client({
  region: process.env.S3_REGION || "us-east-1",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
  },
  forcePathStyle: true, // Required for MinIO
});

const BUCKET = process.env.S3_BUCKET || "fygs-videos";
const PUBLIC_URL_BASE = process.env.S3_PUBLIC_URL || "";

export async function POST(req: NextRequest) {
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

    // Generate unique key
    const ext = validated.filename.split(".").pop() || "mp4";
    const key = `videos/${session.user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    // Generate presigned PUT URL
    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: validated.contentType,
      ContentLength: validated.size,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    const publicUrl = `${PUBLIC_URL_BASE}/${key}`;

    return NextResponse.json({ uploadUrl, publicUrl, key });
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
