import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/db";
import { getEntitlement } from "@/lib/access/entitlement";
import { CourseAccessTier, PaymentKind, PaymentStatus, SubscriptionStatus } from "@/lib/generated/prisma/client";
import { paymentService } from "@/lib/payment-service";
import { createCourse, createSubscription, createUser, enroll } from "../../support/factories";
import { resetDatabase } from "../../support/test-db";

vi.mock("@/lib/stripe", () => ({
  stripe: { invoicePayments: { list: async () => ({ data: [] }) } },
  stripeKeyMode: () => "unknown",
  assertStripeKeyMode: () => {},
}));
vi.mock("@/lib/payments/notify", () => ({ notifyRefund: vi.fn(async () => {}), notifyDispute: vi.fn(async () => {}) }));
vi.mock("@/lib/structured-logger", () => {
  const noop = () => {};
  const logger = { debug: noop, info: noop, warn: noop, error: noop, withContext: () => logger, businessEvent: noop };
  return { createLogger: () => logger, logger };
});

import { handleChargeDisputeClosed, handleChargeDisputeCreated } from "@/app/api/stripe/webhook/_handlers/charge-dispute";
import { handleRefundUpdated } from "@/app/api/stripe/webhook/_handlers/refund-updated";

const cancelImmediately = vi.spyOn(paymentService, "cancelImmediately");

const dispute = (status: string, paymentIntent = "pi_d") =>
  ({ data: { object: { id: "dp_1", status, reason: "fraudulent", amount: 4990, currency: "eur", payment_intent: paymentIntent } } }) as never;
const refundEvent = (status: string) =>
  ({ data: { object: { id: "re_1", status, amount: 4990, currency: "eur", payment_intent: "pi_d", failure_reason: "expired_or_canceled_card" } } }) as never;

beforeEach(async () => {
  await resetDatabase(db);
  cancelImmediately.mockReset().mockResolvedValue(true);
});
afterAll(async () => {
  await resetDatabase(db);
  await db.$disconnect();
});

async function courseBuyer() {
  const user = await createUser();
  const course = await createCourse({ accessTier: CourseAccessTier.PREMIUM, price: "49.90" });
  await enroll(user.id, course.id);
  const payment = await db.payment.create({
    data: { userId: user.id, courseId: course.id, kind: PaymentKind.COURSE, status: PaymentStatus.COMPLETED, amount: "49.90", stripePaymentIntentId: "pi_d" },
  });
  return { user, course, payment };
}

describe("chargebacks", () => {
  it("opening a dispute suspends the access, winning it gives it back, losing it ends it", async () => {
    const { user, course, payment } = await courseBuyer();
    expect(await getEntitlement(user.id, course.id)).toMatchObject({ entitled: true });

    await handleChargeDisputeCreated(dispute("needs_response"));
    expect((await db.payment.findUniqueOrThrow({ where: { id: payment.id } })).status).toBe(PaymentStatus.DISPUTED);
    expect(await getEntitlement(user.id, course.id)).toMatchObject({ entitled: false, lapsed: "disputed" });
    // the progress is kept: the enrolment row is still there
    expect(await db.enrollment.count({ where: { userId: user.id, courseId: course.id } })).toBe(1);

    await handleChargeDisputeClosed(dispute("won"));
    expect((await db.payment.findUniqueOrThrow({ where: { id: payment.id } })).status).toBe(PaymentStatus.COMPLETED);
    expect(await getEntitlement(user.id, course.id)).toMatchObject({ entitled: true });

    await handleChargeDisputeCreated(dispute("needs_response"));
    await handleChargeDisputeClosed(dispute("lost"));
    expect((await db.payment.findUniqueOrThrow({ where: { id: payment.id } })).status).toBe(PaymentStatus.REFUNDED);
    expect(await getEntitlement(user.id, course.id)).toMatchObject({ entitled: false });
  });

  it("is idempotent: a redelivery changes and audits nothing more", async () => {
    await courseBuyer();
    await handleChargeDisputeCreated(dispute("needs_response"));
    await handleChargeDisputeCreated(dispute("needs_response"));
    expect(await db.invoiceAudit.count({ where: { type: "DISPUTE_OPENED" } })).toBe(1);
    await handleChargeDisputeClosed(dispute("won"));
    await handleChargeDisputeClosed(dispute("won"));
    expect(await db.invoiceAudit.count({ where: { type: "DISPUTE_WON" } })).toBe(1);
  });

  it("a closure that decides nothing, and a refunded payment, are left alone", async () => {
    const { payment } = await courseBuyer();
    await handleChargeDisputeClosed(dispute("under_review"));
    await db.payment.update({ where: { id: payment.id }, data: { status: PaymentStatus.REFUNDED } });
    await handleChargeDisputeCreated(dispute("needs_response"));
    expect((await db.payment.findUniqueOrThrow({ where: { id: payment.id } })).status).toBe(PaymentStatus.REFUNDED);
  });

  it("a disputed subscription payment ends the subscription at Stripe and in our database", async () => {
    const user = await createUser();
    await createSubscription(user.id, { stripeSubscriptionId: "sub_d", status: SubscriptionStatus.ACTIVE });
    await db.payment.create({
      data: { userId: user.id, kind: PaymentKind.SUBSCRIPTION, status: PaymentStatus.COMPLETED, amount: "19.99", stripePaymentIntentId: "pi_d" },
    });
    await handleChargeDisputeCreated(dispute("needs_response"));
    expect(cancelImmediately).toHaveBeenCalledWith("sub_d", { idempotencyKey: "dispute-cancel:dp_1" });
    expect((await db.subscription.findUniqueOrThrow({ where: { userId: user.id } })).status).toBe(SubscriptionStatus.CANCELED);
  });

  it("a dispute matching no payment is acknowledged", async () => {
    await expect(handleChargeDisputeCreated(dispute("needs_response", "pi_unknown"))).resolves.toBeUndefined();
  });
});

describe("refund.updated", () => {
  it("a failed refund gives a course purchase back and is audited once", async () => {
    const { user, course, payment } = await courseBuyer();
    await db.payment.update({ where: { id: payment.id }, data: { status: PaymentStatus.REFUNDED } });

    await handleRefundUpdated(refundEvent("failed"));
    await handleRefundUpdated(refundEvent("failed"));
    expect((await db.payment.findUniqueOrThrow({ where: { id: payment.id } })).status).toBe(PaymentStatus.COMPLETED);
    expect(await getEntitlement(user.id, course.id)).toMatchObject({ entitled: true });
    expect(await db.invoiceAudit.count({ where: { type: "REFUND_FAILED" } })).toBe(1);
  });

  it("a succeeded refund changes nothing", async () => {
    const { payment } = await courseBuyer();
    await db.payment.update({ where: { id: payment.id }, data: { status: PaymentStatus.REFUNDED } });
    await handleRefundUpdated(refundEvent("succeeded"));
    expect((await db.payment.findUniqueOrThrow({ where: { id: payment.id } })).status).toBe(PaymentStatus.REFUNDED);
  });
});
