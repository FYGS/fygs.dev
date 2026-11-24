/**
 * Test Setup
 *
 * Unit tests: No external dependencies — run with mocks only.
 * Integration tests: run against a disposable PostgreSQL started by
 * tests/support/global-setup.ts (embedded Postgres, or TEST_DATABASE_URL in CI)
 * with the real Prisma schema; see scripts/test-db.mjs. Individual tests clean
 * up the rows they create.
 */

import { afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";

// Node >= 25 ships a global `localStorage` that is undefined without
// --localstorage-file and shadows the jsdom one. Restore jsdom's Storage.
const jsdomStorage = (
  globalThis as { jsdom?: { window: { localStorage: Storage } } }
).jsdom?.window.localStorage;
if (jsdomStorage && typeof globalThis.localStorage === "undefined") {
  Object.defineProperty(globalThis, "localStorage", {
    value: jsdomStorage,
    configurable: true,
  });
}

// Automatic cleanup for React Testing Library (jsdom environments)
afterEach(async () => {
  try {
    const { cleanup } = await import("@testing-library/react");
    cleanup();
  } catch {
    // Not in a jsdom environment or @testing-library/react not available
  }
});
