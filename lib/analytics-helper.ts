/**
 * Analytics Events Helper
 * 
 * Centralized helper for emitting analytics events with standardized payload shapes
 * and PII protection. All events are logged without personally identifiable information.
 */

import { db } from '@/lib/db'

export type AnalyticsEventType = 
  | 'ENROLLMENT_CREATED'
  | 'COURSE_PURCHASED'
  | 'SUBSCRIPTION_STARTED'
  | 'SUBSCRIPTION_CANCELED'
  | 'SUBSCRIPTION_PLAN_SWITCHED'
  | 'REFUND_ISSUED'
  | 'LESSON_COMPLETED'
  | 'CERTIFICATE_ISSUED'
  | 'USER_REGISTERED'
  | 'LOGIN_SUCCESS'
  | 'RECOMMENDATION_IMPRESSION'
  | 'RECOMMENDATION_CLICK'
  | 'UPGRADE_CTA_SHOWN'
  | 'UPGRADE_CTA_CLICKED'
  | 'AI_ASSISTANT_REQUEST'

export interface AnalyticsEventPayload {
  userId: string
  type: AnalyticsEventType
  source: 'web' | 'api' | 'server' | 'webhook'
  properties: Record<string, any>
  sessionId?: string
}

export interface EnrollmentEventProperties {
  courseId: string
  courseTitle?: string
  courseTier: 'FREE' | 'PREMIUM'
  enrollmentSource: 'catalog' | 'recommendation' | 'direct_link' | 'admin'
  hasActiveSubscription: boolean
  timestamp: string
}

export interface PurchaseEventProperties {
  courseId?: string
  productType: 'course' | 'subscription'
  amount: number
  currency: string
  paymentMethod: string
  priceId?: string
  timestamp: string
}

export interface SubscriptionEventProperties {
  subscriptionId: string
  plan: 'monthly' | 'yearly' | 'lifetime'
  status: 'active' | 'canceled' | 'past_due' | 'trialing'
  amount?: number
  currency?: string
  timestamp: string
}

export interface RefundEventProperties {
  originalAmount: number
  refundAmount: number
  currency: string
  reason: string
  eligibilityWindow: number // days
  subscriptionId?: string
  courseId?: string
  timestamp: string
}

export interface LessonCompletionEventProperties {
  lessonId: string
  courseId: string
  lessonOrder: number
  watchTime: number
  completionPercentage: number
  isFirstCompletion: boolean
  timestamp: string
}

export interface CertificateEventProperties {
  certificateId: string
  courseId: string
  courseTitle?: string
  completionDate: string
  totalLessons: number
  totalWatchTime: number
  timestamp: string
}

export interface RecommendationEventProperties {
  recommendationType: 'similar_courses' | 'trending' | 'for_you' | 'category_based'
  courseIds: string[]
  position: number
  context: 'homepage' | 'course_page' | 'dashboard' | 'email'
  timestamp: string
}

export class AnalyticsHelper {
  /**
   * Emit an analytics event with correlation tracking
   */
  static async emit(payload: AnalyticsEventPayload): Promise<void> {
    try {
      // Validate required fields
      if (!payload.userId || !payload.type || !payload.source) {
        console.warn('[Analytics] Missing required fields:', { 
          hasUserId: !!payload.userId, 
          hasType: !!payload.type, 
          hasSource: !!payload.source 
        })
        return
      }

      // Strip PII from properties and add correlation tracking
      const sanitizedProperties = this.sanitizeProperties({
        ...payload.properties,
        correlationId: payload.properties.correlationId || this.generateCorrelationId()
      })

      // Create analytics event
      await db.analyticsEvent.create({
        data: {
          userId: payload.userId,
          type: payload.type,
          source: payload.source,
          properties: sanitizedProperties,
          sessionId: payload.sessionId,
          createdAt: new Date()
        }
      })

      // Log for debugging (development only)
      if (process.env.NODE_ENV === 'development') {
        console.log('[Analytics]', {
          type: payload.type,
          source: payload.source,
          userId: payload.userId.substring(0, 8) + '...',
          properties: sanitizedProperties
        })
      }
    } catch (error) {
      console.error('[Analytics] Failed to emit event:', error)
      // Don't throw - analytics failures shouldn't break user flows
    }
  }

  /**
   * Record enrollment event
   */
  static async recordEnrollment(
    userId: string, 
    properties: EnrollmentEventProperties & { correlationId?: string }
  ): Promise<void> {
    await this.emit({
      userId,
      type: 'ENROLLMENT_CREATED',
      source: 'server',
      properties
    })
  }

  /**
   * Record purchase event
   */
  static async recordPurchase(
    userId: string,
    properties: PurchaseEventProperties & { correlationId?: string }
  ): Promise<void> {
    await this.emit({
      userId,
      type: 'COURSE_PURCHASED',
      source: 'webhook',
      properties
    })
  }

  /**
   * Record subscription lifecycle events
   */
  static async recordSubscriptionEvent(
    userId: string,
    eventType: 'SUBSCRIPTION_STARTED' | 'SUBSCRIPTION_CANCELED',
    properties: SubscriptionEventProperties & { correlationId?: string }
  ): Promise<void> {
    await this.emit({
      userId,
      type: eventType,
      source: 'webhook',
      properties
    })
  }

  /**
   * Record refund event
   */
  static async recordRefund(
    userId: string,
    properties: RefundEventProperties & { correlationId?: string }
  ): Promise<void> {
    await this.emit({
      userId,
      type: 'REFUND_ISSUED',
      source: 'server',
      properties
    })
  }

  /**
   * Record lesson completion
   */
  static async recordLessonCompletion(
    userId: string,
    properties: LessonCompletionEventProperties & { correlationId?: string }
  ): Promise<void> {
    await this.emit({
      userId,
      type: 'LESSON_COMPLETED',
      source: 'server',
      properties
    })
  }

  /**
   * Record certificate issuance
   */
  static async recordCertificateIssuance(
    userId: string,
    properties: CertificateEventProperties & { correlationId?: string }
  ): Promise<void> {
    await this.emit({
      userId,
      type: 'CERTIFICATE_ISSUED',
      source: 'server',
      properties
    })
  }

  /**
   * Record recommendation events
   */
  static async recordRecommendationImpression(
    userId: string,
    properties: RecommendationEventProperties & { correlationId?: string }
  ): Promise<void> {
    await this.emit({
      userId,
      type: 'RECOMMENDATION_IMPRESSION',
      source: 'web',
      properties
    })
  }

  static async recordRecommendationClick(
    userId: string,
    properties: RecommendationEventProperties & { clickedCourseId: string; correlationId?: string }
  ): Promise<void> {
    await this.emit({
      userId,
      type: 'RECOMMENDATION_CLICK',
      source: 'web',
      properties
    })
  }

  /**
   * Sanitize properties to remove PII
   */
  private static sanitizeProperties(properties: Record<string, any>): Record<string, any> {
    const sanitized = { ...properties }
    
    // Remove or hash potential PII fields
    const piiFields = ['email', 'name', 'firstName', 'lastName', 'address', 'phone', 'ip']
    
    for (const field of piiFields) {
      if (sanitized[field]) {
        delete sanitized[field]
      }
    }

    // Hash user-specific identifiers while preserving referential integrity
    if (sanitized.stripeCustomerId && typeof sanitized.stripeCustomerId === 'string') {
      sanitized.stripeCustomerId = this.hashString(sanitized.stripeCustomerId)
    }

    if (sanitized.sessionId && typeof sanitized.sessionId === 'string') {
      sanitized.sessionId = this.hashString(sanitized.sessionId)
    }

    return sanitized
  }

  /**
   * Simple hash function for consistent anonymization
   */
  private static hashString(input: string): string {
    let hash = 0
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36)
  }

  /**
   * Generate correlation ID for tracking related events
   */
  static generateCorrelationId(): string {
    return 'corr_' + Date.now() + '_' + Math.random().toString(36).substring(2)
  }

  /**
   * Batch emit multiple events (for performance)
   */
  static async emitBatch(payloads: AnalyticsEventPayload[]): Promise<void> {
    try {
      const sanitizedPayloads = payloads.map(payload => ({
        userId: payload.userId,
        type: payload.type,
        source: payload.source,
        properties: this.sanitizeProperties({
          ...payload.properties,
          correlationId: payload.properties.correlationId || this.generateCorrelationId()
        }),
        sessionId: payload.sessionId,
        createdAt: new Date()
      }))

      await db.analyticsEvent.createMany({
        data: sanitizedPayloads
      })
    } catch (error) {
      console.error('[Analytics] Failed to emit batch events:', error)
    }
  }
}
// ─── Named event helpers (fire-and-forget) ───────────────────────────────────

export type AnalyticsContext = Record<string, unknown>;

export interface TrackEventInput {
  type: string;
  userId?: string;
  sessionId?: string;
  source?: "server" | "client" | "webhook";
  context?: AnalyticsContext;
}

/**
 * Fire-and-forget analytics event writer.
 * Swallows errors to avoid impacting UX/business flows.
 * Prefer the typed AnalyticsHelper.record* methods when one fits the event;
 * the Analytics.* helpers below keep the event type and source of each named
 * event in one place.
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
  subscriptionStarted: (userId: string, context?: AnalyticsContext) =>
    trackEvent({
      type: "SUBSCRIPTION_STARTED",
      userId,
      source: "webhook",
      context,
    }),
  subscriptionPlanSwitched: (userId: string, context?: AnalyticsContext) =>
    trackEvent({
      type: "SUBSCRIPTION_PLAN_SWITCHED",
      userId,
      source: "server",
      context,
    }),
  subscriptionUpdated: (userId: string, context?: AnalyticsContext) =>
    trackEvent({
      type: "SUBSCRIPTION_UPDATED",
      userId,
      source: "webhook",
      context,
    }),
  subscriptionRenewed: (userId: string, context?: AnalyticsContext) =>
    trackEvent({
      type: "SUBSCRIPTION_RENEWED",
      userId,
      source: "webhook",
      context,
    }),
  subscriptionCanceledSoft: (userId: string, context?: AnalyticsContext) =>
    trackEvent({
      type: "SUBSCRIPTION_CANCELED_SOFT",
      userId,
      source: "server",
      context,
    }),
  subscriptionCanceledImmediate: (userId: string, context?: AnalyticsContext) =>
    trackEvent({
      type: "SUBSCRIPTION_CANCELED_IMMEDIATE",
      userId,
      source: "server",
      context,
    }),
  coursePurchased: (userId: string, context?: AnalyticsContext) =>
    trackEvent({
      type: "COURSE_PURCHASED",
      userId,
      source: "webhook",
      context,
    }),
  courseEnrollmentExplicit: (userId: string, context?: AnalyticsContext) =>
    trackEvent({
      type: "COURSE_ENROLLMENT_EXPLICIT",
      userId,
      source: "server",
      context,
    }),
  courseRefunded: (userId: string, context?: AnalyticsContext) =>
    trackEvent({ type: "COURSE_REFUNDED", userId, source: "server", context }),
  lessonCompleted: (userId: string, context?: AnalyticsContext) =>
    trackEvent({ type: "LESSON_COMPLETED", userId, source: "server", context }),
  certificateIssued: (userId: string, context?: AnalyticsContext) =>
    trackEvent({
      type: "CERTIFICATE_ISSUED",
      userId,
      source: "server",
      context,
    }),
  previewViewed: (userId: string | undefined, context?: AnalyticsContext) =>
    trackEvent({ type: "PREVIEW_VIEWED", userId, source: "server", context }),
  recommendationShown: (userId: string, context?: AnalyticsContext) =>
    trackEvent({
      type: "RECOMMENDATION_SHOWN",
      userId,
      source: "server",
      context,
    }),
  recommendationClicked: (userId: string, context?: AnalyticsContext) =>
    trackEvent({
      type: "RECOMMENDATION_CLICKED",
      userId,
      source: "client",
      context,
    }),
  subscriptionPaymentFailed: (userId: string, context?: AnalyticsContext) =>
    trackEvent({
      type: "SUBSCRIPTION_PAYMENT_FAILED",
      userId,
      source: "webhook",
      context,
    }),
  courseCardViewed: (userId: string | undefined, context?: AnalyticsContext) =>
    trackEvent({
      type: "COURSE_CARD_VIEWED",
      userId,
      source: "client",
      context,
    }),
  courseCardCtaClicked: (userId: string | undefined, context?: AnalyticsContext) =>
    trackEvent({
      type: "COURSE_CARD_CTA_CLICKED",
      userId,
      source: "client",
      context,
    }),
  // Removed COURSE_OWNED_NOT_ENROLLED state; enrollment required for access visibility.
};
