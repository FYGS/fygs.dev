import { expect, test } from "./support/fixtures";

const PLAYGROUND = "/fr/tech-mastry/playground";

test.describe("security headers", () => {
  test("regular pages: CSP, frame protection, no isolation headers, no x-powered-by", async ({ request }) => {
    for (const path of ["/fr", "/fr/blog", "/fr/pricing", "/fr/auth/login"]) {
      const res = await request.get(path);
      expect(res.status(), path).toBe(200);
      const h = res.headers();
      expect(h["x-powered-by"], path).toBeUndefined();
      expect(h["x-frame-options"], path).toBe("SAMEORIGIN");
      expect(h["x-content-type-options"], path).toBe("nosniff");
      expect(h["referrer-policy"], path).toBe("strict-origin-when-cross-origin");
      expect(h["strict-transport-security"], path).toContain("max-age=");
      expect(h["content-security-policy"], path).toMatch(/default-src/);
      expect(h["content-security-policy"], path).toMatch(/frame-ancestors/);
      // cross-origin isolation would break third-party embeds: playground only
      expect(h["cross-origin-embedder-policy"], path).toBeUndefined();
      expect(h["cross-origin-opener-policy"], path).toBeUndefined();
    }
  });

  test("playground is cross-origin isolated with its own CSP", async ({ request }) => {
    const res = await request.get(PLAYGROUND);
    expect(res.status()).toBe(200);
    const h = res.headers();
    expect(h["cross-origin-embedder-policy"]).toBe("require-corp");
    expect(h["cross-origin-opener-policy"]).toBe("same-origin");
    expect(h["x-frame-options"]).toBe("SAMEORIGIN");
    expect(h["x-powered-by"]).toBeUndefined();
    expect(h["content-security-policy"]).toBeTruthy();

    const regular = (await request.get("/fr")).headers()["content-security-policy"];
    expect(h["content-security-policy"]).not.toBe(regular);
  });

  test("the playground really is isolated in the browser, other pages are not", async ({ page }) => {
    await page.goto(PLAYGROUND);
    expect(await page.evaluate(() => crossOriginIsolated)).toBe(true);
    await page.goto("/fr");
    expect(await page.evaluate(() => crossOriginIsolated)).toBe(false);
  });

  test("API responses do not leak the framework either", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.status()).toBe(200);
    expect(res.headers()["x-powered-by"]).toBeUndefined();
    expect(res.headers()["x-frame-options"]).toBe("SAMEORIGIN");
  });
});
