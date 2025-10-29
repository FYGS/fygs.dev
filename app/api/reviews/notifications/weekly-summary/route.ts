import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ReviewNotificationService } from "@/lib/services/review-notification";
import { logger } from "@/lib/structured-logger";

export const runtime = "nodejs";

/**
 * Send weekly review summaries to instructors
 * POST /api/reviews/notifications/weekly-summary
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin permissions
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès non autorisé - Admin requis" },
        { status: 403 }
      );
    }

    // Send weekly summaries
    await ReviewNotificationService.sendWeeklyReviewSummaries();

    logger.info("Weekly review summaries triggered", {
      eventType: "notification.weekly_summaries_triggered",
      metadata: {
        triggeredBy: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Résumés hebdomadaires envoyés avec succès",
    });
  } catch (error) {
    logger.error("Failed to send weekly review summaries", {
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });

    return NextResponse.json(
      { error: "Erreur lors de l'envoi des résumés" },
      { status: 500 }
    );
  }
}

/**
 * Send bulk notifications for reviews
 * PUT /api/reviews/notifications/weekly-summary
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès non autorisé - Admin requis" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { reviewIds } = body;

    if (!Array.isArray(reviewIds) || reviewIds.length === 0) {
      return NextResponse.json(
        { error: "Liste d'IDs d'avis requise" },
        { status: 400 }
      );
    }

    // Send bulk notifications
    await ReviewNotificationService.sendBulkReviewNotifications(reviewIds);

    logger.info("Bulk review notifications triggered", {
      eventType: "notification.bulk_notifications_triggered",
      metadata: {
        triggeredBy: session.user.id,
        reviewCount: reviewIds.length,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Notifications envoyées pour ${reviewIds.length} avis`,
      processedReviews: reviewIds.length,
    });
  } catch (error) {
    logger.error("Failed to send bulk review notifications", {
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });

    return NextResponse.json(
      { error: "Erreur lors de l'envoi des notifications" },
      { status: 500 }
    );
  }
}
