import type { Page } from "@playwright/test";

import { expect, test } from "./support/fixtures";

/**
 * WebContainer (real Node.js in the browser) needs network access to StackBlitz and a
 * cross-origin isolated page. It cannot boot offline / in CI, so these tests hide
 * `SharedArrayBuffer` before the page loads: the playground then takes its documented
 * fallback and runs JavaScript/TypeScript in a sandboxed iframe. The AI assistant has
 * no API key in this environment and answers in its offline mode.
 */
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Reflect.deleteProperty(globalThis, "SharedArrayBuffer");
  });
});

async function openPlayground(page: Page) {
  await page.goto("/fr/tech-mastry/playground");
  await expect(page.locator(".monaco-editor").first()).toBeVisible({ timeout: 45_000 });
}

async function replaceEditorContent(page: Page, code: string) {
  await page.locator(".monaco-editor .view-lines").first().click();
  await page.keyboard.press("Control+A");
  await page.keyboard.insertText(code);
}

test.describe("playground (fr)", () => {
  test("Monaco loads and the default template runs", async ({ page }) => {
    await openPlayground(page);
    await expect(page.locator(".monaco-editor")).toContainText("Welcome to FYGS Playground");

    await page.getByRole("button", { name: /Run/ }).first().click();
    await expect(page.getByText("Hello, Developer! You are 25 years old.")).toBeVisible({ timeout: 30_000 });
  });

  test("the AI assistant answers offline (Ctrl+I), and explains a console error", async ({ page }) => {
    await openPlayground(page);

    await page.locator(".monaco-editor .view-lines").first().click();
    await page.keyboard.press("Control+I");
    const panel = page.getByTestId("pg-ai-panel");
    await expect(panel).toBeVisible();
    await expect(panel.getByTestId("ai-offline-badge").first()).toBeVisible();

    const input = panel.locator("textarea");
    await expect(input).toBeFocused();
    await input.fill("Explique ce code");
    await input.press("Enter");
    await expect(panel.getByTestId("ai-message").last()).toContainText(/Aperçu : \d+ ligne/, { timeout: 30_000 });
    const answered = await panel.getByTestId("ai-message").count();
    expect(answered).toBe(1); // assistant messages only

    // make the code fail, run it, ask for an explanation of the error
    await replaceEditorContent(page, 'const user = undefined;\nconsole.log(user.name);\n');
    await page.getByRole("button", { name: /Run/ }).first().click();
    const explain = page.getByTestId("pg-explain-error");
    await expect(explain).toBeVisible({ timeout: 30_000 });
    await explain.click();
    await expect(panel.getByTestId("ai-message")).toHaveCount(answered + 1, { timeout: 30_000 });
    await expect(panel.getByTestId("ai-message").last()).toContainText(/undefined|name|TypeError/i);
  });
});
