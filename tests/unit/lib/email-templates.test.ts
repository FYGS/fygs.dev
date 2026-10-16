import { createHash } from "crypto";
import { describe, expect, it } from "vitest";

import { ModernEmailTemplates as T } from "@/lib/email-templates";

const hash = (v: unknown) =>
  createHash("sha256").update(JSON.stringify(v)).digest("hex");

const weeklyStats = {
  totalReviews: 12,
  averageRating: 4.5,
  positiveReviews: 10,
  responseRate: 80,
};
const base = { userName: "Alice", siteUrl: "https://example.test" };
const sub = {
  ...base,
  planName: "Premium",
  price: 19.9,
  billingPeriod: "monthly" as const,
  nextBillingDate: "2030-01-01",
};

const cases: Record<string, () => { subject: string; html: string }> = {
  welcome: () => T.welcomeRegistration(base),
  welcomeDefaultUrl: () => T.welcomeRegistration({ userName: "Bob" }),
  coursePurchase: () =>
    T.coursePurchase({ ...base, courseTitle: "React", courseSlug: "react", coursePrice: 49 }),
  coursePurchaseNoPrice: () =>
    T.coursePurchase({ ...base, courseTitle: "React", courseSlug: "react" }),
  premium: () => T.premiumSubscription(sub),
  premiumYearly: () => T.premiumSubscription({ ...sub, billingPeriod: "yearly" }),
  updated: () => T.subscriptionUpdated(sub),
  updatedNoDate: () =>
    T.subscriptionUpdated({ ...sub, nextBillingDate: undefined }),
  password: () =>
    T.passwordChanged({ ...base, changeDate: "2030-01-01", ipAddress: "1.2.3.4" }),
  passwordNoIp: () => T.passwordChanged({ ...base, changeDate: "2030-01-01" }),
  paymentFailed: () => T.paymentFailed(base),
  canceled: () => T.subscriptionCanceled(base),
  canceledImmediate: () => T.subscriptionCanceledImmediate(base),
  switched: () => T.subscriptionPlanSwitched(sub),
  refund: () =>
    T.refundIssued({ ...base, courseTitle: "React", amount: 49 } as never),
  newReview: () =>
    T.newReviewForInstructor({
      instructorName: "I", reviewerName: "R", courseTitle: "C", rating: 4,
      comment: "good", courseSlug: "c", reviewId: "r1", siteUrl: "https://e.test",
    } as never),
  newReviewNoComment: () =>
    T.newReviewForInstructor({
      instructorName: "I", reviewerName: "R", courseTitle: "C", rating: 1,
      courseSlug: "c", reviewId: "r1",
    } as never),
  reply: () =>
    T.instructorReplyToReview({
      studentName: "S", instructorName: "I", courseTitle: "C",
      replyContent: "thanks", originalRating: 5, courseSlug: "c", reviewId: "r1",
    } as never),
  reported: () =>
    T.reviewReported({
      moderatorName: "M", reporterName: "P", reviewerName: "R", courseTitle: "C",
      rating: 2, comment: "bad", reportReason: "spam", reportDetails: "details",
      reviewId: "r1",
    } as never),
  reportedNoDetails: () =>
    T.reviewReported({
      moderatorName: "M", reporterName: "P", reviewerName: "R", courseTitle: "C",
      rating: 2, reportReason: "spam", reviewId: "r1",
    } as never),
  helpful: () =>
    T.reviewHelpfulVote({
      reviewerName: "R", courseTitle: "C", rating: 5, totalHelpfulVotes: 10,
      courseSlug: "c", reviewId: "r1",
    } as never),
  weekly: () =>
    T.weeklyReviewSummary({
      instructorName: "I",
      weeklyStats,
      topCourses: [
        { title: "A", slug: "a", newReviews: 3, averageRating: 4.2 },
        { title: "B", slug: "b", newReviews: 1, averageRating: 3.9 },
      ],
    }),
  weeklyEmpty: () =>
    T.weeklyReviewSummary({ instructorName: "I", weeklyStats, topCourses: [] }),
  discussionReply: () =>
    T.discussionReply({
      authorName: "A", replierName: "B", discussionTitle: "T",
      replyContent: "x".repeat(300), discussionId: "d1",
    } as never),
  follower: () =>
    T.newFollower({
      recipientName: "A", followerName: "B", followerAvatar: "https://a.test/a.png",
      followerId: "u2",
    } as never),
  followerNoAvatar: () =>
    T.newFollower({ recipientName: "A", followerName: "B", followerId: "u2" } as never),
  mentorRequest: () =>
    T.mentorRequest({ mentorName: "M", studentName: "S", message: "hi" } as never),
  mentorRequestNoMsg: () =>
    T.mentorRequest({ mentorName: "M", studentName: "S" } as never),
  mentorAccept: () =>
    T.mentorResponse({ studentName: "S", mentorName: "M", action: "accept" }),
  mentorDecline: () =>
    T.mentorResponse({ studentName: "S", mentorName: "M", action: "decline" }),
  badge: () =>
    T.badgeEarned({
      userName: "U", badgeName: "Star", badgeDescription: "desc",
      badgeIcon: "⭐", points: 50,
    } as never),
  digest: () =>
    T.communityWeeklyDigest({
      userName: "U",
      weeklyStats: { totalDiscussions: 1, totalReplies: 2, pointsEarned: 30, newFollowers: 4 },
      topDiscussions: [{ id: "d1", title: "Hot", replyCount: 7 }],
      newBadges: [{ name: "Star", icon: "⭐" }],
    }),
  digestEmpty: () =>
    T.communityWeeklyDigest({
      userName: "U",
      weeklyStats: { totalDiscussions: 0, totalReplies: 0, pointsEarned: 0, newFollowers: 0 },
      topDiscussions: [],
      newBadges: [],
    }),
};

describe("ModernEmailTemplates (pinned output)", () => {
  it("exposes the same set of templates", () => {
    expect(
      Object.getOwnPropertyNames(T)
        .filter((k) => typeof (T as never)[k] === "function")
        .sort(),
    ).toMatchSnapshot();
  });

  for (const [name, render] of Object.entries(cases)) {
    it(`renders ${name}`, () => {
      const out = render();
      expect(out.subject).toMatchSnapshot();
      expect(hash(out)).toMatchSnapshot();
    });
  }

  it("full html of one template is stable", () => {
    expect(cases.premium().html).toMatchSnapshot();
  });
});
