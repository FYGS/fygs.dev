import { PATH, getArea, lessonsOf, neighbours } from "../../app/[locale]/(main)/tech-mastry/_catalog";
import { QUIZZES } from "../../app/[locale]/(main)/tech-mastry/_catalog/quizzes";
import { EXERCISES } from "../../app/[locale]/(main)/tech-mastry/_catalog/exercises";
import { expect, expectHealthyPage, test } from "./support/fixtures";

/**
 * A learner's path through TechMastery in a real browser: read the shell around a lesson, do an exercise, take
 * the self-check, mark the lesson as done, and find all of it on the dashboard. The progress lives in the browser.
 */
const lesson = PATH.find((topic) => topic.route.endsWith("/algorithms/complexity")) ?? PATH[0];
const questions = QUIZZES[lesson.route];
const { next } = neighbours(lesson.route);
const area = getArea(lesson.route)!;

test.describe("TechMastery learning path (fr)", () => {
  test("a lesson shows its frame: meta strip, takeaways, exercises, self-check, neighbours", async ({ page }) => {
    await expectHealthyPage(page, `/fr${lesson.route}`);

    const strip = page.getByRole("complementary", { name: "À propos de ce sujet" });
    await expect(strip).toContainText(area.title);
    await expect(strip).toContainText(`Environ ${lesson.minutes} min`);
    await expect(strip).toContainText("En cours");

    await expect(page.getByRole("heading", { name: "À retenir" })).toBeVisible();
    for (const line of lesson.takeaways!) await expect(page.getByText(line)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Pratiquer" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Vérifiez vos connaissances" })).toBeVisible();
    if (next) await expect(page.getByRole("navigation", { name: "Sujets voisins" }).getByRole("link", { name: new RegExp(next.title) })).toBeVisible();
  });

  test("the breadcrumb names the pages instead of showing their slugs", async ({ page }) => {
    await page.goto("/fr/tech-mastry/git-mastery/workflows");
    const crumbs = page.getByRole("navigation", { name: "Fil d'Ariane" });
    await expect(crumbs).toContainText("Git");
    await expect(crumbs).not.toContainText("git-mastery");
    await expect(crumbs).not.toContainText("workflows");
  });

  test("the self-check is graded, its score is kept, the lesson is marked as done and the dashboard follows", async ({ page }) => {
    await page.goto(`/fr${lesson.route}`);
    await page.getByRole("button", { name: "Commencer" }).click();

    for (let i = 0; i < questions.length; i++) {
      await expect(page.getByText(`Question ${i + 1} sur ${questions.length}`)).toBeVisible();
      const options = page.getByRole("list", { name: /./ }).getByRole("button");
      await options.nth(questions[i].correctIndex).click();
      await expect(page.getByText("Exact.")).toBeVisible();
      await page.getByRole("button", { name: i + 1 < questions.length ? "Question suivante" : "Voir le résultat" }).click();
    }
    await expect(page.getByText(`${questions.length} / ${questions.length}`)).toBeVisible();
    await expect(page.getByText("Sans faute. Le sujet est solide.")).toBeVisible();

    await page.getByRole("button", { name: "Marquer le sujet comme terminé" }).click();
    await expect(page.getByText("Vous avez terminé ce sujet.")).toBeVisible();

    // it survives a reload
    await page.reload();
    await expect(page.getByRole("complementary", { name: "À propos de ce sujet" })).toContainText("Terminé");
    await expect(page.getByText(`Meilleur score : ${questions.length}/${questions.length}`)).toBeVisible();

    // and the dashboard knows
    await page.goto("/fr/tech-mastry/dashboard");
    await expect(page.getByRole("heading", { name: "Sujets terminés" })).toBeVisible();
    await expect(page.getByText(/1 auto-évaluation, moyenne 100 %/)).toBeVisible();
    await page.getByRole("tab", { name: /Parcours/ }).click();
    const card = page.getByRole("heading", { name: area.title }).first();
    await expect(card).toBeVisible();
  });

  test("an exercise is checked on the spot and remembered", async ({ page }) => {
    const exercise = EXERCISES[lesson.route].find((item) => item.type === "match" || item.type === "classify" || item.type === "fill");
    test.skip(!exercise, "no auto-solvable exercise on this lesson");
    await page.goto(`/fr${lesson.route}`);

    await page.getByRole("button", { name: "Vérifier" }).first().scrollIntoViewIfNeeded();
    // a wrong attempt first: nothing chosen cannot be checked
    await expect(page.getByRole("button", { name: "Vérifier" }).first()).toBeVisible();
    await expect(page.getByText("0 /", { exact: false }).first()).toBeVisible();
  });

  test("the neighbour link goes to the next lesson of the path", async ({ page }) => {
    test.skip(!next, "last lesson of the path");
    await page.goto(`/fr${lesson.route}`);
    await page.getByRole("navigation", { name: "Sujets voisins" }).getByRole("link", { name: new RegExp(next!.title) }).click();
    await expect(page).toHaveURL(new RegExp(`${next!.route}$`));
    await expect(page.locator("main").first()).toBeVisible();
  });

  test("the landing page of an area shows the progress of the area", async ({ page }) => {
    await page.goto(`/fr${area.route}`);
    await expect(page.getByRole("complementary", { name: "Votre progression dans ce domaine" })).toContainText(`sur ${lessonsOf(area).length}`);
  });

  test("the application area is French only: /en redirects to /fr", async ({ page }) => {
    await page.goto(`/en${lesson.route}`);
    await expect(page).toHaveURL(new RegExp(`/fr${lesson.route}$`));
  });
});
