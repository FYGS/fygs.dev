import { NextRequest, NextResponse } from "next/server";
import { ReviewSearchService } from "@/lib/services/review-search";
import { logger } from "@/lib/structured-logger";
import { enforceRateLimit } from "@/lib/rate-limit";

/**
 * Get trending reviews (high engagement)
 * GET /api/reviews/trending?courseId=xxx&period=week&limit=10
 */
export async function GET(request: NextRequest) {
  const limited = await enforceRateLimit(request, "review-read", {
    limit: 120,
    windowSeconds: 60,
  });
  if (limited) return limited;

  try {
    const { searchParams } = new URL(request.url);

    const courseId = searchParams.get("courseId");
    const period = searchParams.get("period") || "week"; // day, week, month
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);

    // Calculate date range based on period
    let dateFrom: Date | undefined;
    const now = new Date();

    switch (period) {
      case "day":
        dateFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "week":
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        dateFrom = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    const filters = {
      courseId: courseId || undefined,
      dateFrom,
      minHelpfulVotes: 1, // At least 1 helpful vote
    };

    const options = {
      limit,
      sortBy: "helpful" as const,
      includeStats: true,
      includeReplies: true,
      includeVotes: true,
    };

    const result = await ReviewSearchService.getTrendingReviews(
      filters,
      options
    );

    return NextResponse.json({
      success: true,
      period,
      ...result,
    });
  } catch (error) {
    logger.error("Failed to fetch trending reviews", {
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });

    return NextResponse.json(
      { error: "Erreur lors de la récupération des avis tendance" },
      { status: 500 }
    );
  }
}
