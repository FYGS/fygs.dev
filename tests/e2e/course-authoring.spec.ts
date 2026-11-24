import { randomUUID } from "node:crypto";

import { ADMIN_EMAIL } from "./support/global-setup";
import { createUser, PASSWORD, sql } from "./support/db";
import { expect, signInViaApi, test } from "./support/fixtures";

async function insertCourse(options: { title: string; instructorId: string | null }) {
  const id = randomUUID();
  const slug = `${options.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${id.slice(0, 6)}`;
  await sql(
    `INSERT INTO "Course" (id, title, slug, description, category, level, "accessTier", published, "instructorId", "updatedAt")
     VALUES ($1, $2, $3, 'Une description de test assez longue', 'JAVASCRIPT'::"CourseCategory", 'BEGINNER'::"CourseLevel", 'FREE'::"CourseAccessTier", false, $4, now())`,
    [id, options.title, slug, options.instructorId],
  );
  return { id, slug };
}

test.describe("course authoring (fr)", () => {
  test("an admin builds a course from a title to a published page, without leaving the builder", async ({ page }) => {
    const title = `Formation E2E ${randomUUID().slice(0, 6)}`;
    await page.goto("/fr");
    await signInViaApi(page, ADMIN_EMAIL, PASSWORD);

    // creation asks for a title only and lands in the builder on the programme
    await page.goto("/fr/admin/courses/new");
    await page.getByLabel("Titre de la formation").fill(title);
    await page.getByRole("button", { name: "Créer et commencer" }).click();
    await expect(page).toHaveURL(/\/admin\/courses\/[^/?]+\?section=programme/);
    const courseId = new URL(page.url()).pathname.split("/").pop()!;

    // a module and a lesson, each with just a title
    await page.getByLabel("Titre du nouveau module").fill("Les bases");
    await page.getByRole("button", { name: "Ajouter un module" }).click();
    await expect(page.getByRole("region", { name: /Module 1 : Les bases/ })).toBeVisible();
    await page.getByLabel("Titre de la nouvelle leçon du module Les bases").fill("Introduction");
    await page.getByRole("region", { name: /Module 1/ }).getByRole("button", { name: "Ajouter", exact: true }).click();

    // the lesson opens beside the programme: write, it saves by itself, publish it
    const drawer = page.getByRole("dialog");
    await expect(drawer.getByLabel("Titre", { exact: true })).toHaveValue("Introduction");
    await expect(drawer.getByRole("switch", { name: "Publiée" })).toBeDisabled(); // nothing to show yet
    await drawer.locator(".ProseMirror").click();
    await expect(drawer.locator(".ProseMirror")).toBeFocused(); // keystrokes before this would go to the page
    await page.keyboard.type("Bienvenue dans la formation.");
    await expect(page.getByRole("status").filter({ hasText: "Enregistré" })).toBeVisible();
    await drawer.getByRole("switch", { name: "Publiée" }).click();
    await expect(drawer.getByRole("switch", { name: "Publiée" })).toBeChecked();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Introduction" }).locator("xpath=ancestor::div[1]").getByText("Prête")).toBeVisible();

    // a quiz for the module
    await page.getByRole("button", { name: "Évaluations" }).click();
    await page.getByRole("button", { name: "Ajouter un quiz" }).click();
    await page.getByLabel("Titre", { exact: true }).fill("Quiz du module 1");
    await page.getByLabel("Énoncé").fill("Que fait ce cours ?");
    await page.getByLabel("Réponse 1 de la question 1").fill("Il enseigne");
    await page.getByLabel("Réponse 2 de la question 1").fill("Il dort");
    await page.getByRole("button", { name: "Enregistrer le quiz" }).click();
    await expect(page.getByText("Quiz du module 1")).toBeVisible();

    // the description is typed in Infos; publishing is refused until the cover image exists
    await page.getByRole("button", { name: "Infos" }).click();
    await page.getByLabel("Description", { exact: true }).fill("Une formation complète créée de bout en bout pendant le test.");
    await expect(page.getByRole("status").filter({ hasText: "Enregistré" })).toBeVisible();

    await page.getByRole("button", { name: /^Publier/ }).click();
    const publishDialog = page.getByRole("dialog");
    await expect(publishDialog.getByText("Il reste à compléter")).toBeVisible();
    await expect(publishDialog.getByText("Une image de couverture")).toBeVisible();
    await expect(publishDialog.getByRole("button", { name: "Publier maintenant" })).toBeDisabled();
    await publishDialog.getByRole("button", { name: "Plus tard" }).click();
    expect((await sql(`SELECT published FROM "Course" WHERE id = $1`, [courseId]))[0]).toMatchObject({ published: false });

    // the image upload needs object storage, which the disposable environment does not have: set it as the upload would
    await sql(`UPDATE "Course" SET thumbnail = (SELECT thumbnail FROM "Course" WHERE thumbnail IS NOT NULL AND id <> $1 LIMIT 1) WHERE id = $1`, [courseId]);
    await page.reload();
    await page.getByRole("button", { name: /^Publier/ }).click();
    await page.getByRole("button", { name: "Publier maintenant" }).click();
    await expect(page.getByText("Publiée", { exact: true }).first()).toBeVisible();

    const [course] = await sql<{ published: boolean; slug: string; publishedAt: Date | null; duration: number | null }>(
      `SELECT published, slug, "publishedAt", duration FROM "Course" WHERE id = $1`,
      [courseId],
    );
    expect(course.published).toBe(true);
    expect(course.publishedAt).not.toBeNull();

    // the public page is live
    const response = await page.goto(`/fr/formations/${course.slug}`);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: title }).first()).toBeVisible();
  });

  test("an instructor sees and edits only their own courses", async ({ page }) => {
    const instructor = await createUser({ name: "Instructeur Auteur", role: "INSTRUCTOR" });
    const mine = await insertCourse({ title: "Ma formation à moi", instructorId: instructor.id });
    const theirs = await insertCourse({ title: "Formation de la maison", instructorId: null });

    await page.goto("/fr");
    await signInViaApi(page, instructor.email, instructor.password);

    await page.goto("/fr/admin/courses");
    await expect(page.getByRole("link", { name: "Ma formation à moi" })).toBeVisible();
    await expect(page.getByText("Formation de la maison")).toHaveCount(0);

    await page.goto(`/fr/admin/courses/${mine.id}`);
    await expect(page.getByRole("heading", { name: "Ma formation à moi" })).toBeVisible();

    await page.goto(`/fr/admin/courses/${theirs.id}`);
    await expect(page).not.toHaveURL(new RegExp(`/admin/courses/${theirs.id}`));
  });

  test("the retired lesson pages are gone", async ({ page }) => {
    await page.goto("/fr");
    await signInViaApi(page, ADMIN_EMAIL, PASSWORD);
    for (const path of ["/fr/admin/lessons", "/fr/admin/lessons/new"]) {
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(404);
    }
  });
});
