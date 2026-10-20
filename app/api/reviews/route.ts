import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ReviewPermissionsService } from "@/lib/services/review-permissions";
import {
  createReviewSchema,
  ReviewContentValidator,
} from "@/lib/validators/review-validators";
import { db } from "@/lib/db";
import { ReviewStatus } from "@/lib/generated/prisma/browser";
import { logger } from "@/lib/structured-logger";
import { ReviewAnalyticsService } from "@/lib/services/review-analytics";
import { ReviewNotificationService } from "@/lib/services/review-notification";
import { ReviewSearchService } from "@/lib/services/review-search";
import { reviewSearchUnavailableResponse } from "@/lib/services/review-search-response";
import { enforceRateLimit } from "@/lib/rate-limit";
import { parseJsonBody } from "@/lib/utils/parse-json-body";

// Use Node.js runtime for email services
export const runtime = "nodejs";

/**
 * Create a new review
 * POST /api/reviews
 */
export async function POST(request: NextRequest) {
  const limited = await enforceRateLimit(request, "review-write", {
    limit: 20,
    windowSeconds: 60,
  });
  if (limited) return limited;

  try {
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
    const body = parsed.body;
    const validation = createReviewSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Données invalides",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { courseId, rating, comment } = validation.data;

    // Check permissions
    const permissionCheck = await ReviewPermissionsService.canCreateReview(
      session.user.id,
      courseId
    );

    if (!permissionCheck.allowed) {
      return NextResponse.json(
        {
          error: permissionCheck.reason,
          requiresAction: permissionCheck.requiresAction,
        },
        { status: 403 }
      );
    }

    // Check rate limiting
    const rateLimitCheck = await ReviewPermissionsService.checkRateLimit(
      session.user.id,
      "create"
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
        session.user.id
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

    // Determine review status based on content validation and user reputation
    let status: "PENDING" | "APPROVED" = "PENDING";

    // Auto-approve for verified users with high confidence content
    if (contentValidation.confidence > 0.8 && session.user.emailVerified) {
      status = "APPROVED";
    }

    // Create the review
    const review = await db.review.create({
      data: {
        userId: session.user.id,
        courseId,
        rating,
        comment: comment || null,
        status,
        verified: session.user.emailVerified || false,
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
    ReviewAnalyticsService.invalidateCourseCache(courseId);

    // Send notification to instructor (async, don't wait)
    if (status === "APPROVED") {
      ReviewNotificationService.notifyNewReview(review.id).catch(
        (error) => {
          logger.error("Failed to send review notification", {
            metadata: {
              reviewId: review.id,
              error: error instanceof Error ? error.message : String(error),
            },
          });
        }
      );
    }

    // Log the creation
    logger.info("Review created", {
      metadata: {
        reviewId: review.id,
        userId: session.user.id,
        courseId,
        rating,
        status,
        autoApproved: status === "APPROVED",
      },
    });

    return NextResponse.json(
      {
        success: true,
        review: {
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          status: review.status,
          verified: review.verified,
          createdAt: review.createdAt,
          user: review.user,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error("Failed to create review", {
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });

    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

/**
 * Get reviews with advanced filtering and search
 * GET /api/reviews?courseId=xxx&search=xxx&rating=5&verified=true&page=1&limit=20&sortBy=newest
 */
export async function GET(request: NextRequest) {
  const limited = await enforceRateLimit(request, "review-read", {
    limit: 120,
    windowSeconds: 60,
  });
  if (limited) return limited;

  try {
    const { searchParams } = new URL(request.url);

    // Parse filters
    const filters: any = {
      courseId: searchParams.get("courseId") || undefined,
      search: searchParams.get("search") || undefined,
      rating: searchParams.get("rating")
        ? parseInt(searchParams.get("rating")!)
        : undefined,
      verified: searchParams.get("verified") === "true" ? true : undefined,
      status:
        (searchParams.get("status") as ReviewStatus) || ReviewStatus.APPROVED,
      hasComment:
        searchParams.get("hasComment") === "true"
          ? true
          : searchParams.get("hasComment") === "false"
          ? false
          : undefined,
      hasReplies:
        searchParams.get("hasReplies") === "true"
          ? true
          : searchParams.get("hasReplies") === "false"
          ? false
          : undefined,
      minHelpfulVotes: searchParams.get("minHelpfulVotes")
        ? parseInt(searchParams.get("minHelpfulVotes")!)
        : undefined,
      userId: searchParams.get("userId") || undefined,
      instructorId: searchParams.get("instructorId") || undefined,
    };

    // Parse date filters
    if (searchParams.get("dateFrom")) {
      filters.dateFrom = new Date(searchParams.get("dateFrom")!);
    }
    if (searchParams.get("dateTo")) {
      filters.dateTo = new Date(searchParams.get("dateTo")!);
    }

    // Parse report count filter
    if (
      searchParams.get("reportCountMin") ||
      searchParams.get("reportCountMax")
    ) {
      filters.reportCount = {
        min: searchParams.get("reportCountMin")
          ? parseInt(searchParams.get("reportCountMin")!)
          : undefined,
        max: searchParams.get("reportCountMax")
          ? parseInt(searchParams.get("reportCountMax")!)
          : undefined,
      };
    }

    // Parse options
    const options = {
      page: parseInt(searchParams.get("page") || "1"),
      limit: Math.min(parseInt(searchParams.get("limit") || "20"), 100), // Max 100 per page
      sortBy: (searchParams.get("sortBy") || "newest") as any,
      includeStats: searchParams.get("includeStats") === "true",
      includeReplies: searchParams.get("includeReplies") !== "false", // Default true
      includeVotes: searchParams.get("includeVotes") !== "false", // Default true
    };

    // Validate required parameters for public endpoints
    if (!filters.courseId && !filters.userId && !filters.instructorId) {
      return NextResponse.json(
        {
          error:
            "Au moins un filtre (courseId, userId, ou instructorId) est requis",
        },
        { status: 400 }
      );
    }

    // Use the search service
    const result = await ReviewSearchService.searchReviews(filters, options);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    const unavailable = reviewSearchUnavailableResponse(error, "reviews.list");
    if (unavailable) return unavailable;

    logger.error("Failed to fetch reviews", {
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });

    return NextResponse.json(
      { error: "Erreur lors de la récupération des avis" },
      { status: 500 }
    );
  }
}
