import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ReviewPermissionsService } from "@/lib/services/review-permissions";
import { ReviewNotificationService } from "@/lib/services/review-notification";
import { createReportSchema } from "@/lib/validators/review-validators";
import { db } from "@/lib/db";
import { ReportStatus } from "@prisma/client";
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

    // Create the report
    const report = await db.reviewReport.create({
      data: {
        reviewId,
        userId: session.user.id,
        reason,
        details: details || null,
        status: ReportStatus.PENDING,
      },
      include: {
        user: true,
        review: {
          include: {
            user: true,
            course: true,
          },
        },
      },
    });

    // Update report count on review
    const reportCount = await db.reviewReport.count({
      where: { reviewId },
    });

    await db.review.update({
      where: { id: reviewId },
      data: { reportCount },
    });

    // Send notification to moderators (async, don't wait)
    ReviewNotificationService.notifyReviewReported(report as any).catch(
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

    // If report count reaches threshold, flag the review
    const REPORT_THRESHOLD = 3;
    if (reportCount >= REPORT_THRESHOLD) {
      await db.review.update({
        where: { id: reviewId },
        data: { status: "FLAGGED" },
      });

      logger.warn("Review auto-flagged due to reports", {
        metadata: {
          reviewId,
          reportCount,
        },
      });
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
