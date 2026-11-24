import { ADMIN_EMAIL } from "./support/global-setup";
import { createUser, PASSWORD, sql } from "./support/db";
import { expect, signInViaApi, test } from "./support/fixtures";

/**
 * The user directory used to have a search box, filters, an "import" button and row menus that did nothing, and
 * every user link led to a page that did not exist. This drives the real thing in a browser, and checks the database.
 */
test.describe("admin: users, analytics, review page (fr)", () => {
  const roleOf = async (id: string) => (await sql<{ role: string }>(`SELECT role FROM "user" WHERE id = $1`, [id]))[0].role;
  const bannedOf = async (id: string) => (await sql<{ isBanned: boolean }>(`SELECT "isBanned" FROM "user" WHERE id = $1`, [id]))[0].isBanned;

  test("search finds the account, its page changes the role and suspends from the community", async ({ page }) => {
    const user = await createUser({ name: "Zoé Annuaire" });
    await page.goto("/fr");
    await signInViaApi(page, ADMIN_EMAIL, PASSWORD);

    await page.goto("/fr/admin/users");
    await page.getByLabel("Nom ou e-mail").fill("Annuaire");
    await page.getByRole("button", { name: "Filtrer" }).click();
    await expect(page).toHaveURL(/q=Annuaire/);
    await expect(page.getByText("1–1 sur 1")).toBeVisible();

    await page.getByRole("link", { name: "Zoé Annuaire" }).click();
    await expect(page).toHaveURL(new RegExp(`/admin/users/${user.id}$`));
    await expect(page.getByRole("heading", { level: 1, name: "Zoé Annuaire" })).toBeVisible();

    await page.getByLabel("Rôle").selectOption("INSTRUCTOR");
    await page.getByRole("button", { name: "Enregistrer le rôle" }).click();
    await expect(page.getByText("Rôle mis à jour.")).toBeVisible();
    await expect.poll(() => roleOf(user.id)).toBe("INSTRUCTOR");

    await page.getByRole("button", { name: "Suspendre de la communauté" }).click();
    await expect(page.getByText("Compte suspendu de la communauté.")).toBeVisible();
    await expect.poll(() => bannedOf(user.id)).toBe(true);

    await page.getByRole("button", { name: "Lever la suspension" }).click();
    await expect(page.getByText("Suspension levée.")).toBeVisible();
    await expect.poll(() => bannedOf(user.id)).toBe(false);
  });

  test("an administrator cannot change their own role from their own page", async ({ page }) => {
    const [admin] = await sql<{ id: string }>(`SELECT id FROM "user" WHERE email = $1`, [ADMIN_EMAIL]);
    await page.goto("/fr");
    await signInViaApi(page, ADMIN_EMAIL, PASSWORD);

    await page.goto(`/fr/admin/users/${admin.id}`);
    await expect(page.getByText("C'est votre compte")).toBeVisible();
    await expect(page.getByRole("button", { name: "Enregistrer le rôle" })).toHaveCount(0);
  });

  test("an unknown user id is a 404, not a crash", async ({ page }) => {
    await page.goto("/fr");
    await signInViaApi(page, ADMIN_EMAIL, PASSWORD);
    const response = await page.goto("/fr/admin/users/does-not-exist");
    expect(response?.status()).toBe(404);
  });

  test("analytics: the period is applied and the CSV export is a file for administrators only", async ({ page, request }) => {
    await page.goto("/fr");
    await signInViaApi(page, ADMIN_EMAIL, PASSWORD);

    await page.goto("/fr/admin/analytics?range=3");
    await expect(page.getByLabel("Période")).toHaveValue("3");
    await expect(page.getByText("Sur 3 mois")).toBeVisible();

    const exported = await page.request.get("/api/admin/analytics/export?range=3");
    expect(exported.status()).toBe(200);
    expect(exported.headers()["content-type"]).toContain("text/csv");
    const lines = (await exported.text()).trim().split("\n");
    expect(lines[0]).toBe("mois,revenus,transactions,nouveaux_utilisateurs,utilisateurs_total");
    expect(lines).toHaveLength(4); // header + 3 months

    // a visitor without a session gets nothing
    const anonymous = await request.get("/api/admin/analytics/export?range=3");
    expect(anonymous.status()).toBe(401);
  });

  test("the review page shows the real review, its author and its history", async ({ page }) => {
    const author = await createUser({ name: "Auteur Détail" });
    const [course] = await sql<{ id: string; title: string }>(`SELECT id, title FROM "Course" WHERE published = true ORDER BY slug LIMIT 1`);
    const [review] = await sql<{ id: string }>(
      `INSERT INTO "Review" (id, "userId", "courseId", rating, comment, status, "updatedAt")
       VALUES (gen_random_uuid()::text, $1, $2, 4, 'Un commentaire bien réel pour la page de détail', 'PENDING', now()) RETURNING id`,
      [author.id, course.id],
    );
    await page.goto("/fr");
    await signInViaApi(page, ADMIN_EMAIL, PASSWORD);

    await page.goto(`/fr/admin/reviews/${review.id}`);
    await expect(page.getByText("Un commentaire bien réel pour la page de détail")).toBeVisible();
    await expect(page.getByRole("link", { name: "Auteur Détail" })).toBeVisible();
    await expect(page.getByText("Marie Dubois")).toHaveCount(0); // the fabricated review is gone
    await expect(page.getByText("Aucune décision de modération pour le moment.")).toBeVisible();

    await page.getByLabel("Note de modération (facultative)").fill("Conforme à la charte");
    await page.getByRole("button", { name: "Approuver" }).click();
    await expect(page.getByText("Avis approuvé")).toBeVisible();
    await expect(page.getByText("Conforme à la charte")).toBeVisible(); // in the history, after the refresh

    const [row] = await sql<{ note: string | null }>(`SELECT note FROM "ReviewModeration" WHERE "reviewId" = $1`, [review.id]);
    expect(row.note).toBe("Conforme à la charte");

    const missing = await page.goto("/fr/admin/reviews/does-not-exist");
    expect(missing?.status()).toBe(404);
  });
});
