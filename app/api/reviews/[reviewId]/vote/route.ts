import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ReviewPermissionsService } from "@/lib/services/review-permissions";
import { ReviewNotificationService } from "@/lib/services/review-notification";
import { createVoteSchema } from "@/lib/validators/review-validators";
import { db } from "@/lib/db";
import { logger } from "@/lib/structured-logger";
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{
    reviewId: string;
  }>;
}

/**
 * Vote on a review (helpful/not helpful)
 * POST /api/reviews/[reviewId]/vote
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
    const body = await request.json();
    const validation = createVoteSchema.safeParse({ ...body, reviewId });

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Données invalides",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { helpful } = validation.data;

    // Check permissions
    const permissionCheck = await ReviewPermissionsService.canVoteOnReview(
      session.user.id,
      reviewId
    );

    if (!permissionCheck.allowed) {
      return NextResponse.json(
        { error: permissionCheck.reason },
        { status: 403 }
      );
    }

    // Check if user already voted and update or create
    const existingVote = await db.reviewVote.findUnique({
      where: {
        userId_reviewId: {
          userId: session.user.id,
          reviewId,
        },
      },
    });

    let vote;
    let action: "created" | "updated" | "removed";

    if (existingVote) {
      if (existingVote.helpful === helpful) {
        // Same vote - remove it
        await db.reviewVote.delete({
          where: { id: existingVote.id },
        });
        action = "removed";
      } else {
        // Different vote - update it
        vote = await db.reviewVote.update({
          where: { id: existingVote.id },
          data: { helpful },
        });
        action = "updated";
      }
    } else {
      // New vote - create it
      vote = await db.reviewVote.create({
        data: {
          userId: session.user.id,
          reviewId,
          helpful,
        },
      });
      action = "created";
    }

    // Update helpful count on review
    const helpfulVotes = await db.reviewVote.count({
      where: {
        reviewId,
        helpful: true,
      },
    });

    await db.review.update({
      where: { id: reviewId },
      data: { helpfulCount: helpfulVotes },
    });

    // Send notification for helpful votes (async, don't wait)
    if (helpful && action === "created") {
      ReviewNotificationService.notifyHelpfulVote(reviewId, helpfulVotes).catch(
        (error) => {
          logger.error("Failed to send helpful vote notification", {
            metadata: {
              reviewId,
              helpfulVotes,
              error: error instanceof Error ? error.message : String(error),
            },
          });
        }
      );
    }

    // Log the vote
    logger.info("Review vote recorded", {
      metadata: {
        reviewId,
        userId: session.user.id,
        helpful,
        action,
      },
    });

    return NextResponse.json({
      success: true,
      vote: vote || null,
      action,
      helpfulCount: helpfulVotes,
    });
  } catch (error) {
    logger.error("Failed to vote on review", {
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });

    return NextResponse.json({ error: "Erreur lors du vote" }, { status: 500 });
  }
}

/**
 * Get votes for a review
 * GET /api/reviews/[reviewId]/vote
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { reviewId } = await params;

    // Get user session for user-specific data
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // Get all votes for the review
    const votes = await db.reviewVote.findMany({
      where: { reviewId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Calculate stats
    const helpfulCount = votes.filter((vote) => vote.helpful).length;
    const unhelpfulCount = votes.filter((vote) => !vote.helpful).length;

    // Get user's vote if authenticated
    const userVote = session?.user
      ? votes.find((vote) => vote.userId === session.user.id)
      : null;

    return NextResponse.json({
      success: true,
      votes: {
        helpful: helpfulCount,
        unhelpful: unhelpfulCount,
        total: votes.length,
        userVote: userVote
          ? {
              helpful: userVote.helpful,
              createdAt: userVote.createdAt,
            }
          : null,
      },
    });
  } catch (error) {
    logger.error("Failed to fetch review votes", {
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });

    return NextResponse.json(
      { error: "Erreur lors de la récupération des votes" },
      { status: 500 }
    );
  }
}
