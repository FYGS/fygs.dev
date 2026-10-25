"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { paymentService } from "@/lib/payment-service";
import { courseRefundDecision, REFUND_WINDOW_DAYS } from "@/lib/refund-policy";
import { PaymentKind, PaymentStatus } from "@/lib/generated/prisma/browser";
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
 * Stripe refunds the PaymentIntent (idempotent), the payment is marked REFUNDED at once, which ends the lifetime
 * access (lib/access/entitlement.ts); the `charge.refunded` webhook that follows changes nothing more.
 * The enrolment and the progress are kept: buying again picks up where the learner was.
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
    select: {
      id: true,
      amount: true,
      currency: true,
      status: true,
      createdAt: true,
      courseId: true,
      stripePaymentIntentId: true,
      course: { select: { slug: true, title: true } },
    },
  });
  if (!payment || !payment.courseId) return { success: false, message: "Commande introuvable.", error: "NOT_FOUND" };
  if (payment.status === PaymentStatus.REFUNDED) {
    return { success: false, message: "Cette commande a déjà été remboursée.", error: "ALREADY_REFUNDED" };
  }
  if (payment.status !== PaymentStatus.COMPLETED || !payment.stripePaymentIntentId?.startsWith("pi_")) {
    return { success: false, message: REFUSALS.NOT_REFUNDABLE, error: "NOT_REFUNDABLE" };
  }

  const certificate = await db.certificate.findUnique({
    where: { userId_courseId: { userId, courseId: payment.courseId } },
    select: { id: true },
  });
  const decision = courseRefundDecision({
    purchasedAt: payment.createdAt,
    amount: Number(payment.amount),
    completed: !!certificate,
  });
  if (!decision.refundable) return { success: false, message: REFUSALS[decision.reason], error: decision.reason };

  try {
    const refundId = await paymentService.refundPayment(payment.stripePaymentIntentId, undefined, {
      idempotencyKey: `course-refund:${payment.id}`,
    });
    const amount = Number(payment.amount);
    await db.$transaction([
      db.payment.update({ where: { id: payment.id }, data: { status: PaymentStatus.REFUNDED } }),
      db.invoiceAudit.create({
        data: {
          userId,
          paymentId: payment.id,
          type: "REFUND_PROCESSED",
          amount,
          currency: payment.currency,
          metadata: {
            refundReason: "Demande de l'apprenant (page Facturation)",
            refundedAt: new Date().toISOString(),
            stripeRefundId: refundId,
            stripePaymentIntentId: payment.stripePaymentIntentId,
            courseId: payment.courseId,
          },
        },
      }),
    ]);
    log.info("Course purchase refunded", { userId, resourceId: payment.id, metadata: { courseId: payment.courseId } });
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
