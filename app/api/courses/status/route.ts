import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getEntitlement } from "@/lib/access/entitlement";
import { createLogger } from "@/lib/structured-logger";
import { enforceRateLimit } from "@/lib/rate-limit";

/**
 * Whether the signed-in user may follow a course now. Polled by the course page after a payment, until the
 * Stripe webhook has opened the access.
 */
export async function GET(req: NextRequest) {
  const limited = await enforceRateLimit(req, "read", { limit: 120, windowSeconds: 60 });
  if (limited) return limited;

  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ unlocked: false, reason: "unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const courseId = searchParams.get("courseId");
    if (!slug && !courseId) return NextResponse.json({ error: "Paramètre slug ou courseId manquant" }, { status: 400 });

    const course = await db.course.findFirst({
      where: slug ? { slug } : { id: courseId as string },
      select: { id: true, slug: true },
    });
    if (!course) return NextResponse.json({ unlocked: false, reason: "not_found" }, { status: 404 });

    const entitlement = await getEntitlement({ id: session.user.id, role: session.user.role }, course.id);
    return NextResponse.json({
      unlocked: !!entitlement?.entitled,
      source: entitlement?.source ?? null,
      enrolled: !!entitlement?.enrolled,
      courseId: course.id,
      slug: course.slug,
    });
  } catch (error) {
    createLogger({ operation: "course-status-api", resourceType: "api" }).error(
      "Course status error",
      { metadata: { error: error instanceof Error ? error.message : String(error) } },
      error instanceof Error ? error : new Error(String(error)),
    );
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
