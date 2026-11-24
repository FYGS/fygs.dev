import { db } from "@/lib/db";

export const REPORT_THRESHOLD = 3;
export const MIN_REPORTER_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Whether the CREDIBLE reports on a review reach the threshold that hides it automatically. Credible: one report per
 * account (the database key allows one per reporter and review), the reporter's e-mail is verified and the account is at
 * least a week old. Fresh throw-away accounts therefore cannot take a review down; their reports still reach the
 * moderators, who decide.
 */
export async function shouldAutoFlag(reviewId: string, now = new Date()): Promise<boolean> {
  const credible = await db.reviewReport.count({
    where: {
      reviewId,
      user: { emailVerified: true, createdAt: { lte: new Date(now.getTime() - MIN_REPORTER_AGE_MS) } },
    },
  });
  return credible >= REPORT_THRESHOLD;
}
