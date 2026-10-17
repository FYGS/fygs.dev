import { db } from "../db";
import {
  SubscriptionPlan,
  SubscriptionStatus,
} from "@/lib/generated/prisma/browser";
import { mapStripeSubscriptionStatus } from "../stripe-subscription-status";
import { createLogger } from "../structured-logger";
import { getSubscriptionPeriod } from "../stripe-shapes";
import { SubscriptionManagement } from "./subscriptions";

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

  // Grant subscription access
  protected async grantSubscriptionAccess(
    userId: string,
    subscriptionId: string,
  ): Promise<void> {
    const logger = createLogger({
      operation: "grant-subscription",
      resourceType: "subscription",
      resourceId: subscriptionId,
    });

    logger.info(`Granting subscription access`, {
      resourceId: subscriptionId,
      metadata: { userId },
    });

    try {
      // Get subscription details from Stripe for more complete data
      const stripeSubscription = await this.getSubscription(subscriptionId);

      if (!stripeSubscription) {
        logger.error(`Subscription not found`, {
          resourceId: subscriptionId,
          metadata: { userId },
        });
        throw new Error(`Stripe subscription ${subscriptionId} not found`);
      }

      // Ensure customer ID is available and valid
      const customerId =
        typeof stripeSubscription.customer === "string"
          ? stripeSubscription.customer
          : stripeSubscription.customer?.id || "unknown";

      if (customerId === "unknown") {
        logger.warn(`Missing customer ID in subscription`, {
          resourceId: subscriptionId,
          metadata: { userId, status: stripeSubscription.status },
        });
      }

      // Map Stripe status to our enum (fails closed: unknown never grants access)
      const { status: mappedStatus } = mapStripeSubscriptionStatus(
        stripeSubscription.status,
      );

      // For subscription created via checkout, always ensure it's set to ACTIVE if Stripe says "active"
      const finalStatus =
        stripeSubscription.status === "active"
          ? SubscriptionStatus.ACTIVE
          : mappedStatus;

      // Cast to access properties potentially missing in the type definition
      const subAny = stripeSubscription as any;

      // Period dates: on the subscription item since API 2025-03-31 (basil), on
      // the subscription itself before (getSubscriptionPeriod reads both)
      const subscriptionItem = stripeSubscription.items?.data?.[0];
      const period = getSubscriptionPeriod(stripeSubscription);

      // Safe access to period timestamps with fallbacks to current time
      const now = Date.now();
      const currentPeriodStart = new Date(
        (period.start ||
          subAny.billing_cycle_anchor ||
          subAny.start_date ||
          Math.floor(now / 1000)) * 1000,
      );

      // Get billing interval to calculate proper fallback period
      const billingInterval =
        subscriptionItem?.price?.recurring?.interval || "month";
      const fallbackPeriodSeconds =
        billingInterval === "year" ? 365 * 24 * 60 * 60 : 30 * 24 * 60 * 60;

      const currentPeriodEnd = new Date(
        (period.end ||
          Math.floor(now / 1000) + fallbackPeriodSeconds) * 1000,
      );

      // Log period details for debugging
      logger.info("Subscription period from Stripe", {
        resourceId: subscriptionId,
        metadata: {
          userId,
          currentPeriodStartRaw: period.start,
          currentPeriodEndRaw: period.end,
          currentPeriodStartDate: currentPeriodStart.toISOString(),
          currentPeriodEndDate: currentPeriodEnd.toISOString(),
          billingInterval,
          status: stripeSubscription.status,
        },
      });

      // Get price ID safely
      const priceId =
        stripeSubscription.items?.data?.[0]?.price?.id ||
        (subAny.plan?.id as string) ||
        null;

      if (!priceId) {
        logger.warn(`No price ID found in subscription`, {
          resourceId: subscriptionId,
          metadata: {
            userId,
            status: stripeSubscription.status,
            hasItems: !!stripeSubscription.items,
          },
        });
      }

      // Create or update subscription record with complete data and fallbacks
      await db.subscription.upsert({
        where: { userId },
        create: {
          userId,
          stripeSubscriptionId: subscriptionId,
          stripeCustomerId: customerId,
          status: finalStatus,
          priceId: priceId,
          plan: SubscriptionPlan.PREMIUM,
          currentPeriodStart,
          currentPeriodEnd,
          cancelAtPeriodEnd: !!stripeSubscription.cancel_at_period_end,
        },
        update: {
          stripeSubscriptionId: subscriptionId,
          stripeCustomerId: customerId,
          status: finalStatus,
          priceId: priceId,
          plan: SubscriptionPlan.PREMIUM,
          currentPeriodStart,
          currentPeriodEnd,
          cancelAtPeriodEnd: !!stripeSubscription.cancel_at_period_end,
        },
      });

      logger.info(`Subscription access granted successfully`, {
        resourceId: subscriptionId,
        metadata: {
          userId,
          status: finalStatus,
          periodEnd: currentPeriodEnd.toISOString(),
        },
      });
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
