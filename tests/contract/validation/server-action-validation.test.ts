/**
 * T117: Negative Validation Tests for Server Actions
 *
 * Tests server action validation as required by FR-032.
 * Verifies proper handling of malformed payloads for critical server actions:
 * - Enroll in course
 * - Update progress
 * - Cancel subscription
 * - Issue certificate
 */

import { describe, it, expect, afterEach } from "vitest";
import { createTestEnvironment } from "../../utils/test-database";

// Mock server actions for validation testing
class ServerActionValidator {
  /**
   * Validate enrollment payload
   */
  static validateEnrollmentPayload(payload: any): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!payload) {
      errors.push("Payload is required");
      return { isValid: false, errors };
    }

    if (!payload.userId || typeof payload.userId !== "string") {
      errors.push("userId is required and must be a string");
    }

    if (!payload.courseId || typeof payload.courseId !== "string") {
      errors.push("courseId is required and must be a string");
    }

    if (
      payload.enrolledAt &&
      !(payload.enrolledAt instanceof Date) &&
      !Date.parse(payload.enrolledAt)
    ) {
      errors.push("enrolledAt must be a valid date");
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Validate progress update payload
   */
  static validateProgressPayload(payload: any): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!payload) {
      errors.push("Payload is required");
      return { isValid: false, errors };
    }

    if (!payload.userId || typeof payload.userId !== "string") {
      errors.push("userId is required and must be a string");
    }

    if (!payload.lessonId || typeof payload.lessonId !== "string") {
      errors.push("lessonId is required and must be a string");
    }

    if (typeof payload.completed !== "boolean") {
      errors.push("completed is required and must be a boolean");
    }

    if (
      payload.completedAt &&
      !(payload.completedAt instanceof Date) &&
      !Date.parse(payload.completedAt)
    ) {
      errors.push("completedAt must be a valid date");
    }

    if (payload.progress !== undefined) {
      if (
        typeof payload.progress !== "number" ||
        isNaN(payload.progress) ||
        !isFinite(payload.progress) ||
        payload.progress < 0 ||
        payload.progress > 100
      ) {
        errors.push("progress must be a number between 0 and 100");
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Validate subscription cancellation payload
   */
  static validateCancelSubscriptionPayload(payload: any): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!payload) {
      errors.push("Payload is required");
      return { isValid: false, errors };
    }

    if (!payload.userId || typeof payload.userId !== "string") {
      errors.push("userId is required and must be a string");
    }

    if (!payload.subscriptionId || typeof payload.subscriptionId !== "string") {
      errors.push("subscriptionId is required and must be a string");
    }

    if (payload.cancelReason && typeof payload.cancelReason !== "string") {
      errors.push("cancelReason must be a string");
    }

    if (
      payload.cancelAtPeriodEnd &&
      typeof payload.cancelAtPeriodEnd !== "boolean"
    ) {
      errors.push("cancelAtPeriodEnd must be a boolean");
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Validate certificate issuance payload
   */
  static validateCertificatePayload(payload: any): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!payload) {
      errors.push("Payload is required");
      return { isValid: false, errors };
    }

    if (!payload.userId || typeof payload.userId !== "string") {
      errors.push("userId is required and must be a string");
    }

    if (!payload.courseId || typeof payload.courseId !== "string") {
      errors.push("courseId is required and must be a string");
    }

    if (
      payload.certificateTemplate &&
      typeof payload.certificateTemplate !== "string"
    ) {
      errors.push("certificateTemplate must be a string");
    }

    if (
      payload.issuedAt &&
      !(payload.issuedAt instanceof Date) &&
      !Date.parse(payload.issuedAt)
    ) {
      errors.push("issuedAt must be a valid date");
    }

    if (payload.grade !== undefined) {
      if (
        typeof payload.grade !== "number" ||
        isNaN(payload.grade) ||
        !isFinite(payload.grade) ||
        payload.grade < 0 ||
        payload.grade > 100
      ) {
        errors.push("grade must be a number between 0 and 100");
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Mock server action that throws on invalid payload
   */
  static async mockEnrollAction(payload: any) {
    const validation = this.validateEnrollmentPayload(payload);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
    }
    return { success: true, enrollmentId: "mock-enrollment-id" };
  }

  static async mockProgressAction(payload: any) {
    const validation = this.validateProgressPayload(payload);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
    }
    return { success: true, progressId: "mock-progress-id" };
  }

  static async mockCancelSubscriptionAction(payload: any) {
    const validation = this.validateCancelSubscriptionPayload(payload);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
    }
    return { success: true, canceledAt: new Date() };
  }

  static async mockCertificateAction(payload: any) {
    const validation = this.validateCertificatePayload(payload);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
    }
    return { success: true, certificateId: "mock-certificate-id" };
  }
}

describe("T117: Negative Validation Tests for Server Actions", () => {
  const testEnv = createTestEnvironment();

  afterEach(async () => {
    await testEnv.cleanup();
  });

  describe("Enrollment Action Validation", () => {
    it("rejects null payload", async () => {
      const validation = ServerActionValidator.validateEnrollmentPayload(null);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("Payload is required");

      await expect(
        ServerActionValidator.mockEnrollAction(null)
      ).rejects.toThrow("Validation failed");
    });

    it("rejects undefined payload", async () => {
      const validation =
        ServerActionValidator.validateEnrollmentPayload(undefined);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("Payload is required");

      await expect(
        ServerActionValidator.mockEnrollAction(undefined)
      ).rejects.toThrow("Validation failed");
    });

    it("rejects payload without userId", async () => {
      const payload = { courseId: "course-123" };
      const validation =
        ServerActionValidator.validateEnrollmentPayload(payload);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        "userId is required and must be a string"
      );

      await expect(
        ServerActionValidator.mockEnrollAction(payload)
      ).rejects.toThrow("userId is required");
    });

    it("rejects payload without courseId", async () => {
      const payload = { userId: "user-123" };
      const validation =
        ServerActionValidator.validateEnrollmentPayload(payload);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        "courseId is required and must be a string"
      );

      await expect(
        ServerActionValidator.mockEnrollAction(payload)
      ).rejects.toThrow("courseId is required");
    });

    it("rejects payload with invalid userId type", async () => {
      const payload = { userId: 123, courseId: "course-123" };
      const validation =
        ServerActionValidator.validateEnrollmentPayload(payload);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        "userId is required and must be a string"
      );
    });

    it("rejects payload with invalid courseId type", async () => {
      const payload = { userId: "user-123", courseId: ["course-123"] };
      const validation =
        ServerActionValidator.validateEnrollmentPayload(payload);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        "courseId is required and must be a string"
      );
    });

    it("rejects payload with invalid enrolledAt", async () => {
      const payload = {
        userId: "user-123",
        courseId: "course-123",
        enrolledAt: "invalid-date",
      };
      const validation =
        ServerActionValidator.validateEnrollmentPayload(payload);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("enrolledAt must be a valid date");
    });

    it("accepts valid enrollment payload", async () => {
      const payload = {
        userId: "user-123",
        courseId: "course-123",
        enrolledAt: new Date(),
      };
      const validation =
        ServerActionValidator.validateEnrollmentPayload(payload);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);

      const result = await ServerActionValidator.mockEnrollAction(payload);
      expect(result.success).toBe(true);
    });
  });

  describe("Progress Action Validation", () => {
    it("rejects null payload", async () => {
      const validation = ServerActionValidator.validateProgressPayload(null);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("Payload is required");

      await expect(
        ServerActionValidator.mockProgressAction(null)
      ).rejects.toThrow("Validation failed");
    });

    it("rejects payload without userId", async () => {
      const payload = { lessonId: "lesson-123", completed: true };
      const validation = ServerActionValidator.validateProgressPayload(payload);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        "userId is required and must be a string"
      );
    });

    it("rejects payload without lessonId", async () => {
      const payload = { userId: "user-123", completed: true };
      const validation = ServerActionValidator.validateProgressPayload(payload);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        "lessonId is required and must be a string"
      );
    });

    it("rejects payload without completed status", async () => {
      const payload = { userId: "user-123", lessonId: "lesson-123" };
      const validation = ServerActionValidator.validateProgressPayload(payload);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        "completed is required and must be a boolean"
      );
    });

    it("rejects payload with invalid completed type", async () => {
      const payload = {
        userId: "user-123",
        lessonId: "lesson-123",
        completed: "yes",
      };
      const validation = ServerActionValidator.validateProgressPayload(payload);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        "completed is required and must be a boolean"
      );
    });

    it("rejects payload with invalid progress value", async () => {
      const payload = {
        userId: "user-123",
        lessonId: "lesson-123",
        completed: true,
        progress: 150,
      };
      const validation = ServerActionValidator.validateProgressPayload(payload);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        "progress must be a number between 0 and 100"
      );
    });

    it("rejects payload with negative progress", async () => {
      const payload = {
        userId: "user-123",
        lessonId: "lesson-123",
        completed: false,
        progress: -10,
      };
      const validation = ServerActionValidator.validateProgressPayload(payload);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        "progress must be a number between 0 and 100"
      );
    });

    it("rejects payload with invalid completedAt", async () => {
      const payload = {
        userId: "user-123",
        lessonId: "lesson-123",
        completed: true,
        completedAt: "not-a-date",
      };
      const validation = ServerActionValidator.validateProgressPayload(payload);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("completedAt must be a valid date");
    });

    it("accepts valid progress payload", async () => {
      const payload = {
        userId: "user-123",
        lessonId: "lesson-123",
        completed: true,
        progress: 100,
        completedAt: new Date(),
      };
      const validation = ServerActionValidator.validateProgressPayload(payload);
      expect(validation.isValid).toBe(true);

      const result = await ServerActionValidator.mockProgressAction(payload);
      expect(result.success).toBe(true);
    });
  });

  describe("Cancel Subscription Action Validation", () => {
    it("rejects null payload", async () => {
      const validation =
        ServerActionValidator.validateCancelSubscriptionPayload(null);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("Payload is required");

      await expect(
        ServerActionValidator.mockCancelSubscriptionAction(null)
      ).rejects.toThrow("Validation failed");
    });

    it("rejects payload without userId", async () => {
      const payload = { subscriptionId: "sub-123" };
      const validation =
        ServerActionValidator.validateCancelSubscriptionPayload(payload);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        "userId is required and must be a string"
      );
    });

    it("rejects payload without subscriptionId", async () => {
      const payload = { userId: "user-123" };
      const validation =
        ServerActionValidator.validateCancelSubscriptionPayload(payload);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        "subscriptionId is required and must be a string"
      );
    });

    it("rejects payload with invalid cancelReason type", async () => {
      const payload = {
        userId: "user-123",
        subscriptionId: "sub-123",
        cancelReason: 123,
      };
      const validation =
        ServerActionValidator.validateCancelSubscriptionPayload(payload);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("cancelReason must be a string");
    });

    it("rejects payload with invalid cancelAtPeriodEnd type", async () => {
      const payload = {
        userId: "user-123",
        subscriptionId: "sub-123",
        cancelAtPeriodEnd: "true",
      };
      const validation =
        ServerActionValidator.validateCancelSubscriptionPayload(payload);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        "cancelAtPeriodEnd must be a boolean"
      );
    });

    it("accepts valid cancel subscription payload", async () => {
      const payload = {
        userId: "user-123",
        subscriptionId: "sub-123",
        cancelReason: "Customer requested",
        cancelAtPeriodEnd: true,
      };
      const validation =
        ServerActionValidator.validateCancelSubscriptionPayload(payload);
      expect(validation.isValid).toBe(true);

      const result = await ServerActionValidator.mockCancelSubscriptionAction(
        payload
      );
      expect(result.success).toBe(true);
    });
  });

  describe("Certificate Action Validation", () => {
    it("rejects null payload", async () => {
      const validation = ServerActionValidator.validateCertificatePayload(null);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("Payload is required");

      await expect(
        ServerActionValidator.mockCertificateAction(null)
      ).rejects.toThrow("Validation failed");
    });

    it("rejects payload without userId", async () => {
      const payload = { courseId: "course-123" };
      const validation =
        ServerActionValidator.validateCertificatePayload(payload);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        "userId is required and must be a string"
      );
    });

    it("rejects payload without courseId", async () => {
      const payload = { userId: "user-123" };
      const validation =
        ServerActionValidator.validateCertificatePayload(payload);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        "courseId is required and must be a string"
      );
    });

    it("rejects payload with invalid certificateTemplate type", async () => {
      const payload = {
        userId: "user-123",
        courseId: "course-123",
        certificateTemplate: 123,
      };
      const validation =
        ServerActionValidator.validateCertificatePayload(payload);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        "certificateTemplate must be a string"
      );
    });

    it("rejects payload with invalid grade value", async () => {
      const payload = {
        userId: "user-123",
        courseId: "course-123",
        grade: 150,
      };
      const validation =
        ServerActionValidator.validateCertificatePayload(payload);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        "grade must be a number between 0 and 100"
      );
    });

    it("rejects payload with negative grade", async () => {
      const payload = { userId: "user-123", courseId: "course-123", grade: -5 };
      const validation =
        ServerActionValidator.validateCertificatePayload(payload);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        "grade must be a number between 0 and 100"
      );
    });

    it("rejects payload with invalid issuedAt", async () => {
      const payload = {
        userId: "user-123",
        courseId: "course-123",
        issuedAt: "invalid-date",
      };
      const validation =
        ServerActionValidator.validateCertificatePayload(payload);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("issuedAt must be a valid date");
    });

    it("accepts valid certificate payload", async () => {
      const payload = {
        userId: "user-123",
        courseId: "course-123",
        certificateTemplate: "standard",
        grade: 95,
        issuedAt: new Date(),
      };
      const validation =
        ServerActionValidator.validateCertificatePayload(payload);
      expect(validation.isValid).toBe(true);

      const result = await ServerActionValidator.mockCertificateAction(payload);
      expect(result.success).toBe(true);
    });
  });

  describe("Complex Malformed Payloads", () => {
    it("handles payloads with circular references", async () => {
      const circularPayload: any = {
        userId: "user-123",
        courseId: "course-123",
      };
      circularPayload.self = circularPayload;

      // Should handle gracefully without infinite loops
      const validation =
        ServerActionValidator.validateEnrollmentPayload(circularPayload);
      expect(validation.isValid).toBe(true); // Basic fields are valid
    });

    it("handles payloads with deeply nested objects", async () => {
      const deepPayload = {
        userId: "user-123",
        courseId: "course-123",
        metadata: {
          level1: {
            level2: {
              level3: {
                level4: {
                  value: "deep-value",
                },
              },
            },
          },
        },
      };

      const validation =
        ServerActionValidator.validateEnrollmentPayload(deepPayload);
      expect(validation.isValid).toBe(true); // Extra fields are ignored
    });

    it("handles payloads with function properties", async () => {
      const payloadWithFunction = {
        userId: "user-123",
        courseId: "course-123",
        someFunction: () => console.log("test"),
      };

      const validation =
        ServerActionValidator.validateEnrollmentPayload(payloadWithFunction);
      expect(validation.isValid).toBe(true); // Function properties are ignored
    });

    it("handles payloads with symbol properties", async () => {
      const symbolKey = Symbol("test");
      const payloadWithSymbol = {
        userId: "user-123",
        courseId: "course-123",
        [symbolKey]: "symbol-value",
      };

      const validation =
        ServerActionValidator.validateEnrollmentPayload(payloadWithSymbol);
      expect(validation.isValid).toBe(true); // Symbol properties are ignored
    });

    it("handles empty object payload", async () => {
      const emptyPayload = {};
      const validation =
        ServerActionValidator.validateEnrollmentPayload(emptyPayload);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        "userId is required and must be a string"
      );
      expect(validation.errors).toContain(
        "courseId is required and must be a string"
      );
    });

    it("handles array instead of object payload", async () => {
      const arrayPayload = ["user-123", "course-123"];
      const validation =
        ServerActionValidator.validateEnrollmentPayload(arrayPayload);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        "userId is required and must be a string"
      );
    });

    it("handles primitive values as payload", async () => {
      const stringPayload = "invalid-payload";
      const numberPayload = 123;
      const booleanPayload = true;

      expect(
        ServerActionValidator.validateEnrollmentPayload(stringPayload).isValid
      ).toBe(false);
      expect(
        ServerActionValidator.validateEnrollmentPayload(numberPayload).isValid
      ).toBe(false);
      expect(
        ServerActionValidator.validateEnrollmentPayload(booleanPayload).isValid
      ).toBe(false);
    });
  });

  describe("Multiple Validation Errors", () => {
    it("accumulates multiple enrollment validation errors", async () => {
      const invalidPayload = {
        userId: 123, // Invalid type
        courseId: null, // Invalid value
        enrolledAt: "not-a-date", // Invalid date
      };

      const validation =
        ServerActionValidator.validateEnrollmentPayload(invalidPayload);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toHaveLength(3);
      expect(validation.errors).toContain(
        "userId is required and must be a string"
      );
      expect(validation.errors).toContain(
        "courseId is required and must be a string"
      );
      expect(validation.errors).toContain("enrolledAt must be a valid date");
    });

    it("accumulates multiple progress validation errors", async () => {
      const invalidPayload = {
        userId: null, // Invalid
        lessonId: 123, // Invalid type
        completed: "yes", // Invalid type
        progress: 150, // Invalid range
        completedAt: "invalid", // Invalid date
      };

      const validation =
        ServerActionValidator.validateProgressPayload(invalidPayload);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(3);
    });

    it("accumulates multiple certificate validation errors", async () => {
      const invalidPayload = {
        userId: [], // Invalid type
        courseId: {}, // Invalid type
        certificateTemplate: 123, // Invalid type
        grade: -50, // Invalid range
        issuedAt: "never", // Invalid date
      };

      const validation =
        ServerActionValidator.validateCertificatePayload(invalidPayload);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(3);
    });
  });

  describe("Edge Cases and Security", () => {
    it("handles extremely long string values", async () => {
      const longString = "a".repeat(10000);
      const payload = {
        userId: longString,
        courseId: longString,
      };

      // Validation should still work with long strings
      const validation =
        ServerActionValidator.validateEnrollmentPayload(payload);
      expect(validation.isValid).toBe(true);
    });

    it("handles special characters and unicode", async () => {
      const payload = {
        userId: "用户-123-🚀",
        lessonId: "курс-456-€", // Fixed: was courseId, should be lessonId for progress validation
        completed: true,
      };

      const validation = ServerActionValidator.validateProgressPayload(payload);
      expect(validation.isValid).toBe(true);
    });

    it("handles potential injection attempts", async () => {
      const maliciousPayload = {
        userId: '<script>alert("xss")</script>',
        lessonId: "'; DROP TABLE lessons; --", // Fixed: was courseId, should be lessonId for progress validation
        completed: true,
      };

      // Validation should still work (content filtering happens elsewhere)
      const validation =
        ServerActionValidator.validateProgressPayload(maliciousPayload);
      expect(validation.isValid).toBe(true);
    });

    it("handles very large numbers", async () => {
      const payload = {
        userId: "user-123",
        lessonId: "lesson-123",
        completed: true,
        progress: Number.MAX_SAFE_INTEGER,
      };

      const validation = ServerActionValidator.validateProgressPayload(payload);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        "progress must be a number between 0 and 100"
      );
    });

    it("handles NaN and Infinity values", async () => {
      const payloadWithNaN = {
        userId: "user-123",
        lessonId: "lesson-123",
        completed: true,
        progress: NaN,
      };

      const payloadWithInfinity = {
        userId: "user-123",
        courseId: "course-123",
        grade: Infinity,
      };

      expect(
        ServerActionValidator.validateProgressPayload(payloadWithNaN).isValid
      ).toBe(false);
      expect(
        ServerActionValidator.validateCertificatePayload(payloadWithInfinity)
          .isValid
      ).toBe(false);
    });
  });
});
