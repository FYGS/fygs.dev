import { test as base, expect, type Cookie, type Page } from "@playwright/test";

import { PASSWORD, uniqueIp } from "./db";
import { STAFF_TOTP_SECRET, totpNow } from "./two-factor";

export { expect };

type Lang = "fr" | "en";

/**
 * Shared fixtures:
 * - `lang`: locale of the test (fr by default); the locale cookies skip the "choose your language" modal.
 * - every test gets its own client IP for the app's rate limiter (it trusts the last
 *   X-Forwarded-For hop), added on same-origin /api calls only so that third-party
 *   requests never get a non-CORS-safelisted header.
 */
export const test = base.extend<{ lang: Lang; pageErrorGuard: void }>({
  lang: ["fr", { option: true }],

  // Uncaught exceptions in the page (hydration crashes, undefined access...) fail the test.
  pageErrorGuard: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(`${page.url()} -> ${error.message}`));
      await use();
      expect(errors, "uncaught page errors").toEqual([]);
    },
    { auto: true },
  ],

  context: async ({ context, baseURL, lang }, provide) => {
    await context.addCookies([
      { name: "locale_selected", value: "true", url: baseURL! },
      { name: "NEXT_LOCALE", value: lang, url: baseURL! },
    ]);
    const ip = uniqueIp();
    await context.route(
      (url) => url.origin === new URL(baseURL!).origin && url.pathname.startsWith("/api/"),
      (route) => route.continue({ headers: { ...route.request().headers(), "x-forwarded-for": ip } }),
    );
    await provide(context);
  },
});

/** Sessions already opened by this worker, per account: the sign-in endpoint allows 10 attempts per e-mail and 15 minutes. */
const sessionCookies = new Map<string, Cookie[]>();

async function hasSession(page: Page) {
  const res = await page.request.get("/api/auth/get-session", {
    headers: { "x-forwarded-for": uniqueIp() },
  });
  if (!res.ok()) return false;
  const body = await res.json().catch(() => null);
  return Boolean(body?.user);
}

/**
 * Signs in through the real auth endpoint (shares cookies with `page`). A session opened earlier for the same
 * account in this worker is reused while the server still accepts it, so many tests can use the seeded admin
 * without running into the per-e-mail sign-in limit (which stays as strict as in production).
 */
export async function signInViaApi(page: Page, email: string, password = PASSWORD) {
  const cached = sessionCookies.get(email);
  if (cached) {
    await page.context().addCookies(cached);
    if (await hasSession(page)) return;
  }
  const res = await page.request.post("/api/auth/sign-in/email", {
    data: { email, password },
    // page.request bypasses context.route: set the rate-limit bucket here
    headers: { origin: new URL(process.env.E2E_BASE_URL!).origin, "x-forwarded-for": uniqueIp() },
  });
  expect(res.ok(), `sign-in API answered ${res.status()}`).toBe(true);
  // A staff account answers with a second-factor challenge: give the code an authenticator would show
  if ((await res.json().catch(() => null))?.twoFactorRedirect) {
    const verified = await page.request.post("/api/auth/two-factor/verify-totp", {
      data: { code: totpNow(STAFF_TOTP_SECRET) },
      headers: { origin: new URL(process.env.E2E_BASE_URL!).origin, "x-forwarded-for": uniqueIp() },
    });
    expect(verified.ok(), `second factor answered ${verified.status()}`).toBe(true);
  }
  sessionCookies.set(
    email,
    (await page.context().cookies()).filter((c) => !["locale_selected", "NEXT_LOCALE"].includes(c.name)),
  );
}

/** POST to the app's API from the test runner with its own rate-limit bucket. */
export function apiPost(page: Page, path: string, data: unknown) {
  return page.request.post(path, {
    data,
    headers: { origin: new URL(process.env.E2E_BASE_URL!).origin, "x-forwarded-for": uniqueIp() },
  });
}

/** Opens `path` and checks it answered 200, has its landmark and did not fall into an error boundary. */
export async function expectHealthyPage(page: Page, path: string) {
  const response = await page.goto(path);
  expect(response?.status(), path).toBe(200);
  await page.waitForLoadState("load");
  await expect(page.locator("main").first(), path).toBeVisible();
  await expect(page.getByText(/Oups ! Une erreur s'est produite|Something went wrong/), path).toHaveCount(0);
}
