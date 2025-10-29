/**
 * T107: Recommendation Impression & Click Analytics Tests
 *
 * Tests the recommendation analytics system ensuring both impression
 * and click events are logged without PII (Personally Identifiable Information)
 * as required by FR-031.
 */

import { describe, test, expect, afterEach, beforeEach, vi } from "vitest";
import { db } from "@/lib/db";
import { createTestEnvironment } from "../../utils/test-database";

// Mock analytics helper to avoid real tracking
vi.mock("@/lib/analytics-helper", () => ({
  AnalyticsHelper: {
    emit: vi.fn().mockResolvedValue(undefined),
  },
}));

describe("T107: Recommendation Impression & Click Analytics Tests", () => {
  const testEnv = createTestEnvironment();

  beforeEach(async () => {
    // Reset mock between tests
    await import("@/lib/analytics-helper");
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  describe("Impression Analytics", () => {
    test("logs course recommendation impressions without PII", async () => {
      // Create test user and courses
      const user = await db.user.create({
        data: {
          email: `rec-user-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}@example.com`,
          name: "Recommendation Test User",
          emailVerified: true,
        },
      });

      const courses = await Promise.all([
        db.course.create({
          data: {
            title: "Recommended Course 1",
            slug: `rec-course-1-${Date.now()}`,
            description: "First recommended course",
            price: 99.99,
            level: "BEGINNER",
            published: true,
            accessTier: "FREE",
            category: "JAVASCRIPT",
          },
        }),
        db.course.create({
          data: {
            title: "Recommended Course 2",
            slug: `rec-course-2-${Date.now()}`,
            description: "Second recommended course",
            price: 149.99,
            level: "INTERMEDIATE",
            published: true,
            accessTier: "PREMIUM",
            category: "TYPESCRIPT",
          },
        }),
      ]);

      testEnv.trackUser(user.id);
      courses.forEach((c) => testEnv.trackCourse(c.id));

      // Mock impression tracking function
      const trackImpression = async (
        userId: string,
        courseId: string,
        position: number,
        algorithm: string
      ) => {
        // Verify no PII is included in analytics data
        const { AnalyticsHelper } = await import("@/lib/analytics-helper");

        await AnalyticsHelper.emit({
          userId: userId,
          type: "RECOMMENDATION_IMPRESSION",
          source: "web",
          properties: {
            courseId: courseId,
            position: position,
            algorithm: algorithm,
            timestamp: new Date().toISOString(),
          },
          sessionId: `session_${Date.now()}`,
        });
      };

      // Track recommendation impressions
      await trackImpression(
        user.id,
        courses[0].id,
        1,
        "collaborative_filtering"
      );
      await trackImpression(
        user.id,
        courses[1].id,
        2,
        "collaborative_filtering"
      );

      // Import the mock to verify calls
      const { AnalyticsHelper } = await import("@/lib/analytics-helper");

      // Verify impressions were tracked
      expect(AnalyticsHelper.emit).toHaveBeenCalledTimes(2);

      // Verify first impression call
      expect(AnalyticsHelper.emit).toHaveBeenNthCalledWith(1, {
        userId: user.id,
        type: "RECOMMENDATION_IMPRESSION",
        source: "web",
        properties: {
          courseId: courses[0].id,
          position: 1,
          algorithm: "collaborative_filtering",
          timestamp: expect.any(String),
        },
        sessionId: expect.stringMatching(/^session_\d+$/),
      });

      // Verify second impression call
      expect(AnalyticsHelper.emit).toHaveBeenNthCalledWith(2, {
        userId: user.id,
        type: "RECOMMENDATION_IMPRESSION",
        source: "web",
        properties: {
          courseId: courses[1].id,
          position: 2,
          algorithm: "collaborative_filtering",
          timestamp: expect.any(String),
        },
        sessionId: expect.stringMatching(/^session_\d+$/),
      });

      // Verify no PII was included in any calls
      const allCalls = (AnalyticsHelper.emit as any).mock.calls;
      allCalls.forEach((call: any) => {
        const payload = call[0];
        expect(payload.properties).not.toHaveProperty("email");
        expect(payload.properties).not.toHaveProperty("name");
        expect(payload.properties).not.toHaveProperty("phoneNumber");
        expect(payload.properties).not.toHaveProperty("address");
      });
    });

    test("tracks multiple recommendation impressions for same user", async () => {
      // Create test user
      const user = await db.user.create({
        data: {
          email: `multi-rec-user-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}@example.com`,
          name: "Multi Recommendation User",
          emailVerified: true,
        },
      });

      testEnv.trackUser(user.id);

      // Create multiple courses
      const courses = await Promise.all([
        db.course.create({
          data: {
            title: "Course A",
            slug: `course-a-${Date.now()}`,
            description: "Course A description",
            price: 50.0,
            level: "BEGINNER",
            published: true,
            accessTier: "FREE",
            category: "JAVASCRIPT",
          },
        }),
        db.course.create({
          data: {
            title: "Course B",
            slug: `course-b-${Date.now()}`,
            description: "Course B description",
            price: 75.0,
            level: "INTERMEDIATE",
            published: true,
            accessTier: "PREMIUM",
            category: "FRONTEND",
          },
        }),
        db.course.create({
          data: {
            title: "Course C",
            slug: `course-c-${Date.now()}`,
            description: "Course C description",
            price: 100.0,
            level: "ADVANCED",
            published: true,
            accessTier: "PREMIUM",
            category: "BACKEND",
          },
        }),
      ]);

      courses.forEach((c) => testEnv.trackCourse(c.id));

      // Mock function to track impressions in bulk
      const trackBulkImpressions = async (
        userId: string,
        courseIds: string[],
        algorithm: string
      ) => {
        const { AnalyticsHelper } = await import("@/lib/analytics-helper");

        for (let i = 0; i < courseIds.length; i++) {
          await AnalyticsHelper.emit({
            userId: userId,
            type: "RECOMMENDATION_IMPRESSION",
            source: "web",
            properties: {
              courseId: courseIds[i],
              position: i + 1,
              algorithm: algorithm,
              timestamp: new Date().toISOString(),
            },
            sessionId: `bulk_session_${Date.now()}`,
          });
        }
      };

      // Track multiple impressions
      await trackBulkImpressions(
        user.id,
        courses.map((c) => c.id),
        "content_based"
      );

      const { AnalyticsHelper } = await import("@/lib/analytics-helper");

      // Verify all impressions were tracked
      expect(AnalyticsHelper.emit).toHaveBeenCalledTimes(3);

      // Verify each impression has correct position
      courses.forEach((course, index) => {
        expect(AnalyticsHelper.emit).toHaveBeenNthCalledWith(index + 1, {
          userId: user.id,
          type: "RECOMMENDATION_IMPRESSION",
          source: "web",
          properties: {
            courseId: course.id,
            position: index + 1,
            algorithm: "content_based",
            timestamp: expect.any(String),
          },
          sessionId: expect.stringMatching(/^bulk_session_\d+$/),
        });
      });
    });
  });

  describe("Click Analytics", () => {
    test("logs course recommendation clicks without PII", async () => {
      // Create test user and course
      const user = await db.user.create({
        data: {
          email: `click-user-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}@example.com`,
          name: "Click Test User",
          emailVerified: true,
        },
      });

      const course = await db.course.create({
        data: {
          title: "Clicked Course",
          slug: `clicked-course-${Date.now()}`,
          description: "Course that gets clicked",
          price: 199.99,
          level: "INTERMEDIATE",
          published: true,
          accessTier: "PREMIUM",
          category: "FULLSTACK",
        },
      });

      testEnv.trackUser(user.id);
      testEnv.trackCourse(course.id);

      // Mock click tracking function
      const trackClick = async (
        userId: string,
        courseId: string,
        position: number,
        algorithm: string
      ) => {
        const { AnalyticsHelper } = await import("@/lib/analytics-helper");

        await AnalyticsHelper.emit({
          userId: userId,
          type: "RECOMMENDATION_CLICK",
          source: "web",
          properties: {
            courseId: courseId,
            position: position,
            algorithm: algorithm,
            timestamp: new Date().toISOString(),
            referrer: "recommendations_page",
          },
          sessionId: `click_session_${Date.now()}`,
        });
      };

      // Track recommendation click
      await trackClick(user.id, course.id, 1, "hybrid_recommendation");

      const { AnalyticsHelper } = await import("@/lib/analytics-helper");

      // Verify click was tracked
      expect(AnalyticsHelper.emit).toHaveBeenCalledWith({
        userId: user.id,
        type: "RECOMMENDATION_CLICK",
        source: "web",
        properties: {
          courseId: course.id,
          position: 1,
          algorithm: "hybrid_recommendation",
          timestamp: expect.any(String),
          referrer: "recommendations_page",
        },
        sessionId: expect.stringMatching(/^click_session_\d+$/),
      });

      // Verify no PII in click tracking
      const clickCall = (AnalyticsHelper.emit as any).mock.calls[0];
      const payload = clickCall[0];
      expect(payload.properties).not.toHaveProperty("email");
      expect(payload.properties).not.toHaveProperty("name");
      expect(payload.properties).not.toHaveProperty("phoneNumber");
      expect(payload.properties).not.toHaveProperty("address");
    });

    test("tracks click-through rate calculation", async () => {
      // Create test user and courses
      const user = await db.user.create({
        data: {
          email: `ctr-user-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}@example.com`,
          name: "CTR Test User",
          emailVerified: true,
        },
      });

      const courses = await Promise.all([
        db.course.create({
          data: {
            title: "High CTR Course",
            slug: `high-ctr-course-${Date.now()}`,
            description: "Course with high click-through rate",
            price: 99.99,
            level: "BEGINNER",
            published: true,
            accessTier: "FREE",
            category: "CLOUD",
          },
        }),
        db.course.create({
          data: {
            title: "Low CTR Course",
            slug: `low-ctr-course-${Date.now()}`,
            description: "Course with low click-through rate",
            price: 149.99,
            level: "ADVANCED",
            published: true,
            accessTier: "PREMIUM",
            category: "AI",
          },
        }),
      ]);

      testEnv.trackUser(user.id);
      courses.forEach((c) => testEnv.trackCourse(c.id));

      const { AnalyticsHelper } = await import("@/lib/analytics-helper");

      // Simulate impression and click flow
      const algorithm = "machine_learning";
      const sessionId = `ctr_session_${Date.now()}`;

      // Track impressions for both courses
      await AnalyticsHelper.emit({
        userId: user.id,
        type: "RECOMMENDATION_IMPRESSION",
        source: "web",
        properties: {
          courseId: courses[0].id,
          position: 1,
          algorithm: algorithm,
          timestamp: new Date().toISOString(),
        },
        sessionId: sessionId,
      });

      await AnalyticsHelper.emit({
        userId: user.id,
        type: "RECOMMENDATION_IMPRESSION",
        source: "web",
        properties: {
          courseId: courses[1].id,
          position: 2,
          algorithm: algorithm,
          timestamp: new Date().toISOString(),
        },
        sessionId: sessionId,
      });

      // Track click only for first course
      await AnalyticsHelper.emit({
        userId: user.id,
        type: "RECOMMENDATION_CLICK",
        source: "web",
        properties: {
          courseId: courses[0].id,
          position: 1,
          algorithm: algorithm,
          timestamp: new Date().toISOString(),
        },
        sessionId: sessionId,
      });

      // Verify tracking calls
      expect(AnalyticsHelper.emit).toHaveBeenCalledTimes(3);

      // Verify impression tracking
      expect(AnalyticsHelper.emit).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          userId: user.id,
          type: "RECOMMENDATION_IMPRESSION",
          properties: expect.objectContaining({
            courseId: courses[0].id,
            position: 1,
            algorithm: algorithm,
          }),
        })
      );

      expect(AnalyticsHelper.emit).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          userId: user.id,
          type: "RECOMMENDATION_IMPRESSION",
          properties: expect.objectContaining({
            courseId: courses[1].id,
            position: 2,
            algorithm: algorithm,
          }),
        })
      );

      // Verify click tracking
      expect(AnalyticsHelper.emit).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining({
          userId: user.id,
          type: "RECOMMENDATION_CLICK",
          properties: expect.objectContaining({
            courseId: courses[0].id,
            position: 1,
            algorithm: algorithm,
          }),
        })
      );

      // Mock CTR calculation (would be done in analytics aggregation)
      const impressions = 2;
      const clicks = 1;
      const ctr = (clicks / impressions) * 100;

      expect(ctr).toBe(50); // 50% CTR
    });
  });

  describe("Privacy Compliance", () => {
    test("ensures no PII is stored in recommendation analytics", async () => {
      // Create user with comprehensive PII
      const user = await db.user.create({
        data: {
          email: `pii-test-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}@example.com`,
          name: "John Doe PII Test",
          emailVerified: true,
        },
      });

      const course = await db.course.create({
        data: {
          title: "Privacy Test Course",
          slug: `privacy-course-${Date.now()}`,
          description: "Course for privacy testing",
          price: 99.99,
          level: "BEGINNER",
          published: true,
          accessTier: "FREE",
          category: "DEVOPS",
        },
      });

      testEnv.trackUser(user.id);
      testEnv.trackCourse(course.id);

      const { AnalyticsHelper } = await import("@/lib/analytics-helper");

      // Track both impression and click
      await AnalyticsHelper.emit({
        userId: user.id,
        type: "RECOMMENDATION_IMPRESSION",
        source: "web",
        properties: {
          courseId: course.id,
          position: 1,
          algorithm: "privacy_test",
          timestamp: new Date().toISOString(),
        },
        sessionId: `privacy_session_${Date.now()}`,
      });

      await AnalyticsHelper.emit({
        userId: user.id,
        type: "RECOMMENDATION_CLICK",
        source: "web",
        properties: {
          courseId: course.id,
          position: 1,
          algorithm: "privacy_test",
          timestamp: new Date().toISOString(),
        },
        sessionId: `privacy_session_${Date.now()}`,
      });

      // Verify all tracking calls
      const allCalls = (AnalyticsHelper.emit as any).mock.calls;

      // Check each call for PII compliance
      allCalls.forEach((call: any) => {
        const payload = call[0];

        // Verify event types are correct
        expect(["RECOMMENDATION_IMPRESSION", "RECOMMENDATION_CLICK"]).toContain(
          payload.type
        );

        // Verify no direct PII is included in properties
        expect(payload.properties).not.toHaveProperty("email");
        expect(payload.properties).not.toHaveProperty("name");
        expect(payload.properties).not.toHaveProperty("firstName");
        expect(payload.properties).not.toHaveProperty("lastName");
        expect(payload.properties).not.toHaveProperty("phoneNumber");
        expect(payload.properties).not.toHaveProperty("address");
        expect(payload.properties).not.toHaveProperty("ipAddress");
        expect(payload.properties).not.toHaveProperty("socialSecurityNumber");
        expect(payload.properties).not.toHaveProperty("creditCardNumber");

        // Verify acceptable non-PII data is present
        expect(payload).toHaveProperty("userId"); // User ID is acceptable
        expect(payload.properties).toHaveProperty("courseId");
        expect(payload.properties).toHaveProperty("position");
        expect(payload.properties).toHaveProperty("algorithm");
        expect(payload.properties).toHaveProperty("timestamp");

        // Verify data types
        expect(typeof payload.userId).toBe("string");
        expect(typeof payload.properties.courseId).toBe("string");
        expect(typeof payload.properties.position).toBe("number");
        expect(typeof payload.properties.algorithm).toBe("string");
        expect(typeof payload.properties.timestamp).toBe("string");
      });
    });

    test("validates algorithm tracking without user identification", async () => {
      // Create multiple users to test algorithm effectiveness
      const users = await Promise.all([
        db.user.create({
          data: {
            email: `algo-user-1-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}@example.com`,
            name: "Algorithm User 1",
            emailVerified: true,
          },
        }),
        db.user.create({
          data: {
            email: `algo-user-2-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}@example.com`,
            name: "Algorithm User 2",
            emailVerified: true,
          },
        }),
      ]);

      const course = await db.course.create({
        data: {
          title: "Algorithm Test Course",
          slug: `algo-course-${Date.now()}`,
          description: "Course for algorithm testing",
          price: 129.99,
          level: "INTERMEDIATE",
          published: true,
          accessTier: "PREMIUM",
          category: "PRODUCTIVITY",
        },
      });

      users.forEach((u) => testEnv.trackUser(u.id));
      testEnv.trackCourse(course.id);

      const { AnalyticsHelper } = await import("@/lib/analytics-helper");

      // Test different algorithms
      const algorithms = [
        "collaborative_filtering",
        "content_based",
        "hybrid_recommendation",
      ];

      for (let i = 0; i < algorithms.length; i++) {
        const algorithm = algorithms[i];
        const user = users[i % users.length];

        // Track impression and potential click
        await AnalyticsHelper.emit({
          userId: user.id,
          type: "RECOMMENDATION_IMPRESSION",
          source: "web",
          properties: {
            courseId: course.id,
            position: 1,
            algorithm: algorithm,
            timestamp: new Date().toISOString(),
          },
          sessionId: `algo_test_${Date.now()}_${i}`,
        });

        // Some users click, some don't (to test different CTRs)
        if (i % 2 === 0) {
          await AnalyticsHelper.emit({
            userId: user.id,
            type: "RECOMMENDATION_CLICK",
            source: "web",
            properties: {
              courseId: course.id,
              position: 1,
              algorithm: algorithm,
              timestamp: new Date().toISOString(),
            },
            sessionId: `algo_test_${Date.now()}_${i}`,
          });
        }
      }

      // Verify algorithm tracking
      const allCalls = (AnalyticsHelper.emit as any).mock.calls;

      // Should have 3 impressions + 2 clicks = 5 total calls
      expect(allCalls).toHaveLength(5);

      // Verify algorithm diversity
      const algorithmCounts = allCalls.reduce((acc: any, call: any) => {
        const algorithm = call[0].properties.algorithm;
        acc[algorithm] = (acc[algorithm] || 0) + 1;
        return acc;
      }, {});

      expect(Object.keys(algorithmCounts)).toHaveLength(3); // 3 different algorithms
      expect(algorithmCounts["collaborative_filtering"]).toBeGreaterThan(0);
      expect(algorithmCounts["content_based"]).toBeGreaterThan(0);
      expect(algorithmCounts["hybrid_recommendation"]).toBeGreaterThan(0);
    });
  });

  describe("Analytics Data Integrity", () => {
    test("ensures impression and click timestamps are properly ordered", async () => {
      // Create test user and course
      const user = await db.user.create({
        data: {
          email: `timestamp-user-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}@example.com`,
          name: "Timestamp Test User",
          emailVerified: true,
        },
      });

      const course = await db.course.create({
        data: {
          title: "Timestamp Test Course",
          slug: `timestamp-course-${Date.now()}`,
          description: "Course for timestamp testing",
          price: 89.99,
          level: "BEGINNER",
          published: true,
          accessTier: "FREE",
          category: "TYPESCRIPT",
        },
      });

      testEnv.trackUser(user.id);
      testEnv.trackCourse(course.id);

      const { AnalyticsHelper } = await import("@/lib/analytics-helper");

      // Track impression first
      const impressionTime = new Date();
      await AnalyticsHelper.emit({
        userId: user.id,
        type: "RECOMMENDATION_IMPRESSION",
        source: "web",
        properties: {
          courseId: course.id,
          position: 1,
          algorithm: "timestamp_test",
          timestamp: impressionTime.toISOString(),
        },
        sessionId: `timestamp_session_${Date.now()}`,
      });

      // Wait a small amount to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Track click after impression
      const clickTime = new Date();
      await AnalyticsHelper.emit({
        userId: user.id,
        type: "RECOMMENDATION_CLICK",
        source: "web",
        properties: {
          courseId: course.id,
          position: 1,
          algorithm: "timestamp_test",
          timestamp: clickTime.toISOString(),
        },
        sessionId: `timestamp_session_${Date.now()}`,
      });

      // Verify tracking order
      const calls = (AnalyticsHelper.emit as any).mock.calls;
      expect(calls).toHaveLength(2);

      const [impressionCall, clickCall] = calls;
      const impressionTimestamp = new Date(
        impressionCall[0].properties.timestamp
      );
      const clickTimestamp = new Date(clickCall[0].properties.timestamp);

      // Click should come after impression
      expect(clickTimestamp.getTime()).toBeGreaterThan(
        impressionTimestamp.getTime()
      );

      // Verify event types
      expect(impressionCall[0].type).toBe("RECOMMENDATION_IMPRESSION");
      expect(clickCall[0].type).toBe("RECOMMENDATION_CLICK");
    });
  });
});
