import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getEntitlement } from "@/lib/access/entitlement";
import { CourseAccessTier, PaymentKind, PaymentStatus } from "@/lib/generated/prisma/client";
import { createCourse, createUser, enroll } from "../../support/factories";
import { resetDatabase } from "../../support/test-db";

const h = vi.hoisted(() => ({ refund: vi.fn() }));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: vi.fn() } } }));
vi.mock("next/headers", () => ({ headers: vi.fn(() => Promise.resolve(new Headers())) }));
vi.mock("@/lib/payment-service", () => ({ paymentService: { refundPayment: h.refund } }));

import { requestCourseRefund } from "@/app/[locale]/(main)/dashboard/actions/requestCourseRefund";

const DAY = 24 * 60 * 60 * 1000;

async function buyer(daysAgo = 2) {
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
      createdAt: new Date(Date.now() - daysAgo * DAY),
    },
  });
  vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: user.id } } as never);
  return { user, course, payment };
}

beforeEach(async () => {
  await resetDatabase(db);
  h.refund.mockReset().mockResolvedValue("re_123");
});
afterAll(() => resetDatabase(db));

describe("requestCourseRefund", () => {
  it("refunds within 14 days, marks the payment REFUNDED and closes the access; progress is kept", async () => {
    const { user, course, payment } = await buyer();
    expect(await getEntitlement(user.id, course.id)).toMatchObject({ entitled: true, source: "purchase" });

    const result = await requestCourseRefund({ paymentId: payment.id });
    expect(result).toMatchObject({ success: true, message: expect.stringContaining("remboursée") });
    expect(h.refund).toHaveBeenCalledWith(payment.stripePaymentIntentId, undefined, { idempotencyKey: `course-refund:${payment.id}` });
    expect((await db.payment.findUniqueOrThrow({ where: { id: payment.id } })).status).toBe(PaymentStatus.REFUNDED);
    expect(await db.invoiceAudit.count({ where: { paymentId: payment.id, type: "REFUND_PROCESSED" } })).toBe(1);
    expect(await getEntitlement(user.id, course.id)).toMatchObject({ entitled: false, lapsed: "refunded", enrolled: true });

    // asking again changes nothing
    expect(await requestCourseRefund({ paymentId: payment.id })).toMatchObject({ success: false, error: "ALREADY_REFUNDED" });
    expect(h.refund).toHaveBeenCalledTimes(1);
  });

  it("refuses after the window, once the course is finished, for another user's payment", async () => {
    const late = await buyer(20);
    expect(await requestCourseRefund({ paymentId: late.payment.id })).toMatchObject({ success: false, error: "WINDOW_EXPIRED" });

    const done = await buyer(1);
    await db.certificate.create({ data: { userId: done.user.id, courseId: done.course.id } });
    expect(await requestCourseRefund({ paymentId: done.payment.id })).toMatchObject({ success: false, error: "COURSE_COMPLETED" });

    const stranger = await createUser();
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: stranger.id } } as never);
    expect(await requestCourseRefund({ paymentId: done.payment.id })).toMatchObject({ success: false, error: "NOT_FOUND" });
    expect(h.refund).not.toHaveBeenCalled();
  });

  it("a Stripe failure leaves the payment untouched", async () => {
    const { payment } = await buyer();
    h.refund.mockRejectedValue(new Error("stripe down"));
    expect(await requestCourseRefund({ paymentId: payment.id })).toMatchObject({ success: false, error: "STRIPE_REFUND_FAILED" });
    expect((await db.payment.findUniqueOrThrow({ where: { id: payment.id } })).status).toBe(PaymentStatus.COMPLETED);
  });

  it("needs a session", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null as never);
    expect(await requestCourseRefund({ paymentId: "x" })).toMatchObject({ success: false, error: "UNAUTHORIZED" });
  });
});
