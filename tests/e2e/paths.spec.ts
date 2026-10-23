import { randomUUID } from "node:crypto";

import { ADMIN_EMAIL } from "./support/global-setup";
import { createUser, PASSWORD, sql } from "./support/db";
import { expect, expectHealthyPage, signInViaApi, test } from "./support/fixtures";

// The free path of prisma/seed/steps/paths.ts: three free courses
const FREE_PATH = "bases-du-web-moderne";

async function pathCourseIds(): Promise<string[]> {
  const rows = await sql<{ courseId: string }>(
    `SELECT pc."courseId" FROM "PathCourse" pc JOIN "Path" p ON p.id = pc."pathId" WHERE p.slug = $1 ORDER BY pc."order"`,
    [FREE_PATH],
  );
  return rows.map((r) => r.courseId);
}

/** Everything a learner must do in a course (lessons, quizzes, final exam), written straight to the database. */
async function completeCourse(userId: string, courseId: string) {
  for (const lesson of await sql<{ id: string }>(`SELECT id FROM "Lesson" WHERE "courseId" = $1 AND published = true`, [courseId])) {
    await sql(
      `INSERT INTO "Progress" (id, "userId", "lessonId", completed, "completedAt") VALUES ($1, $2, $3, true, now()) ON CONFLICT DO NOTHING`,
      [randomUUID(), userId, lesson.id],
    );
  }
  for (const quiz of await sql<{ id: string }>(`SELECT id FROM "Quiz" WHERE "courseId" = $1`, [courseId])) {
    await sql(
      `INSERT INTO "QuizResult" (id, "userId", "quizId", score, total, percentage) VALUES ($1, $2, $3, 1, 1, 100) ON CONFLICT DO NOTHING`,
      [randomUUID(), userId, quiz.id],
    );
  }
  for (const exam of await sql<{ id: string }>(`SELECT id FROM "FinalExam" WHERE "courseId" = $1 AND published = true`, [courseId])) {
    await sql(
      `INSERT INTO "ExamResult" (id, "userId", "examId", score, total, percentage, passed, answers) VALUES ($1, $2, $3, 1, 1, 100, true, '[]') ON CONFLICT DO NOTHING`,
      [randomUUID(), userId, exam.id],
    );
  }
}

test.describe("learning paths (fr)", () => {
  test("a visitor browses the catalogue and reads a path", async ({ page }) => {
    await expectHealthyPage(page, "/fr/parcours");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const card = page.locator(`main a[href$="/parcours/${FREE_PATH}"]`).first();
    await expect(card).toBeVisible();

    // filters work without JavaScript: a GET form
    await page.goto("/fr/parcours?q=zzzzzz-introuvable");
    await expect(page.getByText("Aucun parcours ne correspond")).toBeVisible();

    await page.goto(`/fr/parcours/${FREE_PATH}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("list", { name: "Formations du parcours" }).getByRole("listitem")).toHaveCount(3);
    await expect(page.getByRole("link", { name: /Se connecter pour commencer/ })).toBeVisible();
    const ld = await page.locator('script[type="application/ld+json"]').evaluateAll((nodes) => nodes.map((n) => n.textContent ?? ""));
    expect(ld.filter((text) => text.includes('"hasCourse"'))).toHaveLength(1);
  });

  test("an unknown path and an unknown certificate code are clean 404 / not-found states", async ({ page }) => {
    // the page streams behind its loading skeleton, so the status line is already sent: the not-found
    // screen and the noindex directive are what a visitor and a crawler get
    await page.goto("/fr/parcours/ce-parcours-n-existe-pas");
    await expect(page.getByRole("heading", { name: "Oups ! Page introuvable" })).toBeVisible();
    await expect(page.locator('meta[name="robots"][content="noindex"]').first()).toBeAttached();
    await page.goto(`/fr/parcours/verification/${"0".repeat(32)}`);
    await expect(page.getByRole("heading", { name: "Certificat introuvable" })).toBeVisible();
  });

  test("a learner starts a path, finishes it and gets a verifiable certificate", async ({ page, context }) => {
    const user = await createUser({ name: "Apprenante Parcours" });
    await page.goto("/fr");
    await signInViaApi(page, user.email, user.password);

    await page.goto(`/fr/parcours/${FREE_PATH}`);
    await page.getByRole("button", { name: "Commencer le parcours" }).click();
    await expect(page.getByRole("link", { name: "Continuer le parcours" })).toBeVisible({ timeout: 30_000 });
    const [{ count }] = await sql<{ count: string }>(`SELECT count(*) FROM "Enrollment" WHERE "userId" = $1`, [user.id]);
    expect(Number(count)).toBe(3);

    // no certificate yet: its page sends back to the path
    await page.goto(`/fr/parcours/${FREE_PATH}/certificat`);
    await expect(page).toHaveURL(new RegExp(`/fr/parcours/${FREE_PATH}$`));

    for (const courseId of await pathCourseIds()) await completeCourse(user.id, courseId);

    await page.goto(`/fr/parcours/${FREE_PATH}`);
    await expect(page.getByRole("link", { name: "Voir mon certificat" })).toBeVisible();
    await page.getByRole("link", { name: "Voir mon certificat" }).click();
    await expect(page.getByText("Apprenante Parcours")).toBeVisible();

    const [{ code }] = await sql<{ code: string }>(`SELECT code FROM "PathCertificate" WHERE "userId" = $1`, [user.id]);
    expect(code).toMatch(/^[a-f0-9]{32}$/);

    // anyone can verify it, signed out
    const visitor = await context.browser()!.newContext();
    const anonymous = await visitor.newPage();
    await anonymous.goto(`${new URL(page.url()).origin}/fr/parcours/verification/${code}`);
    await expect(anonymous.getByText("Ce certificat est authentique")).toBeVisible();
    await expect(anonymous.getByText("Apprenante Parcours")).toBeVisible();
    await visitor.close();

    // the dashboard component and the path page agree
    await page.goto(`/fr/parcours`);
    await expect(page.getByText("Terminé").first()).toBeVisible();
  });

  test("the admin lists paths and opens the editor; a student cannot", async ({ page }) => {
    await page.goto("/fr");
    await signInViaApi(page, ADMIN_EMAIL, PASSWORD);
    await page.goto("/fr/admin/paths");
    await expect(page.getByRole("heading", { name: "Parcours", level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: "Les bases du web moderne" })).toBeVisible();

    await page.goto("/fr/admin/paths/new");
    await page.getByLabel("Titre").fill("Parcours créé en e2e");
    await expect(page.getByLabel("Adresse (slug)")).toHaveValue("parcours-cree-en-e2e");
    await page.getByRole("button", { name: /Ajouter JavaScript Fundamentals/ }).click();
    await page.getByLabel("Description").fill("Un parcours créé par le test de bout en bout.");
    await page.getByRole("button", { name: "Enregistrer" }).click();
    await expect(page).toHaveURL(/\/fr\/admin\/paths\/[a-z0-9]+$/, { timeout: 30_000 });
    // a draft with one course cannot be published: the checklist says why
    await expect(page.getByText(/au moins 2 formations/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Publier" })).toBeDisabled();

    const student = await createUser({ name: "Étudiant parcours" });
    await page.context().clearCookies();
    await signInViaApi(page, student.email, student.password);
    await page.goto("/fr/admin/paths");
    await expect(page).toHaveURL(/\/fr\/dashboard$/);
  });
});
