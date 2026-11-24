import { AccountEmailTemplates } from "./account";
import { CommunityEmailTemplates } from "./community";
import { ReviewEmailTemplates } from "./reviews";

/**
 * Facade keeping the historical `ModernEmailTemplates` API: every template is
 * implemented in a domain module and exposed here as a static member.
 */
export class ModernEmailTemplates {
  static welcomeRegistration = AccountEmailTemplates.welcomeRegistration;
  static coursePurchase = AccountEmailTemplates.coursePurchase;
  static premiumSubscription = AccountEmailTemplates.premiumSubscription;
  static subscriptionUpdated = AccountEmailTemplates.subscriptionUpdated;
  static passwordChanged = AccountEmailTemplates.passwordChanged;
  static paymentFailed = AccountEmailTemplates.paymentFailed;
  static subscriptionCanceled = AccountEmailTemplates.subscriptionCanceled;
  static subscriptionCanceledImmediate = AccountEmailTemplates.subscriptionCanceledImmediate;
  static subscriptionPlanSwitched = AccountEmailTemplates.subscriptionPlanSwitched;
  static refundIssued = AccountEmailTemplates.refundIssued;
  static newReviewForInstructor = ReviewEmailTemplates.newReviewForInstructor;
  static instructorReplyToReview = ReviewEmailTemplates.instructorReplyToReview;
  static reviewReported = ReviewEmailTemplates.reviewReported;
  static reviewHelpfulVote = ReviewEmailTemplates.reviewHelpfulVote;
  static weeklyReviewSummary = ReviewEmailTemplates.weeklyReviewSummary;
  static discussionReply = CommunityEmailTemplates.discussionReply;
  static newFollower = CommunityEmailTemplates.newFollower;
  static mentorRequest = CommunityEmailTemplates.mentorRequest;
  static mentorResponse = CommunityEmailTemplates.mentorResponse;
  static badgeEarned = CommunityEmailTemplates.badgeEarned;
  static communityWeeklyDigest = CommunityEmailTemplates.communityWeeklyDigest;
}
