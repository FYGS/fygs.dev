import { randomUUID } from "node:crypto";

import type { Page } from "@playwright/test";

import { createUser, sql } from "./support/db";
import { expect, expectHealthyPage, signInViaApi, test } from "./support/fixtures";

const FREE_COURSE = "javascript-fundamentals-zero-hero";
// Texts that must stay on the server until a question is answered (prisma/seed/steps/visual-supports.ts)
const SECRET_EXPLANATIONS = ["bug historique de JavaScript", "portée de bloc tandis que"];

async function courseId(): Promise<string> {
  const [row] = await sql<{ id: string }>(`SELECT id FROM "Course" WHERE slug = $1`, [FREE_COURSE]);
  return row.id;
}

async function enrollInDb(userId: string) {
  await sql(`INSERT INTO "Enrollment" (id, "userId", "courseId") VALUES ($1, $2, $3)`, [randomUUID(), userId, await courseId()]);
}

async function firstQuizId(): Promise<string> {
  const [row] = await sql<{ id: string }>(`SELECT id FROM "Quiz" WHERE "courseId" = $1 ORDER BY "createdAt" LIMIT 1`, [await courseId()]);
  return row.id;
}

async function learner(page: Page, options: { enrolled?: boolean } = {}) {
  const user = await createUser({ name: "Apprenant E2E" });
  if (options.enrolled) await enrollInDb(user.id);
  await page.goto("/fr");
  await signInViaApi(page, user.email, user.password);
  return user;
}

test.describe("enrolled learner (fr)", () => {
  test("browse the catalogue, enroll in a free course, open a lesson, mark it as done", async ({ page }) => {
    const user = await learner(page);

    await page.goto("/fr/formations");
    const card = page.locator(`main a[href$="/formations/${FREE_COURSE}"]`).first();
    await expect(card).toBeVisible();
    await card.click();
    await expect(page).toHaveURL(new RegExp(`/fr/formations/${FREE_COURSE}$`));
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await page.getByRole("button", { name: /S'inscrire maintenant/ }).click();
    await expect(page).toHaveURL(new RegExp(`/fr/learn/${FREE_COURSE}/lessons/[^/]+$`), { timeout: 30_000 });
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();

    const [enrollment] = await sql(`SELECT 1 FROM "Enrollment" WHERE "userId" = $1`, [user.id]);
    expect(enrollment).toBeTruthy();

    await page.getByRole("button", { name: "Marquer comme terminée" }).click();
    await expect(page.getByRole("button", { name: "Terminée" })).toBeVisible();
    await expect
      .poll(async () => (await sql(`SELECT 1 FROM "Progress" WHERE "userId" = $1 AND completed = true`, [user.id])).length)
      .toBe(1);

    // the state survives a reload (it comes from the server, not from the client)
    await page.reload();
    await expect(page.getByRole("button", { name: "Terminée" })).toBeVisible();
  });

  test("quiz: graded server-side, correct answers never reach the browser before answering", async ({ page }) => {
    await learner(page, { enrolled: true });
    const quizId = await firstQuizId();
    const url = `/fr/learn/${FREE_COURSE}/quizzes/${quizId}`;

    // 1. the HTML and the RSC payload of the page carry no answer, no explanation
    const html = await (await page.request.get(url)).text();
    const rsc = await (await page.request.get(url, { headers: { RSC: "1" } })).text();
    for (const body of [html, rsc]) {
      expect(body).toContain("La portée (scope)"); // the options are there...
      for (const secret of SECRET_EXPLANATIONS) expect(body).not.toContain(secret);
      expect(body).not.toMatch(/\\?"correct\\?"\s*:/);
      expect(body).not.toMatch(/\\?"explanation\\?"\s*:/);
    }

    // 2. answering asks the server for the feedback
    await page.goto(url);
    await page.getByRole("button", { name: /La portée \(scope\)/ }).click();
    await expect(page.getByText("Bonne réponse", { exact: true }).first()).toBeVisible();
    await expect(page.getByText(/portée de bloc/)).toBeVisible();
    await page.getByRole("button", { name: "Question suivante" }).click();

    await page.getByRole("button", { name: /'null'/ }).click(); // wrong: typeof null is 'object'
    await expect(page.getByText("Mauvaise réponse", { exact: true })).toBeVisible();
    await expect(page.getByText(/bug historique/)).toBeVisible();
    await page.getByRole("button", { name: "Terminer le quiz" }).click();

    // 3. the attempt is graded and stored by the server: 1 / 2
    await expect(page.getByText("50%")).toBeVisible();
    await expect(page.getByText(/1 \/ 2 bonnes réponses/)).toBeVisible();
    await expect
      .poll(async () => (await sql<{ score: number; total: number }>(`SELECT score, total FROM "QuizResult" WHERE "quizId" = $1`, [quizId]))[0])
      .toEqual({ score: 1, total: 2 });
  });

  test("anonymous visitors cannot open a quiz", async ({ page }) => {
    // not signed in: the quiz page itself redirects to the login
    const quizId = await firstQuizId();
    await page.goto(`/fr/learn/${FREE_COURSE}/quizzes/${quizId}`);
    await expect(page).toHaveURL(/\/fr\/auth\/login\?callbackUrl=/);
  });

  test("the certificate comes with the last lesson or quiz, and not before", async ({ page }) => {
    const user = await learner(page, { enrolled: true });
    const id = await courseId();
    const summary = async () => (await page.request.get(`/api/progress/summary?courseId=${id}`)).json();

    const before = await summary();
    expect(before.ok).toBe(true);
    expect(before.breakdown.lessons.completed).toBe(0);
    expect(before.breakdown.quizzes.passed).toBe(0);
    expect(before.breakdown.overall.isComplete).toBe(false);
    expect(before.hasCertificate).toBe(false);

    // all lessons done in the database, quiz still to pass: not eligible yet
    await sql(
      `INSERT INTO "Progress" (id, "userId", "lessonId", completed, "completedAt")
       SELECT gen_random_uuid()::text, $1, id, true, now() FROM "Lesson" WHERE "courseId" = $2 AND published = true`,
      [user.id, id],
    );
    const lessonsOnly = await summary();
    expect(lessonsOnly.hasCertificate).toBe(false);
    expect(lessonsOnly.breakdown.lessons.percentage).toBe(100);
    expect(lessonsOnly.completion).toBeLessThan(100);

    // pass the quiz(zes) through the UI
    await page.goto(`/fr/learn/${FREE_COURSE}/quizzes/${await firstQuizId()}`);
    await page.getByRole("button", { name: /La portée \(scope\)/ }).click();
    await page.getByRole("button", { name: "Question suivante" }).click();
    await page.getByRole("button", { name: /'object'/ }).click();
    await page.getByRole("button", { name: "Terminer le quiz" }).click();
    await expect(page.locator("#main-content").getByText("100%")).toBeVisible();

    await expect.poll(async () => (await summary()).completion).toBe(100);
    const after = await summary();
    expect(after.breakdown.overall.isComplete).toBe(true);
    // passing the last quiz issued the certificate on the spot, nothing else had to ask for it
    expect(after.hasCertificate).toBe(true);
    expect(after.certificateCode).toMatch(/^[a-f0-9]{32}$/);
  });

  test("the learner area renders", async ({ page }) => {
    await learner(page, { enrolled: true });
    for (const path of [
      "/fr/dashboard",
      "/fr/dashboard/my-courses",
      "/fr/dashboard/billing",
      "/fr/dashboard/certificates",
      "/fr/profile",
      "/fr/community/notifications",
      `/fr/formations/${FREE_COURSE}`,
      `/fr/formations/${FREE_COURSE}/details`,
      `/fr/formations/${FREE_COURSE}/visual-supports`,
      `/fr/learn/${FREE_COURSE}`,
      `/fr/learn/${FREE_COURSE}/supports`,
      `/fr/learn/${FREE_COURSE}/completed`,
    ]) {
      await expectHealthyPage(page, path);
    }
  });
});
