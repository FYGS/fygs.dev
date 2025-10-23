import { AnalyticsHelper, type AnalyticsEventType } from "./analytics-helper";

export interface TrackEventInput {
  type: string;
  userId?: string;
  sessionId?: string;
  source?: "server" | "client" | "webhook";
  context?: Record<string, any>;
}

/**
 * Fire-and-forget analytics event writer.
 * Swallows errors to avoid impacting UX/business flows.
 *
 * @deprecated Use AnalyticsHelper methods directly for better type safety and PII handling
 */
export async function trackEvent(evt: TrackEventInput): Promise<void> {
  try {
    if (!evt.userId) {
      console.warn("[analytics] skipping event without userId", evt.type);
      return;
    }

    // Map source to AnalyticsHelper source types
    const source = evt.source === "client" ? "web" : evt.source || "server";

    await AnalyticsHelper.emit({
      type: evt.type as AnalyticsEventType,
      userId: evt.userId,
      sessionId: evt.sessionId,
      source: source as "server" | "webhook" | "web" | "api",
      properties: {
        ...evt.context,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (e) {
    console.warn("[analytics] failed to record event", evt.type, e);
  }
}

// Convenience helpers
export const Analytics = {
  subscriptionStarted: (userId: string, context?: any) =>
    trackEvent({
      type: "SUBSCRIPTION_STARTED",
      userId,
      source: "webhook",
      context,
    }),
  subscriptionPlanSwitched: (userId: string, context?: any) =>
    trackEvent({
      type: "SUBSCRIPTION_PLAN_SWITCHED",
      userId,
      source: "server",
      context,
    }),
  subscriptionUpdated: (userId: string, context?: any) =>
    trackEvent({
      type: "SUBSCRIPTION_UPDATED",
      userId,
      source: "webhook",
      context,
    }),
  subscriptionRenewed: (userId: string, context?: any) =>
    trackEvent({
      type: "SUBSCRIPTION_RENEWED",
      userId,
      source: "webhook",
      context,
    }),
  subscriptionCanceledSoft: (userId: string, context?: any) =>
    trackEvent({
      type: "SUBSCRIPTION_CANCELED_SOFT",
      userId,
      source: "server",
      context,
    }),
  subscriptionCanceledImmediate: (userId: string, context?: any) =>
    trackEvent({
      type: "SUBSCRIPTION_CANCELED_IMMEDIATE",
      userId,
      source: "server",
      context,
    }),
  coursePurchased: (userId: string, context?: any) =>
    trackEvent({
      type: "COURSE_PURCHASED",
      userId,
      source: "webhook",
      context,
    }),
  courseEnrollmentExplicit: (userId: string, context?: any) =>
    trackEvent({
      type: "COURSE_ENROLLMENT_EXPLICIT",
      userId,
      source: "server",
      context,
    }),
  courseRefunded: (userId: string, context?: any) =>
    trackEvent({ type: "COURSE_REFUNDED", userId, source: "server", context }),
  lessonCompleted: (userId: string, context?: any) =>
    trackEvent({ type: "LESSON_COMPLETED", userId, source: "server", context }),
  certificateIssued: (userId: string, context?: any) =>
    trackEvent({
      type: "CERTIFICATE_ISSUED",
      userId,
      source: "server",
      context,
    }),
  previewViewed: (userId: string | undefined, context?: any) =>
    trackEvent({ type: "PREVIEW_VIEWED", userId, source: "server", context }),
  recommendationShown: (userId: string, context?: any) =>
    trackEvent({
      type: "RECOMMENDATION_SHOWN",
      userId,
      source: "server",
      context,
    }),
  recommendationClicked: (userId: string, context?: any) =>
    trackEvent({
      type: "RECOMMENDATION_CLICKED",
      userId,
      source: "client",
      context,
    }),
  subscriptionPaymentFailed: (userId: string, context?: any) =>
    trackEvent({
      type: "SUBSCRIPTION_PAYMENT_FAILED",
      userId,
      source: "webhook",
      context,
    }),
  courseCardViewed: (userId: string | undefined, context?: any) =>
    trackEvent({
      type: "COURSE_CARD_VIEWED",
      userId,
      source: "client",
      context,
    }),
  courseCardCtaClicked: (userId: string | undefined, context?: any) =>
    trackEvent({
      type: "COURSE_CARD_CTA_CLICKED",
      userId,
      source: "client",
      context,
    }),
  // Removed COURSE_OWNED_NOT_ENROLLED state; enrollment required for access visibility.
};
