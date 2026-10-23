import { ADMIN_EMAIL } from "./support/global-setup";
import { createUser, PASSWORD, sql } from "./support/db";
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
    "/fr/admin/reviews",
    "/fr/admin/reviews/analytics",
    "/fr/admin/reviews/moderation",
    "/fr/admin/tags",
    "/fr/admin/tags/new",
    "/fr/admin/users",
    "/fr/admin/payments",
    "/fr/admin/subscriptions",
    "/fr/admin/enrollments",
    "/fr/admin/certificates",
  ];

  // the sidebar hides these for an instructor, but typing the URL must not be enough
  const ADMIN_ONLY = ["users", "payments", "subscriptions", "enrollments", "certificates"];

  test("an instructor reaches the back office but not the admin-only pages", async ({ page }) => {
    const instructor = await createUser({ name: "Instructeur E2E", role: "INSTRUCTOR" });
    await page.goto("/fr");
    await signInViaApi(page, instructor.email, instructor.password);

    await page.goto("/fr/admin");
    await expect(page).toHaveURL(/\/fr\/admin$/);
    for (const name of ADMIN_ONLY) {
      await page.goto(`/fr/admin/${name}`);
      await expect(page, `/admin/${name}`).toHaveURL(/\/fr\/admin$/);
      await expect(page.locator("main")).toBeVisible(); // still in the back office, not thrown out to the login
    }
  });

  test("the payments list filters, searches and paginates for real", async ({ page }) => {
    const buyer = await createUser({ name: "Acheteuse Filtre", email: "acheteuse-filtre@example.com" });
    await sql(
      `INSERT INTO "Payment" (id, "userId", amount, currency, status, kind, "updatedAt")
       VALUES (gen_random_uuid()::text, $1, 4900, 'eur', 'REFUNDED', 'COURSE', now()),
              (gen_random_uuid()::text, $1, 1500, 'eur', 'COMPLETED', 'COURSE', now())`,
      [buyer.id],
    );
    await page.goto("/fr");
    await signInViaApi(page, ADMIN_EMAIL, PASSWORD);

    await page.goto("/fr/admin/payments?q=acheteuse-filtre");
    await expect(page.getByText("1–2 sur 2")).toBeVisible();
    await expect(page.getByRole("row", { name: /Acheteuse Filtre/ })).toHaveCount(2);

    await page.getByLabel("Statut").selectOption("REFUNDED");
    await page.getByRole("button", { name: "Filtrer" }).click();
    await expect(page).toHaveURL(/status=REFUNDED/);
    await expect(page.getByRole("row", { name: /Acheteuse Filtre/ })).toHaveCount(1);
    await expect(page.getByText("Remboursé").first()).toBeVisible();

    await page.goto("/fr/admin/payments?q=personne-ne-s-appelle-comme-ca");
    await expect(page.getByText("Aucun résultat")).toBeVisible();
  });

  test("every admin page renders for the admin (no error boundary, no page error)", async ({ page }) => {
    await page.goto("/fr");
    await signInViaApi(page, ADMIN_EMAIL, PASSWORD);
    for (const path of ADMIN_PAGES) {
      await expectHealthyPage(page, path);
    }
  });
});
