import { db } from "@/lib/db";
import { PaymentKind, PaymentStatus } from "@/lib/generated/prisma/browser";
import { refundCooldownEnd, REFUND_COOLDOWN_MONTHS, SUPPORT_EMAIL } from "@/lib/refund-policy";

/**
 * Whether the buyer refunded this product recently and so cannot buy it again yet (see `REFUND_COOLDOWN_MONTHS`).
 * A refund leaves three kinds of trace: the audit row of a refund made through the application (`REFUND_PROCESSED`),
 * the audit row of a full refund made from the Stripe dashboard (`CHARGE_REFUNDED`), and the payment itself marked
 * REFUNDED. A refunded payment with no audit row at all predates the audit trail: its date is unknown, so it counts.
 */

export type RefundedProduct = { kind: "subscription" } | { kind: "course"; courseId: string };

export interface RefundCooldown {
  until: Date;
}

export async function refundCooldown(
  userId: string,
  product: RefundedProduct,
  now: Date = new Date(),
): Promise<RefundCooldown | null> {
  const since = new Date(now.getTime());
  since.setUTCMonth(since.getUTCMonth() - REFUND_COOLDOWN_MONTHS);

  const refundedPayments = await db.payment.findMany({
    where: {
      userId,
      status: PaymentStatus.REFUNDED,
      ...(product.kind === "subscription"
        ? { kind: PaymentKind.SUBSCRIPTION }
        : { kind: PaymentKind.COURSE, courseId: product.courseId }),
    },
    select: { id: true },
  });

  const audits = await db.invoiceAudit.findMany({
    where: {
      userId,
      OR: [
        product.kind === "subscription"
          ? { type: "REFUND_PROCESSED", subscriptionId: { not: null } }
          : { type: "REFUND_PROCESSED", metadata: { path: ["courseId"], equals: product.courseId } },
        ...(refundedPayments.length ? [{ type: "CHARGE_REFUNDED", paymentId: { in: refundedPayments.map((p) => p.id) } }] : []),
      ],
    },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true, metadata: true },
  });

  // A refund the bank rejected afterwards (REFUND_FAILED) gave nothing back: it does not count
  const failed = await db.invoiceAudit.findMany({ where: { userId, type: "REFUND_FAILED" }, select: { metadata: true } });
  const failedRefundIds = new Set(failed.map((row) => (row.metadata as { stripeRefundId?: string } | null)?.stripeRefundId));
  const counted = audits.filter((row) => {
    const refundId = (row.metadata as { stripeRefundId?: string } | null)?.stripeRefundId;
    return !(refundId && failedRefundIds.has(refundId));
  });

  const last = counted[0]?.createdAt;
  if (last) {
    return last.getTime() >= since.getTime() ? { until: refundCooldownEnd(last) } : null;
  }
  // Every trace was a failed refund: nothing was given back. A refunded payment with no audit row at all predates the
  // audit trail: its date is unknown, treated as recent
  return audits.length === 0 && refundedPayments.length > 0 ? { until: refundCooldownEnd(now) } : null;
}

/** The sentence shown to a buyer who is in the cooldown. */
export function refundCooldownMessage(product: RefundedProduct, cooldown: RefundCooldown): string {
  const what = product.kind === "subscription" ? "l’abonnement Premium" : "cette formation";
  const date = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone: "Europe/Paris" }).format(cooldown.until);
  return `Vous avez fait rembourser ${what} : il ne peut pas être racheté avant le ${date}. Une question ? Écrivez à ${SUPPORT_EMAIL}.`;
}
