import { ADMIN_EMAIL } from "./support/global-setup";
import { createUser, PASSWORD, sql } from "./support/db";
import { expect, signInViaApi, test } from "./support/fixtures";

/**
 * The moderation queue used to show Approve / Reject buttons that did nothing. This follows a pending
 * review from the database to the admin's click and back to the database.
 */
test.describe("review moderation (fr)", () => {
  async function pendingReview(comment: string) {
    const author = await createUser({ name: "Auteur Modération" });
    const [course] = await sql<{ id: string; title: string }>(`SELECT id, title FROM "Course" WHERE published = true ORDER BY slug LIMIT 1`);
    const [review] = await sql<{ id: string }>(
      `INSERT INTO "Review" (id, "userId", "courseId", rating, comment, status, "updatedAt")
       VALUES (gen_random_uuid()::text, $1, $2, 3, $3, 'PENDING', now()) RETURNING id`,
      [author.id, course.id, comment],
    );
    return { review: review.id, course: course.title };
  }

  const statusOf = async (id: string) => (await sql<{ status: string }>(`SELECT status FROM "Review" WHERE id = $1`, [id]))[0].status;

  test("the admin approves a pending review; it is recorded and leaves the queue", async ({ page }) => {
    const { review } = await pendingReview("Avis à approuver depuis le test e2e");
    await page.goto("/fr");
    await signInViaApi(page, ADMIN_EMAIL, PASSWORD);

    await page.goto("/fr/admin/reviews/moderation");
    const approve = page.getByRole("button", { name: /Approuver l'avis de Auteur Modération/ });
    await expect(approve).toBeVisible();
    await approve.click();

    await expect(page.getByText("Avis approuvé")).toBeVisible();
    await expect.poll(() => statusOf(review)).toBe("APPROVED");
    const trail = await sql<{ fromStatus: string; toStatus: string; moderatorId: string | null }>(
      `SELECT "fromStatus", "toStatus", "moderatorId" FROM "ReviewModeration" WHERE "reviewId" = $1`,
      [review],
    );
    expect(trail).toHaveLength(1);
    expect(trail[0]).toMatchObject({ fromStatus: "PENDING", toStatus: "APPROVED" });
    expect(trail[0].moderatorId).toBeTruthy();
  });

  test("the admin rejects from the full list, which can be filtered by status", async ({ page }) => {
    const { review } = await pendingReview("Avis à rejeter depuis la liste");
    await page.goto("/fr");
    await signInViaApi(page, ADMIN_EMAIL, PASSWORD);

    await page.goto("/fr/admin/reviews?q=rejeter+depuis+la+liste&status=PENDING");
    await expect(page.getByText("1–1 sur 1")).toBeVisible();
    await page.getByRole("button", { name: /Rejeter l'avis de Auteur Modération/ }).click();

    await expect(page.getByText("Avis rejeté")).toBeVisible();
    await expect.poll(() => statusOf(review)).toBe("REJECTED");

    await page.goto("/fr/admin/reviews?q=rejeter+depuis+la+liste&status=PENDING");
    await expect(page.getByText("Aucun résultat")).toBeVisible(); // no longer pending
    await page.goto("/fr/admin/reviews?q=rejeter+depuis+la+liste&status=REJECTED");
    await expect(page.getByText("1–1 sur 1")).toBeVisible();
  });

  test("an instructor cannot open the moderation pages", async ({ page }) => {
    const instructor = await createUser({ name: "Instructeur Modération", role: "INSTRUCTOR" });
    await page.goto("/fr");
    await signInViaApi(page, instructor.email, instructor.password);

    for (const path of ["/fr/admin/reviews", "/fr/admin/reviews/moderation"]) {
      await page.goto(path);
      await expect(page, path).not.toHaveURL(new RegExp(`${path}$`));
    }
  });
});
