import { createUser, PASSWORD, uniqueEmail } from "./support/db";
import { apiPost, expect, test } from "./support/fixtures";
import { waitForLink } from "./support/mailbox";

const NEW_PASSWORD = "Another-Passw0rd!y";

async function fillLogin(page: import("@playwright/test").Page, email: string, password: string) {
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Se connecter" }).click();
}

test.describe("authentication (fr)", () => {
  test("sign up, verify the captured e-mail (auto sign-in), profile, sign out", async ({ page }) => {
    const email = uniqueEmail("signup");
    await page.goto("/fr/auth/register");
    await page.locator("#name").fill("Camille E2E");
    await page.locator("#email").fill(email);
    await page.locator("#password").fill(PASSWORD);
    await page.locator("#confirmPassword").fill(PASSWORD);
    await page.locator("#acceptTerms").click();
    await page.getByRole("button", { name: "Créer mon compte" }).click();
    await expect(page).toHaveURL(/\/fr\/auth\/verify\?email=/);

    // not verified yet: the profile is still behind the login
    await page.goto("/fr/profile");
    await expect(page).toHaveURL(/\/fr\/auth\/login\?callbackUrl=/);

    const link = await waitForLink(email, /\/api\/auth\/verify-email\?token=/);
    await page.goto(link);

    // autoSignInAfterVerification: the session exists without typing the password
    await page.goto("/fr/profile");
    await expect(page).toHaveURL(/\/fr\/profile$/);
    await expect(page.getByRole("heading", { level: 1, name: "Camille E2E" })).toBeVisible();

    await page.locator("header").getByRole("button").filter({ has: page.locator("[data-slot=avatar], span.rounded-full") }).first().click();
    await page.getByRole("menuitem", { name: "Se déconnecter" }).click();
    await expect.poll(async () => (await page.request.get("/api/auth/get-session")).json()).toBeNull();
    // signing out sends the browser to the catalogue: let that navigation finish before starting another one
    await expect(page).not.toHaveURL(/\/fr\/profile$/);
    await page.waitForLoadState("load");
    await page.goto("/fr/profile");
    await expect(page).toHaveURL(/\/fr\/auth\/login/);
  });

  test("unverified account cannot sign in", async ({ page }) => {
    const email = uniqueEmail("unverified");
    await apiPost(page, "/api/auth/sign-up/email", { email, password: PASSWORD, name: "Pas Vérifié" });
    await page.goto("/fr/auth/login");
    await fillLogin(page, email, PASSWORD);
    await expect(page.getByRole("alert").first()).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("wrong password is refused, then the right one signs in", async ({ page }) => {
    const user = await createUser({ name: "Login E2E" });
    await page.goto("/fr/auth/login");
    await fillLogin(page, user.email, "mauvais-mot-de-passe");
    await expect(page.getByRole("alert").first()).toBeVisible();
    await expect(page).toHaveURL(/\/fr\/auth\/login/);

    await page.locator("#password").fill(user.password);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page).toHaveURL(/\/fr\/dashboard/);
  });

  test("forgot password: captured reset link, new password, old one stops working", async ({ page }) => {
    const user = await createUser({ name: "Reset E2E" });
    await page.goto("/fr/auth/forgot-password");
    await page.locator("#email").fill(user.email);
    await page.locator('button[type="submit"]').click();

    const link = await waitForLink(user.email, /reset-password/);
    await page.goto(link);
    await expect(page).toHaveURL(/\/fr\/auth\/reset-password\?token=/);
    await page.locator("#password").fill(NEW_PASSWORD);
    await page.locator("#confirmPassword").fill(NEW_PASSWORD);
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\/fr\/auth\/login/);

    await fillLogin(page, user.email, user.password);
    await expect(page.getByRole("alert").first()).toBeVisible();
    await page.locator("#password").fill(NEW_PASSWORD);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page).toHaveURL(/\/fr\/dashboard/);
  });
});
