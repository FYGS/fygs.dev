import type { Page } from "@playwright/test";

import { expect, test } from "./support/fixtures";

/**
 * Learners' code runs in the code sandbox (public/sandbox): an iframe with an opaque origin
 * and its own CSP, evaluating in a worker it can kill. The site's CSP forbids eval in the pages
 * themselves, so this only works if the whole chain works in a PRODUCTION build: headers,
 * iframe, blob worker, messaging. A unit test cannot tell.
 */

const TWO_SUM = `function twoSum(nums, target) {
  const seen = {};
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (need in seen) return [seen[need], i];
    seen[nums[i]] = i;
  }
  return [];
}`;

async function openTwoSum(page: Page) {
  await page.goto("/fr/tech-mastry/challenges");
  await page.getByRole("button", { name: /Two Sum/ }).click();
  await expect(page.locator(".monaco-editor").first()).toBeVisible({ timeout: 45_000 });
}

async function typeSolution(page: Page, code: string) {
  await page.locator(".monaco-editor .view-lines").first().click();
  await page.keyboard.press("Control+A");
  await page.keyboard.insertText(code);
}

const submit = (page: Page) => page.getByRole("button", { name: "Submit Solution" }).click();

test.describe("code sandbox", () => {
  test("is served on its own, with a strict policy and nothing else", async ({ request }) => {
    const html = await request.get("/sandbox/runner.html");
    expect(html.status()).toBe(200);

    const csp = html.headers()["content-security-policy"];
    expect(csp).toContain("default-src 'none'");
    expect(csp).toContain("script-src 'self' 'unsafe-eval'");
    expect(csp).toContain("connect-src 'none'");
    expect(csp).toContain("worker-src blob:");
    expect(csp).toContain("frame-ancestors 'self'");
    // a second policy would be intersected with this one and silently take eval away again
    expect(html.headers()["content-security-policy-report-only"]).toBeUndefined();
    expect(html.headers()["x-frame-options"]).toBe("SAMEORIGIN");

    const script = await request.get("/sandbox/runner.js");
    expect(script.status()).toBe(200);
    expect(script.headers()["content-type"]).toContain("javascript");
  });

  test("the pages themselves still cannot eval", async ({ page }) => {
    await page.goto("/fr/tech-mastry/challenges");

    // page.evaluate() would not tell: the debugger protocol is allowed to eval whatever the CSP says.
    // A script of the page is subject to it.
    const outcome = await page.evaluate(() => {
      const script = document.createElement("script");
      script.textContent =
        "try { new Function('return 1')(); window.__evalOutcome = 'allowed'; } catch (error) { window.__evalOutcome = error.name; }";
      document.head.appendChild(script);
      return (window as unknown as { __evalOutcome?: string }).__evalOutcome;
    });

    expect(outcome).toBe("EvalError");
  });

  test("a challenge is graded for real: right, wrong, broken and endless code", async ({ page }) => {
    const violations: string[] = [];
    page.on("console", (message) => {
      if (/Content Security Policy|Refused to/i.test(message.text())) violations.push(message.text());
    });
    await openTwoSum(page);

    // a correct solution passes every test, hidden ones included
    await typeSolution(page, TWO_SUM);
    await submit(page);
    await expect(page.getByText("All Tests Passed!")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("4/4").first()).toBeVisible();
    await expect(page.getByText("Solved")).toBeVisible();

    // a wrong one fails and shows what it returned
    await typeSolution(page, "function twoSum(nums, target) { return [7, 7]; }");
    await submit(page);
    await expect(page.getByText("Some Tests Failed")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("[7,7]").first()).toBeVisible();

    // a syntax error is not a wrong answer
    await typeSolution(page, "function twoSum(nums, target) { return [");
    await submit(page);
    await expect(page.getByRole("alert").filter({ hasText: "Your code could not run" })).toBeVisible({ timeout: 30_000 });

    // an endless loop is stopped, and the page stays usable
    await typeSolution(page, "function twoSum(nums, target) { while (true) {} }");
    await submit(page);
    await expect(page.getByText("Time limit exceeded").first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole("button", { name: "Submit Solution" })).toBeEnabled();
    await page.getByRole("button", { name: /Back to Challenges/ }).click();
    await expect(page.getByRole("button", { name: /Valid Parentheses/ })).toBeVisible();

    expect(violations).toEqual([]);
  });

  test("console output reaches the learner", async ({ page }) => {
    await openTwoSum(page);

    await typeSolution(page, `function twoSum(nums, target) { console.log("probing", nums.length); return []; }`);
    await submit(page);

    await expect(page.getByText("probing 4").first()).toBeVisible({ timeout: 30_000 });
  });

  test("the sandbox frame can reach neither the site nor the network", async ({ page }) => {
    await openTwoSum(page);
    await typeSolution(page, TWO_SUM);
    await submit(page);
    await expect(page.getByText("All Tests Passed!")).toBeVisible({ timeout: 30_000 });

    const frame = page.frames().find((candidate) => candidate.url().endsWith("/sandbox/runner.html"));
    expect(frame, "the sandbox iframe exists").toBeTruthy();

    const probes = await frame!.evaluate(async () => {
      const attempt = async (name: string, action: () => unknown) => {
        try {
          await action();
          return `${name}: reachable`;
        } catch (error) {
          return `${name}: ${(error as Error).name}`;
        }
      };
      return Promise.all([
        attempt("localStorage", () => localStorage.length),
        attempt("cookies", () => document.cookie),
        attempt("parent DOM", () => window.parent.document.title),
        attempt("fetch", () => fetch("/api/health")),
      ]);
    });

    expect(probes).toEqual([
      "localStorage: SecurityError",
      "cookies: SecurityError",
      "parent DOM: SecurityError",
      "fetch: TypeError", // connect-src 'none'
    ]);
  });
});
