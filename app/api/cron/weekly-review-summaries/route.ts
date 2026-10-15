import { NextRequest, NextResponse } from "next/server";
import { ReviewNotificationService } from "@/lib/services/review-notification";
import { logger } from "@/lib/structured-logger";
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * Cron job to send weekly review summaries
 * This endpoint should be called by a cron service (like Vercel Cron)
 * GET /api/cron/weekly-review-summaries
 */
export async function GET(request: NextRequest) {
  const limited = await enforceRateLimit(request, "cron", {
    limit: 30,
    windowSeconds: 60,
  });
  if (limited) return limited;

  try {
    // Verify the request is from a cron service
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      logger.warn("Unauthorized cron request", {
        metadata: {
          hasAuth: !!authHeader,
          hasSecret: !!cronSecret,
        },
      });

      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Send weekly summaries
    await ReviewNotificationService.sendWeeklyReviewSummaries();

    logger.info("Weekly review summaries cron job completed", {
      eventType: "cron.weekly_summaries_completed",
    });

    return NextResponse.json({
      success: true,
      message: "Weekly review summaries sent successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Cron job failed: weekly review summaries", {
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });

    return NextResponse.json(
      {
        error: "Erreur lors de l'envoi des résumés hebdomadaires",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
