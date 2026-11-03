"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { paymentService } from "@/lib/payment-service";
import { courseRefundDecision, REFUND_WINDOW_DAYS } from "@/lib/refund-policy";
import { PaymentKind, PaymentStatus } from "@/lib/generated/prisma/browser";
import { writeAudit } from "@/lib/audit";
import { withPurchaseLock } from "@/lib/payments/locks";
import { notifyRefund } from "@/lib/payments/notify";
import { createLogger } from "@/lib/structured-logger";

const schema = z.object({ paymentId: z.string().min(1) });

export type RequestCourseRefundResult = { success: true; message: string } | { success: false; message: string; error: string };

const REFUSALS = {
  WINDOW_EXPIRED: `Le délai de remboursement de ${REFUND_WINDOW_DAYS} jours est dépassé.`,
  COURSE_COMPLETED: "La formation est terminée (certificat délivré) : elle ne peut plus être remboursée.",
  NOT_REFUNDABLE: "Cette commande n’a rien coûté : il n’y a rien à rembourser.",
} as const;

/**
 * Refunds a course bought on its own, within the window of the refund policy and while the course is not finished.
 *
 * The window runs from the day the payment was SETTLED (`Payment.updatedAt`, written once when it becomes COMPLETED),
 * not from the creation of the pending row at checkout. The decision, the Stripe refund and the status change all run
 * under the buyer's purchase lock, the lock certificate issuance takes before it checks the purchase: a certificate
 * issued first makes this refund refuse, a refund committed first leaves nothing to issue the certificate on. Stripe is
 * called inside the transaction (idempotent; "already refunded" counts as done), so a failure records nothing.
 * The payment becomes REFUNDED, which ends the lifetime access (lib/access/entitlement.ts); the enrolment and the
 * progress are kept. The `charge.refunded` webhook that follows changes nothing more. The same course cannot be bought
 * again for 12 months (lib/payments/refund-guard.ts).
 */
export async function requestCourseRefund(input: z.infer<typeof schema>): Promise<RequestCourseRefundResult> {
  const log = createLogger({ operation: "requestCourseRefund" });
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { success: false, message: "Commande inconnue.", error: "VALIDATION_ERROR" };

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { success: false, message: "Connectez-vous pour continuer.", error: "UNAUTHORIZED" };
  const userId = session.user.id;

  const payment = await db.payment.findFirst({
    where: { id: parsed.data.paymentId, userId, kind: PaymentKind.COURSE },
    select: { id: true, courseId: true, course: { select: { slug: true, title: true } } },
  });
  if (!payment || !payment.courseId) return { success: false, message: "Commande introuvable.", error: "NOT_FOUND" };
  const courseId = payment.courseId;

  try {
    const outcome = await withPurchaseLock(userId, courseId, async (tx) => {
      // Everything is read again under the lock: a parallel refund, dispute or certificate has been committed by now
      const current = await tx.payment.findFirst({
        where: { id: payment.id, userId },
        select: { amount: true, currency: true, status: true, updatedAt: true, stripePaymentIntentId: true },
      });
      if (!current) return { ok: false as const, error: "NOT_FOUND" as const };
      if (current.status === PaymentStatus.REFUNDED) return { ok: false as const, error: "ALREADY_REFUNDED" as const };
      if (current.status !== PaymentStatus.COMPLETED || !current.stripePaymentIntentId?.startsWith("pi_")) {
        return { ok: false as const, error: "NOT_REFUNDABLE" as const };
      }

      const certificate = await tx.certificate.findUnique({
        where: { userId_courseId: { userId, courseId } },
        select: { id: true },
      });
      const decision = courseRefundDecision({
        purchasedAt: current.updatedAt,
        amount: Number(current.amount),
        completed: !!certificate,
      });
      if (!decision.refundable) return { ok: false as const, error: decision.reason };

      const refundId = await paymentService.refundPayment(current.stripePaymentIntentId, undefined, {
        idempotencyKey: `course-refund:${payment.id}`,
      });
      const amount = Number(current.amount);
      await tx.payment.update({ where: { id: payment.id }, data: { status: PaymentStatus.REFUNDED } });
      await tx.invoiceAudit.create({
        data: {
          userId,
          paymentId: payment.id,
          type: "REFUND_PROCESSED",
          amount,
          currency: current.currency,
          metadata: {
            refundReason: "Demande de l'apprenant (page Facturation)",
            refundedAt: new Date().toISOString(),
            stripeRefundId: refundId,
            stripePaymentIntentId: current.stripePaymentIntentId,
            courseId,
          },
        },
      });
      await writeAudit(
        {
          actorId: userId,
          action: "payment.refunded",
          targetType: "payment",
          targetId: payment.id,
          metadata: { refundId, amount, currency: current.currency, courseId },
        },
        tx,
      );
      return { ok: true as const, amount, currency: current.currency };
    });

    if (!outcome.ok) {
      if (outcome.error === "NOT_FOUND") return { success: false, message: "Commande introuvable.", error: "NOT_FOUND" };
      if (outcome.error === "ALREADY_REFUNDED") {
        return { success: false, message: "Cette commande a déjà été remboursée.", error: "ALREADY_REFUNDED" };
      }
      return { success: false, message: REFUSALS[outcome.error], error: outcome.error };
    }

    log.info("Course purchase refunded", { userId, resourceId: payment.id, metadata: { courseId } });
    await notifyRefund(userId, {
      product: `la formation « ${payment.course?.title ?? "formation"} »`,
      amount: outcome.amount,
      currency: outcome.currency,
    });
  } catch (error) {
    log.error("Course refund failed", {
      userId,
      resourceId: payment.id,
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });
    return {
      success: false,
      message: "Le remboursement n’a pas pu être traité. Réessayez ou contactez le support.",
      error: "STRIPE_REFUND_FAILED",
    };
  }

  revalidatePath("/fr/dashboard/billing");
  revalidatePath("/fr/dashboard/my-courses");
  if (payment.course) revalidatePath(`/fr/formations/${payment.course.slug}`);
  return {
    success: true,
    message: `« ${payment.course?.title ?? "La formation"} » est remboursée. Le montant revient sur votre moyen de paiement sous 5 à 10 jours.`,
  };
}
