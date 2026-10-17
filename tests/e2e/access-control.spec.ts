import { ADMIN_EMAIL } from "./support/global-setup";
import { createUser, PASSWORD } from "./support/db";
import { expect, expectHealthyPage, signInViaApi, test } from "./support/fixtures";

const PROTECTED = ["/fr/dashboard", "/fr/dashboard/my-courses", "/fr/dashboard/billing", "/fr/profile", "/fr/admin"];

test.describe("access control (fr)", () => {
  for (const path of PROTECTED) {
    test(`anonymous ${path} redirects to the login and keeps the destination`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/fr\/auth\/login\?/);
      const url = new URL(page.url());
      expect(url.searchParams.get("callbackUrl")).toBe(path);
      await expect(page.locator("#email")).toBeVisible();
    });
  }

  test("anonymous API calls are refused", async ({ request }) => {
    expect((await request.get("/api/progress/summary")).status()).toBe(401);
  });

  test("a student is sent back to the dashboard and never sees admin content", async ({ page }) => {
    const student = await createUser({ name: "Étudiant E2E" });
    await page.goto("/fr");
    await signInViaApi(page, student.email, student.password);
    await page.goto("/fr/admin");
    await expect(page).toHaveURL(/\/fr\/dashboard$/);
    for (const adminPath of ["/fr/admin/users", "/fr/admin/courses", "/fr/admin/analytics"]) {
      await page.goto(adminPath);
      await expect(page).toHaveURL(/\/fr\/dashboard$/);
    }
  });

  test("the seeded admin opens the back office", async ({ page }) => {
    await page.goto("/fr");
    await signInViaApi(page, ADMIN_EMAIL, PASSWORD);
    await page.goto("/fr/admin");
    await expect(page).toHaveURL(/\/fr\/admin$/);
    await expect(page.locator("main")).toBeVisible();
    await page.goto("/fr/admin/users");
    await expect(page).toHaveURL(/\/fr\/admin\/users$/);
    await expect(page.getByText(ADMIN_EMAIL).first()).toBeVisible();
  });

  const ADMIN_PAGES = [
    "/fr/admin",
    "/fr/admin/analytics",
    "/fr/admin/community",
    "/fr/admin/community/analytics",
    "/fr/admin/community/moderation",
    "/fr/admin/community/users",
    "/fr/admin/courses",
    "/fr/admin/courses/new",
    "/fr/admin/lessons",
    "/fr/admin/lessons/new",
    "/fr/admin/reviews",
    "/fr/admin/reviews/analytics",
    "/fr/admin/reviews/moderation",
    "/fr/admin/reviews/settings",
    "/fr/admin/tags",
    "/fr/admin/tags/new",
    "/fr/admin/users",
  ];

  test("every admin page renders for the admin (no error boundary, no page error)", async ({ page }) => {
    await page.goto("/fr");
    await signInViaApi(page, ADMIN_EMAIL, PASSWORD);
    for (const path of ADMIN_PAGES) {
      await expectHealthyPage(page, path);
    }
  });
});
