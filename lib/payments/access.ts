import { db } from "../db";
import { createLogger } from "../structured-logger";
import { SubscriptionManagement } from "./subscriptions";
import {
  applySubscriptionState,
  cancelDuplicateSubscription,
  subscriptionStateFromStripe,
  type ApplyOutcome,
} from "./subscription-state";

/** Database-side access grants (course enrollment, subscription record). */
export class AccessGrants extends SubscriptionManagement {
  // Grant course access
  async grantCourseAccess(userId: string, courseId: string): Promise<void> {
    console.log(`Granting course access: User ${userId} -> Course ${courseId}`);

    try {
      // Check if enrollment already exists (idempotency)
      const existingEnrollment = await db.enrollment.findUnique({
        where: {
          userId_courseId: { userId, courseId },
        },
      });

      if (existingEnrollment) {
        console.log(
          `Course access already exists: User ${userId} -> Course ${courseId}`,
        );
        return;
      }

      // Verify course exists and is published
      const course = await db.course.findFirst({
        where: { id: courseId, published: true },
        select: { id: true, title: true },
      });

      if (!course) {
        throw new Error(`Course ${courseId} not found or not published`);
      }

      // Create enrollment record
      await db.enrollment.create({
        data: {
          userId,
          courseId,
          enrolledAt: new Date(),
        },
      });

      console.log(
        `Course access granted: User ${userId} -> Course ${courseId} (${course.title})`,
      );
    } catch (error) {
      console.error(`Failed to grant course access: ${error}`);
      throw error;
    }
  }

  /**
   * Grants Premium from a subscription: reads its CURRENT state from Stripe (never trusting the event that told us
   * about it) and stores it through `applySubscriptionState`, which refuses what is stale, foreign, not a Premium
   * plan, or a duplicate of a running subscription (cancelled and refunded here).
   */
  protected async grantSubscriptionAccess(
    userId: string,
    subscriptionId: string,
  ): Promise<ApplyOutcome> {
    const logger = createLogger({
      operation: "grant-subscription",
      resourceType: "subscription",
      resourceId: subscriptionId,
    });

    try {
      const stripeSubscription = await this.getSubscription(subscriptionId);
      if (!stripeSubscription) {
        throw new Error(`Stripe subscription ${subscriptionId} not found`);
      }

      const state = subscriptionStateFromStripe(userId, stripeSubscription);
      const outcome = await applySubscriptionState(state);

      if (outcome === "duplicate_active") {
        await cancelDuplicateSubscription(this, userId, subscriptionId);
      }

      logger.info("Subscription access processed", {
        resourceId: subscriptionId,
        metadata: { userId, outcome, status: state.status, periodEnd: state.currentPeriodEnd.toISOString() },
      });
      return outcome;
    } catch (error) {
      logger.error(`Failed to grant subscription access`, {
        resourceId: subscriptionId,
        metadata: {
          userId,
          error: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : undefined,
        },
      });
      throw error;
    }
  }
}
