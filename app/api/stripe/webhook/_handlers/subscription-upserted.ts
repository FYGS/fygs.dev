import type Stripe from "stripe";
import { db } from "@/lib/db";
import { SubscriptionPlan } from "@prisma/client";
import { emailService } from "@/lib/email-service";
import { Analytics } from "@/lib/analytics-helper";
import { classifyBillingCycle } from "@/lib/subscription-pricing";
import { mapStripeSubscriptionStatus } from "@/lib/stripe-subscription-status";
import { getSubscriptionPeriod, stripeRefId } from "@/lib/stripe-shapes";
import { logger } from "../_lib/logger";

export async function handleSubscriptionUpserted(event: Stripe.CustomerSubscriptionCreatedEvent | Stripe.CustomerSubscriptionUpdatedEvent): Promise<void> {
  try {
    const subscription = event.data.object;

    // Webhook is the single source of truth for subscription status updates
    const userId = subscription.metadata?.userId;
    // Log better diagnostics for subscription events
    logger.info("Processing subscription event details", {
      eventType: event.type,
      userId: userId || undefined,
      resourceId: subscription.id,
      resourceType: "subscription",
      metadata: {
        hasMetadata: !!subscription.metadata,
        status: subscription.status,
      },
    });

    if (userId) {
      const priceItem = subscription.items?.data?.[0];
      const priceId: string | undefined = priceItem?.price?.id;
      // Use metadata.billingCycle as primary source if available
      const billingCycle = subscription.metadata?.billingCycle as
        | "yearly"
        | "monthly"
        | undefined;
      const interval =
        billingCycle ||
        (classifyBillingCycle(priceId) === "yearly"
          ? "yearly"
          : "monthly");

      // Fails closed: only Stripe "active" grants access (ACTIVE)
      const { status: mappedStatus, known } = mapStripeSubscriptionStatus(
        subscription.status,
      );
      if (!known) {
        logger.warn("Unknown Stripe subscription status", {
          resourceId: subscription.id,
          metadata: { stripeStatus: subscription.status },
        });
      }

      // Cast subscription to any to safely access properties that might not be in the type definition
      const subData = subscription as any;

      // Period dates: on the subscription item since API 2025-03-31 (basil), on the
      // subscription itself before: the endpoint may still send either shape
      const period = getSubscriptionPeriod(subscription);

      // Add safe access to period timestamps with fallbacks
      const currentPeriodStart =
        period.start ||
        subData.billing_cycle_anchor ||
        subData.start_date ||
        Math.floor(Date.now() / 1000);

      const currentPeriodEnd =
        period.end ||
        Math.floor(Date.now() / 1000) +
          (interval === "yearly" ? 365 : 30) * 24 * 60 * 60;

      // Log detailed period information for debugging
      logger.info("Subscription period details", {
        eventType: event.type,
        userId,
        resourceId: subscription.id,
        metadata: {
          currentPeriodStartRaw: period.start,
          currentPeriodEndRaw: period.end,
          currentPeriodStartDate: new Date(
            currentPeriodStart * 1000,
          ).toISOString(),
          currentPeriodEndDate: new Date(
            currentPeriodEnd * 1000,
          ).toISOString(),
          billingCycle: interval,
          priceId,
          status: subscription.status,
        },
      });

      const subscriptionData = {
        userId,
        stripeCustomerId: stripeRefId(subscription.customer) ?? (subscription.customer as string),
        stripeSubscriptionId: subscription.id,
        status: mappedStatus,
        priceId,
        plan: SubscriptionPlan.PREMIUM,
        currentPeriodStart: new Date(currentPeriodStart * 1000),
        currentPeriodEnd: new Date(currentPeriodEnd * 1000),
        cancelAtPeriodEnd: !!subData.cancel_at_period_end,
      };

      await db.subscription.upsert({
        where: { userId },
        create: subscriptionData,
        update: subscriptionData,
      });

      // Send subscription update email for active subscriptions
      if (subscription.status === "active") {
        try {
          const user = await db.user.findUnique({
            where: { id: userId },
            select: { email: true, name: true },
          });

          if (user) {
            if (event.type === "customer.subscription.created") {
              await emailService.sendPremiumSubscriptionEmail(
                user.name || "Étudiant",
                user.email,
                "Premium",
                (subscription as any).items.data[0]?.price?.unit_amount /
                  100 || 0,
                interval,
              );
              Analytics.subscriptionStarted(userId, {
                priceId,
                billingCycle: interval,
              });
              logger.info("Premium subscription welcome email sent", {
                eventType: "email.subscription_welcome_sent",
                userId,
                resourceType: "subscription",
                resourceId: subscription.id,
                metadata: { interval },
              });
            } else {
              // Record generic subscription update (status change, price, cycle)
              Analytics.subscriptionUpdated(userId, {
                priceId,
                billingCycle: interval,
                status: subscription.status,
              });
            }
          }
        } catch (emailError) {
          logger.error(
            "Error sending subscription email",
            {
              eventType: "email.send_error",
              userId,
              resourceType: "subscription",
              resourceId: subscription.id,
            },
            emailError instanceof Error
              ? emailError
              : new Error(String(emailError)),
          );
        }
      }

      logger.info("Subscription updated successfully", {
        eventType: "subscription.updated",
        userId,
        resourceType: "subscription",
        resourceId: subscription.id,
        fromState: undefined,
        toState: subscription.status,
        metadata: { plan: "PREMIUM", interval },
      });
    }
  } catch (error) {
    logger.error(
      "Error processing subscription update",
      {
        eventType: "webhook.subscription_update_error",
        resourceType: "subscription",
      },
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
}
