import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { paymentService, WebhookSignatureError } from "@/lib/payment-service";
import { claimEvent, completeEvent, releaseEvent } from "@/lib/payments/event-claims";
import { assertStripeKeyMode } from "@/lib/stripe";
import { logger } from "./_lib/logger";
import { handleCheckoutSessionCompleted } from "./_handlers/checkout-session-completed";
import { handleSubscriptionUpserted } from "./_handlers/subscription-upserted";
import { handleSubscriptionDeleted } from "./_handlers/subscription-deleted";
import { handleInvoicePaymentSucceeded } from "./_handlers/invoice-payment-succeeded";
import { handleInvoicePaymentFailed } from "./_handlers/invoice-payment-failed";
import { handleChargeRefunded } from "./_handlers/charge-refunded";
import { handleCheckoutAsyncPaymentFailed } from "./_handlers/checkout-async-payment-failed";
import { handleChargeDisputeClosed, handleChargeDisputeCreated } from "./_handlers/charge-dispute";
import { handleRefundUpdated } from "./_handlers/refund-updated";

// Disable body parsing for webhooks
export const runtime = "nodejs";

/** A Stripe event is a few KB; nothing legitimate comes close to this. Larger bodies are refused unread. */
const MAX_BODY_BYTES = 1_000_000;

class BodyTooLargeError extends Error {}

/** The raw body as text (the signature is computed on it), refusing to buffer more than the limit. */
async function readBody(req: NextRequest): Promise<string> {
  const declared = Number(req.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) throw new BodyTooLargeError();
  if (!req.body) return req.text();

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel().catch(() => undefined);
      throw new BodyTooLargeError();
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}

export async function POST(req: NextRequest) {
  let body: string;
  let signature: string | null;

  try {
    assertStripeKeyMode();
  } catch (error) {
    logger.error("Stripe key does not match the expected mode", {
      eventType: "webhook.key_mode_mismatch",
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  try {
    body = await readBody(req);
    const headersList = await headers();
    signature = headersList.get("stripe-signature");

    if (!signature) {
      logger.error("Missing Stripe signature in webhook request", {
        eventType: "webhook.signature_missing",
      });
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }
  } catch (error) {
    if (error instanceof BodyTooLargeError) {
      logger.error("Webhook body too large", { eventType: "webhook.body_too_large" });
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }
    logger.error(
      "Error reading webhook request",
      {
        eventType: "webhook.request_read_error",
      },
      error instanceof Error ? error : new Error(String(error)),
    );
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  let event: ReturnType<typeof paymentService.verifyWebhookSignature>;
  try {
    event = paymentService.verifyWebhookSignature(body, signature);
  } catch (error) {
    if (error instanceof WebhookSignatureError) {
      // The sender is not Stripe (or the payload was altered): client error, no retry value.
      logger.error("Invalid Stripe webhook signature", {
        eventType: "webhook.signature_invalid",
      });
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
    // Anything else (e.g. missing STRIPE_WEBHOOK_SECRET) is a server problem.
    logger.error("Webhook signature verification failed", {
      eventType: "webhook.verification_error",
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  // Stripe delivers at least once and retries on any non-2xx. The claim lives in the database with a lease (see
  // lib/payments/event-claims.ts): a duplicate of a processed event is acknowledged, a delivery that arrives while the
  // first is still running is refused so that Stripe retries (and takes over if the first one died), and a handler that
  // fails releases the claim so that the retry runs at once.
  const claim = await claimEvent(event.id, event.type);
  if (claim.state === "duplicate") {
    logger.info("Duplicate Stripe webhook event ignored", {
      eventType: "webhook.duplicate_event",
      resourceType: "stripe_event",
      resourceId: event.id,
    });
    return NextResponse.json({ received: true, duplicate: true });
  }
  if (claim.state === "in_progress") {
    logger.warn("Stripe webhook event is being processed by another delivery", {
      eventType: "webhook.event_in_progress",
      resourceType: "stripe_event",
      resourceId: event.id,
    });
    return NextResponse.json({ error: "Event is being processed" }, { status: 409 });
  }

  try {
    logger.info("Processing Stripe webhook event", {
      eventType: "webhook.event_received",
      resourceType: "stripe_event",
      resourceId: event.id,
      metadata: { type: event.type },
    });

    // Handle the event with proper error handling for each case

    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        await handleCheckoutSessionCompleted(event);
        break;
      }

      case "checkout.session.async_payment_failed": {
        await handleCheckoutAsyncPaymentFailed(event);
        break;
      }

      case "charge.refunded": {
        await handleChargeRefunded(event);
        break;
      }

      case "charge.dispute.created": {
        await handleChargeDisputeCreated(event);
        break;
      }

      case "charge.dispute.closed": {
        await handleChargeDisputeClosed(event);
        break;
      }

      case "refund.updated":
      case "charge.refund.updated": {
        await handleRefundUpdated(event);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        await handleSubscriptionUpserted(event);
        break;
      }

      case "customer.subscription.deleted": {
        await handleSubscriptionDeleted(event);
        break;
      }

      case "invoice.payment_succeeded": {
        await handleInvoicePaymentSucceeded(event);
        break;
      }

      case "invoice.payment_failed": {
        await handleInvoicePaymentFailed(event);
        break;
      }

      default:
        logger.info("Unhandled Stripe webhook event type", {
          eventType: "webhook.unhandled_event",
          resourceType: "stripe_event",
          resourceId: event.id,
          metadata: { type: event.type },
        });
    }
  } catch (error) {
    await releaseEvent(event.id).catch(() => undefined);
    // Log the full error details with stack trace
    logger.error("Webhook handler failed", {
      eventType: "webhook.handler_error",
      resourceType: "webhook",
      metadata: {
        error: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
      },
    });

    // Return an appropriate error response but don't expose details
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }

  await completeEvent(event.id).catch((error: unknown) =>
    // The event is processed; if this write fails Stripe's retry is acknowledged only after the lease expires and the
    // handlers (idempotent) run again
    logger.error("Could not mark the Stripe event as processed", {
      eventType: "webhook.complete_failed",
      resourceId: event.id,
      metadata: { error: error instanceof Error ? error.message : String(error) },
    }),
  );

  // On success, return a 200 response that Stripe can acknowledge
  logger.info("Webhook processed successfully", {
    eventType: "webhook.processed",
    resourceType: "webhook",
  });
  return NextResponse.json({ received: true });
}
