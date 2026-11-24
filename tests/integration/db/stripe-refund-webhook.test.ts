import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { AccessService } from "@/lib/access-service";
import { CourseAccessTier, PaymentKind, PaymentStatus } from "@/lib/generated/prisma/client";
import { resetDatabase } from "../../support/test-db";
import { createCourse, createUser, enroll } from "../../support/factories";

const sendPaymentFailedEmail = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
vi.mock("@/lib/email-service", () => ({ emailService: { sendPaymentFailedEmail } }));

import { handleChargeRefunded } from "@/app/api/stripe/webhook/_handlers/charge-refunded";
import { handleCheckoutAsyncPaymentFailed } from "@/app/api/stripe/webhook/_handlers/checkout-async-payment-failed";

beforeEach(async () => {
  await resetDatabase(db);
  sendPaymentFailedEmail.mockClear();
});
afterAll(async () => {
  await resetDatabase(db);
  await db.$disconnect();
});

const chargeRefunded = (charge: Partial<Stripe.Charge>) =>
  ({
    id: "evt_refund",
    type: "charge.refunded",
    data: {
      object: {
        id: "ch_1",
        payment_intent: "pi_1",
        amount: 4990,
        amount_refunded: 4990,
        refunded: true,
        currency: "eur",
        ...charge,
      },
    },
  }) as unknown as Stripe.ChargeRefundedEvent;

async function purchasedCourse(paymentIntent = "pi_1") {
  const user = await createUser();
  const course = await createCourse({ accessTier: CourseAccessTier.PREMIUM, previewEnabled: false });
  await enroll(user.id, course.id);
  const payment = await db.payment.create({
    data: {
      userId: user.id,
      courseId: course.id,
      amount: "49.90",
      kind: PaymentKind.COURSE,
      status: PaymentStatus.COMPLETED,
      stripePaymentIntentId: paymentIntent,
    },
  });
  return { user, course, payment };
}

describe("charge.refunded", () => {
  it("a full refund marks the payment REFUNDED and ends the access, keeping the enrollment", async () => {
    const { user, course, payment } = await purchasedCourse();
    expect(await AccessService.checkCourseAccess(user.id, course.id)).toMatchObject({ canAccessCourse: true });

    await handleChargeRefunded(chargeRefunded({}));

    expect((await db.payment.findUniqueOrThrow({ where: { id: payment.id } })).status).toBe(PaymentStatus.REFUNDED);
    expect(await AccessService.checkCourseAccess(user.id, course.id)).toMatchObject({
      isEnrolledInCourse: true,
      canAccessCourse: false,
      accessReason: "premium_locked",
    });
    const audits = await db.invoiceAudit.findMany({ where: { userId: user.id, type: "CHARGE_REFUNDED" } });
    expect(audits).toHaveLength(1);
    expect(audits[0]).toMatchObject({ paymentId: payment.id, currency: "eur" });
    expect(Number(audits[0].amount)).toBe(49.9);
  });

  it("is idempotent: a second delivery changes nothing and writes no second audit row", async () => {
    const { user } = await purchasedCourse();

    await handleChargeRefunded(chargeRefunded({}));
    await handleChargeRefunded(chargeRefunded({}));

    expect(await db.invoiceAudit.count({ where: { userId: user.id, type: "CHARGE_REFUNDED" } })).toBe(1);
    expect(await db.payment.count({ where: { userId: user.id, status: PaymentStatus.REFUNDED } })).toBe(1);
  });

  it("a partial refund is audited but keeps the access", async () => {
    const { user, course, payment } = await purchasedCourse();

    await handleChargeRefunded(chargeRefunded({ amount_refunded: 1000, refunded: false }));

    expect((await db.payment.findUniqueOrThrow({ where: { id: payment.id } })).status).toBe(PaymentStatus.COMPLETED);
    expect(await AccessService.checkCourseAccess(user.id, course.id)).toMatchObject({ canAccessCourse: true });
    expect(await db.invoiceAudit.count({ where: { userId: user.id, type: "CHARGE_REFUNDED" } })).toBe(1);
  });

  it("a second partial refund of the same charge is a new audit row", async () => {
    const { user } = await purchasedCourse();

    await handleChargeRefunded(chargeRefunded({ amount_refunded: 1000, refunded: false }));
    await handleChargeRefunded(chargeRefunded({ amount_refunded: 2000, refunded: false }));

    expect(await db.invoiceAudit.count({ where: { userId: user.id, type: "CHARGE_REFUNDED" } })).toBe(2);
  });

  it("a subscription payment keyed by invoice is found through the charge's invoice", async () => {
    const user = await createUser();
    const payment = await db.payment.create({
      data: {
        userId: user.id,
        amount: "9.90",
        kind: PaymentKind.SUBSCRIPTION,
        status: PaymentStatus.COMPLETED,
        stripePaymentIntentId: "in_1",
      },
    });

    await handleChargeRefunded(chargeRefunded({ payment_intent: "pi_other", ...({ invoice: "in_1" } as object) }));

    expect((await db.payment.findUniqueOrThrow({ where: { id: payment.id } })).status).toBe(PaymentStatus.REFUNDED);
  });

  it("a charge that matches no payment is ignored without failing", async () => {
    await expect(handleChargeRefunded(chargeRefunded({ payment_intent: "pi_unknown" }))).resolves.toBeUndefined();
    expect(await db.invoiceAudit.count()).toBe(0);
  });

  it("only the refunded purchase loses access", async () => {
    const { user, course } = await purchasedCourse("pi_1");
    const other = await createCourse({ accessTier: CourseAccessTier.PREMIUM, previewEnabled: false });
    await enroll(user.id, other.id);
    await db.payment.create({
      data: {
        userId: user.id,
        courseId: other.id,
        amount: "19.90",
        kind: PaymentKind.COURSE,
        status: PaymentStatus.COMPLETED,
        stripePaymentIntentId: "pi_2",
      },
    });

    await handleChargeRefunded(chargeRefunded({}));

    expect(await AccessService.checkCourseAccess(user.id, course.id)).toMatchObject({ canAccessCourse: false });
    expect(await AccessService.checkCourseAccess(user.id, other.id)).toMatchObject({ canAccessCourse: true });
  });
});

describe("checkout.session.async_payment_failed", () => {
  const failed = (userId: string, id = "cs_1") =>
    ({
      id: "evt_failed",
      type: "checkout.session.async_payment_failed",
      data: { object: { id, mode: "payment", metadata: { userId } } },
    }) as unknown as Stripe.CheckoutSessionAsyncPaymentFailedEvent;

  it("marks the pending payment FAILED, tells the buyer, and grants nothing", async () => {
    const user = await createUser();
    const course = await createCourse({ accessTier: CourseAccessTier.PREMIUM, previewEnabled: false });
    const payment = await db.payment.create({
      data: {
        userId: user.id,
        courseId: course.id,
        amount: "49.90",
        kind: PaymentKind.COURSE,
        status: PaymentStatus.PENDING,
        stripePaymentIntentId: "cs_1",
      },
    });

    await handleCheckoutAsyncPaymentFailed(failed(user.id));

    expect((await db.payment.findUniqueOrThrow({ where: { id: payment.id } })).status).toBe(PaymentStatus.FAILED);
    expect(sendPaymentFailedEmail).toHaveBeenCalledTimes(1);
    expect(await AccessService.checkCourseAccess(user.id, course.id)).toMatchObject({ canAccessCourse: false });
  });

  it("a second delivery does not email again and never touches a COMPLETED payment", async () => {
    const user = await createUser();
    await db.payment.create({
      data: {
        userId: user.id,
        amount: "9.90",
        kind: PaymentKind.COURSE,
        status: PaymentStatus.COMPLETED,
        stripePaymentIntentId: "cs_1",
      },
    });

    await handleCheckoutAsyncPaymentFailed(failed(user.id));

    expect(sendPaymentFailedEmail).not.toHaveBeenCalled();
    expect(await db.payment.count({ where: { status: PaymentStatus.COMPLETED } })).toBe(1);
  });

  it("an email failure does not make Stripe retry", async () => {
    const user = await createUser();
    await db.payment.create({
      data: {
        userId: user.id,
        amount: "9.90",
        kind: PaymentKind.COURSE,
        status: PaymentStatus.PENDING,
        stripePaymentIntentId: "cs_1",
      },
    });
    sendPaymentFailedEmail.mockRejectedValueOnce(new Error("smtp down"));

    await expect(handleCheckoutAsyncPaymentFailed(failed(user.id))).resolves.toBeUndefined();
  });
});
