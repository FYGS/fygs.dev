import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ReviewPermissionsService } from "@/lib/services/review-permissions";
import { ReviewNotificationService } from "@/lib/services/review-notification";
import { createReplySchema } from "@/lib/validators/review-validators";
import { db } from "@/lib/db";
import { logger } from "@/lib/structured-logger";
import { enforceRateLimit } from "@/lib/rate-limit";
import { parseJsonBody } from "@/lib/utils/parse-json-body";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{
    reviewId: string;
  }>;
}

/**
 * Create a reply to a review
 * POST /api/reviews/[reviewId]/replies
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const limited = await enforceRateLimit(request, "review-write", {
    limit: 20,
    windowSeconds: 60,
  });
  if (limited) return limited;

  try {
    const { reviewId } = await params;

    // Get user session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const parsed = await parseJsonBody(request);
    if (!parsed.ok) return parsed.response;
    const validation = createReplySchema.safeParse({
      ...(parsed.body as object),
      reviewId,
    });

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Données invalides",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { content } = validation.data;

    // Check permissions
    const permissionCheck = await ReviewPermissionsService.canReplyToReview(
      session.user.id,
      reviewId
    );

    if (!permissionCheck.allowed) {
      return NextResponse.json(
        { error: permissionCheck.reason },
        { status: 403 }
      );
    }

    // Create the reply
    const reply = await db.reviewReply.create({
      data: {
        reviewId,
        userId: session.user.id,
        content,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
      },
    });

    // Send notification to student (async, don't wait)
    ReviewNotificationService.notifyInstructorReply(reply.id).catch(
      (error) => {
        logger.error("Failed to send reply notification", {
          metadata: {
            replyId: reply.id,
            error: error instanceof Error ? error.message : String(error),
          },
        });
      }
    );

    // Log the reply
    logger.info("Review reply created", {
      metadata: {
        replyId: reply.id,
        reviewId,
        userId: session.user.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        reply: {
          id: reply.id,
          content: reply.content,
          createdAt: reply.createdAt,
          user: reply.user,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error("Failed to create review reply", {
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });

    return NextResponse.json(
      { error: "Erreur lors de la création de la réponse" },
      { status: 500 }
    );
  }
}

/**
 * Get replies for a review
 * GET /api/reviews/[reviewId]/replies
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { reviewId } = await params;

    // The replies of a review follow its visibility: a pending, rejected or flagged review (and what was said under
    // it) is for its author, an administrator and the instructor of its course only
    const review = await db.review.findUnique({
      where: { id: reviewId },
      select: { status: true, userId: true, course: { select: { instructorId: true } } },
    });
    if (!review) {
      return NextResponse.json({ error: "Avis non trouvé" }, { status: 404 });
    }
    if (review.status !== "APPROVED") {
      const session = await auth.api.getSession({ headers: request.headers }).catch(() => null);
      const viewer = session?.user;
      const mayRead =
        !!viewer &&
        (viewer.id === review.userId ||
          viewer.role === "ADMIN" ||
          (viewer.role === "INSTRUCTOR" && review.course.instructorId === viewer.id));
      if (!mayRead) {
        return NextResponse.json({ error: "Avis non trouvé" }, { status: 404 });
      }
    }

    // Get all replies for the review
    const replies = await db.reviewReply.findMany({
      where: { reviewId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      replies,
    });
  } catch (error) {
    logger.error("Failed to fetch review replies", {
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });

    return NextResponse.json(
      { error: "Erreur lors de la récupération des réponses" },
      { status: 500 }
    );
  }
}
