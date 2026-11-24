import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/db";
import { ReportReason, Role } from "@/lib/generated/prisma/client";
import { resetDatabase } from "../../support/test-db";
import { createCourse, createUser } from "../../support/factories";

const mail = vi.hoisted(() => ({
  sendNewReviewNotification: vi.fn(async () => true),
  sendInstructorReplyNotification: vi.fn(async () => true),
  sendReviewReportedNotification: vi.fn(async () => true),
  sendWeeklyReviewSummary: vi.fn(async () => true),
}));
vi.mock("@/lib/email-service", () => ({ emailService: mail }));

import { ReviewNotificationService } from "@/lib/services/review-notification";

beforeEach(async () => {
  await resetDatabase(db);
  vi.clearAllMocks();
});
afterAll(async () => {
  await resetDatabase(db);
  await db.$disconnect();
});

async function scene() {
  const instructor = await createUser({ name: "Ines Instructor", email: "instructor@example.test", role: Role.INSTRUCTOR });
  const student = await createUser({ name: "Sam Student", email: "student@example.test" });
  const course = await createCourse({ title: "Next.js", slug: "next-js", instructorId: instructor.id });
  const review = await db.review.create({
    data: { userId: student.id, courseId: course.id, rating: 4, comment: "Très clair" },
  });
  return { instructor, student, course, review };
}

describe("new review -> the course instructor", () => {
  it("is e-mailed with the reviewer, the course and the rating", async () => {
    const { review } = await scene();

    await ReviewNotificationService.notifyNewReview(review.id);

    expect(mail.sendNewReviewNotification).toHaveBeenCalledTimes(1);
    expect(mail.sendNewReviewNotification).toHaveBeenCalledWith("instructor@example.test", "Ines Instructor", {
      reviewerName: "Sam Student",
      courseTitle: "Next.js",
      rating: 4,
      comment: "Très clair",
      courseSlug: "next-js",
      reviewId: review.id,
    });
  });

  it("does nothing, and does not throw, for a course without instructor", async () => {
    const student = await createUser();
    const course = await createCourse();
    const review = await db.review.create({ data: { userId: student.id, courseId: course.id, rating: 5 } });

    await expect(ReviewNotificationService.notifyNewReview(review.id)).resolves.toBeUndefined();
    expect(mail.sendNewReviewNotification).not.toHaveBeenCalled();
  });

  it("does nothing for a review that no longer exists", async () => {
    await expect(ReviewNotificationService.notifyNewReview("gone")).resolves.toBeUndefined();
    expect(mail.sendNewReviewNotification).not.toHaveBeenCalled();
  });

  it("a failing mail provider never breaks the request that created the review", async () => {
    const { review } = await scene();
    mail.sendNewReviewNotification.mockRejectedValueOnce(new Error("smtp down"));

    await expect(ReviewNotificationService.notifyNewReview(review.id)).resolves.toBeUndefined();
  });
});

describe("instructor reply -> the reviewer", () => {
  it("is e-mailed with the instructor's name and the reply", async () => {
    const { instructor, review } = await scene();
    const reply = await db.reviewReply.create({
      data: { reviewId: review.id, userId: instructor.id, content: "Merci pour votre retour !" },
    });

    await ReviewNotificationService.notifyInstructorReply(reply.id);

    expect(mail.sendInstructorReplyNotification).toHaveBeenCalledWith("student@example.test", {
      studentName: "Sam Student",
      instructorName: "Ines Instructor",
      courseTitle: "Next.js",
      replyContent: "Merci pour votre retour !",
      originalRating: 4,
      courseSlug: "next-js",
      reviewId: review.id,
    });
  });
});

describe("review report -> the moderators", () => {
  it("every admin and instructor is e-mailed, the reporter and the reviewer are named", async () => {
    const { review } = await scene();
    await createUser({ name: "Alice Admin", email: "admin@example.test", role: Role.ADMIN });
    const reporter = await createUser({ name: "Rita Reporter", email: "reporter@example.test" });
    const report = await db.reviewReport.create({
      data: { reviewId: review.id, userId: reporter.id, reason: ReportReason.SPAM, details: "pub" },
    });

    await ReviewNotificationService.notifyReviewReported(report.id);

    expect(mail.sendReviewReportedNotification).toHaveBeenCalledTimes(2); // the instructor and the admin
    const recipients = mail.sendReviewReportedNotification.mock.calls.map((call) => call[0] as string).sort();
    expect(recipients).toEqual(["admin@example.test", "instructor@example.test"]);
    expect(mail.sendReviewReportedNotification.mock.calls[0][1]).toMatchObject({
      reporterName: "Rita Reporter",
      reviewerName: "Sam Student",
      courseTitle: "Next.js",
      reportReason: "Spam",
      reportDetails: "pub",
      reviewId: review.id,
    });
  });
});

describe("bulk notifications", () => {
  it("every review of an instructor is notified, up to the cap", async () => {
    const { instructor, course } = await scene();
    const ids: string[] = [];
    for (let i = 0; i < 7; i++) {
      const student = await createUser();
      const review = await db.review.create({ data: { userId: student.id, courseId: course.id, rating: 5 } });
      ids.push(review.id);
    }

    await ReviewNotificationService.sendBulkReviewNotifications(ids);

    expect(mail.sendNewReviewNotification).toHaveBeenCalledTimes(5);
    expect(mail.sendNewReviewNotification.mock.calls.every((call) => call[0] === instructor.email)).toBe(true);
  });

  it("a single review of an instructor is notified", async () => {
    const { review } = await scene();

    await ReviewNotificationService.sendBulkReviewNotifications([review.id]);

    expect(mail.sendNewReviewNotification).toHaveBeenCalledTimes(1);
  });
});

describe("weekly summary", () => {
  it("goes to an instructor who got a review this week, and only to them", async () => {
    const { instructor } = await scene(); // the scene holds one review, created just now
    const idle = await createUser({ email: "idle@example.test", role: Role.INSTRUCTOR });
    await createCourse({ instructorId: idle.id });

    await ReviewNotificationService.sendWeeklyReviewSummaries();

    expect(mail.sendWeeklyReviewSummary).toHaveBeenCalledTimes(1);
    expect(mail.sendWeeklyReviewSummary.mock.calls[0][0]).toBe(instructor.email);
  });

  it("skips reviews older than a week", async () => {
    const { course, student } = await scene();
    await db.review.deleteMany();
    await db.review.create({
      data: { userId: student.id, courseId: course.id, rating: 3, createdAt: new Date(Date.now() - 10 * 86_400_000) },
    });

    await ReviewNotificationService.sendWeeklyReviewSummaries();

    expect(mail.sendWeeklyReviewSummary).not.toHaveBeenCalled();
  });
});
