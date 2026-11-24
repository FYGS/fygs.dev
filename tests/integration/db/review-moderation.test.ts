import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/db";
import { ReportReason, ReportStatus, ReviewStatus, Role } from "@/lib/generated/prisma/client";
import { resetDatabase } from "../../support/test-db";
import { createCourse, createUser } from "../../support/factories";

const mail = vi.hoisted(() => ({ sendNewReviewNotification: vi.fn(async () => true) }));
vi.mock("@/lib/email-service", () => ({ emailService: mail }));

import { getModerationCounts, moderateReview } from "@/lib/services/review-moderation";
import { listReviews } from "@/lib/services/admin-listings";

beforeEach(async () => {
  await resetDatabase(db);
  vi.clearAllMocks();
});
afterAll(async () => {
  await resetDatabase(db);
  await db.$disconnect();
});

async function scene(status: ReviewStatus = ReviewStatus.PENDING) {
  const admin = await createUser({ name: "Alice Admin", role: Role.ADMIN });
  const instructor = await createUser({ name: "Ines", email: "ines@example.test", role: Role.INSTRUCTOR });
  const student = await createUser({ name: "Sam", email: "sam@example.test" });
  const course = await createCourse({ title: "Next.js", slug: "next-js", instructorId: instructor.id });
  const review = await db.review.create({
    data: { userId: student.id, courseId: course.id, rating: 4, comment: "Très clair", status },
  });
  return { admin, instructor, student, course, review };
}

describe("moderateReview", () => {
  it("approves a pending review: status, audit row, and the instructor hears about it", async () => {
    const { admin, review } = await scene();

    const outcome = await moderateReview({ reviewId: review.id, decision: "APPROVE", moderatorId: admin.id, note: "  RAS  " });

    expect(outcome).toEqual({ ok: true, status: "APPROVED", changed: true });
    expect((await db.review.findUniqueOrThrow({ where: { id: review.id } })).status).toBe("APPROVED");
    const trail = await db.reviewModeration.findMany({ where: { reviewId: review.id } });
    expect(trail).toHaveLength(1);
    expect(trail[0]).toMatchObject({ moderatorId: admin.id, fromStatus: "PENDING", toStatus: "APPROVED", note: "RAS" });
    expect(mail.sendNewReviewNotification).toHaveBeenCalledTimes(1);
    expect(mail.sendNewReviewNotification.mock.calls[0][0]).toBe("ines@example.test");
  });

  it("rejects a review: nothing is sent to the instructor", async () => {
    const { admin, review } = await scene();

    expect(await moderateReview({ reviewId: review.id, decision: "REJECT", moderatorId: admin.id })).toMatchObject({
      status: "REJECTED",
      changed: true,
    });
    expect(mail.sendNewReviewNotification).not.toHaveBeenCalled();
  });

  it("settles the open reports with the decision: dismissed on approval, resolved on rejection", async () => {
    const { admin, student, review } = await scene(ReviewStatus.FLAGGED);
    const reporter = await createUser();
    await db.reviewReport.create({ data: { reviewId: review.id, userId: reporter.id, reason: ReportReason.SPAM } });
    await db.reviewReport.create({
      data: { reviewId: review.id, userId: student.id, reason: ReportReason.OTHER, status: ReportStatus.REVIEWED },
    });

    await moderateReview({ reviewId: review.id, decision: "APPROVE", moderatorId: admin.id });
    let reports = await db.reviewReport.findMany({ where: { reviewId: review.id }, orderBy: { createdAt: "asc" } });
    expect(reports.map((r) => r.status)).toEqual(["DISMISSED", "REVIEWED"]); // only the open one

    await db.reviewReport.updateMany({ where: { userId: reporter.id }, data: { status: ReportStatus.PENDING } });
    await moderateReview({ reviewId: review.id, decision: "REJECT", moderatorId: admin.id });
    reports = await db.reviewReport.findMany({ where: { reviewId: review.id, userId: reporter.id } });
    expect(reports[0].status).toBe("RESOLVED");
  });

  it("is idempotent: deciding what is already decided changes nothing and records nothing", async () => {
    const { admin, review } = await scene();

    await moderateReview({ reviewId: review.id, decision: "APPROVE", moderatorId: admin.id });
    const again = await moderateReview({ reviewId: review.id, decision: "APPROVE", moderatorId: admin.id });

    expect(again).toEqual({ ok: true, status: "APPROVED", changed: false });
    expect(await db.reviewModeration.count()).toBe(1);
    expect(mail.sendNewReviewNotification).toHaveBeenCalledTimes(1);
  });

  it("two moderators acting at once write one decision, not two", async () => {
    const { admin, review } = await scene();
    const other = await createUser({ role: Role.ADMIN });

    const outcomes = await Promise.all([
      moderateReview({ reviewId: review.id, decision: "APPROVE", moderatorId: admin.id }),
      moderateReview({ reviewId: review.id, decision: "APPROVE", moderatorId: other.id }),
    ]);

    expect(outcomes.filter((o) => o.ok && o.changed)).toHaveLength(1);
    expect(await db.reviewModeration.count()).toBe(1);
    expect(mail.sendNewReviewNotification).toHaveBeenCalledTimes(1);
  });

  it("a decision can be reversed, and the trail keeps both; a review that was already public is not announced again", async () => {
    const { admin, review } = await scene(ReviewStatus.APPROVED);

    await moderateReview({ reviewId: review.id, decision: "REJECT", moderatorId: admin.id });
    await moderateReview({ reviewId: review.id, decision: "APPROVE", moderatorId: admin.id });

    const trail = await db.reviewModeration.findMany({ where: { reviewId: review.id }, orderBy: { createdAt: "asc" } });
    expect(trail.map((t) => `${t.fromStatus}>${t.toStatus}`)).toEqual(["APPROVED>REJECTED", "REJECTED>APPROVED"]);
    expect(mail.sendNewReviewNotification).not.toHaveBeenCalled(); // never PENDING -> APPROVED
  });

  it("answers NOT_FOUND for a review that does not exist", async () => {
    const { admin } = await scene();

    expect(await moderateReview({ reviewId: "gone", decision: "APPROVE", moderatorId: admin.id })).toEqual({
      ok: false,
      error: "NOT_FOUND",
    });
  });

  it("keeps the trail when the moderator account is deleted", async () => {
    const { admin, review } = await scene();
    await moderateReview({ reviewId: review.id, decision: "APPROVE", moderatorId: admin.id });

    await db.user.delete({ where: { id: admin.id } });

    const [entry] = await db.reviewModeration.findMany({ where: { reviewId: review.id } });
    expect(entry).toMatchObject({ moderatorId: null, toStatus: "APPROVED" });
  });
});

describe("getModerationCounts", () => {
  it("counts the queue and the decisions of the last 24 hours", async () => {
    const { admin, course } = await scene(ReviewStatus.PENDING);
    const [a, b, c] = await Promise.all([createUser(), createUser(), createUser()]);
    const make = (userId: string, status: ReviewStatus) =>
      db.review.create({ data: { userId, courseId: course.id, rating: 5, status } });
    const pending = await make(a.id, ReviewStatus.PENDING);
    await make(b.id, ReviewStatus.FLAGGED);
    const toReject = await make(c.id, ReviewStatus.PENDING);

    await moderateReview({ reviewId: pending.id, decision: "APPROVE", moderatorId: admin.id });
    await moderateReview({ reviewId: toReject.id, decision: "REJECT", moderatorId: admin.id });
    // an old decision does not count
    await db.reviewModeration.create({
      data: { reviewId: pending.id, fromStatus: "PENDING", toStatus: "APPROVED", createdAt: new Date(Date.now() - 3 * 86_400_000) },
    });

    expect(await getModerationCounts()).toEqual({ pending: 1, flagged: 1, approvedLast24h: 1, rejectedLast24h: 1 });
  });
});

describe("listReviews", () => {
  it("lists newest first and filters by status, rating and text", async () => {
    const { course } = await scene(ReviewStatus.PENDING);
    const [x, y] = await Promise.all([
      createUser({ name: "Xavier", email: "x@example.test" }),
      createUser({ name: "Yvonne", email: "y@example.test" }),
    ]);
    await db.review.create({
      data: { userId: x.id, courseId: course.id, rating: 5, status: "APPROVED", comment: "Excellent", createdAt: new Date("2026-02-01") },
    });
    await db.review.create({
      data: { userId: y.id, courseId: course.id, rating: 2, status: "REJECTED", comment: "Décevant", createdAt: new Date("2026-03-01") },
    });

    const all = await listReviews({});
    expect(all.total).toBe(3);
    expect(all.rows.map((r) => r.user.name)).toEqual(["Sam", "Yvonne", "Xavier"]); // newest first

    expect((await listReviews({ status: "REJECTED" })).rows.map((r) => r.user.name)).toEqual(["Yvonne"]);
    expect((await listReviews({ rating: "5" })).rows.map((r) => r.user.name)).toEqual(["Xavier"]);
    expect((await listReviews({ q: "excell" })).rows.map((r) => r.user.name)).toEqual(["Xavier"]);
    expect((await listReviews({ q: "Next" })).total).toBe(3); // by course title
    expect((await listReviews({ q: "y@example" })).rows.map((r) => r.user.name)).toEqual(["Yvonne"]);
    expect((await listReviews({ status: "DROP", rating: "9" })).total).toBe(3); // unknown values are ignored
    expect(all.rows[0]).toMatchObject({ courseTitle: "Next.js", reportCount: 0, status: "PENDING" });
  });
});
