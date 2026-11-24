import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma 7 CLI configuration. The datasource URL lives here (no longer in
 * schema.prisma) and `.env` is loaded explicitly by the import above; variables
 * already present in the environment (CI, `scripts/test-db.mjs`) win over `.env`.
 *
 * `prisma generate` does not connect, so a missing DATABASE_URL must not break
 * it (CI and Docker builds generate the client without a database).
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://placeholder:placeholder@localhost:5432/placeholder",
  },
});
