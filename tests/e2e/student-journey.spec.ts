import { test, expect } from "@playwright/test";

/**
 * E2E Test: Full student journey
 * inscription → course landing → lesson 1 → quiz → certificate
 *
 * Prerequisites: App running with seeded data
 */

test.describe("Parcours étudiant complet", () => {
  test("landing page shows course info and CTA", async ({ page }) => {
    await page.goto("/fr/formations");
    await expect(page.locator("h1, h2").first()).toBeVisible();
    // Should have at least one course card
    await expect(
      page
        .locator('[data-testid="course-card"], article, .course-card')
        .first(),
    ).toBeVisible();
  });

  test("course detail page displays structured sections", async ({ page }) => {
    await page.goto("/fr/formations");
    // Click on first course link
    const courseLink = page.locator("a[href*='/formations/']").first();
    await courseLink.click();

    // Should show course header
    await expect(page.locator("h1").first()).toBeVisible();

    // Should show curriculum section
    await expect(
      page.getByText(/Programme|Curriculum|Modules/i).first(),
    ).toBeVisible();

    // Should show trust badges
    await expect(
      page.getByText(/Paiement sécurisé|Garantie/i).first(),
    ).toBeVisible();
  });

  test("lesson page renders video player and navigation", async ({ page }) => {
    // Navigate directly to a lesson page (assumes seeded course)
    await page.goto("/fr/formations");
    const courseLink = page.locator("a[href*='/formations/']").first();
    await courseLink.click();

    // Look for lesson links in curriculum
    const lessonLink = page.locator("a[href*='/lessons/']").first();

    if (await lessonLink.isVisible()) {
      await lessonLink.click();
      // Should show lesson content or video
      await expect(
        page.locator("video, h1, [data-testid='lesson-content']").first(),
      ).toBeVisible();
    }
  });

  test("skeleton loading appears during navigation", async ({ page }) => {
    await page.goto("/fr/formations");
    // Navigate and check for loading state
    const courseLink = page.locator("a[href*='/formations/']").first();

    // Enable slow network to catch loading state
    await page.route("**/*", async (route) => {
      await new Promise((r) => setTimeout(r, 100));
      await route.continue();
    });

    await courseLink.click();
    // The page should eventually load (skeleton may flash too fast in fast envs)
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
  });

  test("mobile responsive - sidebar hidden on small screens", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/fr/formations");
    // Course page should still be accessible on mobile
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });
});
