import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  plugins: [],
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.ts"],
    setupFiles: ["tests/setup.ts"],
    testTimeout: 30000,
    hookTimeout: 30000, // Increase hook timeout for complex setups
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true, // Ensure database consistency
      },
    },
    env: {
      NODE_ENV: "test",
      // Use test database URL from Docker Compose
      DATABASE_URL:
        process.env.TEST_DATABASE_URL ||
        "postgresql://postgres:password@localhost:5433/fygs_test",
      REDIS_URL: process.env.REDIS_TEST_URL || "redis://localhost:6380/0",
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
