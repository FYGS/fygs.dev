import { defineConfig } from "vitest/config";
import path from "path";

/**
 * Integration test configuration (real PostgreSQL, real Prisma schema).
 *
 * Run with `pnpm test:integration`: scripts/test-db.mjs boots a disposable
 * embedded PostgreSQL (or uses TEST_DATABASE_URL, e.g. the CI service container)
 * and pushes the schema. Running vitest directly with this config works too:
 * globalSetup starts the database itself. DATABASE_URL is set there and is never
 * taken from the shell or .env, so the remote dev database is out of reach.
 */
export default defineConfig({
  plugins: [],
  test: {
    environment: "node",
    globals: true,
    include: [
      "tests/integration/**/*.test.ts",
      "tests/reviews/**/*.test.ts",
      "tests/contract/**/*.test.ts",
      "tests/*.test.ts",
    ],
    exclude: ["tests/unit/**"],
    globalSetup: ["tests/support/global-setup.ts"],
    setupFiles: ["tests/setup.ts", "tests/support/next-mocks.ts"],
    testTimeout: 30000,
    hookTimeout: 30000,
    pool: "forks",
    fileParallelism: false,
    env: {
      NODE_ENV: "test",
      TEST_INTEGRATION: "true",
      SKIP_ENV_VALIDATION: "true",
      BETTER_AUTH_SECRET:
        "test-secret-for-auth-testing-only-must-be-32-chars-long",
      BETTER_AUTH_URL: "http://localhost:3000",
    },
  },
  resolve: {
    alias: {
      "@/app": path.resolve(__dirname, "./app"),
      "@/lib": path.resolve(__dirname, "./lib"),
      "@": path.resolve(__dirname, "./"),
      "~": path.resolve(__dirname, "./"),
    },
  },
});
