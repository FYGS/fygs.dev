/**
 * Characterization tests: lib/analytics.ts (trackEvent + Analytics.*)
 *
 * Freezes (1) the set of event names and sources each convenience helper
 * emits and (2) the fire-and-forget contract of trackEvent, before the
 * analytics modules are consolidated (refactor stage 3). A mapping slip would
 * silently corrupt persisted analytics data, so the record below must stay
 * identical unless a change is deliberate.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const { emit } = vi.hoisted(() => ({ emit: vi.fn() }));

vi.mock("@/lib/analytics-helper", () => ({
  AnalyticsHelper: { emit },
}));

import { Analytics, trackEvent } from "@/lib/analytics";

beforeEach(() => {
  emit.mockReset();
  emit.mockResolvedValue(undefined);
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

describe("Analytics.* helpers: emitted event type and source", () => {
  it("matches the recorded mapping for every helper", async () => {
    const record: Record<string, { type: string; source: string }> = {};
    for (const [name, helper] of Object.entries(Analytics)) {
      emit.mockClear();
      await (helper as (userId: string, context?: object) => Promise<void>)(
        "user-1",
        { probe: true },
      );
      expect(emit).toHaveBeenCalledTimes(1);
      const arg = emit.mock.calls[0][0];
      record[name] = { type: arg.type, source: arg.source };
    }
    expect(record).toMatchInlineSnapshot(`
      {
        "certificateIssued": {
          "source": "server",
          "type": "CERTIFICATE_ISSUED",
        },
        "courseCardCtaClicked": {
          "source": "web",
          "type": "COURSE_CARD_CTA_CLICKED",
        },
        "courseCardViewed": {
          "source": "web",
          "type": "COURSE_CARD_VIEWED",
        },
        "courseEnrollmentExplicit": {
          "source": "server",
          "type": "COURSE_ENROLLMENT_EXPLICIT",
        },
        "coursePurchased": {
          "source": "webhook",
          "type": "COURSE_PURCHASED",
        },
        "courseRefunded": {
          "source": "server",
          "type": "COURSE_REFUNDED",
        },
        "lessonCompleted": {
          "source": "server",
          "type": "LESSON_COMPLETED",
        },
        "previewViewed": {
          "source": "server",
          "type": "PREVIEW_VIEWED",
        },
        "recommendationClicked": {
          "source": "web",
          "type": "RECOMMENDATION_CLICKED",
        },
        "recommendationShown": {
          "source": "server",
          "type": "RECOMMENDATION_SHOWN",
        },
        "subscriptionCanceledImmediate": {
          "source": "server",
          "type": "SUBSCRIPTION_CANCELED_IMMEDIATE",
        },
        "subscriptionCanceledSoft": {
          "source": "server",
          "type": "SUBSCRIPTION_CANCELED_SOFT",
        },
        "subscriptionPaymentFailed": {
          "source": "webhook",
          "type": "SUBSCRIPTION_PAYMENT_FAILED",
        },
        "subscriptionPlanSwitched": {
          "source": "server",
          "type": "SUBSCRIPTION_PLAN_SWITCHED",
        },
        "subscriptionRenewed": {
          "source": "webhook",
          "type": "SUBSCRIPTION_RENEWED",
        },
        "subscriptionStarted": {
          "source": "webhook",
          "type": "SUBSCRIPTION_STARTED",
        },
        "subscriptionUpdated": {
          "source": "webhook",
          "type": "SUBSCRIPTION_UPDATED",
        },
      }
    `);
  });

  it("forwards context as properties and adds an ISO timestamp", async () => {
    await Analytics.lessonCompleted("user-1", { lessonId: "l1", courseId: "c1" });
    const arg = emit.mock.calls[0][0];
    expect(arg.userId).toBe("user-1");
    expect(arg.properties.lessonId).toBe("l1");
    expect(arg.properties.courseId).toBe("c1");
    expect(new Date(arg.properties.timestamp).toISOString()).toBe(
      arg.properties.timestamp,
    );
  });
});

describe("trackEvent contract", () => {
  it("skips events without a userId and does not emit", async () => {
    await trackEvent({ type: "PREVIEW_VIEWED" });
    expect(emit).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalled();
  });

  it("maps source 'client' to 'web'", async () => {
    await trackEvent({ type: "COURSE_CARD_VIEWED", userId: "u", source: "client" });
    expect(emit.mock.calls[0][0].source).toBe("web");
  });

  it("defaults the source to 'server'", async () => {
    await trackEvent({ type: "LESSON_COMPLETED", userId: "u" });
    expect(emit.mock.calls[0][0].source).toBe("server");
  });

  it("keeps 'webhook' as is and forwards sessionId", async () => {
    await trackEvent({
      type: "COURSE_PURCHASED",
      userId: "u",
      source: "webhook",
      sessionId: "s1",
    });
    expect(emit.mock.calls[0][0]).toMatchObject({ source: "webhook", sessionId: "s1" });
  });

  it("never throws when the writer fails", async () => {
    emit.mockRejectedValue(new Error("db down"));
    await expect(
      trackEvent({ type: "LESSON_COMPLETED", userId: "u" }),
    ).resolves.toBeUndefined();
    expect(console.warn).toHaveBeenCalled();
  });

  it("awaits the writer (callers that await it wait for the insert)", async () => {
    let finished = false;
    emit.mockImplementation(
      () =>
        new Promise<void>((resolve) =>
          setTimeout(() => {
            finished = true;
            resolve();
          }, 20),
        ),
    );
    await trackEvent({ type: "LESSON_COMPLETED", userId: "u" });
    expect(finished).toBe(true);
  });
});
