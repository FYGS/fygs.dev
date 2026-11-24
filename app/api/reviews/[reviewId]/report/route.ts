import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ReviewPermissionsService } from "@/lib/services/review-permissions";
import { ReviewNotificationService } from "@/lib/services/review-notification";
import { createReportSchema } from "@/lib/validators/review-validators";
import { shouldAutoFlag } from "@/lib/services/review-reports";
import { db } from "@/lib/db";
import { ReportStatus } from "@/lib/generated/prisma/browser";
import { logger } from "@/lib/structured-logger";
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{
    reviewId: string;
  }>;
}

/**
 * Report a review
 * POST /api/reviews/[reviewId]/report
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
    const validation = createReportSchema.safeParse({ ...body, reviewId });

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Données invalides",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { reason, details } = validation.data;

    // Check permissions
    const permissionCheck = await ReviewPermissionsService.canReportReview(
      session.user.id,
      reviewId
    );

    if (!permissionCheck.allowed) {
      return NextResponse.json(
        { error: permissionCheck.reason },
        { status: 403 }
      );
    }

    // Check if user already reported this review
    const existingReport = await db.reviewReport.findUnique({
      where: {
        userId_reviewId: {
          userId: session.user.id,
          reviewId,
        },
      },
    });

    if (existingReport) {
      return NextResponse.json(
        { error: "Vous avez déjà signalé cet avis" },
        { status: 400 }
      );
    }

    // Create the report (one per reporter and review: the unique key also settles two simultaneous requests)
    let report;
    try {
      report = await db.reviewReport.create({
        data: {
          reviewId,
          userId: session.user.id,
          reason,
          details: details || null,
          status: ReportStatus.PENDING,
        },
        select: { id: true, reason: true, createdAt: true },
      });
    } catch (error) {
      if ((error as { code?: string } | null)?.code === "P2002") {
        return NextResponse.json({ error: "Vous avez déjà signalé cet avis" }, { status: 400 });
      }
      throw error;
    }

    // Update report count on review
    const reportCount = await db.reviewReport.count({
      where: { reviewId },
    });

    await db.review.update({
      where: { id: reviewId },
      data: { reportCount },
    });

    // Send notification to moderators (async, don't wait)
    ReviewNotificationService.notifyReviewReported(report.id).catch(
      (error) => {
        logger.error("Failed to send report notification", {
          metadata: {
            reportId: report.id,
            error: error instanceof Error ? error.message : String(error),
          },
        });
      }
    );

    // Log the report
    logger.info("Review reported", {
      metadata: {
        reportId: report.id,
        reviewId,
        userId: session.user.id,
        reason,
      },
    });

    // A review is hidden automatically only when enough CREDIBLE people reported it: distinct accounts (one report each),
    // with a verified e-mail and at least a week old. Fresh throw-away accounts cannot take a review down; their
    // reports still reach the moderators, who decide.
    if (await shouldAutoFlag(reviewId)) {
      const flagged = await db.review.updateMany({
        where: { id: reviewId, status: "APPROVED" },
        data: { status: "FLAGGED" },
      });

      if (flagged.count > 0) {
        logger.warn("Review auto-flagged due to reports", {
          metadata: {
            reviewId,
            reportCount,
          },
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        report: {
          id: report.id,
          reason: report.reason,
          createdAt: report.createdAt,
        },
        totalReports: reportCount,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error("Failed to report review", {
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });

    return NextResponse.json(
      { error: "Erreur lors du signalement" },
      { status: 500 }
    );
  }
}

/**
 * Get reports for a review (admin only)
 * GET /api/reviews/[reviewId]/report
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { reviewId } = await params;

    // Get user session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès administrateur requis" },
        { status: 403 }
      );
    }

    // Get all reports for the review
    const reports = await db.reviewReport.findMany({
      where: { reviewId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get report statistics
    const stats = {
      total: reports.length,
      pending: reports.filter((r) => r.status === ReportStatus.PENDING).length,
      reviewed: reports.filter((r) => r.status === ReportStatus.REVIEWED)
        .length,
      resolved: reports.filter((r) => r.status === ReportStatus.RESOLVED)
        .length,
      dismissed: reports.filter((r) => r.status === ReportStatus.DISMISSED)
        .length,
      reasonBreakdown: reports.reduce((acc, report) => {
        acc[report.reason] = (acc[report.reason] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      success: true,
      reports,
      stats,
    });
  } catch (error) {
    logger.error("Failed to fetch review reports", {
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });

    return NextResponse.json(
      { error: "Erreur lors de la récupération des signalements" },
      { status: 500 }
    );
  }
}
