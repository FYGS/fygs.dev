import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ReviewPermissionsService } from "@/lib/services/review-permissions";
import {
  updateReviewSchema,
  ReviewContentValidator,
} from "@/lib/validators/review-validators";
import { db } from "@/lib/db";
import { ReviewStatus } from "@/lib/generated/prisma/browser";
import { logger } from "@/lib/structured-logger";
import { ReviewAnalyticsService } from "@/lib/services/review-analytics";
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{
    reviewId: string;
  }>;
}

/**
 * Get a specific review
 * GET /api/reviews/[reviewId]
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { reviewId } = await params;

    const review = await db.review.findUnique({
      where: { id: reviewId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        votes: {
          select: {
            id: true,
            userId: true,
            helpful: true,
          },
        },
        replies: {
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
        },
        _count: {
          select: {
            votes: {
              where: { helpful: true },
            },
            reports: true,
          },
        },
      },
    });

    if (!review) {
      return NextResponse.json({ error: "Avis non trouvé" }, { status: 404 });
    }

    // Check if user can view this review
    if (review.status !== ReviewStatus.APPROVED) {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      // Only review author, course instructor, or admin can view non-approved reviews
      const canView =
        session?.user &&
        (session.user.id === review.userId ||
          session.user.role === "ADMIN" ||
          (session.user.role === "INSTRUCTOR" &&
            review.courseId === review.courseId)); // Simplified check

      if (!canView) {
        return NextResponse.json({ error: "Avis non trouvé" }, { status: 404 });
      }
    }

    return NextResponse.json({
      success: true,
      review,
    });
  } catch (error) {
    logger.error("Failed to fetch review", {
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });

    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'avis" },
      { status: 500 }
    );
  }
}

/**
 * Update a review
 * PUT /api/reviews/[reviewId]
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    // Check edit permissions
    const permissionCheck = await ReviewPermissionsService.canEditReview(
      session.user.id,
      reviewId
    );

    if (!permissionCheck.allowed) {
      return NextResponse.json(
        { error: permissionCheck.reason },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = updateReviewSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Données invalides",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { rating, comment } = validation.data;

    // Check rate limiting
    const rateLimitCheck = await ReviewPermissionsService.checkRateLimit(
      session.user.id,
      "edit"
    );

    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        {
          error: rateLimitCheck.reason,
          resetTime: rateLimitCheck.resetTime,
        },
        { status: 429 }
      );
    }

    // Validate content if comment provided
    let contentValidation: {
      isValid: boolean;
      issues: string[];
      confidence: number;
    } = { isValid: true, issues: [], confidence: 1 };
    let duplicateCheck = { isDuplicate: false, similarity: 0 };

    if (comment) {
      contentValidation = ReviewContentValidator.validateContent(comment);
      duplicateCheck = await ReviewContentValidator.checkDuplicateContent(
        comment,
        session.user.id,
        reviewId
      );

      if (!contentValidation.isValid) {
        return NextResponse.json(
          {
            error: "Contenu inapproprié détecté",
            issues: contentValidation.issues,
          },
          { status: 400 }
        );
      }

      if (duplicateCheck.isDuplicate) {
        return NextResponse.json(
          {
            error: "Contenu similaire déjà publié",
            similarity: duplicateCheck.similarity,
          },
          { status: 400 }
        );
      }
    }

    // Get original review
    const originalReview = await db.review.findUnique({
      where: { id: reviewId },
      select: { courseId: true, status: true },
    });

    if (!originalReview) {
      return NextResponse.json({ error: "Avis non trouvé" }, { status: 404 });
    }

    // Determine new status after edit
    let newStatus = originalReview.status;

    // If content changed significantly, require re-moderation
    if (comment && contentValidation.confidence < 0.7) {
      newStatus = ReviewStatus.PENDING;
    }

    // Update the review
    const updatedReview = await db.review.update({
      where: { id: reviewId },
      data: {
        ...(rating !== undefined && { rating }),
        ...(comment !== undefined && { comment }),
        status: newStatus,
        updatedAt: new Date(),
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

    // Invalidate cache
    ReviewAnalyticsService.invalidateCourseCache(originalReview.courseId);

    // Log the update
    logger.info("Review updated", {
      metadata: {
        reviewId,
        userId: session.user.id,
        statusChanged: newStatus !== originalReview.status,
        newStatus,
      },
    });

    return NextResponse.json({
      success: true,
      review: {
        id: updatedReview.id,
        rating: updatedReview.rating,
        comment: updatedReview.comment,
        status: updatedReview.status,
        verified: updatedReview.verified,
        updatedAt: updatedReview.updatedAt,
        user: updatedReview.user,
      },
      statusChanged: newStatus !== originalReview.status,
    });
  } catch (error) {
    logger.error("Failed to update review", {
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });

    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'avis" },
      { status: 500 }
    );
  }
}

/**
 * Delete a review
 * DELETE /api/reviews/[reviewId]
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    // Check delete permissions
    const permissionCheck = await ReviewPermissionsService.canDeleteReview(
      session.user.id,
      reviewId
    );

    if (!permissionCheck.allowed) {
      return NextResponse.json(
        { error: permissionCheck.reason },
        { status: 403 }
      );
    }

    // Get review info before deletion
    const review = await db.review.findUnique({
      where: { id: reviewId },
      select: { courseId: true, userId: true },
    });

    if (!review) {
      return NextResponse.json({ error: "Avis non trouvé" }, { status: 404 });
    }

    // Delete the review and related data
    await db.$transaction(async (tx) => {
      // Delete votes
      await tx.reviewVote.deleteMany({
        where: { reviewId },
      });

      // Delete replies
      await tx.reviewReply.deleteMany({
        where: { reviewId },
      });

      // Delete reports
      await tx.reviewReport.deleteMany({
        where: { reviewId },
      });

      // Delete the review
      await tx.review.delete({
        where: { id: reviewId },
      });
    });

    // Invalidate cache
    ReviewAnalyticsService.invalidateCourseCache(review.courseId);

    // Log the deletion
    logger.info("Review deleted", {
      metadata: {
        reviewId,
        userId: session.user.id,
        reviewAuthorId: review.userId,
        isOwnReview: session.user.id === review.userId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Avis supprimé avec succès",
    });
  } catch (error) {
    logger.error("Failed to delete review", {
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });

    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'avis" },
      { status: 500 }
    );
  }
}
