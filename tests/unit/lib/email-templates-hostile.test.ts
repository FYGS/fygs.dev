import { describe, expect, it } from "vitest";

import { ModernEmailTemplates } from "@/lib/emails/templates";
import { AuthEmailTemplates } from "@/lib/emails/service/auth-templates";
import { ContactEmailTemplates } from "@/lib/emails/service/contact-templates";
import { emailLink } from "@/lib/emails/templates/links";
import { SecurityEmailTemplates } from "@/lib/emails/templates/security";
import { disputeOpenedTemplate, refundConfirmationTemplate } from "@/lib/emails/templates/payments-security";
import { htmlToText, isSingleAddress, smtpOptions } from "@/lib/emails/service/transport";

/**
 * Every e-mail template is rendered with hostile text in every string field. What an attacker types in a name, a
 * subject, a comment or a profile must reach the mail as text, never as markup, a link or a header.
 */

const MARK = "PWNED";
const HOSTILE = `"><img src=x onerror=${MARK}><script>${MARK}</script>`;
const HEADER_INJECTION = `Hello\r\nBcc: attacker@evil.tld Subject: x`;
const BAD_LINK = `javascript:${MARK}`;
/** CR, LF, line and paragraph separators: anything that could end a header. */
const LINE_BREAK = new RegExp("[\r\n\u2028\u2029]");

type Rendered = { subject: string; html: string };

const stars = { totalReviews: 3, averageRating: 4.5, positiveReviews: 2, responseRate: 50 };
const digest = { totalDiscussions: 1, totalReplies: 2, pointsEarned: 30, newFollowers: 1 };

/** Arguments of each known template: hostile text in every string field. */
const KNOWN: Record<string, () => Rendered> = {
  "account.welcomeRegistration": () => ModernEmailTemplates.welcomeRegistration({ userName: HOSTILE }),
  "account.coursePurchase": () =>
    ModernEmailTemplates.coursePurchase({ userName: HOSTILE, courseTitle: HOSTILE, courseSlug: HOSTILE, coursePrice: 49 }),
  "account.premiumSubscription": () =>
    ModernEmailTemplates.premiumSubscription({ userName: HOSTILE, planName: HOSTILE, price: 29, billingPeriod: "monthly" }),
  "account.subscriptionUpdated": () =>
    ModernEmailTemplates.subscriptionUpdated({
      userName: HOSTILE,
      planName: HOSTILE,
      price: 29,
      billingPeriod: "yearly",
      nextBillingDate: HOSTILE,
    }),
  "account.passwordChanged": () =>
    ModernEmailTemplates.passwordChanged({ userName: HOSTILE, changeDate: HOSTILE, ipAddress: HOSTILE }),
  "account.paymentFailed": () => ModernEmailTemplates.paymentFailed({ userName: HOSTILE }),
  "account.subscriptionCanceled": () => ModernEmailTemplates.subscriptionCanceled({ userName: HOSTILE }),
  "account.subscriptionCanceledImmediate": () => ModernEmailTemplates.subscriptionCanceledImmediate({ userName: HOSTILE }),
  "account.subscriptionPlanSwitched": () =>
    ModernEmailTemplates.subscriptionPlanSwitched({
      userName: HOSTILE,
      planName: HOSTILE,
      price: 290,
      billingPeriod: "yearly",
      nextBillingDate: HOSTILE,
    }),
  "account.refundIssued": () => ModernEmailTemplates.refundIssued({ userName: HOSTILE, courseTitle: HOSTILE, amount: 49 }),
  "reviews.newReviewForInstructor": () =>
    ModernEmailTemplates.newReviewForInstructor({
      instructorName: HOSTILE,
      reviewerName: HOSTILE,
      courseTitle: HEADER_INJECTION + HOSTILE,
      rating: 5,
      comment: HOSTILE,
      courseSlug: HOSTILE,
      reviewId: HOSTILE,
    }),
  "reviews.instructorReplyToReview": () =>
    ModernEmailTemplates.instructorReplyToReview({
      studentName: HOSTILE,
      instructorName: HEADER_INJECTION,
      courseTitle: HEADER_INJECTION + HOSTILE,
      replyContent: HOSTILE,
      originalRating: 4,
      courseSlug: HOSTILE,
      reviewId: HOSTILE,
    }),
  "reviews.reviewReported": () =>
    ModernEmailTemplates.reviewReported({
      moderatorName: HOSTILE,
      reporterName: HOSTILE,
      reviewerName: HOSTILE,
      courseTitle: HEADER_INJECTION + HOSTILE,
      rating: 1,
      comment: HOSTILE,
      reportReason: HOSTILE,
      reportDetails: HOSTILE,
      reviewId: HOSTILE,
    }),
  "reviews.reviewHelpfulVote": () =>
    ModernEmailTemplates.reviewHelpfulVote({
      reviewerName: HOSTILE,
      courseTitle: HEADER_INJECTION + HOSTILE,
      rating: 3,
      totalHelpfulVotes: 12,
      courseSlug: HOSTILE,
      reviewId: HOSTILE,
    }),
  "reviews.weeklyReviewSummary": () =>
    ModernEmailTemplates.weeklyReviewSummary({
      instructorName: HOSTILE,
      weeklyStats: stars,
      topCourses: [{ title: HOSTILE, slug: HOSTILE, newReviews: 2, averageRating: 4 }],
    }),
  "community.discussionReply": () =>
    ModernEmailTemplates.discussionReply({
      authorName: HOSTILE,
      replierName: HEADER_INJECTION + HOSTILE,
      discussionTitle: HOSTILE,
      replyContent: HOSTILE,
      discussionId: HOSTILE,
    }),
  "community.newFollower": () =>
    ModernEmailTemplates.newFollower({
      recipientName: HOSTILE,
      followerName: HEADER_INJECTION + HOSTILE,
      followerAvatar: BAD_LINK,
      followerId: HOSTILE,
    }),
  "community.mentorRequest": () =>
    ModernEmailTemplates.mentorRequest({ mentorName: HOSTILE, studentName: HEADER_INJECTION + HOSTILE, message: HOSTILE, requestId: HOSTILE }),
  "community.mentorResponse": () =>
    ModernEmailTemplates.mentorResponse({ studentName: HOSTILE, mentorName: HEADER_INJECTION + HOSTILE, action: "accept" }),
  "community.badgeEarned": () =>
    ModernEmailTemplates.badgeEarned({
      userName: HOSTILE,
      badgeName: HEADER_INJECTION + HOSTILE,
      badgeDescription: HOSTILE,
      badgeIcon: HOSTILE,
      points: 10,
    }),
  "community.communityWeeklyDigest": () =>
    ModernEmailTemplates.communityWeeklyDigest({
      userName: HOSTILE,
      weeklyStats: digest,
      topDiscussions: [{ id: HOSTILE, title: HOSTILE, replyCount: 2 }],
      newBadges: [{ name: HOSTILE, icon: HOSTILE }],
    }),
  "auth.emailVerification": () => new AuthEmailTemplates().emailVerification(HOSTILE, BAD_LINK),
  "auth.passwordReset": () => new AuthEmailTemplates().passwordReset(HOSTILE, BAD_LINK),
  "auth.welcomeEmail": () => new AuthEmailTemplates().welcomeEmail(HOSTILE),
  "auth.enrollmentConfirmationEmail": () => new AuthEmailTemplates().enrollmentConfirmationEmail(HOSTILE, HEADER_INJECTION + HOSTILE, BAD_LINK),
  "auth.certificateEarnedEmail": () => new AuthEmailTemplates().certificateEarnedEmail(HOSTILE, HEADER_INJECTION + HOSTILE, BAD_LINK, "path"),
  "security.emailChangeConfirmation": () => SecurityEmailTemplates.emailChangeConfirmation(HOSTILE, `x${HOSTILE}@evil.tld`, BAD_LINK),
  "security.twoFactorChanged": () => SecurityEmailTemplates.twoFactorChanged(HOSTILE, true),
  "security.accountDeleted": () => SecurityEmailTemplates.accountDeleted(HOSTILE),
  "payments-security.refundConfirmationTemplate": () =>
    refundConfirmationTemplate({ name: HOSTILE, product: HEADER_INJECTION + HOSTILE, amount: 49, currency: "eur" }),
  "payments-security.disputeOpenedTemplate": () => disputeOpenedTemplate({ name: HOSTILE, product: HEADER_INJECTION + HOSTILE }),
  "contact.contactFormAdminEmail": () =>
    new ContactEmailTemplates().contactFormAdminEmail({
      name: HOSTILE,
      email: `"${HOSTILE}"@evil.tld`,
      subject: HEADER_INJECTION + HOSTILE,
      message: HOSTILE,
      company: HOSTILE,
      position: HOSTILE,
      type: "recruitment",
    }),
  "contact.contactFormUserConfirmation": () => new ContactEmailTemplates().contactFormUserConfirmation({ name: HOSTILE, email: "a@b.fr", subject: HOSTILE, message: HOSTILE, type: "training" }),
};

const staticTemplates = Object.getOwnPropertyNames(ModernEmailTemplates).filter(
  (name) => typeof (ModernEmailTemplates as unknown as Record<string, unknown>)[name] === "function" && name !== "length" && name !== "name" && name !== "prototype",
);
const methodsOf = (cls: { prototype: object }) =>
  Object.getOwnPropertyNames(cls.prototype).filter((name) => name !== "constructor");

describe("e-mail templates with hostile text in every field", () => {
  it("covers every template that exists (add a case to KNOWN when you add a template)", () => {
    const discovered = new Set<string>([
      ...staticTemplates.map((name) => {
        const group = ["welcomeRegistration", "coursePurchase", "premiumSubscription", "subscriptionUpdated", "passwordChanged", "paymentFailed", "subscriptionCanceled", "subscriptionCanceledImmediate", "subscriptionPlanSwitched", "refundIssued"].includes(name)
          ? "account"
          : ["newReviewForInstructor", "instructorReplyToReview", "reviewReported", "reviewHelpfulVote", "weeklyReviewSummary"].includes(name)
            ? "reviews"
            : "community";
        return `${group}.${name}`;
      }),
      ...methodsOf(AuthEmailTemplates).map((name) => `auth.${name}`),
      ...methodsOf(ContactEmailTemplates).map((name) => `contact.${name}`),
      ...Object.getOwnPropertyNames(SecurityEmailTemplates)
        .filter((name) => typeof (SecurityEmailTemplates as unknown as Record<string, unknown>)[name] === "function" && !["length", "name", "prototype"].includes(name))
        .map((name) => `security.${name}`),
    ]);
    // the payment templates are plain functions: the module's exports are the list
    for (const exported of ["refundConfirmationTemplate", "disputeOpenedTemplate"]) discovered.add(`payments-security.${exported}`);
    const missing = [...discovered].filter((name) => !(name in KNOWN));
    expect(missing, "templates without a hostile-input case").toEqual([]);
  });

  for (const [name, render] of Object.entries(KNOWN)) {
    it(`${name}: user text is text, links are safe, the subject is one line`, () => {
      const { subject, html } = render();

      // No markup of ours came from the input
      expect(html).not.toContain(`<img src=x onerror=${MARK}`);
      expect(html).not.toContain(`<script>${MARK}`);
      expect(html).not.toContain(`onerror=${MARK}>`);
      // No dangerous address reached a link or an image
      expect(html).not.toMatch(/(?:href|src)\s*=\s*["']?\s*javascript:/i);
      // The subject is a header: one line, so text like "Bcc:" in it cannot start a header of its own
      expect(subject).not.toMatch(LINE_BREAK);
      // The input is still shown, as text
      if (html.includes(MARK)) expect(html).toContain("&lt;");
    });
  }

  it("the text-only copy of a mail has no style or head content", () => {
    const text = htmlToText("<html><head><title>T</title><style>body{color:red}</style></head><body><p>Bonjour <b>vous</b></p></body></html>");
    expect(text).toBe("Bonjour vous");
  });
});

describe("emailLink", () => {
  it("keeps https, allows http only for a local host, and refuses everything else", () => {
    expect(emailLink("https://fygs.dev/a?b=1&c=2")).toBe("https://fygs.dev/a?b=1&amp;c=2");
    expect(emailLink("http://localhost:3100/x")).toBe("http://localhost:3100/x");
    for (const value of ["http://fygs.dev/x", "javascript:alert(1)", "data:text/html,x", "//evil.tld", "/relative", "", null, 3]) {
      expect(emailLink(value)).toBe("#");
    }
  });
});

describe("SMTP transport", () => {
  it("requires TLS (STARTTLS) for a remote server and at least TLS 1.2", () => {
    const remote = smtpOptions({ EMAIL_SERVER_HOST: "smtp.example.org", EMAIL_SERVER_PORT: "587" } as unknown as NodeJS.ProcessEnv);
    expect(remote.requireTLS).toBe(true);
    expect(remote.secure).toBe(false);
    expect(remote.tls.minVersion).toBe("TLSv1.2");
    const implicit = smtpOptions({ EMAIL_SERVER_HOST: "smtp.example.org", EMAIL_SERVER_PORT: "465" } as unknown as NodeJS.ProcessEnv);
    expect(implicit.secure).toBe(true);
    expect(implicit.requireTLS).toBe(false);
  });
  it("accepts a local mail catcher without TLS", () => {
    expect(smtpOptions({ EMAIL_SERVER_HOST: "localhost", EMAIL_SERVER_PORT: "1025" } as unknown as NodeJS.ProcessEnv).requireTLS).toBe(false);
  });
  it("sends to exactly one plain address", () => {
    expect(isSingleAddress("a.b+c@fygs.dev")).toBe(true);
    for (const value of ["a@b.fr, c@d.fr", "a@b.fr\r\nBcc: x@y.fr", "Name <a@b.fr>", "a@b", "@b.fr", "a@@b.fr", "a b@c.fr"]) {
      expect(isSingleAddress(value), value).toBe(false);
    }
  });
});
