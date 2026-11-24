import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { getRecentActivity } from "@/lib/services/admin-activity";
import { CourseAccessTier, PaymentKind, PaymentStatus } from "@/lib/generated/prisma/client";
import { resetDatabase } from "../../support/test-db";
import { createCourse, createUser, enroll } from "../../support/factories";

beforeEach(() => resetDatabase(db));
afterAll(async () => {
  await resetDatabase(db);
  await db.$disconnect();
});

const at = (minutesAgo: number) => new Date(Date.now() - minutesAgo * 60_000);

describe("getRecentActivity", () => {
  it("is empty on an empty platform", async () => {
    expect(await getRecentActivity()).toEqual([]);
  });

  it("merges registrations, enrollments, payments, reviews and certificates, newest first", async () => {
    const user = await createUser({ name: "Alice Martin", createdAt: at(50) });
    const course = await createCourse({ title: "Next.js", accessTier: CourseAccessTier.PREMIUM });
    await db.enrollment.create({ data: { userId: user.id, courseId: course.id, enrolledAt: at(40) } });
    await db.payment.create({
      data: {
        userId: user.id,
        courseId: course.id,
        amount: "49.90",
        kind: PaymentKind.COURSE,
        status: PaymentStatus.COMPLETED,
        updatedAt: at(30),
      },
    });
    await db.review.create({ data: { userId: user.id, courseId: course.id, rating: 5, createdAt: at(20) } });
    await db.certificate.create({ data: { userId: user.id, courseId: course.id, issuedAt: at(10) } });

    const activities = await getRecentActivity();

    expect(activities.map((a) => a.type)).toEqual([
      "certificate_issued",
      "review_posted",
      "payment_received",
      "course_enrolled",
      "user_registered",
    ]);
    expect(activities.find((a) => a.type === "payment_received")).toMatchObject({
      description: "49.90 EUR pour 'Next.js'",
      userName: "Alice Martin",
    });
    expect(activities.find((a) => a.type === "review_posted")?.description).toBe("5/5 sur 'Next.js'");
  });

  it("ignores payments that did not settle", async () => {
    const user = await createUser();
    await Promise.all(
      [PaymentStatus.PENDING, PaymentStatus.FAILED, PaymentStatus.REFUNDED].map((status) =>
        db.payment.create({ data: { userId: user.id, amount: "9.90", kind: PaymentKind.SUBSCRIPTION, status } }),
      ),
    );

    expect((await getRecentActivity()).filter((a) => a.type === "payment_received")).toEqual([]);
  });

  it("names a subscription payment, which has no course", async () => {
    const user = await createUser();
    await db.payment.create({
      data: { userId: user.id, amount: "9.90", kind: PaymentKind.SUBSCRIPTION, status: PaymentStatus.COMPLETED },
    });

    const [payment] = (await getRecentActivity()).filter((a) => a.type === "payment_received");
    expect(payment.description).toBe("9.90 EUR pour 'Abonnement Premium'");
  });

  it("returns exactly `limit` items even when one source alone has more", async () => {
    const course = await createCourse();
    const users = await Promise.all(Array.from({ length: 6 }, (_, i) => createUser({ createdAt: at(100 - i) })));
    await Promise.all(users.map((u, i) => enroll(u.id, course.id).then(() => i)));

    const activities = await getRecentActivity(4);

    expect(activities).toHaveLength(4);
    expect(activities.map((a) => a.at.getTime())).toEqual(
      [...activities.map((a) => a.at.getTime())].sort((x, y) => y - x),
    );
  });
});
