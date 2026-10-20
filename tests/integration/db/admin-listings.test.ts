import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import {
  CourseAccessTier,
  PaymentKind,
  PaymentStatus,
  SubscriptionStatus,
} from "@/lib/generated/prisma/client";
import {
  PAGE_SIZE,
  listCertificates,
  listEnrollments,
  listPayments,
  listSubscriptions,
} from "@/lib/services/admin-listings";
import { resetDatabase } from "../../support/test-db";
import { createCourse, createSubscription, createUser, enroll } from "../../support/factories";

beforeEach(() => resetDatabase(db));
afterAll(async () => {
  await resetDatabase(db);
  await db.$disconnect();
});

const pay = (userId: string, status: PaymentStatus, amount: string, extra: Record<string, unknown> = {}) =>
  db.payment.create({ data: { userId, amount, status, kind: PaymentKind.COURSE, ...extra } });

describe("listPayments", () => {
  it("is empty on an empty platform", async () => {
    expect(await listPayments({})).toMatchObject({
      rows: [],
      total: 0,
      page: 1,
      pages: 1,
      totals: { collected: 0, refunded: 0, pending: 0, failed: 0 },
    });
  });

  it("lists the newest first, with the customer, the course and a number for the amount", async () => {
    const alice = await createUser({ name: "Alice", email: "alice@example.test" });
    const course = await createCourse({ title: "Next.js", accessTier: CourseAccessTier.PREMIUM });
    await pay(alice.id, PaymentStatus.COMPLETED, "10.00", { createdAt: new Date("2026-01-01"), courseId: course.id });
    await pay(alice.id, PaymentStatus.COMPLETED, "49.90", { createdAt: new Date("2026-02-01"), kind: PaymentKind.SUBSCRIPTION });

    const result = await listPayments({});

    expect(result.rows.map((row) => row.amount)).toEqual([49.9, 10]);
    expect(result.rows[1]).toMatchObject({
      user: { name: "Alice", email: "alice@example.test" },
      courseTitle: "Next.js",
      kind: "COURSE",
      status: "COMPLETED",
      currency: "eur",
    });
    expect(result.rows[0].courseTitle).toBeNull();
  });

  it("totals the whole filtered set by status, not just the page", async () => {
    const user = await createUser();
    for (let i = 0; i < PAGE_SIZE + 5; i++) await pay(user.id, PaymentStatus.COMPLETED, "2.00");
    await pay(user.id, PaymentStatus.REFUNDED, "30.00");
    await pay(user.id, PaymentStatus.PENDING, "5.00");
    await pay(user.id, PaymentStatus.FAILED, "7.00");

    const result = await listPayments({});

    expect(result.rows).toHaveLength(PAGE_SIZE);
    expect(result.total).toBe(PAGE_SIZE + 8);
    expect(result.totals).toEqual({ collected: (PAGE_SIZE + 5) * 2, refunded: 30, pending: 5, failed: 7 });
  });

  it("filters by status, by kind and by the customer's name or e-mail", async () => {
    const alice = await createUser({ name: "Alice Martin", email: "alice@example.test" });
    const bob = await createUser({ name: "Bob Durand", email: "bob@corp.test" });
    await pay(alice.id, PaymentStatus.COMPLETED, "10.00");
    await pay(alice.id, PaymentStatus.REFUNDED, "20.00", { kind: PaymentKind.SUBSCRIPTION });
    await pay(bob.id, PaymentStatus.COMPLETED, "30.00");

    expect((await listPayments({ status: "REFUNDED" })).rows.map((r) => r.amount)).toEqual([20]);
    expect((await listPayments({ kind: "SUBSCRIPTION" })).rows.map((r) => r.amount)).toEqual([20]);
    expect((await listPayments({ q: "BOB" })).rows.map((r) => r.amount)).toEqual([30]);
    expect((await listPayments({ q: "corp.test" })).rows.map((r) => r.amount)).toEqual([30]);
    expect((await listPayments({ q: "alice", status: "COMPLETED" })).rows.map((r) => r.amount)).toEqual([10]);
    // the totals follow the filters
    expect((await listPayments({ q: "alice" })).totals).toMatchObject({ collected: 10, refunded: 20 });
  });

  it("ignores a status or a kind the schema does not know instead of failing", async () => {
    const user = await createUser();
    await pay(user.id, PaymentStatus.COMPLETED, "10.00");

    expect((await listPayments({ status: "DROP TABLE", kind: "nope" })).total).toBe(1);
  });

  it("treats the search text as text, never as a filter expression", async () => {
    const user = await createUser({ name: "O'Brien", email: "obrien@example.test" });
    await pay(user.id, PaymentStatus.COMPLETED, "10.00");

    expect((await listPayments({ q: "O'Brien" })).total).toBe(1);
    expect((await listPayments({ q: "%" })).total).toBe(0); // no wildcard injected: nobody has "%" in a name
    expect((await listPayments({ q: "x".repeat(500) })).total).toBe(0); // and a huge value does not break the query
  });

  it("paginates, and clamps a page that does not exist to the last one", async () => {
    const user = await createUser();
    for (let i = 0; i < PAGE_SIZE + 3; i++) await pay(user.id, PaymentStatus.COMPLETED, "1.00");

    const first = await listPayments({ page: 1 });
    const second = await listPayments({ page: 2 });
    const beyond = await listPayments({ page: 99 });
    const nonsense = await listPayments({ page: -4 });

    expect(first).toMatchObject({ page: 1, pages: 2 });
    expect(first.rows).toHaveLength(PAGE_SIZE);
    expect(second.rows).toHaveLength(3);
    expect(beyond.page).toBe(2);
    expect(beyond.rows).toHaveLength(3);
    expect(nonsense.page).toBe(1);
    // no row appears twice across pages
    expect(new Set([...first.rows, ...second.rows].map((r) => r.id)).size).toBe(PAGE_SIZE + 3);
  });
});

describe("listSubscriptions", () => {
  it("lists subscribers with their status and scheduled end, filterable", async () => {
    const [alice, bob, carol] = await Promise.all([
      createUser({ name: "Alice", email: "alice@example.test" }),
      createUser({ name: "Bob", email: "bob@example.test" }),
      createUser({ name: "Carol", email: "carol@example.test" }),
    ]);
    await createSubscription(alice.id, { status: SubscriptionStatus.ACTIVE, cancelAtPeriodEnd: true });
    await createSubscription(bob.id, { status: SubscriptionStatus.CANCELED });
    await createSubscription(carol.id, { status: SubscriptionStatus.ACTIVE });

    const all = await listSubscriptions({});
    expect(all.total).toBe(3);
    expect(all.rows.find((r) => r.user.name === "Alice")).toMatchObject({ status: "ACTIVE", cancelAtPeriodEnd: true });

    expect((await listSubscriptions({ status: "ACTIVE" })).rows.map((r) => r.user.name).sort()).toEqual(["Alice", "Carol"]);
    expect((await listSubscriptions({ status: "CANCELED" })).rows.map((r) => r.user.name)).toEqual(["Bob"]);
    expect((await listSubscriptions({ q: "carol@" })).rows.map((r) => r.user.name)).toEqual(["Carol"]);
    expect((await listSubscriptions({ status: "nope" })).total).toBe(3);
  });
});

describe("listEnrollments", () => {
  it("lists who follows what, and filters by learner, course and completion", async () => {
    const alice = await createUser({ name: "Alice", email: "alice@example.test" });
    const bob = await createUser({ name: "Bob", email: "bob@example.test" });
    const react = await createCourse({ title: "React", accessTier: CourseAccessTier.PREMIUM });
    const git = await createCourse({ title: "Git", accessTier: CourseAccessTier.FREE });
    await enroll(alice.id, react.id);
    await enroll(bob.id, git.id);
    await db.enrollment.update({
      where: { userId_courseId: { userId: bob.id, courseId: git.id } },
      data: { completedAt: new Date("2026-03-01") },
    });

    expect((await listEnrollments({})).total).toBe(2);
    expect((await listEnrollments({ q: "react" })).rows.map((r) => r.user.name)).toEqual(["Alice"]); // by course
    expect((await listEnrollments({ q: "bob@" })).rows.map((r) => r.courseTitle)).toEqual(["Git"]); // by learner
    expect((await listEnrollments({ completed: "yes" })).rows.map((r) => r.user.name)).toEqual(["Bob"]);
    expect((await listEnrollments({ completed: "no" })).rows.map((r) => r.user.name)).toEqual(["Alice"]);
    expect((await listEnrollments({})).rows.find((r) => r.courseTitle === "React")).toMatchObject({ accessTier: "PREMIUM", completedAt: null });
  });
});

describe("listCertificates", () => {
  it("lists the certificates, newest first, searchable by learner or course", async () => {
    const alice = await createUser({ name: "Alice", email: "alice@example.test" });
    const course = await createCourse({ title: "TypeScript" });
    const other = await createCourse({ title: "Rust" });
    await db.certificate.create({ data: { userId: alice.id, courseId: course.id, issuedAt: new Date("2026-01-01") } });
    await db.certificate.create({ data: { userId: alice.id, courseId: other.id, issuedAt: new Date("2026-02-01") } });

    const result = await listCertificates({});
    expect(result.rows.map((r) => r.courseTitle)).toEqual(["Rust", "TypeScript"]);
    expect((await listCertificates({ q: "script" })).rows.map((r) => r.courseTitle)).toEqual(["TypeScript"]);
    expect((await listCertificates({ q: "alice" })).total).toBe(2);
    expect((await listCertificates({ q: "nobody" })).total).toBe(0);
  });
});
