import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { paymentService, WebhookSignatureError } from "@/lib/payment-service";
import { ensureIdempotent, releaseIdempotent } from "@/lib/rate-limit";
import { logger } from "./_lib/logger";
import { handleCheckoutSessionCompleted } from "./_handlers/checkout-session-completed";
import { handleSubscriptionUpserted } from "./_handlers/subscription-upserted";
import { handleSubscriptionDeleted } from "./_handlers/subscription-deleted";
import { handleInvoicePaymentSucceeded } from "./_handlers/invoice-payment-succeeded";
import { handleInvoicePaymentFailed } from "./_handlers/invoice-payment-failed";

// Disable body parsing for webhooks
export const runtime = "nodejs";

// Stripe retries a failing event for up to 3 days.
const EVENT_CLAIM_TTL_SECONDS = 3 * 24 * 60 * 60;

export async function POST(req: NextRequest) {
  let body: string;
  let signature: string | null;

  try {
    body = await req.text();
    const headersList = await headers();
    signature = headersList.get("stripe-signature");

    if (!signature) {
      logger.error("Missing Stripe signature in webhook request", {
        eventType: "webhook.signature_missing",
      });
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }
  } catch (error) {
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

  // Stripe delivers at least once and retries on any non-2xx: process each event
  // id once. The claim is released when the handler fails so the retry can run.
  const idempotencyKey = `stripe-event:${event.id}`;
  const firstDelivery = await ensureIdempotent(idempotencyKey, EVENT_CLAIM_TTL_SECONDS);
  if (!firstDelivery) {
    logger.info("Duplicate Stripe webhook event ignored", {
      eventType: "webhook.duplicate_event",
      resourceType: "stripe_event",
      resourceId: event.id,
    });
    return NextResponse.json({ received: true, duplicate: true });
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
    await releaseIdempotent(idempotencyKey);
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

  // On success, return a 200 response that Stripe can acknowledge
  logger.info("Webhook processed successfully", {
    eventType: "webhook.processed",
    resourceType: "webhook",
  });
  return NextResponse.json({ received: true });
}
