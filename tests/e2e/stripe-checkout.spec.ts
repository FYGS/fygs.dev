import { createUser } from "./support/db";
import { expect, signInViaApi, test } from "./support/fixtures";

/**
 * Smoke only: the app creates a real Checkout Session with the Stripe TEST key and sends the
 * browser to Stripe's hosted page. Nothing is paid; we stop at the URL. Needs network access
 * to api.stripe.com (scripts/e2e.mjs passes STRIPE_* from .env only when the key is sk_test_).
 */
test.describe("subscription checkout (fr)", () => {
  test.skip(!process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_"), "no Stripe test key in the environment");

  test("pricing -> subscribe lands on a Stripe-hosted checkout page", async ({ page }) => {
    const user = await createUser({ name: "Abonné E2E" });
    await page.goto("/fr");
    await signInViaApi(page, user.email, user.password);

    await page.goto("/fr/pricing");
    await page.getByRole("button", { name: /Commencer maintenant/ }).click();
    await page.waitForURL(/^https:\/\/checkout\.stripe\.com\/c\/pay\/cs_test_/, { timeout: 45_000, waitUntil: "commit" });
    expect(new URL(page.url()).hostname).toBe("checkout.stripe.com");
  });
});
