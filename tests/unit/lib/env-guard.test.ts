import { afterEach, describe, expect, it, vi } from "vitest";
import { assertProductionEnv, checkProductionEnv } from "@/lib/env-guard";

const STRONG = "Xk9#vQ2mZp7LwR4tYb8NcD1sFh6JgA3eU5oIq0WzE";

const goodEnv = (): NodeJS.ProcessEnv => ({
  NODE_ENV: "production",
  BETTER_AUTH_SECRET: STRONG,
  BETTER_AUTH_URL: "https://fygs.dev",
  NEXT_PUBLIC_SITE_URL: "https://fygs.dev",
  DATABASE_URL: "postgresql://app:pw@db.internal:5432/fygs",
  CRON_SECRET: STRONG,
  ADMIN_API_KEY: STRONG,
  TRUSTED_PROXY_HOPS: "1",
});

describe("checkProductionEnv", () => {
  it("accepts a complete, strong configuration", () => {
    expect(checkProductionEnv(goodEnv())).toEqual({ errors: [], warnings: [] });
  });

  it("refuses a missing, short, placeholder or low-variety secret", () => {
    for (const secret of [undefined, "", "short", "your-32-character-secret-key-here", "build-time-placeholder-secret-not-for-production", "a".repeat(48)]) {
      const report = checkProductionEnv({ ...goodEnv(), BETTER_AUTH_SECRET: secret });
      expect(report.errors.some((e) => e.startsWith("BETTER_AUTH_SECRET")), String(secret)).toBe(true);
    }
  });

  it("requires public addresses over https (http only for a developer's machine)", () => {
    expect(checkProductionEnv({ ...goodEnv(), BETTER_AUTH_URL: undefined }).errors).toContain("BETTER_AUTH_URL is not set");
    expect(checkProductionEnv({ ...goodEnv(), BETTER_AUTH_URL: "not a url" }).errors.join()).toMatch(/BETTER_AUTH_URL is not a valid URL/);
    expect(checkProductionEnv({ ...goodEnv(), NEXT_PUBLIC_SITE_URL: "http://fygs.dev" }).errors.join()).toMatch(/NEXT_PUBLIC_SITE_URL must be an https/);
    expect(checkProductionEnv({ ...goodEnv(), BETTER_AUTH_URL: "http://localhost:3100", NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3100" }).errors).toEqual([]);
  });

  it("needs a database", () => {
    expect(checkProductionEnv({ ...goodEnv(), DATABASE_URL: undefined }).errors).toContain("DATABASE_URL is not set");
  });

  it("refuses short operation keys, and only warns when they are not set", () => {
    expect(checkProductionEnv({ ...goodEnv(), CRON_SECRET: "tooshort" }).errors.join()).toMatch(/CRON_SECRET is shorter/);
    expect(checkProductionEnv({ ...goodEnv(), ADMIN_API_KEY: "x".repeat(10) }).errors.join()).toMatch(/ADMIN_API_KEY is shorter/);
    const unset = checkProductionEnv({ ...goodEnv(), CRON_SECRET: undefined, ADMIN_API_KEY: "" });
    expect(unset.errors).toEqual([]);
    expect(unset.warnings.join()).toMatch(/CRON_SECRET is not set/);
    expect(unset.warnings.join()).toMatch(/ADMIN_API_KEY is not set/);
  });

  it("refuses to run with certificate checks turned off", () => {
    expect(checkProductionEnv({ ...goodEnv(), NODE_TLS_REJECT_UNAUTHORIZED: "0" }).errors.join()).toMatch(/NODE_TLS_REJECT_UNAUTHORIZED/);
  });

  it("checks the proxy count and warns when it is not set", () => {
    expect(checkProductionEnv({ ...goodEnv(), TRUSTED_PROXY_HOPS: "two" }).errors.join()).toMatch(/TRUSTED_PROXY_HOPS/);
    expect(checkProductionEnv({ ...goodEnv(), TRUSTED_PROXY_HOPS: undefined }).warnings.join()).toMatch(/TRUSTED_PROXY_HOPS is not set/);
  });

  it("reports every problem at once", () => {
    const report = checkProductionEnv({ NODE_ENV: "production" });
    expect(report.errors.length).toBeGreaterThanOrEqual(4);
  });
});

describe("assertProductionEnv", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("does nothing in development, tests and builds, whatever the environment", () => {
    vi.stubEnv("NODE_ENV", "test");
    expect(assertProductionEnv({})).toEqual({ errors: [], warnings: [] });
    vi.stubEnv("NODE_ENV", "development");
    expect(assertProductionEnv({})).toEqual({ errors: [], warnings: [] });
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PHASE", "phase-production-build");
    expect(assertProductionEnv({})).toEqual({ errors: [], warnings: [] });
  });

  it("refuses to start a production server with a weak environment, naming every problem", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PHASE", "");
    expect(() => assertProductionEnv({ ...goodEnv(), BETTER_AUTH_SECRET: "weak", BETTER_AUTH_URL: undefined })).toThrow(
      /Refusing to start[\s\S]*BETTER_AUTH_SECRET[\s\S]*BETTER_AUTH_URL/,
    );
  });

  it("lets a sound production server start and hands back the warnings", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PHASE", "");
    expect(assertProductionEnv({ ...goodEnv(), CRON_SECRET: undefined }).warnings.join()).toMatch(/CRON_SECRET/);
  });
});
