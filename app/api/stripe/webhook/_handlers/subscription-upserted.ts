import type Stripe from "stripe";
import { db } from "@/lib/db";
import { paymentService } from "@/lib/payment-service";
import { emailService } from "@/lib/email-service";
import { Analytics } from "@/lib/analytics-helper";
import { classifyBillingCycle } from "@/lib/subscription-pricing";
import {
  applySubscriptionState,
  cancelDuplicateSubscription,
  subscriptionStateFromStripe,
} from "@/lib/payments/subscription-state";
import { logger } from "../_lib/logger";

const CLOCK_SKEW_MARGIN_MS = 60_000;

/**
 * `customer.subscription.created` / `.updated`. The event only tells us that something changed: the state that is
 * stored is the one READ FROM STRIPE now (a retried or reordered event can then neither resurrect a cancelled
 * subscription nor undo a newer change), through the central rules of lib/payments/subscription-state.ts (Premium
 * plans only, one subscription per user, nothing stale).
 */
export async function handleSubscriptionUpserted(
  event: Stripe.CustomerSubscriptionCreatedEvent | Stripe.CustomerSubscriptionUpdatedEvent,
): Promise<void> {
  try {
    const subscription = event.data.object;

    // Set by our checkout when the subscription is created; the owner of the subscription
    const userId = subscription.metadata?.userId;
    if (!userId) {
      logger.warn("Subscription event without user: ignored", {
        eventType: event.type,
        resourceId: subscription.id,
        resourceType: "subscription",
      });
      return;
    }

    // The stored state was confirmed with Stripe clearly AFTER this event was created: nothing to learn. The margin
    // absorbs a clock that is ahead of Stripe's; inside it the event is processed (reading the live state is safe).
    const stored = await db.subscription.findUnique({ where: { userId }, select: { lastEventAt: true, stripeSubscriptionId: true } });
    if (
      stored?.stripeSubscriptionId === subscription.id &&
      stored.lastEventAt &&
      event.created < Math.floor((stored.lastEventAt.getTime() - CLOCK_SKEW_MARGIN_MS) / 1000)
    ) {
      logger.info("Stale subscription event ignored", {
        eventType: "subscription.event_stale",
        userId,
        resourceId: subscription.id,
        resourceType: "subscription",
      });
      return;
    }

    // Trust Stripe's current state, not the payload that travelled
    const live = await paymentService.getSubscription(subscription.id);
    const state = subscriptionStateFromStripe(userId, live);
    const outcome = await applySubscriptionState(state);

    if (outcome === "duplicate_active") {
      await cancelDuplicateSubscription(paymentService, userId, subscription.id);
    }

    logger.info("Subscription event processed", {
      eventType: "subscription.updated",
      userId,
      resourceType: "subscription",
      resourceId: subscription.id,
      toState: state.status,
      metadata: { outcome, priceId: state.priceId },
    });

    if (outcome !== "applied") return;

    const interval = classifyBillingCycle(state.priceId ?? undefined) === "yearly" ? "yearly" : "monthly";

    // Welcome e-mail (once, at creation) and analytics for running subscriptions
    if (live.status === "active") {
      try {
        const user = await db.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
        if (user) {
          if (event.type === "customer.subscription.created") {
            const unitAmount = live.items.data[0]?.price?.unit_amount ?? 0;
            await emailService.sendPremiumSubscriptionEmail(user.name || "Étudiant", user.email, "Premium", unitAmount / 100, interval);
            Analytics.subscriptionStarted(userId, { priceId: state.priceId ?? undefined, billingCycle: interval });
            logger.info("Premium subscription welcome email sent", {
              eventType: "email.subscription_welcome_sent",
              userId,
              resourceType: "subscription",
              resourceId: subscription.id,
              metadata: { interval },
            });
          } else {
            Analytics.subscriptionUpdated(userId, {
              priceId: state.priceId ?? undefined,
              billingCycle: interval,
              status: live.status,
            });
          }
        }
      } catch (emailError) {
        logger.error(
          "Error sending subscription email",
          { eventType: "email.send_error", userId, resourceType: "subscription", resourceId: subscription.id },
          emailError instanceof Error ? emailError : new Error(String(emailError)),
        );
      }
    }
  } catch (error) {
    logger.error(
      "Error processing subscription update",
      { eventType: "webhook.subscription_update_error", resourceType: "subscription" },
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
}
