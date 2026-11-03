import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getEntitlement } from "@/lib/access/entitlement";
import { CourseAccessTier, PaymentKind, PaymentStatus, SubscriptionStatus } from "@/lib/generated/prisma/client";
import { withPurchaseLock } from "@/lib/payments/locks";
import { refundCooldown } from "@/lib/payments/refund-guard";
import { createCourse, createSubscription, createUser, enroll } from "../../support/factories";
import { resetDatabase } from "../../support/test-db";

const h = vi.hoisted(() => ({
  refund: vi.fn(),
  cancel: vi.fn(),
  latest: vi.fn(),
}));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: vi.fn() } } }));
vi.mock("next/headers", () => ({ headers: vi.fn(() => Promise.resolve(new Headers())) }));
vi.mock("@/lib/payment-service", () => ({
  paymentService: { refundPayment: h.refund, cancelImmediately: h.cancel, getLatestSubscriptionPayment: h.latest },
}));
vi.mock("@/lib/payments/notify", () => ({ notifyRefund: vi.fn(async () => {}), notifyDispute: vi.fn(async () => {}) }));
vi.mock("@/lib/analytics-helper", () => ({ AnalyticsHelper: { recordRefund: vi.fn(async () => {}) } }));

import { requestCourseRefund } from "@/app/[locale]/(main)/dashboard/actions/requestCourseRefund";
import { requestRefund } from "@/app/[locale]/(main)/dashboard/actions/requestRefund";

const DAY = 24 * 60 * 60 * 1000;

beforeEach(async () => {
  await resetDatabase(db);
  h.refund.mockReset().mockResolvedValue("re_1");
  h.cancel.mockReset().mockResolvedValue(true);
  h.latest.mockReset();
});
afterAll(async () => {
  await resetDatabase(db);
  await db.$disconnect();
});

async function courseBuyer(settledDaysAgo = 1) {
  const user = await createUser();
  const course = await createCourse({ accessTier: CourseAccessTier.PREMIUM, price: "49.90" });
  await enroll(user.id, course.id);
  const payment = await db.payment.create({
    data: {
      userId: user.id,
      courseId: course.id,
      amount: "49.90",
      kind: PaymentKind.COURSE,
      status: PaymentStatus.COMPLETED,
      stripePaymentIntentId: `pi_${user.id.slice(-8)}`,
      createdAt: new Date(Date.now() - 30 * DAY), // the checkout was opened long ago...
      updatedAt: new Date(Date.now() - settledDaysAgo * DAY), // ...and paid recently
    },
  });
  vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: user.id } } as never);
  return { user, course, payment };
}

describe("course refund", () => {
  it("the 14 days run from the payment, not from the day the checkout was opened", async () => {
    const recent = await courseBuyer(1);
    expect(await requestCourseRefund({ paymentId: recent.payment.id })).toMatchObject({ success: true });

    const old = await courseBuyer(15);
    expect(await requestCourseRefund({ paymentId: old.payment.id })).toMatchObject({ success: false, error: "WINDOW_EXPIRED" });
  });

  it("a refund and the certificate of the same course are mutually exclusive, whoever comes first", async () => {
    // The refund holds the lock across Stripe; certificate issuance (which takes the same lock, then checks the purchase)
    // waits for it and finds the purchase gone.
    const { user, course, payment } = await courseBuyer();
    let issued: "issued" | "refused" | null = null;
    h.refund.mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 150)); // Stripe takes its time
      return "re_slow";
    });

    const issueCertificate = withPurchaseLock(user.id, course.id, async (tx) => {
      const purchase = await tx.payment.findFirst({
        where: { userId: user.id, courseId: course.id, kind: PaymentKind.COURSE, status: PaymentStatus.COMPLETED },
      });
      if (!purchase) return (issued = "refused");
      await tx.certificate.create({ data: { userId: user.id, courseId: course.id } });
      return (issued = "issued");
    });

    const [refund] = await Promise.all([
      requestCourseRefund({ paymentId: payment.id }),
      new Promise((resolve) => setTimeout(resolve, 20)).then(() => issueCertificate),
    ]);

    // exactly one outcome
    const certificates = await db.certificate.count({ where: { userId: user.id, courseId: course.id } });
    if (refund.success) {
      expect(issued).toBe("refused");
      expect(certificates).toBe(0);
    } else {
      expect(issued).toBe("issued");
      expect(certificates).toBe(1);
    }
    expect((refund.success ? 1 : 0) + certificates).toBe(1);
  });

  it("a certificate issued first makes the refund refuse, and Stripe is never called", async () => {
    const { user, course, payment } = await courseBuyer();
    await withPurchaseLock(user.id, course.id, (tx) => tx.certificate.create({ data: { userId: user.id, courseId: course.id } }));
    expect(await requestCourseRefund({ paymentId: payment.id })).toMatchObject({ success: false, error: "COURSE_COMPLETED" });
    expect(h.refund).not.toHaveBeenCalled();
  });

  it("two refund requests at once: one refund, one refusal", async () => {
    const { payment } = await courseBuyer();
    const results = await Promise.all([requestCourseRefund({ paymentId: payment.id }), requestCourseRefund({ paymentId: payment.id })]);
    expect(results.filter((r) => r.success)).toHaveLength(1);
    expect(h.refund).toHaveBeenCalledTimes(1);
  });

  it("writes the audit trail, and the same course cannot be bought again right away", async () => {
    const { user, course, payment } = await courseBuyer();
    await requestCourseRefund({ paymentId: payment.id });
    expect(await db.auditLog.findFirst({ where: { action: "payment.refunded", targetId: payment.id } })).toMatchObject({ actorId: user.id });
    expect(await refundCooldown(user.id, { kind: "course", courseId: course.id })).not.toBeNull();
    expect(await refundCooldown(user.id, { kind: "subscription" })).toBeNull();
    expect(await getEntitlement(user.id, course.id)).toMatchObject({ entitled: false, lapsed: "refunded" });
  });
});

describe("subscription refund", () => {
  async function subscriber(paidDaysAgo = 1) {
    const user = await createUser();
    await db.payment.deleteMany({ where: { stripePaymentIntentId: "in_r" } }); // one subscriber at a time in these scenarios
    await db.subscription.deleteMany({ where: { stripeSubscriptionId: "sub_r" } });
    const subscription = await createSubscription(user.id, { stripeSubscriptionId: "sub_r", status: SubscriptionStatus.ACTIVE });
    const paidAt = new Date(Date.now() - paidDaysAgo * DAY);
    await db.payment.create({
      data: { userId: user.id, kind: PaymentKind.SUBSCRIPTION, status: PaymentStatus.COMPLETED, amount: "19.99", stripePaymentIntentId: "in_r", description: "Abonnement Premium", updatedAt: paidAt },
    });
    h.latest.mockResolvedValue({ paymentIntentId: "pi_r", invoiceId: "in_r", amountPaidCents: 1999, currency: "eur", paidAt });
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: user.id } } as never);
    return { user, subscription };
  }

  it("refunds the paid invoice, ends the subscription, records everything, and blocks a quick re-subscription", async () => {
    const { user, subscription } = await subscriber();
    const result = await requestRefund({ subscriptionId: "sub_r" });
    expect(result).toMatchObject({ success: true, refund: { amount: 19.99, currency: "eur" } });
    expect(h.refund).toHaveBeenCalledWith("pi_r", 1999, { idempotencyKey: `refund:${subscription.id}:pi_r` });
    expect(h.cancel).toHaveBeenCalledWith("sub_r", { idempotencyKey: "cancel:sub_r:immediate" });
    expect((await db.subscription.findUniqueOrThrow({ where: { userId: user.id } })).status).toBe(SubscriptionStatus.CANCELED);
    expect((await db.payment.findFirstOrThrow({ where: { userId: user.id, stripePaymentIntentId: "in_r" } })).status).toBe(PaymentStatus.REFUNDED);
    expect(await refundCooldown(user.id, { kind: "subscription" })).not.toBeNull();
  });

  it("the window runs from the payment that opened the period (a plan change does not reopen it)", async () => {
    const { subscription } = await subscriber(15);
    // the plan was switched yesterday: the period start moved, the payment did not
    await db.subscription.update({ where: { id: subscription.id }, data: { currentPeriodStart: new Date(Date.now() - DAY) } });
    expect(await requestRefund({ subscriptionId: "sub_r" })).toMatchObject({ success: false, error: "REFUND_PERIOD_EXPIRED" });
    expect(h.refund).not.toHaveBeenCalled();
  });

  it("refused once a certificate was earned with the subscription; not for a course bought on its own", async () => {
    const { user } = await subscriber();
    const included = await createCourse({ accessTier: CourseAccessTier.PREMIUM });
    const bought = await createCourse({ accessTier: CourseAccessTier.PREMIUM });
    await db.payment.create({
      data: { userId: user.id, courseId: bought.id, kind: PaymentKind.COURSE, status: PaymentStatus.COMPLETED, amount: "49.90", stripePaymentIntentId: "pi_bought" },
    });
    await db.certificate.create({ data: { userId: user.id, courseId: bought.id } });
    // a certificate on a course the learner bought themselves says nothing about the subscription
    expect(await requestRefund({ subscriptionId: "sub_r" })).toMatchObject({ success: true });

    const second = await subscriber();
    await db.certificate.create({ data: { userId: second.user.id, courseId: included.id } });
    expect(await requestRefund({ subscriptionId: "sub_r" })).toMatchObject({ success: false, error: "CERTIFICATE_EARNED" });
  });

  it("a subscription refund and a certificate of a premium course are mutually exclusive", async () => {
    const { user } = await subscriber();
    const course = await createCourse({ accessTier: CourseAccessTier.PREMIUM });
    h.refund.mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
      return "re_slow";
    });

    const issue = new Promise((resolve) => setTimeout(resolve, 20)).then(() =>
      withPurchaseLock(user.id, course.id, async (tx) => {
        const subscription = await tx.subscription.findUnique({ where: { userId: user.id } });
        if (subscription?.status !== SubscriptionStatus.ACTIVE) return "refused" as const;
        await tx.certificate.create({ data: { userId: user.id, courseId: course.id } });
        return "issued" as const;
      }),
    );
    const [refund, issued] = await Promise.all([requestRefund({ subscriptionId: "sub_r" }), issue]);

    expect(refund.success ? "refunded" : "kept").toBe(issued === "issued" ? "kept" : "refunded");
    expect(await db.certificate.count({ where: { userId: user.id } })).toBe(issued === "issued" ? 1 : 0);
  });

  it("a failure at Stripe records nothing, and a retry goes through (the refund is idempotent)", async () => {
    const { user } = await subscriber();
    h.cancel.mockRejectedValueOnce(new Error("CANCEL_IMMEDIATE_FAILED"));

    expect(await requestRefund({ subscriptionId: "sub_r" })).toMatchObject({ success: false, error: "STRIPE_REFUND_FAILED" });
    expect((await db.subscription.findUniqueOrThrow({ where: { userId: user.id } })).status).toBe(SubscriptionStatus.ACTIVE);
    expect(await db.invoiceAudit.count({ where: { userId: user.id, type: "REFUND_PROCESSED" } })).toBe(0);

    expect(await requestRefund({ subscriptionId: "sub_r" })).toMatchObject({ success: true });
    expect(h.refund).toHaveBeenCalledTimes(2);
    expect(new Set(h.refund.mock.calls.map((call) => call[2].idempotencyKey)).size).toBe(1); // same key: Stripe returns the first refund
  });

  it("two requests at once: one refund", async () => {
    await subscriber();
    const results = await Promise.all([requestRefund({ subscriptionId: "sub_r" }), requestRefund({ subscriptionId: "sub_r" })]);
    expect(results.filter((r) => r.success)).toHaveLength(1);
    expect(h.cancel).toHaveBeenCalledTimes(1);
  });

  it("only the owner can refund a subscription", async () => {
    await subscriber();
    const stranger = await createUser();
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: stranger.id } } as never);
    expect(await requestRefund({ subscriptionId: "sub_r" })).toMatchObject({ success: false, error: "SUBSCRIPTION_NOT_FOUND" });
    expect(h.refund).not.toHaveBeenCalled();
  });
});
