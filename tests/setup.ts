/**
 * Test Setup
 *
 * Unit tests: No external dependencies — run with mocks only.
 * Integration tests: Require Docker (postgres + redis) via docker-compose.test.yml.
 *
 * The database is reset once before all tests (not per-test) for performance.
 * Individual tests should handle their own data isolation via transactions or cleanup.
 */

import { beforeAll, afterAll, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";

// Automatic cleanup for React Testing Library (jsdom environments)
afterEach(async () => {
  try {
    const { cleanup } = await import("@testing-library/react");
    cleanup();
  } catch {
    // Not in a jsdom environment or @testing-library/react not available
  }
});

const isIntegrationTest = process.env.TEST_INTEGRATION === "true";

beforeAll(async () => {
  if (!isIntegrationTest) {
    // Unit tests don't need database setup
    return;
  }

  try {
    const { exec } = await import("child_process");
    const { promisify } = await import("util");
    const execAsync = promisify(exec);

    console.log("[test:setup] Pushing schema to test database...");
    await execAsync("dotenv -e .env.test -- npx prisma db push --force-reset", {
      timeout: 30000,
    });
    console.log("[test:setup] Test database ready.");
  } catch (error) {
    console.error("[test:setup] Failed to setup test database:", error);
    throw error;
  }
});

afterAll(async () => {
  if (!isIntegrationTest) return;
  console.log("[test:teardown] Test suite complete.");
});
