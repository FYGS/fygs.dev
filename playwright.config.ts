import { defineConfig, devices } from "@playwright/test";

/**
 * Browser e2e against a PRODUCTION build wired to a disposable PostgreSQL.
 * Do not run `playwright test` directly: `pnpm test:e2e` (scripts/e2e.mjs) starts the
 * database and the server, then calls Playwright with E2E_BASE_URL / E2E_MAIL_FILE set.
 */
const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3100";

export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/support/global-setup.ts",
  // One server, one in-memory rate limiter, one mailbox file: keep it deterministic.
  workers: 1,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0, // a flaky test is a bug to fix, not to retry
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : [["list"]],
  outputDir: "test-results",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    locale: "fr-FR",
    timezoneId: "Europe/Paris",
    serviceWorkers: "block", // the PWA worker would cache pages across tests
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
  },
  projects: [
    {
      name: "chrome",
      // System Chrome: no browser download.
      // E2E_CHROME_PATH points at a specific binary (e.g. browser-actions/setup-chrome in CI).
      use: {
        ...devices["Desktop Chrome"],
        ...(process.env.E2E_CHROME_PATH
          ? { launchOptions: { executablePath: process.env.E2E_CHROME_PATH } }
          : { channel: "chrome" }),
      },
    },
  ],
});
