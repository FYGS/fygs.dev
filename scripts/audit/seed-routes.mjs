// Routes that need a record of the seed (course slugs, lesson slugs, quiz and path ids), for the audits and the
// smoke crawl: the static pages come from list-routes.mjs, these complete them.
// Usage: DATABASE_URL=<disposable test database> node scripts/audit/seed-routes.mjs <learner|visitor|admin>
//   learner: the learning area of the seeded student (course page, course home, lesson, quiz, exam, supports,
//            wrap-up), the paths and their certificate page, a certificate verification page
//   visitor: public course and path pages
//   admin:   the course builder of three courses and the editor of the paths
// Refuses any database that is not local and named "test", like prepare-users.mjs.
import pg from "pg";

const url = process.env.DATABASE_URL;
const parsed = url ? new URL(url) : null;
if (!parsed || !["localhost", "127.0.0.1"].includes(parsed.hostname) || !/test/i.test(parsed.pathname)) {
  throw new Error("Refusing to run: DATABASE_URL must be the local disposable test database");
}

const STUDENT_EMAIL = "pierre.dubois@example.com";
const scope = process.argv[2] ?? "learner";
const pool = new pg.Pool({ connectionString: url, max: 1 });
const q = async (sql, params = []) => (await pool.query(sql, params)).rows;
const routes = [];

if (scope === "learner") {
  const courses = await q(
    `SELECT c.id, c.slug FROM "Enrollment" e
       JOIN "Course" c ON c.id = e."courseId"
       JOIN "user" u ON u.id = e."userId"
     WHERE u.email = $1 AND c.published = true
     ORDER BY c.slug LIMIT 4`,
    [STUDENT_EMAIL],
  );
  for (const course of courses) {
    const base = `/fr/learn/${course.slug}`;
    routes.push(`/fr/formations/${course.slug}`, base, `${base}/supports`, `${base}/completed`, `${base}/exam`);
    for (const lesson of await q(
      `SELECT slug FROM "Lesson" WHERE "courseId" = $1 AND published = true ORDER BY "order" LIMIT 2`,
      [course.id],
    )) {
      routes.push(`${base}/lessons/${lesson.slug}`);
    }
    for (const quiz of await q(`SELECT id FROM "Quiz" WHERE "courseId" = $1 LIMIT 1`, [course.id])) {
      routes.push(`${base}/quizzes/${quiz.id}`);
    }
  }
  for (const path of await q(`SELECT slug FROM "Path" WHERE published = true ORDER BY slug`)) {
    routes.push(`/fr/parcours/${path.slug}`, `/fr/parcours/${path.slug}/certificat`);
  }
  for (const certificate of await q(`SELECT code FROM "Certificate" ORDER BY "issuedAt" LIMIT 1`)) {
    routes.push(`/fr/certificates/verify/${certificate.code}`);
  }
} else if (scope === "visitor") {
  for (const course of await q(`SELECT slug FROM "Course" WHERE published = true ORDER BY "accessTier", slug LIMIT 3`)) {
    routes.push(`/fr/formations/${course.slug}`);
  }
  for (const path of await q(`SELECT slug FROM "Path" WHERE published = true ORDER BY slug`)) {
    routes.push(`/fr/parcours/${path.slug}`);
  }
} else if (scope === "admin") {
  for (const course of await q(`SELECT id FROM "Course" ORDER BY "createdAt" LIMIT 3`)) {
    routes.push(`/fr/admin/courses/${course.id}`);
  }
  for (const path of await q(`SELECT id FROM "Path" ORDER BY slug`)) {
    routes.push(`/fr/admin/paths/${path.id}`);
  }
} else {
  throw new Error(`Unknown scope "${scope}": learner, visitor or admin`);
}

console.log([...new Set(routes)].join("\n"));
await pool.end();
