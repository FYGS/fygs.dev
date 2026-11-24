import { expect, expectHealthyPage, test } from "./support/fixtures";
import { waitForMail } from "./support/mailbox";
import { uniqueEmail } from "./support/db";

test.describe("visitor (fr)", () => {
  test("home renders with a single main landmark and a working skip link", async ({ page }) => {
    await page.goto("/fr");
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");

    // first Tab stop is the skip link, it becomes visible and jumps to <main id="main-content">
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Aller au contenu principal" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main-content$/);
    await expect(page.locator("main#main-content")).toHaveCount(1);
  });

  test("blog list opens a post", async ({ page }) => {
    await page.goto("/fr/blog");
    await expect(page.locator("main")).toHaveCount(1);
    const first = page.locator('main a[href*="/blog/"]').first();
    await expect(first).toBeVisible();
    const href = await first.getAttribute("href");
    await first.click();
    await expect(page).toHaveURL(new RegExp(`${href!.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`));
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    await expect(page.locator("article, main").first()).toContainText(/\w{20,}/);
  });

  test("pricing shows the plans and sends anonymous visitors to the login", async ({ page }) => {
    await page.goto("/fr/pricing");
    await expect(page.getByRole("heading", { name: "Choisissez votre plan" })).toBeVisible();
    await page.getByRole("button", { name: /Commencer maintenant/ }).click();
    await expect(page).toHaveURL(/\/auth\/login\?callbackUrl=%2Ffr%2Fpricing/);
  });

  test("contact form validates, then sends", async ({ page }) => {
    await page.goto("/fr/contact");
    await page.locator('button[type="submit"]').click();
    for (const field of ["name", "email", "subject", "message"]) {
      await expect(page.locator(`#${field}-error`)).toBeVisible();
    }
    // errors are linked to their field for assistive technologies
    await expect(page.locator("#email")).toHaveAttribute("aria-invalid", "true");

    await page.locator("#name").fill("Visiteur E2E");
    await page.locator("#email").fill("pas-un-email");
    await page.locator("#subject").fill("Sujet de test e2e");
    await page.locator("#message").fill("Un message suffisamment long pour passer la validation.");
    await page.locator('button[type="submit"]').click();
    await expect(page.locator("#email-error")).toBeVisible();
    await expect(page.locator("#name-error")).toHaveCount(0);

    const email = uniqueEmail("contact");
    await page.locator("#email").fill(email);
    await page.locator('button[type="submit"]').click();
    await expect(page.locator("#email-error")).toHaveCount(0);
    // the confirmation e-mail to the sender is captured (never sent)
    await waitForMail(email);
  });
});

const PUBLIC_PAGES = [
  "/fr",
  "/fr/formations",
  "/fr/blog",
  "/fr/projects",
  "/fr/me",
  "/fr/pricing",
  "/fr/contact",
  "/fr/privacy",
  "/fr/reviews",
  "/fr/community",
  "/fr/tech-mastry",
  "/fr/tech-mastry/algorithms",
  "/fr/tech-mastry/playground",
  "/fr/auth/login",
  "/fr/auth/register",
  "/fr/auth/forgot-password",
];

test.describe("visitor smoke (fr)", () => {
  test("public pages render without an error boundary or a page error", async ({ page }) => {
    for (const path of PUBLIC_PAGES) await expectHealthyPage(page, path);
  });

  test("an unknown page is a real 404", async ({ page }) => {
    const response = await page.goto("/fr/cette-page-n-existe-pas");
    expect(response?.status()).toBe(404);
  });
});

test.describe("visitor (en)", () => {
  test.use({ lang: "en" });

  test("english pages are served in English", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("main")).toHaveCount(1);
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();

    await page.goto("/en/contact");
    await page.locator('button[type="submit"]').click();
    await expect(page.locator("#name-error")).toBeVisible();
    await expect(page.locator("#name-error")).not.toContainText(/Le nom/);
  });
});
