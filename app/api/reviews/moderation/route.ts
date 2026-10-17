import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ReviewSearchService } from "@/lib/services/review-search";
import { ReviewStatus } from "@/lib/generated/prisma/browser";
import { logger } from "@/lib/structured-logger";

export const runtime = "nodejs";

/**
 * Get reviews needing moderation (admin/instructor only)
 * GET /api/reviews/moderation?status=PENDING&reportCountMin=1&page=1&limit=20
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication and permissions
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }

    // Only admins and instructors can access moderation queue
    if (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);

    // Parse filters for moderation
    const filters: any = {
      status: [
        ReviewStatus.PENDING,
        ...(searchParams.get("includeFlagged") === "true"
          ? [ReviewStatus.APPROVED]
          : []),
      ] as ReviewStatus[],
      instructorId:
        session.user.role === "INSTRUCTOR" ? session.user.id : undefined,
    };

    // Add report count filter if specified
    if (searchParams.get("reportCountMin")) {
      filters.reportCount = {
        min: parseInt(searchParams.get("reportCountMin")!),
      };
    }

    // Add date filters
    if (searchParams.get("dateFrom")) {
      filters.dateFrom = new Date(searchParams.get("dateFrom")!);
    }
    if (searchParams.get("dateTo")) {
      filters.dateTo = new Date(searchParams.get("dateTo")!);
    }

    const options = {
      page: parseInt(searchParams.get("page") || "1"),
      limit: Math.min(parseInt(searchParams.get("limit") || "20"), 100),
      sortBy: (searchParams.get("sortBy") || "oldest") as any,
      includeStats: true,
      includeReplies: true,
      includeVotes: true,
    };

    const result = await ReviewSearchService.getModerationQueue(
      filters,
      options
    );

    // Add moderation-specific metadata
    const response = {
      success: true,
      moderator: {
        id: session.user.id,
        role: session.user.role,
      },
      ...result,
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error("Failed to fetch moderation queue", {
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });

    return NextResponse.json(
      { error: "Erreur lors de la récupération de la file de modération" },
      { status: 500 }
    );
  }
}
