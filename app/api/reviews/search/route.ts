import { NextRequest, NextResponse } from "next/server";
import { ReviewSearchService } from "@/lib/services/review-search";
import { ReviewStatus } from "@prisma/client";
import { logger } from "@/lib/structured-logger";
import { enforceRateLimit } from "@/lib/rate-limit";

/**
 * Advanced review search with full-text search and complex filtering
 * GET /api/reviews/search?q=excellent&courseId=xxx&rating=5&verified=true
 */
export async function GET(request: NextRequest) {
  const limited = await enforceRateLimit(request, "review-read", {
    limit: 120,
    windowSeconds: 60,
  });
  if (limited) return limited;

  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get("q") || searchParams.get("search");

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: "Requête de recherche trop courte (minimum 2 caractères)" },
        { status: 400 }
      );
    }

    // Parse filters
    const filters: any = {
      courseId: searchParams.get("courseId") || undefined,
      rating: searchParams.get("rating")
        ? searchParams
            .get("rating")!
            .split(",")
            .map((r) => parseInt(r))
        : undefined,
      verified: searchParams.get("verified") === "true" ? true : undefined,
      status:
        (searchParams.get("status") as ReviewStatus) || ReviewStatus.APPROVED,
      hasComment: searchParams.get("hasComment") === "true" ? true : undefined,
      hasReplies: searchParams.get("hasReplies") === "true" ? true : undefined,
      minHelpfulVotes: searchParams.get("minHelpfulVotes")
        ? parseInt(searchParams.get("minHelpfulVotes")!)
        : undefined,
      instructorId: searchParams.get("instructorId") || undefined,
    };

    // Parse date filters
    if (searchParams.get("dateFrom")) {
      filters.dateFrom = new Date(searchParams.get("dateFrom")!);
    }
    if (searchParams.get("dateTo")) {
      filters.dateTo = new Date(searchParams.get("dateTo")!);
    }

    // Parse options
    const options = {
      page: parseInt(searchParams.get("page") || "1"),
      limit: Math.min(parseInt(searchParams.get("limit") || "20"), 50), // Max 50 for search
      sortBy: (searchParams.get("sortBy") || "relevance") as any,
      includeStats: searchParams.get("includeStats") === "true",
      includeReplies: searchParams.get("includeReplies") !== "false",
      includeVotes: searchParams.get("includeVotes") !== "false",
    };

    // Perform search
    const result = await ReviewSearchService.searchByText(
      query,
      filters,
      options
    );

    // Add search metadata
    const response = {
      success: true,
      query: query.trim(),
      searchTime: Date.now(),
      ...result,
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error("Failed to search reviews", {
      metadata: {
        error: error instanceof Error ? error.message : String(error),
        query: request.url,
      },
    });

    return NextResponse.json(
      { error: "Erreur lors de la recherche d'avis" },
      { status: 500 }
    );
  }
}

/**
 * Get search suggestions/autocomplete
 * GET /api/reviews/search/suggestions?q=exc&courseId=xxx
 */
export async function POST(request: NextRequest) {
  const limited = await enforceRateLimit(request, "review-read", {
    limit: 120,
    windowSeconds: 60,
  });
  if (limited) return limited;

  try {
    const body = await request.json();
    const { query, courseId, limit = 10 } = body;

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    // Get suggestions based on existing review content
    const suggestions = await getSuggestions(query, courseId, limit);

    return NextResponse.json({
      success: true,
      query,
      suggestions,
    });
  } catch (error) {
    logger.error("Failed to get search suggestions", {
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });

    return NextResponse.json(
      { error: "Erreur lors de la récupération des suggestions" },
      { status: 500 }
    );
  }
}

/**
 * Get search suggestions based on review content
 */
async function getSuggestions(
  query: string,
  courseId?: string,
  limit: number = 10
) {
  // This would ideally use a proper search engine like Elasticsearch
  // For now, we'll use basic text matching

  try {
    // Get reviews that match the query
    const result = await ReviewSearchService.searchByText(
      query,
      {
        courseId,
        status: ReviewStatus.APPROVED,
        hasComment: true,
      },
      {
        limit,
        sortBy: "relevance",
        includeReplies: false,
        includeVotes: false,
      }
    );

    // Extract relevant phrases from review comments
    const suggestions = result.reviews
      .flatMap((review) => {
        if (!review.comment) return [];

        const words = review.comment
          .toLowerCase()
          .split(/\s+/)
          .filter(
            (word: string) =>
              word.length > 3 &&
              word.includes(query.toLowerCase()) &&
              ![
                "le",
                "la",
                "les",
                "de",
                "du",
                "des",
                "et",
                "ou",
                "mais",
                "donc",
                "car",
              ].includes(word)
          );

        return words;
      })
      .reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    // Sort by frequency and return top suggestions
    return Object.entries(suggestions)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, limit)
      .map(([word, count]) => ({
        text: word,
        frequency: count as number,
      }));
  } catch (error) {
    logger.error("Failed to generate suggestions", {
      metadata: {
        error: error instanceof Error ? error.message : String(error),
        query,
        courseId,
      },
    });

    return [];
  }
}
