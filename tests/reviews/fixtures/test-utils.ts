/**
 * Test utilities for review system testing
 * Provides database setup, mocking, and common test helpers
 */

import { beforeEach, afterEach, vi, expect } from "vitest";
import type { PrismaClient } from "@/lib/generated/prisma/client";
import { createTestClient, resetDatabase } from "../../support/test-db";
import type { User } from "../../../lib/auth";
import { seedData, mockUsers } from "./review-fixtures";

// Mock database client for unit tests
export const mockDb = {
  review: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
    createMany: vi.fn(),
    updateMany: vi.fn(),
    deleteMany: vi.fn(),
    aggregate: vi.fn(),
  },
  reviewVote: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    upsert: vi.fn(),
  },
  reviewReply: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  reviewReport: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  user: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
  course: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
  $transaction: vi.fn(),
  $queryRaw: vi.fn(),
};

// Redis mock for caching tests
export const mockRedis = {
  getJSON: vi.fn(),
  setJSON: vi.fn(),
  delete: vi.fn(),
  deletePattern: vi.fn(),
  flushAll: vi.fn(),
  ping: vi.fn(),
  info: vi.fn(),
  keys: vi.fn(),
  multi: vi.fn(),
};

// Auth mock for testing different user roles
export const mockAuth = {
  getUser: vi.fn(),
  requireAuth: vi.fn(),
  requireRole: vi.fn(),
  checkPermission: vi.fn(),
};

// Email service mock
export const mockEmailService = {
  sendReviewNotification: vi.fn(),
  sendModerationAlert: vi.fn(),
  sendWeeklySummary: vi.fn(),
  sendInstructorDigest: vi.fn(),
};

/**
 * Database test utilities for integration tests
 */
export class DatabaseTestUtils {
  private static prisma: PrismaClient;

  static async setup() {
    this.prisma = createTestClient();

    // Clean database
    await this.cleanup();
  }

  static async cleanup() {
    if (!this.prisma) return;

    // Truncate everything: the code under test writes other tables too
    // (analytics events, enrollments...) through its own client
    await resetDatabase(this.prisma);
  }

  static async seedTestData() {
    if (!this.prisma) throw new Error("Database not initialized");

    // Create users
    for (const userData of seedData.users) {
      await this.prisma.user.upsert({
        where: { id: userData.id },
        update: userData,
        create: userData,
      });
    }

    // Create courses
    for (const courseData of seedData.courses) {
      await this.prisma.course.upsert({
        where: { id: courseData.id },
        update: courseData,
        create: courseData,
      });
    }

    // Create reviews
    for (const reviewData of seedData.reviews) {
      await this.prisma.review.upsert({
        where: { id: reviewData.id },
        update: reviewData,
        create: reviewData,
      });
    }

    // Create review votes
    for (const voteData of seedData.reviewVotes) {
      await this.prisma.reviewVote.upsert({
        where: { id: voteData.id },
        update: voteData,
        create: voteData,
      });
    }

    // Create review replies
    for (const replyData of seedData.reviewReplies) {
      await this.prisma.reviewReply.upsert({
        where: { id: replyData.id },
        update: replyData,
        create: replyData,
      });
    }

    // Create review reports
    for (const reportData of seedData.reviewReports) {
      await this.prisma.reviewReport.upsert({
        where: { id: reportData.id },
        update: reportData,
        create: reportData,
      });
    }
  }

  static async teardown() {
    if (this.prisma) {
      await this.cleanup();
      await this.prisma.$disconnect();
    }
  }

  static getPrisma() {
    return this.prisma;
  }
}

/**
 * Mock API request/response utilities
 */
export class MockApiUtils {
  static createMockRequest(
    options: {
      method?: string;
      body?: any;
      query?: Record<string, string>;
      headers?: Record<string, string>;
      user?: typeof mockUsers.student;
    } = {}
  ) {
    const { method = "GET", body, query = {}, headers = {}, user } = options;

    return {
      method,
      body: body ? JSON.stringify(body) : undefined,
      json: vi.fn().mockResolvedValue(body),
      headers: new Headers({
        "content-type": "application/json",
        ...headers,
      }),
      url: `http://localhost:3000/api/reviews?${new URLSearchParams(query)}`,
      nextUrl: {
        searchParams: new URLSearchParams(query),
      },
      // Add user to request for auth testing
      user,
    };
  }

  static createMockResponse() {
    const headers = new Headers();
    const response = {
      headers,
      status: 200,
      json: vi.fn(),
      text: vi.fn(),
    };

    return {
      ...response,
      Response: {
        json: (data: any, init?: ResponseInit) => {
          response.status = init?.status || 200;
          return new Response(JSON.stringify(data), {
            status: response.status,
            headers: response.headers,
          });
        },
        error: (message: string, init?: ResponseInit) => {
          response.status = init?.status || 500;
          return new Response(JSON.stringify({ error: message }), {
            status: response.status,
            headers: response.headers,
          });
        },
      },
    };
  }
}

/**
 * Test authentication utilities
 */
export class AuthTestUtils {
  static mockUserSession(user: User | null = null) {
    mockAuth.getUser.mockResolvedValue(user);
    mockAuth.requireAuth.mockImplementation(() => {
      if (!user) throw new Error("Unauthorized");
      return user;
    });
    mockAuth.requireRole.mockImplementation((requiredRole: string) => {
      if (!user) throw new Error("Unauthorized");
      if (user.role !== requiredRole) throw new Error("Forbidden");
      return user;
    });
    mockAuth.checkPermission.mockImplementation(
      (permission: string, resource?: any) => {
        if (!user) return false;

        // Simple permission logic for testing
        switch (permission) {
          case "review:create":
            return true; // All authenticated users can create reviews
          case "review:edit":
            return (
              !resource || resource.userId === user.id || user.role === "ADMIN"
            );
          case "review:delete":
            return (
              !resource || resource.userId === user.id || user.role === "ADMIN"
            );
          case "review:moderate":
            return (
              user.role === "ADMIN" ||
              (user.role === "INSTRUCTOR" &&
                resource?.course?.instructorId === user.id)
            );
          default:
            return false;
        }
      }
    );
  }

  static clearMocks() {
    mockAuth.getUser.mockReset();
    mockAuth.requireAuth.mockReset();
    mockAuth.requireRole.mockReset();
    mockAuth.checkPermission.mockReset();
  }
}

/**
 * Performance testing utilities
 */
export class PerformanceTestUtils {
  static async measureExecutionTime<T>(
    fn: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    const start = Date.now();
    const result = await fn();
    const duration = Date.now() - start;
    return { result, duration };
  }

  static async runConcurrentTests<T>(
    fn: () => Promise<T>,
    concurrency: number = 10,
    iterations: number = 100
  ) {
    const batches = Math.ceil(iterations / concurrency);
    const results: Array<{ duration: number; success: boolean }> = [];

    for (let batch = 0; batch < batches; batch++) {
      const batchPromises = Array.from(
        { length: Math.min(concurrency, iterations - batch * concurrency) },
        async () => {
          try {
            const start = Date.now();
            await fn();
            return { duration: Date.now() - start, success: true };
          } catch (error) {
            return { duration: 0, success: false, error };
          }
        }
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    return {
      totalTests: results.length,
      successful: successful.length,
      failed: failed.length,
      averageDuration:
        successful.length > 0
          ? successful.reduce((sum, r) => sum + r.duration, 0) /
            successful.length
          : 0,
      minDuration:
        successful.length > 0
          ? Math.min(...successful.map((r) => r.duration))
          : 0,
      maxDuration:
        successful.length > 0
          ? Math.max(...successful.map((r) => r.duration))
          : 0,
      failureRate: (failed.length / results.length) * 100,
    };
  }
}

/**
 * Common test setup and teardown
 */
export function setupTestEnvironment() {
  beforeEach(async () => {
    // Reset all mocks
    vi.clearAllMocks();
    AuthTestUtils.clearMocks();

    // Setup default mock returns
    mockRedis.ping.mockResolvedValue("PONG");
    mockRedis.getJSON.mockResolvedValue(null);
    mockRedis.setJSON.mockResolvedValue("OK");
    mockEmailService.sendReviewNotification.mockResolvedValue(true);
  });

  afterEach(async () => {
    // Clean up any test data
    vi.clearAllMocks();
  });
}

/**
 * Integration test setup
 */
export async function setupIntegrationTest() {
  await DatabaseTestUtils.setup();
  await DatabaseTestUtils.seedTestData();
}

export async function teardownIntegrationTest() {
  await DatabaseTestUtils.teardown();
}

/**
 * Assertion helpers
 */
export const assertions = {
  expectValidReview: (review: any) => {
    expect(review).toHaveProperty("id");
    expect(review).toHaveProperty("userId");
    expect(review).toHaveProperty("courseId");
    expect(review).toHaveProperty("rating");
    expect(review.rating).toBeGreaterThanOrEqual(1);
    expect(review.rating).toBeLessThanOrEqual(5);
    expect(review).toHaveProperty("comment");
    expect(review).toHaveProperty("status");
    expect(review).toHaveProperty("createdAt");
    expect(review).toHaveProperty("updatedAt");
  },

  expectValidPagination: (pagination: any) => {
    expect(pagination).toHaveProperty("total");
    expect(pagination).toHaveProperty("page");
    expect(pagination).toHaveProperty("limit");
    expect(pagination).toHaveProperty("pages");
    expect(pagination.total).toBeGreaterThanOrEqual(0);
    expect(pagination.page).toBeGreaterThan(0);
    expect(pagination.limit).toBeGreaterThan(0);
    expect(pagination.pages).toBeGreaterThanOrEqual(0);
  },

  expectValidApiResponse: (response: any, expectedStatus: number = 200) => {
    expect(response.status).toBe(expectedStatus);
    if (expectedStatus >= 200 && expectedStatus < 300) {
      expect(response.body).toBeDefined();
    }
  },

  expectPerformanceWithinLimits: (
    duration: number,
    maxDuration: number = 1000
  ) => {
    expect(duration).toBeLessThan(maxDuration);
  },
};
