/**
 * End-to-End tests for Review System
 * Tests user workflows from browser perspective using Playwright
 */

import { test, expect } from "@playwright/test";
import {
  setupIntegrationTest,
  teardownIntegrationTest,
} from "../fixtures/test-utils";
import { mockCourses } from "../fixtures/review-fixtures";

// Test configuration
test.describe.configure({ mode: "serial" });

test.describe("Review System E2E Tests", () => {
  test.beforeAll(async () => {
    await setupIntegrationTest();
  });

  test.afterAll(async () => {
    await teardownIntegrationTest();
  });

  test.describe("Guest User Experience", () => {
    test("should view course reviews without authentication", async ({
      page,
    }) => {
      await page.goto(`/courses/${mockCourses.published.slug}`);

      // Should see reviews section
      await expect(
        page.locator('[data-testid="reviews-section"]')
      ).toBeVisible();

      // Should see existing reviews
      await expect(page.locator('[data-testid="review-card"]')).toHaveCount(1);

      // Should see review statistics
      await expect(page.locator('[data-testid="review-stats"]')).toBeVisible();
      await expect(
        page.locator('[data-testid="average-rating"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="rating-distribution"]')
      ).toBeVisible();
    });

    test("should not see review form without authentication", async ({
      page,
    }) => {
      await page.goto(`/courses/${mockCourses.published.slug}`);

      // Review form should not be visible
      await expect(
        page.locator('[data-testid="review-form"]')
      ).not.toBeVisible();

      // Should see login prompt
      await expect(page.locator('[data-testid="login-prompt"]')).toBeVisible();
      await expect(page.getByText("Sign in to leave a review")).toBeVisible();
    });

    test("should be able to search and filter reviews", async ({ page }) => {
      await page.goto(`/courses/${mockCourses.published.slug}`);

      // Test search functionality
      await page.fill('[data-testid="review-search"]', "excellent");
      await page.press('[data-testid="review-search"]', "Enter");

      // Should filter results
      await expect(page.locator('[data-testid="review-card"]')).toHaveCount(1);

      // Test rating filter
      await page.click('[data-testid="rating-filter-5"]');
      await expect(page.locator('[data-testid="review-card"]')).toHaveCount(1);

      // Clear filters
      await page.click('[data-testid="clear-filters"]');
      await expect(page.locator('[data-testid="review-card"]')).toHaveCount(1);
    });
  });

  test.describe("Authenticated Student Experience", () => {
    test.beforeEach(async ({ page }) => {
      // Mock authentication
      await page.addInitScript(() => {
        window.localStorage.setItem(
          "auth-user",
          JSON.stringify({
            id: "user_student_123",
            name: "John Student",
            email: "student@test.com",
            role: "USER",
          })
        );
      });
    });

    test("should create a new review", async ({ page }) => {
      await page.goto(`/courses/${mockCourses.published.slug}`);

      // Should see review form
      await expect(page.locator('[data-testid="review-form"]')).toBeVisible();

      // Fill out review form
      await page.click('[data-testid="rating-star-5"]');
      await page.fill(
        '[data-testid="review-comment"]',
        "This is an excellent course! I learned so much about advanced TypeScript patterns."
      );

      // Submit review
      await page.click('[data-testid="submit-review"]');

      // Should see success message
      await expect(
        page.locator('[data-testid="success-message"]')
      ).toBeVisible();
      await expect(
        page.getByText("Review submitted successfully")
      ).toBeVisible();

      // Should see the new review in the list
      await expect(page.locator('[data-testid="review-card"]')).toHaveCount(2);
      await expect(page.getByText("This is an excellent course")).toBeVisible();
    });

    test("should edit own review", async ({ page }) => {
      await page.goto(`/courses/${mockCourses.published.slug}`);

      // Find and click edit button on own review
      await page.click(
        '[data-testid="review-card"]:has-text("John Student") [data-testid="edit-review"]'
      );

      // Should open edit modal
      await expect(
        page.locator('[data-testid="edit-review-modal"]')
      ).toBeVisible();

      // Update rating and comment
      await page.click('[data-testid="rating-star-4"]');
      await page.fill(
        '[data-testid="review-comment"]',
        "Updated: Still a great course, but I found a few areas that could be improved."
      );

      // Save changes
      await page.click('[data-testid="save-review"]');

      // Should see updated review
      await expect(
        page.getByText("Updated: Still a great course")
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="review-rating"]:has-text("4")').first()
      ).toBeVisible();
    });

    test("should vote on other reviews", async ({ page }) => {
      await page.goto(`/courses/${mockCourses.published.slug}`);

      // Find a review from another user and vote helpful
      const otherReview = page
        .locator('[data-testid="review-card"]')
        .filter({ hasNot: page.getByText("John Student") })
        .first();
      await otherReview.locator('[data-testid="vote-helpful"]').click();

      // Should see updated vote count
      await expect(
        otherReview.locator('[data-testid="helpful-count"]')
      ).toContainText("1");

      // Click again to remove vote
      await otherReview.locator('[data-testid="vote-helpful"]').click();
      await expect(
        otherReview.locator('[data-testid="helpful-count"]')
      ).toContainText("0");
    });

    test("should reply to reviews", async ({ page }) => {
      await page.goto(`/courses/${mockCourses.published.slug}`);

      // Click reply on a review
      await page.click(
        '[data-testid="review-card"] [data-testid="reply-button"]'
      );

      // Should show reply form
      await expect(page.locator('[data-testid="reply-form"]')).toBeVisible();

      // Write reply
      await page.fill(
        '[data-testid="reply-content"]',
        "Thank you for this detailed feedback!"
      );

      // Submit reply
      await page.click('[data-testid="submit-reply"]');

      // Should see reply in conversation
      await expect(
        page.getByText("Thank you for this detailed feedback")
      ).toBeVisible();
    });

    test("should report inappropriate reviews", async ({ page }) => {
      await page.goto(`/courses/${mockCourses.published.slug}`);

      // Click report button
      await page.click(
        '[data-testid="review-card"] [data-testid="report-button"]'
      );

      // Should open report modal
      await expect(page.locator('[data-testid="report-modal"]')).toBeVisible();

      // Select reason and provide details
      await page.click('[data-testid="report-reason-spam"]');
      await page.fill(
        '[data-testid="report-description"]',
        "This review contains spam content and is not relevant to the course."
      );

      // Submit report
      await page.click('[data-testid="submit-report"]');

      // Should see confirmation
      await expect(
        page.locator('[data-testid="report-confirmation"]')
      ).toBeVisible();
      await expect(
        page.getByText("Report submitted successfully")
      ).toBeVisible();
    });
  });

  test.describe("Instructor Experience", () => {
    test.beforeEach(async ({ page }) => {
      // Mock instructor authentication
      await page.addInitScript(() => {
        window.localStorage.setItem(
          "auth-user",
          JSON.stringify({
            id: "user_instructor_456",
            name: "Jane Instructor",
            email: "instructor@test.com",
            role: "INSTRUCTOR",
          })
        );
      });
    });

    test("should view instructor dashboard with review analytics", async ({
      page,
    }) => {
      await page.goto("/dashboard/instructor/reviews");

      // Should see analytics overview
      await expect(
        page.locator('[data-testid="review-analytics"]')
      ).toBeVisible();
      await expect(page.locator('[data-testid="total-reviews"]')).toBeVisible();
      await expect(
        page.locator('[data-testid="average-rating"]')
      ).toBeVisible();
      await expect(page.locator('[data-testid="response-rate"]')).toBeVisible();

      // Should see course performance breakdown
      await expect(
        page.locator('[data-testid="course-performance"]')
      ).toBeVisible();
      await expect(page.getByText(mockCourses.published.title)).toBeVisible();

      // Should see recent reviews requiring attention
      await expect(
        page.locator('[data-testid="recent-reviews"]')
      ).toBeVisible();
    });

    test("should respond to student reviews", async ({ page }) => {
      await page.goto(`/courses/${mockCourses.published.slug}`);

      // Should see instructor reply button
      await expect(
        page.locator('[data-testid="instructor-reply"]')
      ).toBeVisible();

      // Click to reply to a review
      await page.click('[data-testid="instructor-reply"]');

      // Fill instructor response
      await page.fill(
        '[data-testid="instructor-response"]',
        "Thank you for your feedback! I'm glad you found the course helpful. If you have any specific questions about the advanced patterns, feel free to reach out!"
      );

      // Submit response
      await page.click('[data-testid="submit-instructor-response"]');

      // Should see instructor badge on response
      await expect(
        page.locator('[data-testid="instructor-badge"]')
      ).toBeVisible();
      await expect(page.getByText("Course Instructor")).toBeVisible();
    });

    test("should filter reviews by course and status", async ({ page }) => {
      await page.goto("/dashboard/instructor/reviews");

      // Filter by specific course
      await page.selectOption(
        '[data-testid="course-filter"]',
        mockCourses.published.id
      );
      await expect(
        page.locator('[data-testid="filtered-reviews"]')
      ).toBeVisible();

      // Filter by pending reviews
      await page.selectOption('[data-testid="status-filter"]', "PENDING");

      // Should show only pending reviews
      await expect(
        page.locator('[data-testid="review-status-pending"]')
      ).toBeVisible();
    });
  });

  test.describe("Admin Experience", () => {
    test.beforeEach(async ({ page }) => {
      // Mock admin authentication
      await page.addInitScript(() => {
        window.localStorage.setItem(
          "auth-user",
          JSON.stringify({
            id: "user_admin_789",
            name: "Admin User",
            email: "admin@test.com",
            role: "ADMIN",
          })
        );
      });
    });

    test("should access admin review management dashboard", async ({
      page,
    }) => {
      await page.goto("/admin/reviews");

      // Should see admin controls
      await expect(
        page.locator('[data-testid="admin-dashboard"]')
      ).toBeVisible();
      await expect(page.locator('[data-testid="bulk-actions"]')).toBeVisible();
      await expect(
        page.locator('[data-testid="moderation-queue"]')
      ).toBeVisible();

      // Should see platform-wide statistics
      await expect(
        page.locator('[data-testid="platform-stats"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="total-reviews-platform"]')
      ).toBeVisible();
    });

    test("should moderate flagged reviews", async ({ page }) => {
      await page.goto("/admin/reviews/moderation");

      // Should see flagged reviews
      await expect(
        page.locator('[data-testid="flagged-reviews"]')
      ).toBeVisible();

      // Select a flagged review and take action
      await page.check('[data-testid="review-checkbox"]:first-child');
      await page.selectOption('[data-testid="moderation-action"]', "APPROVE");
      await page.click('[data-testid="apply-action"]');

      // Should see confirmation
      await expect(
        page.locator('[data-testid="moderation-success"]')
      ).toBeVisible();
    });

    test("should perform bulk operations", async ({ page }) => {
      await page.goto("/admin/reviews");

      // Select multiple reviews
      await page.check('[data-testid="select-all-reviews"]');

      // Choose bulk action
      await page.selectOption('[data-testid="bulk-action"]', "FEATURE");
      await page.click('[data-testid="apply-bulk-action"]');

      // Confirm action in modal
      await page.click('[data-testid="confirm-bulk-action"]');

      // Should see success message
      await expect(page.locator('[data-testid="bulk-success"]')).toBeVisible();
    });
  });

  test.describe("Performance and Accessibility", () => {
    test("should load review section within performance budget", async ({
      page,
    }) => {
      // Set up performance monitoring
      await page.goto(`/courses/${mockCourses.published.slug}`);

      // Wait for reviews to load
      await page.waitForSelector('[data-testid="reviews-section"]');

      // Measure performance
      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType(
          "navigation"
        )[0] as PerformanceNavigationTiming;
        return {
          loadTime: navigation.loadEventEnd - navigation.loadEventStart,
          domContentLoaded:
            navigation.domContentLoadedEventEnd -
            navigation.domContentLoadedEventStart,
        };
      });

      // Performance assertions
      expect(metrics.loadTime).toBeLessThan(3000); // 3 seconds
      expect(metrics.domContentLoaded).toBeLessThan(2000); // 2 seconds
    });

    test("should be accessible with screen readers", async ({ page }) => {
      await page.goto(`/courses/${mockCourses.published.slug}`);

      // Check for proper ARIA labels
      await expect(page.locator('[data-testid="review-form"]')).toHaveAttribute(
        "aria-label"
      );
      await expect(
        page.locator('[data-testid="rating-stars"]')
      ).toHaveAttribute("role", "radiogroup");

      // Check for proper heading structure
      await expect(page.locator("h2")).toContainText("Reviews");

      // Check for focus management
      await page.keyboard.press("Tab");
      await expect(page.locator(":focus")).toBeVisible();
    });

    test("should handle large numbers of reviews efficiently", async ({
      page,
    }) => {
      // Navigate to a course with many reviews
      await page.goto(`/courses/${mockCourses.published.slug}?stress=true`);

      // Should implement virtual scrolling or pagination
      await expect(
        page.locator('[data-testid="review-pagination"]')
      ).toBeVisible();

      // Test infinite scroll or pagination
      await page.click('[data-testid="load-more-reviews"]');
      await page.waitForSelector('[data-testid="review-card"]');

      // Should not freeze the UI
      await expect(
        page.locator('[data-testid="reviews-section"]')
      ).toBeVisible();
    });
  });

  test.describe("Mobile Responsiveness", () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

    test("should display reviews properly on mobile", async ({ page }) => {
      await page.goto(`/courses/${mockCourses.published.slug}`);

      // Reviews should stack vertically
      await expect(
        page.locator('[data-testid="reviews-section"]')
      ).toBeVisible();

      // Rating stars should be touch-friendly
      const ratingStars = page.locator('[data-testid="rating-star"]');
      const starBox = await ratingStars.first().boundingBox();
      expect(starBox?.height).toBeGreaterThan(44); // iOS touch target minimum

      // Text should be readable
      await expect(page.locator('[data-testid="review-comment"]')).toHaveCSS(
        "font-size",
        "16px"
      );
    });

    test("should handle mobile interactions correctly", async ({ page }) => {
      await page.goto(`/courses/${mockCourses.published.slug}`);

      // Test swipe gestures for review navigation
      await page.touchScreen.tap(100, 300);
      await page.touchScreen.tap(300, 300);

      // Test responsive form elements
      await page.locator('[data-testid="review-comment"]').click();
      await expect(
        page.locator('[data-testid="review-comment"]')
      ).toBeFocused();

      // Keyboard should not obstruct form
      await expect(
        page.locator('[data-testid="submit-review"]')
      ).toBeInViewport();
    });
  });

  test.describe("Error Scenarios", () => {
    test("should handle network failures gracefully", async ({ page }) => {
      // Simulate offline mode
      await page.context().setOffline(true);

      await page.goto(`/courses/${mockCourses.published.slug}`);

      // Should show offline message
      await expect(
        page.locator('[data-testid="offline-message"]')
      ).toBeVisible();

      // Should cache and sync when back online
      await page.context().setOffline(false);
      await page.reload();

      await expect(
        page.locator('[data-testid="reviews-section"]')
      ).toBeVisible();
    });

    test("should handle API errors with user-friendly messages", async ({
      page,
    }) => {
      // Mock API to return errors
      await page.route("/api/reviews", (route) => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: "Internal server error" }),
        });
      });

      await page.goto(`/courses/${mockCourses.published.slug}`);

      // Should show error message instead of crash
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.getByText("Unable to load reviews")).toBeVisible();

      // Should provide retry option
      await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
    });
  });
});
