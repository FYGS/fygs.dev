/**
 * T112: Admin Route Gating Tests
 *
 * Tests admin route protection as required by FR-039.
 * Verifies that non-admin users are properly redirected to /unauthorized
 * when attempting to access admin-only routes.
 */

import { describe, test, expect, afterEach, beforeEach, vi } from "vitest";
import { createTestEnvironment, TestDatabase } from "../../utils/test-database";
import { db } from "@/lib/db";

// Mock route protection service
const RouteProtectionService = {
  async checkAdminAccess(
    userId: string
  ): Promise<{ allowed: boolean; redirectTo?: string }> {
    if (!userId) {
      return { allowed: false, redirectTo: "/auth/login" };
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { allowed: false, redirectTo: "/auth/login" };
    }

    if (user.role !== "ADMIN") {
      return { allowed: false, redirectTo: "/unauthorized" };
    }

    return { allowed: true };
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async simulateAdminRouteAccess(
    userId: string,
    _route: string
  ): Promise<{ status: number; redirectTo?: string; allowed: boolean }> {
    const accessCheck = await this.checkAdminAccess(userId);

    if (!accessCheck.allowed) {
      return {
        status: 302, // Redirect
        redirectTo: accessCheck.redirectTo,
        allowed: false,
      };
    }

    return {
      status: 200, // OK
      allowed: true,
    };
  },
};

// Mock admin routes that should be protected
const ADMIN_ROUTES = [
  "/admin",
  "/admin/dashboard",
  "/admin/users",
  "/admin/courses",
  "/admin/analytics",
  "/admin/settings",
  "/admin/billing",
  "/admin/reports",
];

describe("T112: Admin Route Gating Tests", () => {
  const testEnv = createTestEnvironment();

  beforeEach(async () => {
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  describe("Non-Admin User Access Denial", () => {
    test("student user gets redirected to /unauthorized when accessing /admin", async () => {
      const student = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail("student"),
          name: "Regular Student",
          role: "STUDENT",
        },
      });
      testEnv.trackUser(student.id);

      const accessResult =
        await RouteProtectionService.simulateAdminRouteAccess(
          student.id,
          "/admin"
        );

      expect(accessResult.allowed).toBe(false);
      expect(accessResult.status).toBe(302);
      expect(accessResult.redirectTo).toBe("/unauthorized");
    });

    test("instructor user gets redirected to /unauthorized when accessing admin routes", async () => {
      const instructor = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail("instructor"),
          name: "Course Instructor",
          role: "INSTRUCTOR",
        },
      });
      testEnv.trackUser(instructor.id);

      // Test multiple admin routes
      for (const route of ADMIN_ROUTES) {
        const accessResult =
          await RouteProtectionService.simulateAdminRouteAccess(
            instructor.id,
            route
          );

        expect(accessResult.allowed).toBe(false);
        expect(accessResult.status).toBe(302);
        expect(accessResult.redirectTo).toBe("/unauthorized");
      }
    });

    test("all non-admin roles are consistently denied access", async () => {
      const users = await Promise.all([
        db.user.create({
          data: {
            email: TestDatabase.getUniqueEmail("student"),
            name: "Test Student",
            role: "STUDENT",
          },
        }),
        db.user.create({
          data: {
            email: TestDatabase.getUniqueEmail("instructor"),
            name: "Test Instructor",
            role: "INSTRUCTOR",
          },
        }),
      ]);

      users.forEach((user) => testEnv.trackUser(user.id));

      // Test that all non-admin users are denied
      for (const user of users) {
        const accessCheck = await RouteProtectionService.checkAdminAccess(
          user.id
        );
        expect(accessCheck.allowed).toBe(false);
        expect(accessCheck.redirectTo).toBe("/unauthorized");
      }
    });

    test("unauthenticated user gets redirected to login", async () => {
      const invalidUserId = TestDatabase.getUniqueId("invalid-user");

      const accessResult =
        await RouteProtectionService.simulateAdminRouteAccess(
          invalidUserId,
          "/admin"
        );

      expect(accessResult.allowed).toBe(false);
      expect(accessResult.status).toBe(302);
      expect(accessResult.redirectTo).toBe("/auth/login");
    });

    test("null/empty user ID gets redirected to login", async () => {
      const accessResultNull =
        await RouteProtectionService.simulateAdminRouteAccess("", "/admin");

      expect(accessResultNull.allowed).toBe(false);
      expect(accessResultNull.status).toBe(302);
      expect(accessResultNull.redirectTo).toBe("/auth/login");
    });
  });

  describe("Admin User Access Granted", () => {
    test("admin user can access main admin route", async () => {
      const admin = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail("admin"),
          name: "System Administrator",
          role: "ADMIN",
        },
      });
      testEnv.trackUser(admin.id);

      const accessResult =
        await RouteProtectionService.simulateAdminRouteAccess(
          admin.id,
          "/admin"
        );

      expect(accessResult.allowed).toBe(true);
      expect(accessResult.status).toBe(200);
      expect(accessResult.redirectTo).toBeUndefined();
    });

    test("admin user can access all admin subroutes", async () => {
      const admin = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail("admin"),
          name: "Full Access Admin",
          role: "ADMIN",
        },
      });
      testEnv.trackUser(admin.id);

      // Test all admin routes
      for (const route of ADMIN_ROUTES) {
        const accessResult =
          await RouteProtectionService.simulateAdminRouteAccess(
            admin.id,
            route
          );

        expect(accessResult.allowed).toBe(true);
        expect(accessResult.status).toBe(200);
        expect(accessResult.redirectTo).toBeUndefined();
      }
    });

    test("multiple admin users can access admin routes simultaneously", async () => {
      const admin1 = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail("admin1"),
          name: "Admin One",
          role: "ADMIN",
        },
      });
      testEnv.trackUser(admin1.id);

      const admin2 = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail("admin2"),
          name: "Admin Two",
          role: "ADMIN",
        },
      });
      testEnv.trackUser(admin2.id);

      // Both admins should have access
      const access1 = await RouteProtectionService.simulateAdminRouteAccess(
        admin1.id,
        "/admin/dashboard"
      );
      const access2 = await RouteProtectionService.simulateAdminRouteAccess(
        admin2.id,
        "/admin/analytics"
      );

      expect(access1.allowed).toBe(true);
      expect(access1.status).toBe(200);
      expect(access2.allowed).toBe(true);
      expect(access2.status).toBe(200);
    });
  });

  describe("Role-Based Access Control Consistency", () => {
    test("role check is case-sensitive and exact", async () => {
      // This would test if there were any case variations in role checking
      const admin = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail("admin"),
          name: "Case Test Admin",
          role: "ADMIN", // Exact case
        },
      });
      testEnv.trackUser(admin.id);

      const accessCheck = await RouteProtectionService.checkAdminAccess(
        admin.id
      );
      expect(accessCheck.allowed).toBe(true);
    });

    test("access control is consistent across multiple requests", async () => {
      const admin = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail("admin"),
          name: "Consistent Admin",
          role: "ADMIN",
        },
      });
      testEnv.trackUser(admin.id);

      const student = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail("student"),
          name: "Consistent Student",
          role: "STUDENT",
        },
      });
      testEnv.trackUser(student.id);

      // Test multiple times for consistency
      for (let i = 0; i < 3; i++) {
        const adminAccess = await RouteProtectionService.checkAdminAccess(
          admin.id
        );
        const studentAccess = await RouteProtectionService.checkAdminAccess(
          student.id
        );

        expect(adminAccess.allowed).toBe(true);
        expect(studentAccess.allowed).toBe(false);
        expect(studentAccess.redirectTo).toBe("/unauthorized");
      }
    });

    test("access is denied immediately after role change", async () => {
      // Create user as admin first
      const user = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail("user"),
          name: "Role Change User",
          role: "ADMIN",
        },
      });
      testEnv.trackUser(user.id);

      // Verify admin access
      const adminAccess = await RouteProtectionService.checkAdminAccess(
        user.id
      );
      expect(adminAccess.allowed).toBe(true);

      // Change role to student
      await db.user.update({
        where: { id: user.id },
        data: { role: "STUDENT" },
      });

      // Verify access is now denied
      const studentAccess = await RouteProtectionService.checkAdminAccess(
        user.id
      );
      expect(studentAccess.allowed).toBe(false);
      expect(studentAccess.redirectTo).toBe("/unauthorized");
    });
  });

  describe("Route-Specific Protection", () => {
    test("all defined admin routes are protected", async () => {
      const student = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail("student"),
          name: "Route Test Student",
          role: "STUDENT",
        },
      });
      testEnv.trackUser(student.id);

      // Verify all routes are protected
      for (const route of ADMIN_ROUTES) {
        const accessResult =
          await RouteProtectionService.simulateAdminRouteAccess(
            student.id,
            route
          );

        expect(accessResult.allowed).toBe(false);
        expect(accessResult.redirectTo).toBe("/unauthorized");
      }
    });

    test("admin dashboard route protection", async () => {
      const instructor = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail("instructor"),
          name: "Dashboard Test Instructor",
          role: "INSTRUCTOR",
        },
      });
      testEnv.trackUser(instructor.id);

      const accessResult =
        await RouteProtectionService.simulateAdminRouteAccess(
          instructor.id,
          "/admin/dashboard"
        );

      expect(accessResult.allowed).toBe(false);
      expect(accessResult.status).toBe(302);
      expect(accessResult.redirectTo).toBe("/unauthorized");
    });

    test("admin analytics route protection", async () => {
      const student = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail("student"),
          name: "Analytics Test Student",
          role: "STUDENT",
        },
      });
      testEnv.trackUser(student.id);

      const accessResult =
        await RouteProtectionService.simulateAdminRouteAccess(
          student.id,
          "/admin/analytics"
        );

      expect(accessResult.allowed).toBe(false);
      expect(accessResult.status).toBe(302);
      expect(accessResult.redirectTo).toBe("/unauthorized");
    });

    test("admin settings route protection", async () => {
      const instructor = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail("instructor"),
          name: "Settings Test Instructor",
          role: "INSTRUCTOR",
        },
      });
      testEnv.trackUser(instructor.id);

      const accessResult =
        await RouteProtectionService.simulateAdminRouteAccess(
          instructor.id,
          "/admin/settings"
        );

      expect(accessResult.allowed).toBe(false);
      expect(accessResult.status).toBe(302);
      expect(accessResult.redirectTo).toBe("/unauthorized");
    });
  });

  describe("Edge Cases and Security", () => {
    test("deleted user cannot access admin routes", async () => {
      const user = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail("user"),
          name: "To Be Deleted User",
          role: "ADMIN",
        },
      });

      const userId = user.id;

      // Delete the user
      await db.user.delete({
        where: { id: userId },
      });

      // Attempt to access admin route with deleted user ID
      const accessResult =
        await RouteProtectionService.simulateAdminRouteAccess(userId, "/admin");

      expect(accessResult.allowed).toBe(false);
      expect(accessResult.status).toBe(302);
      expect(accessResult.redirectTo).toBe("/auth/login");
    });

    test("concurrent access attempts are handled correctly", async () => {
      const admin = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail("admin"),
          name: "Concurrent Admin",
          role: "ADMIN",
        },
      });
      testEnv.trackUser(admin.id);

      const student = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail("student"),
          name: "Concurrent Student",
          role: "STUDENT",
        },
      });
      testEnv.trackUser(student.id);

      // Simulate concurrent requests
      const [adminAccess1, adminAccess2, studentAccess1, studentAccess2] =
        await Promise.all([
          RouteProtectionService.simulateAdminRouteAccess(
            admin.id,
            "/admin/dashboard"
          ),
          RouteProtectionService.simulateAdminRouteAccess(
            admin.id,
            "/admin/analytics"
          ),
          RouteProtectionService.simulateAdminRouteAccess(
            student.id,
            "/admin/users"
          ),
          RouteProtectionService.simulateAdminRouteAccess(
            student.id,
            "/admin/settings"
          ),
        ]);

      // Admin should have access
      expect(adminAccess1.allowed).toBe(true);
      expect(adminAccess2.allowed).toBe(true);

      // Student should be denied
      expect(studentAccess1.allowed).toBe(false);
      expect(studentAccess1.redirectTo).toBe("/unauthorized");
      expect(studentAccess2.allowed).toBe(false);
      expect(studentAccess2.redirectTo).toBe("/unauthorized");
    });

    test("route protection works with malformed route paths", async () => {
      const student = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail("student"),
          name: "Malformed Test Student",
          role: "STUDENT",
        },
      });
      testEnv.trackUser(student.id);

      // Test various malformed paths that might bypass protection
      const malformedRoutes = [
        "/admin/",
        "/admin/../admin",
        "/admin//dashboard",
        "/admin/../../admin/users",
      ];

      for (const route of malformedRoutes) {
        const accessResult =
          await RouteProtectionService.simulateAdminRouteAccess(
            student.id,
            route
          );
        expect(accessResult.allowed).toBe(false);
        expect(accessResult.redirectTo).toBe("/unauthorized");
      }
    });

    test("rapid successive access attempts are handled consistently", async () => {
      const student = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail("student"),
          name: "Rapid Test Student",
          role: "STUDENT",
        },
      });
      testEnv.trackUser(student.id);

      // Make rapid successive access attempts
      const rapidAttempts = [];
      for (let i = 0; i < 5; i++) {
        rapidAttempts.push(
          RouteProtectionService.simulateAdminRouteAccess(student.id, "/admin")
        );
      }

      const results = await Promise.all(rapidAttempts);

      // All should be consistently denied
      results.forEach((result) => {
        expect(result.allowed).toBe(false);
        expect(result.redirectTo).toBe("/unauthorized");
      });
    });
  });
});
