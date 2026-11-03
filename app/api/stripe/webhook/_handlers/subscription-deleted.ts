import type Stripe from "stripe";
import { db } from "@/lib/db";
import { SubscriptionStatus } from "@/lib/generated/prisma/browser";
import { applySubscriptionEnded } from "@/lib/payments/subscription-state";
import { emailService } from "@/lib/email-service";
import { Analytics } from "@/lib/analytics-helper";
import { logger } from "../_lib/logger";

export async function handleSubscriptionDeleted(event: Stripe.CustomerSubscriptionDeletedEvent): Promise<void> {
  try {
    const subscription = event.data.object;

    // Keyed on the Stripe subscription id, not on the user: the end of an OLD subscription (a user who cancelled and
    // subscribed again) must not cancel the current one
    const userId = subscription.metadata?.userId;
    const outcome = await applySubscriptionEnded(subscription.id);
    if (outcome === "not_current") {
      logger.info("Ended subscription is not the user's current one: nothing to change", {
        eventType: "subscription.ended_not_current",
        userId,
        resourceType: "subscription",
        resourceId: subscription.id,
      });
      return;
    }

    if (userId) {
      // Send cancellation confirmation email
      try {
        const user = await db.user.findUnique({
          where: { id: userId },
          select: { email: true, name: true },
        });

        if (user) {
          await emailService.sendSubscriptionCanceledEmail(
            user.name || "Étudiant",
            user.email,
          );
          // Record cancellation via soft cancel analytics (even if immediate delete event)
          Analytics.subscriptionCanceledSoft(userId, {
            subscriptionId: subscription.id,
          });
          logger.info("Subscription cancellation email sent", {
            eventType: "email.subscription_cancellation_sent",
            userId,
            resourceType: "subscription",
            resourceId: subscription.id,
            metadata: {},
          });
        }
      } catch (emailError) {
        logger.error(
          "Error sending cancellation email",
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

      logger.info("Subscription canceled successfully", {
        eventType: "subscription.canceled",
        userId,
        resourceType: "subscription",
        resourceId: subscription.id,
        fromState: SubscriptionStatus.ACTIVE,
        toState: SubscriptionStatus.CANCELED,
      });
    }
  } catch (error) {
    logger.error(
      "Error processing subscription deletion",
      {
        eventType: "webhook.subscription_deletion_error",
        resourceType: "subscription",
      },
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
}
