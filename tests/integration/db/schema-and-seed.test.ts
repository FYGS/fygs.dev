import { afterAll, describe, expect, it, vi } from "vitest";
import { getAuthTables } from "better-auth/db";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { runSeed } from "../../../prisma/seed/run";
import { resetDatabase } from "../../support/test-db";

vi.mock("@/lib/email-service", () => ({
  emailService: { sendEmail: vi.fn(), passwordReset: vi.fn(), emailVerification: vi.fn() },
}));

afterAll(async () => {
  await resetDatabase(db); // leave an empty database for the suites that run next
  await db.$disconnect();
});

describe("the pushed schema", () => {
  it("has a column for every field better-auth reads or writes", async () => {
    for (const [key, table] of Object.entries(getAuthTables(auth.options))) {
      const columns = await db.$queryRaw<{ column_name: string }[]>`
        SELECT column_name FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = ${table.modelName}`;
      const present = new Set(columns.map((c) => c.column_name));
      expect(present.size, `table ${table.modelName} (${key}) missing`).toBeGreaterThan(0);
      for (const [field, def] of Object.entries(table.fields)) {
        const column = (def as { fieldName?: string }).fieldName ?? field;
        expect(present, `${table.modelName}.${column}`).toContain(column);
      }
    }
  });

  it("enforces the unique constraints the app relies on", async () => {
    await resetDatabase(db);
    const email = "dup@example.test";
    await db.user.create({ data: { name: "A", email } });
    await expect(db.user.create({ data: { name: "B", email } })).rejects.toMatchObject({ code: "P2002" });
  });
});

describe("prisma/seed orchestrator against a real database", () => {
  it("runs end to end and leaves a coherent catalogue", async () => {
    await resetDatabase(db);
    const log = vi.spyOn(console, "log").mockImplementation(() => {});

    const summary = await runSeed(db);
    log.mockRestore();

    expect(summary.users).toBeGreaterThan(0);
    expect(summary.courses).toBeGreaterThan(0);
    expect(await db.user.count()).toBe(summary.users);
    expect(await db.course.count()).toBe(summary.courses);
    expect(await db.enrollment.count()).toBe(summary.enrollments);

    // data from the later steps (reviews, community, payments) made it in too
    expect(await db.review.count()).toBe(summary.reviews);
    expect(await db.discussion.count()).toBe(summary.discussions);
    expect(await db.certificate.count()).toBe(summary.certificates);

    // learning paths: published, courses in order, each with at least two courses
    const paths = await db.path.findMany({ include: { courses: { orderBy: { order: "asc" } } } });
    expect(paths.length).toBeGreaterThan(0);
    for (const path of paths) {
      expect(path.published).toBe(true);
      expect(path.courses.length).toBeGreaterThanOrEqual(2);
      expect(path.courses.map((c) => c.order)).toEqual(path.courses.map((_, i) => i + 1));
    }

    // the roles the app depends on exist
    const roles = await db.user.groupBy({ by: ["role"], _count: true });
    expect(roles.map((r) => r.role)).toEqual(expect.arrayContaining(["STUDENT", "INSTRUCTOR"]));
  }, 120_000);

  it("is a plain Prisma 7 + pg adapter client (no engine binary involved)", async () => {
    const [{ now }] = await db.$queryRaw<{ now: Date }[]>`SELECT now() AS now`;
    expect(now).toBeInstanceOf(Date);
  });
});
