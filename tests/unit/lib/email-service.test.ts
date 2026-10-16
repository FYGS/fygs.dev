import { createHash } from "crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const sendMail = vi.fn();
const createTransport = vi.fn(() => ({ sendMail }));
vi.mock("nodemailer", () => ({ createTransport }));

const hash = (v: unknown) =>
  createHash("sha256").update(JSON.stringify(v)).digest("hex");

process.env.EMAIL_SERVER_HOST = "smtp.test";
process.env.EMAIL_SERVER_PORT = "465";
process.env.EMAIL_SERVER_USER = "user";
process.env.EMAIL_SERVER_PASSWORD = "pw";
process.env.EMAIL_FROM_NAME = "FYGS";
process.env.EMAIL_FROM = "noreply@fygs.test";
process.env.CONTACT_EMAIL = "contact@fygs.test";

const contact = {
  name: "Jane",
  email: "jane@example.test",
  subject: "Hello",
  message: "A message",
  company: "ACME",
  position: "CTO",
};

// The contact template prints the local time: pin the zone so the snapshot does not depend on the machine.
process.env.TZ = "Europe/Paris";

describe("emailService (pinned behaviour)", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2030-06-15T10:20:30Z"));
    sendMail.mockReset();
    sendMail.mockResolvedValue({});
  });

  it("is a singleton and builds the transporter lazily, once", async () => {
    const mod = await import("@/lib/email-service");
    const again = await import("@/lib/email-service");
    expect(mod.emailService).toBe(again.emailService);
    expect(createTransport).not.toHaveBeenCalled();
    await mod.emailService.sendEmail({ to: "a@b.c", subject: "s", html: "<b>x</b>" });
    await mod.emailService.sendEmail({ to: "a@b.c", subject: "s", html: "<b>x</b>", text: "t" });
    expect(createTransport).toHaveBeenCalledTimes(1);
    expect(createTransport).toHaveBeenCalledWith({
      host: "smtp.test",
      port: 465,
      secure: true,
      auth: { user: "user", pass: "pw" },
    });
    expect(sendMail.mock.calls).toEqual([
      [{ from: "FYGS <noreply@fygs.test>", to: "a@b.c", subject: "s", html: "<b>x</b>", text: "x" }],
      [{ from: "FYGS <noreply@fygs.test>", to: "a@b.c", subject: "s", html: "<b>x</b>", text: "t" }],
    ]);
  });

  it("sendEmail returns false when sending fails", async () => {
    const { emailService } = await import("@/lib/email-service");
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    sendMail.mockRejectedValueOnce(new Error("boom"));
    await expect(emailService.sendEmail({ to: "a", subject: "s", html: "h" })).resolves.toBe(false);
    err.mockRestore();
  });

  it("pure templates are stable", async () => {
    const { emailService: s } = await import("@/lib/email-service");
    const out = {
      verify: s.emailVerification("Al", "https://x.test/v"),
      reset: s.passwordReset("Al", "https://x.test/r"),
      welcome: s.welcomeEmail("Al"),
      enroll: s.enrollmentConfirmationEmail("Al", "Formation", "https://x.test/f"),
      cert: s.certificateEarnedEmail("Al", "Formation", "https://x.test/f"),
      adminAll: s.contactFormAdminEmail(contact),
      userAll: s.contactFormUserConfirmation(contact),
      ...Object.fromEntries(
        (["recruitment", "collaboration", "training", "general"] as const).flatMap((t) => [
          [`admin-${t}`, s.contactFormAdminEmail({ ...contact, type: t })],
          [`user-${t}`, s.contactFormUserConfirmation({ ...contact, type: t })],
        ]),
      ),
    };
    for (const [k, v] of Object.entries(out)) {
      expect(v.subject).toMatchSnapshot(`${k} subject`);
      expect(hash(v)).toMatchSnapshot(`${k} hash`);
    }
  });

  it("every sender builds and sends the expected mail", async () => {
    const { emailService: s } = await import("@/lib/email-service");
    const review = {
      reviewerName: "R", courseTitle: "C", rating: 4, comment: "ok",
      courseSlug: "c", reviewId: "r1",
    };
    const calls: Array<[string, () => Promise<unknown>]> = [
      ["welcome", () => s.sendWelcomeEmail("Al", "al@x.test")],
      ["purchase", () => s.sendCoursePurchaseEmail("Al", "al@x.test", "C", "c", 10)],
      ["premium", () => s.sendPremiumSubscriptionEmail("Al", "al@x.test", "P", 9, "yearly")],
      ["updated", () => s.sendSubscriptionUpdatedEmail("Al", "al@x.test", "P", 9, "monthly", "2030-01-01")],
      ["pwd", () => s.sendPasswordChangedEmail("Al", "al@x.test", "2030-01-01", "1.1.1.1")],
      ["failed", () => s.sendPaymentFailedEmail("Al", "al@x.test")],
      ["canceled", () => s.sendSubscriptionCanceledEmail("Al", "al@x.test")],
      ["canceledNow", () => s.sendSubscriptionCanceledImmediateEmail("Al", "al@x.test")],
      ["switched", () => s.sendSubscriptionPlanSwitchedEmail("Al", "al@x.test", "P", 9, "monthly")],
      ["refund", () => s.sendRefundIssuedEmail("Al", "al@x.test", "C", 10)],
      ["contact", () => s.sendContactFormEmails(contact)],
      ["newReview", () => s.sendNewReviewNotification("i@x.test", "I", review)],
      ["reply", () => s.sendInstructorReplyNotification("s@x.test", {
        studentName: "S", instructorName: "I", courseTitle: "C", replyContent: "r",
        originalRating: 5, courseSlug: "c", reviewId: "r1" })],
      ["reported", () => s.sendReviewReportedNotification("m@x.test", {
        moderatorName: "M", reporterName: "P", reviewerName: "R", courseTitle: "C",
        rating: 1, reportReason: "spam", reviewId: "r1" })],
      ["helpful5", () => s.sendReviewHelpfulVoteNotification("r@x.test", { ...review, totalHelpfulVotes: 5 })],
      ["helpful3-skipped", () => s.sendReviewHelpfulVoteNotification("r@x.test", { ...review, totalHelpfulVotes: 3 })],
      ["weekly", () => s.sendWeeklyReviewSummary("i@x.test", {
        instructorName: "I",
        weeklyStats: { totalReviews: 2, averageRating: 4, positiveReviews: 2, responseRate: 50 },
        topCourses: [] })],
      ["weekly-skipped", () => s.sendWeeklyReviewSummary("i@x.test", {
        instructorName: "I",
        weeklyStats: { totalReviews: 0, averageRating: 0, positiveReviews: 0, responseRate: 0 },
        topCourses: [] })],
      ["discussion", () => s.sendDiscussionReplyNotification("a@x.test", {
        authorName: "A", replierName: "B", discussionTitle: "T", replyContent: "c", discussionId: "d" })],
      ["follower", () => s.sendNewFollowerNotification("a@x.test", {
        recipientName: "A", followerName: "B", followerAvatar: null, followerId: "u" })],
      ["mentorReq", () => s.sendMentorRequestNotification("m@x.test", {
        mentorName: "M", studentName: "S", message: "hi", requestId: "q" })],
      ["mentorResp", () => s.sendMentorResponseNotification("s@x.test", {
        studentName: "S", mentorName: "M", action: "accept" })],
      ["badge", () => s.sendBadgeEarnedNotification("u@x.test", {
        userName: "U", badgeName: "B", badgeDescription: "d", badgeIcon: "i", points: 5 })],
      ["digest", () => s.sendCommunityWeeklyDigest("u@x.test", {
        userName: "U",
        weeklyStats: { totalDiscussions: 1, totalReplies: 1, pointsEarned: 3, newFollowers: 0 },
        topDiscussions: [], newBadges: [] })],
      ["digest-skipped", () => s.sendCommunityWeeklyDigest("u@x.test", {
        userName: "U",
        weeklyStats: { totalDiscussions: 1, totalReplies: 1, pointsEarned: 0, newFollowers: 0 },
        topDiscussions: [], newBadges: [] })],
    ];
    const results: Record<string, unknown> = {};
    for (const [name, run] of calls) {
      sendMail.mockClear();
      const res = await run();
      results[name] = {
        res,
        mails: sendMail.mock.calls.map(([m]) => ({
          ...m, html: hash(m.html), text: hash(m.text),
        })),
      };
    }
    expect(results).toMatchSnapshot();
  });
});
