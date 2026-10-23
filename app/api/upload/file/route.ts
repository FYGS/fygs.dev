import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";
import { enforceRateLimit } from "@/lib/rate-limit";
import { presignUpload, safeExtension } from "@/lib/s3-presign";
import { RESOURCE_CONTENT_TYPES, RESOURCE_MAX_BYTES } from "@/lib/resource-types";

const uploadSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.enum(Object.keys(RESOURCE_CONTENT_TYPES) as [keyof typeof RESOURCE_CONTENT_TYPES]),
  size: z.number().int().min(1).max(RESOURCE_MAX_BYTES),
});

export async function POST(req: NextRequest) {
  const limited = await enforceRateLimit(req, "upload", { limit: 40, windowSeconds: 600 });
  if (limited) return limited;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR") {
    return NextResponse.json({ error: "Permissions insuffisantes" }, { status: 403 });
  }

  try {
    const validated = uploadSchema.parse(await req.json());
    const result = await presignUpload({
      folder: "resources",
      userId: session.user.id,
      extension: safeExtension(validated.filename, RESOURCE_CONTENT_TYPES[validated.contentType]),
      contentType: validated.contentType,
      size: validated.size,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Ce type de fichier n'est pas accepté ou le fichier dépasse 50 Mo." },
        { status: 400 },
      );
    }
    console.error("File upload error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
