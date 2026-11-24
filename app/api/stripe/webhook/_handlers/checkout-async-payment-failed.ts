import type Stripe from "stripe";
import { db } from "@/lib/db";
import { PaymentStatus } from "@/lib/generated/prisma/browser";
import { emailService } from "@/lib/email-service";
import { logger } from "../_lib/logger";

/**
 * A delayed payment method (bank debit...) completes the session unpaid and later
 * fails: the pending payment created at checkout (keyed by the session id) becomes
 * FAILED and the buyer is told. No access was granted for an unpaid session, so
 * there is nothing to revoke. Safe to run twice: only a PENDING row is touched.
 */
export async function handleCheckoutAsyncPaymentFailed(
  event: Stripe.CheckoutSessionAsyncPaymentFailedEvent,
): Promise<void> {
  try {
    const session = event.data.object;
    const userId = session.metadata?.userId;

    const { count } = await db.payment.updateMany({
      where: {
        stripePaymentIntentId: session.id,
        status: PaymentStatus.PENDING,
        ...(userId ? { userId } : {}),
      },
      data: { status: PaymentStatus.FAILED },
    });

    logger.warn("Delayed payment failed", {
      eventType: "payment.async_failed",
      userId,
      resourceType: "checkout_session",
      resourceId: session.id,
      metadata: { updatedPayments: count, mode: session.mode },
    });

    if (!userId || count === 0) return;

    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      });
      if (user) {
        await emailService.sendPaymentFailedEmail(user.name || "Étudiant", user.email);
      }
    } catch (emailError) {
      // The status is already recorded: a mail failure must not make Stripe retry
      logger.error(
        "Error sending payment failed email",
        { eventType: "email.send_error", userId, resourceType: "email" },
        emailError instanceof Error ? emailError : new Error(String(emailError)),
      );
    }
  } catch (error) {
    logger.error(
      "Error processing checkout.session.async_payment_failed",
      { eventType: "webhook.async_payment_failed_error", resourceType: "checkout_session" },
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
}
