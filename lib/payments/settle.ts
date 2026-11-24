import { db } from "@/lib/db";
import { PaymentKind, PaymentStatus, Prisma } from "@/lib/generated/prisma/browser";

/**
 * Records that a payment was collected: finds the row the checkout announced (or an earlier delivery already settled)
 * and completes it, or creates it. Written for webhooks, which Stripe delivers twice, in any order, sometimes
 * concurrently, and which now meet the unique constraint on `stripePaymentIntentId`:
 *  - a concurrent creator loses the race with P2002 and simply completes the row the winner created;
 *  - a payment already REFUNDED or DISPUTED is never brought back to COMPLETED by a late or repeated delivery;
 *  - the settlement time (`updatedAt`) is written once, when the payment becomes COMPLETED. The refund window
 *    (`courseRefundDecision`) runs from it, so neither a repeated delivery nor a later status change moves it.
 */

export interface SettleInput {
  userId: string;
  kind: PaymentKind;
  courseId?: string;
  /** Where the row may already be found: the checkout session id placeholder, the invoice id, the payment intent id. */
  knownReferences: string[];
  /** The stable reference to store: the payment intent id, the invoice id, or the session id for a free session. */
  reference: string;
  amountCents: number;
  currency: string;
  description: string;
  /** Settle a still-pending row of the same user and product when none matches by reference (checkout placeholder). */
  adoptPending?: boolean;
}

export type SettleResult = { paymentId: string; created: boolean; alreadySettled: boolean };

const isUniqueViolation = (error: unknown) => (error as { code?: string } | null)?.code === "P2002";

export async function settlePayment(input: SettleInput): Promise<SettleResult> {
  const amount = new Prisma.Decimal((input.amountCents / 100).toFixed(2));
  const productWhere = { userId: input.userId, kind: input.kind, ...(input.courseId ? { courseId: input.courseId } : {}) };

  for (let attempt = 0; attempt < 3; attempt++) {
    const refs = [...new Set([...input.knownReferences, input.reference])];
    const existing =
      (await db.payment.findFirst({ where: { ...productWhere, stripePaymentIntentId: { in: refs } } })) ??
      (input.adoptPending
        ? await db.payment.findFirst({ where: { ...productWhere, status: PaymentStatus.PENDING }, orderBy: { createdAt: "desc" } })
        : null);

    if (existing) {
      if (existing.status === PaymentStatus.COMPLETED) return { paymentId: existing.id, created: false, alreadySettled: true };
      // Refunded or contested: a repeated delivery of the original payment does not restore the purchase
      if (existing.status === PaymentStatus.REFUNDED || existing.status === PaymentStatus.DISPUTED) {
        return { paymentId: existing.id, created: false, alreadySettled: true };
      }
      try {
        await db.payment.update({
          where: { id: existing.id },
          data: {
            stripePaymentIntentId: input.reference,
            amount,
            currency: input.currency,
            status: PaymentStatus.COMPLETED,
            description: input.description,
            updatedAt: new Date(),
          },
        });
      } catch (error) {
        // The reference we want to store already belongs to another row (two rows for one payment): use that one
        if (isUniqueViolation(error) && attempt < 2) continue;
        throw error;
      }
      return { paymentId: existing.id, created: false, alreadySettled: false };
    }

    try {
      const created = await db.payment.create({
        data: {
          userId: input.userId,
          kind: input.kind,
          ...(input.courseId ? { courseId: input.courseId } : {}),
          stripePaymentIntentId: input.reference,
          amount,
          currency: input.currency,
          status: PaymentStatus.COMPLETED,
          description: input.description,
        },
      });
      return { paymentId: created.id, created: true, alreadySettled: false };
    } catch (error) {
      if (isUniqueViolation(error) && attempt < 2) continue; // the other delivery created it first: complete that row
      throw error;
    }
  }
  throw new Error("settlePayment: could not settle the payment");
}
