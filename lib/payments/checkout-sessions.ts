import { createHash } from "node:crypto";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { PaymentKind, PaymentStatus } from "@/lib/generated/prisma/browser";
import { createLogger } from "@/lib/structured-logger";

const log = createLogger({ operation: "checkout-sessions", resourceType: "payment" });

const IDEMPOTENCY_WINDOW_MS = 10 * 60 * 1000;
const STALE_PENDING_MS = 2 * 24 * 60 * 60 * 1000;

/**
 * Key that makes repeated requests of the same buyer for the same product return ONE Checkout Session: two clicks, two
 * tabs, a retry. It changes with the product, the amount and the e-mail (Stripe refuses a key reused with other
 * parameters) and every 10 minutes (an abandoned session is not handed out again for ever).
 */
export function checkoutIdempotencyKey(input: {
  kind: "course" | "subscription";
  userId: string;
  productId: string;
  amountCents: number;
  email: string;
  now?: number;
}): string {
  const bucket = Math.floor((input.now ?? Date.now()) / IDEMPOTENCY_WINDOW_MS);
  const emailHash = createHash("sha256").update(input.email.toLowerCase()).digest("hex").slice(0, 8);
  return `checkout:${input.kind}:${input.userId}:${input.productId}:${input.amountCents}:${emailHash}:${bucket}`;
}

/**
 * After a new Checkout Session is created for a product, closes the buyer's earlier open sessions for the same
 * product (two payable sessions are two chances to pay twice) and drops pending rows older than two days. Best effort:
 * a session that cannot be expired is already completed or expired, and the duplicate-purchase check of the webhook is
 * the second line of defence.
 */
export async function retireOtherPendingSessions(input: {
  userId: string;
  kind: PaymentKind;
  courseId?: string | null;
  keepSessionId: string;
}): Promise<void> {
  const pending = await db.payment.findMany({
    where: {
      userId: input.userId,
      kind: input.kind,
      status: PaymentStatus.PENDING,
      ...(input.courseId ? { courseId: input.courseId } : {}),
      stripePaymentIntentId: { startsWith: "cs_", not: input.keepSessionId },
    },
    select: { id: true, stripePaymentIntentId: true },
  });

  for (const row of pending) {
    try {
      await stripe.checkout.sessions.expire(row.stripePaymentIntentId as string);
    } catch (error) {
      log.info("Earlier checkout session could not be expired (already completed or expired)", {
        userId: input.userId,
        resourceId: row.stripePaymentIntentId ?? undefined,
        metadata: { error: error instanceof Error ? error.message : String(error) },
      });
    }
  }
  if (pending.length > 0) {
    // A payment that completed in the meantime is no longer PENDING: only the abandoned rows are removed
    await db.payment.deleteMany({ where: { id: { in: pending.map((row) => row.id) }, status: PaymentStatus.PENDING } });
  }

  await db.payment.deleteMany({
    where: { userId: input.userId, status: PaymentStatus.PENDING, createdAt: { lt: new Date(Date.now() - STALE_PENDING_MS) } },
  });
}

/** The Stripe customer of this user: the one already stored, else a new one created once (and stored by the caller). */
export async function ensureStripeCustomer(userId: string, email: string): Promise<string> {
  const stored = await db.subscription.findUnique({ where: { userId }, select: { stripeCustomerId: true } });
  if (stored?.stripeCustomerId) return stored.stripeCustomerId;
  const customer = await stripe.customers.create({ email, metadata: { userId } }, { idempotencyKey: `customer:${userId}` });
  return customer.id;
}
