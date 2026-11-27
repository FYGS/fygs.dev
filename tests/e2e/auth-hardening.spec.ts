import { createUser, PASSWORD, sql, uniqueIp } from "./support/db";
import { expect, signInViaApi, test } from "./support/fixtures";
import { totpNow } from "./support/two-factor";

/** RFC 4648 base32 -> the string an authenticator application holds (the secret is plain ASCII). */
function decodeBase32(value: string): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const character of value.replace(/[\s=]/g, "").toUpperCase()) bits += alphabet.indexOf(character).toString(2).padStart(5, "0");
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes).toString("utf8");
}

async function fillLogin(page: import("@playwright/test").Page, email: string, password: string) {
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Se connecter" }).click();
}

async function enterCode(page: import("@playwright/test").Page, code: string) {
  // The form is server-rendered: a value typed before React hydrates is lost and the button stays disabled, so type again until it takes
  await expect(async () => {
    await page.locator("#two-factor-code").fill(code);
    await expect(page.getByRole("button", { name: "Vérifier" })).toBeEnabled({ timeout: 1_000 });
  }).toPass({ timeout: 15_000 });
}

const HOSTILE = ["https://evil.example/phish", "//evil.example/phish", "javascript:window.__pwned=1", "/\\evil.example"];

test.describe("sign-in redirects stay on the site (fr)", () => {
  for (const hostile of HOSTILE) {
    test(`callbackUrl=${hostile} ends on the dashboard of this site`, async ({ page }) => {
      const user = await createUser({ name: "Redirection E2E" });
      await page.goto(`/fr/auth/login?callbackUrl=${encodeURIComponent(hostile)}`);
      await fillLogin(page, user.email, user.password);
      await expect(page).toHaveURL(/\/fr\/dashboard/);
      expect(new URL(page.url()).origin).toBe(new URL(process.env.E2E_BASE_URL!).origin);
      expect(await page.evaluate(() => (window as unknown as { __pwned?: number }).__pwned)).toBeUndefined();
    });
  }

  test("a path of the site is honoured", async ({ page }) => {
    const user = await createUser({ name: "Redirection E2E" });
    await page.goto(`/fr/auth/login?callbackUrl=${encodeURIComponent("/fr/formations")}`);
    await fillLogin(page, user.email, user.password);
    await expect(page).toHaveURL(/\/fr\/formations/);
  });
});

test.describe("staff and the second factor (fr)", () => {
  test("an instructor without one is sent to set it up, and gets the role once it is on", async ({ page }) => {
    // a staff account that never enrolled: made in the database, not through createUser (which enrols staff)
    const user = await createUser({ name: "Formateur Sans 2FA" });
    await sql(`UPDATE "user" SET role = 'INSTRUCTOR' WHERE id = $1`, [user.id]);
    await page.goto("/fr");
    await signInViaApi(page, user.email, user.password);

    await page.goto("/fr/admin");
    await expect(page).toHaveURL(/\/fr\/profile\/security\?required=1/);
    await expect(page.getByRole("alert").filter({ hasText: "Activez la double authentification" })).toBeVisible();

    // set it up like a person would
    await page.getByRole("button", { name: "Activer la double authentification" }).click();
    await page.locator("#tf-password").fill(user.password);
    await page.getByRole("button", { name: "Continuer" }).click();
    const key = await page.getByLabel("Clé de configuration").innerText();
    await page.locator("#tf-code").fill(totpNow(decodeBase32(key)));
    await page.getByRole("button", { name: "Activer" }).click();

    await expect(page.getByText("Conservez ces codes de secours")).toBeVisible();
    await expect(page.getByRole("list", { name: "Codes de secours" }).getByRole("listitem")).toHaveCount(10);
    await page.getByRole("button", { name: /J'ai conservé mes codes/ }).click();

    // the role is usable now
    await expect(page).toHaveURL(/\/fr\/admin/);
    const [row] = await sql<{ twoFactorEnabled: boolean }>(`SELECT "twoFactorEnabled" FROM "user" WHERE id = $1`, [user.id]);
    expect(row.twoFactorEnabled).toBe(true);
    const audit = await sql<{ action: string }>(`SELECT action FROM "AuditLog" WHERE "targetId" = $1`, [user.id]);
    expect(audit.map((a) => a.action)).toContain("user.two_factor_enabled");
  });

  test("an enrolled instructor signs in with the password, then with a code", async ({ page }) => {
    const user = await createUser({ name: "Formateur Avec 2FA", role: "INSTRUCTOR" });
    await page.goto("/fr/auth/login");
    await fillLogin(page, user.email, user.password);
    await expect(page).toHaveURL(/\/fr\/auth\/two-factor/);

    // nothing is open yet
    await page.goto("/fr/admin");
    await expect(page).toHaveURL(/\/fr\/auth\/login/);

    await page.goto("/fr/auth/login");
    await fillLogin(page, user.email, user.password);
    await expect(page).toHaveURL(/\/fr\/auth\/two-factor/);
    await enterCode(page, "000000");
    await page.getByRole("button", { name: "Vérifier" }).click();
    await expect(page.locator("#two-factor-error")).toContainText("Code incorrect");

    await enterCode(page, totpNow());
    await page.getByRole("button", { name: "Vérifier" }).click();
    await expect(page).toHaveURL(/\/fr\/dashboard/);
    await page.goto("/fr/admin");
    await expect(page).toHaveURL(/\/fr\/admin/);
  });

  test("an instructor cannot switch the factor off from the security page", async ({ page }) => {
    const user = await createUser({ name: "Formateur Protégé", role: "INSTRUCTOR" });
    await page.goto("/fr");
    await signInViaApi(page, user.email, user.password);
    await page.goto("/fr/profile/security");
    await expect(page.getByText("ne peut pas désactiver sa double authentification")).toBeVisible();
    await expect(page.getByRole("button", { name: "Désactiver" })).toHaveCount(0);
  });
});

test.describe("account data (fr)", () => {
  test("the e-mail address cannot be changed through the profile endpoint", async ({ page }) => {
    const user = await createUser({ name: "Profil E2E" });
    await page.goto("/fr");
    await signInViaApi(page, user.email, user.password);
    const origin = new URL(process.env.E2E_BASE_URL!).origin;

    const response = await page.request.patch("/api/profile", {
      data: { name: "Nouveau Nom", email: "squatted@example.com" },
      headers: { origin, "x-forwarded-for": uniqueIp() },
    });
    expect(response.status()).toBe(400);
    const [row] = await sql<{ email: string; name: string }>(`SELECT email, name FROM "user" WHERE id = $1`, [user.id]);
    expect(row.email).toBe(user.email);
    expect(row.name).toBe("Profil E2E");

    const renamed = await page.request.patch("/api/profile", {
      data: { name: "Nouveau Nom" },
      headers: { origin, "x-forwarded-for": uniqueIp() },
    });
    expect(renamed.status()).toBe(200);
  });

  test("asking for a new address sends the approval to the current one and changes nothing", async ({ page }) => {
    const user = await createUser({ name: "Adresse E2E" });
    await page.goto("/fr");
    await signInViaApi(page, user.email, user.password);
    await page.goto("/fr/profile/security");
    await page.locator("#new-email").fill("nouvelle-adresse@example.com");
    await page.getByRole("button", { name: "Demander le changement" }).click();
    await expect(page.getByRole("status")).toContainText("Demande envoyée");
    const [row] = await sql<{ email: string }>(`SELECT email FROM "user" WHERE id = $1`, [user.id]);
    expect(row.email).toBe(user.email);
  });

  test("a person erases their account: anonymised, signed out, unable to sign in again", async ({ page }) => {
    const user = await createUser({ name: "À Supprimer" });
    await page.goto("/fr");
    await signInViaApi(page, user.email, user.password);
    await page.goto("/fr/profile/security");
    await page.getByRole("button", { name: /Supprimer mon compte/ }).click();
    await page.locator("#delete-password").fill(user.password);
    await page.locator("#delete-confirmation").fill("SUPPRIMER");
    await page.getByRole("button", { name: "Supprimer définitivement" }).click();
    await expect(page).toHaveURL(/\/fr\/?$/);

    const [row] = await sql<{ name: string; email: string }>(`SELECT name, email FROM "user" WHERE id = $1`, [user.id]);
    expect(row.name).toBe("Compte supprimé");
    expect(row.email).toBe(`deleted-${user.id}@deleted.invalid`);

    await page.goto("/fr/auth/login");
    await fillLogin(page, user.email, PASSWORD);
    await expect(page.getByRole("alert").first()).toBeVisible();
  });

  test("wrong confirmation or password erases nothing", async ({ page }) => {
    const user = await createUser({ name: "Reste Là" });
    await page.goto("/fr");
    await signInViaApi(page, user.email, user.password);
    await page.goto("/fr/profile/security");
    await page.getByRole("button", { name: /Supprimer mon compte/ }).click();
    await page.locator("#delete-password").fill("pas-le-bon-mot-de-passe");
    await page.locator("#delete-confirmation").fill("SUPPRIMER");
    await page.getByRole("button", { name: "Supprimer définitivement" }).click();
    // the route announcer of Next is also an alert: look at the one that carries the message
    await expect(page.getByRole("alert").filter({ hasText: "Mot de passe incorrect" })).toBeVisible();
    const [row] = await sql<{ name: string }>(`SELECT name FROM "user" WHERE id = $1`, [user.id]);
    expect(row.name).toBe("Reste Là");
  });
});
