import type { Page } from "@playwright/test";

import { expect, test } from "./support/fixtures";

/**
 * The exercises of the algorithm pages used to call `new Function` in the page, which the site's CSP forbids in
 * production, and the sorting ones looked for a function name that could never exist. They now run in the code
 * sandbox. These tests do what a learner does, on the production build.
 */

async function replaceEditorContent(page: Page, code: string) {
  await page.locator(".monaco-editor .view-lines").first().click();
  await page.keyboard.press("Control+A");
  await page.keyboard.insertText(code);
}

test.describe("searching exercises (fr)", () => {
  async function openExercises(page: Page) {
    await page.goto("/fr/tech-mastry/algorithms/searching");
    await page.getByRole("tab", { name: /Exercices/ }).click();
    await expect(page.locator(".monaco-editor").first()).toBeVisible({ timeout: 45_000 });
  }

  const LINEAR =
    "function linearSearch(arr, target) { for (let i = 0; i < arr.length; i++) { if (arr[i] === target) return i; } return -1; }";

  test("a correct linear search passes every test; a wrong one fails them", async ({ page }) => {
    await openExercises(page);

    await replaceEditorContent(page, LINEAR);
    await page.getByRole("button", { name: "Exécuter" }).click();
    await expect(page.getByText("Résultats des Tests")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("Réussi", { exact: true })).toHaveCount(5);
    await expect(page.getByText("Échoué", { exact: true })).toHaveCount(0);

    await replaceEditorContent(page, "function linearSearch(arr, target) { return 12345; }");
    await page.getByRole("button", { name: "Exécuter" }).click();
    await expect(page.getByText("Échoué", { exact: true })).toHaveCount(5, { timeout: 30_000 });
  });

  test("a syntax error is reported as such, not as five failed tests", async ({ page }) => {
    await openExercises(page);

    await replaceEditorContent(page, "function linearSearch(arr, target) { return ) }");
    await page.getByRole("button", { name: "Exécuter" }).click();

    await expect(page.getByText("Erreur de compilation")).toBeVisible({ timeout: 30_000 });
  });

  test("another exercise starts from its own template, not from what was typed in the previous one", async ({ page }) => {
    await openExercises(page);
    await replaceEditorContent(page, "// my work on the linear search");

    await page.getByRole("tab", { name: "Binaire" }).click();

    await expect(page.locator(".monaco-editor").first()).toContainText("binarySearch");
    await expect(page.locator(".monaco-editor").first()).not.toContainText("my work on the linear search");
  });
});

test.describe("sorting exercises (fr)", () => {
  test("a correct bubble sort passes, a wrong one fails, and the function name is the one in the starter code", async ({ page }) => {
    await page.goto("/fr/tech-mastry/algorithms/sorting");
    await page.getByRole("tab", { name: /Exercices/ }).click();

    const editor = page.locator("textarea").first();
    await expect(editor).toBeVisible();
    await expect(editor).toHaveValue(/function bubbleSort/);

    await editor.fill(
      "function bubbleSort(arr) { const a = [...arr]; for (let i = 0; i < a.length; i++) { for (let j = 0; j < a.length - i - 1; j++) { if (a[j] > a[j + 1]) { [a[j], a[j + 1]] = [a[j + 1], a[j]]; } } } return a; }",
    );
    await page.getByRole("button", { name: /Exécuter/ }).click();
    await expect(page.getByText("Tous les tests ont réussi")).toBeVisible({ timeout: 30_000 });

    await editor.fill("function bubbleSort(arr) { return arr; }");
    await page.getByRole("button", { name: /Exécuter/ }).click();
    await expect(page.getByText(/Test \d+ échoué/).first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("Tous les tests ont réussi")).toHaveCount(0);
  });
});
