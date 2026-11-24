import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sdk = vi.hoisted(() => ({ init: vi.fn(), captureRequestError: vi.fn(), captureException: vi.fn() }));
vi.mock("@sentry/nextjs", () => sdk);

const DSN = "https://abc123@o4500.ingest.sentry.io/6789";
const ENV_KEYS = ["SENTRY_DSN", "SENTRY_ENVIRONMENT", "SENTRY_RELEASE", "GIT_COMMIT_SHA", "NEXT_RUNTIME", "NODE_ENV", "DATABASE_URL"];
const saved: Record<string, string | undefined> = {};

beforeEach(() => {
  for (const key of ENV_KEYS) saved[key] = process.env[key];
  vi.resetModules();
  vi.clearAllMocks();
  process.env.NEXT_RUNTIME = "nodejs";
  Object.assign(process.env, { NODE_ENV: "test" });
  delete process.env.DATABASE_URL; // register() also checks it and logs: not what is tested here
});
afterEach(() => {
  for (const key of ENV_KEYS) {
    if (saved[key] === undefined) delete process.env[key];
    else process.env[key] = saved[key];
  }
});

const load = async () => import("@/instrumentation");

describe("instrumentation: server error reporting", () => {
  it("does not start the SDK without a DSN, and onRequestError is then a no-op", async () => {
    delete process.env.SENTRY_DSN;
    const { register, onRequestError } = await load();

    await register();
    await onRequestError(new Error("x"), { path: "/", method: "GET", headers: {} } as never, { routerKind: "App Router" } as never);

    expect(sdk.init).not.toHaveBeenCalled();
    expect(sdk.captureRequestError).not.toHaveBeenCalled();
  });

  it("starts it with the environment, the release and the policy: errors only, nothing personal, noise ignored", async () => {
    process.env.SENTRY_DSN = DSN;
    process.env.SENTRY_ENVIRONMENT = "staging";
    process.env.SENTRY_RELEASE = "1.4.2";
    const { register } = await load();

    await register();

    expect(sdk.init).toHaveBeenCalledTimes(1);
    const options = sdk.init.mock.calls[0][0];
    expect(options).toMatchObject({ dsn: DSN, environment: "staging", release: "1.4.2", tracesSampleRate: 0 });
    expect(options.ignoreErrors.some((rule: RegExp | string) => rule instanceof RegExp && rule.test("NEXT_REDIRECT"))).toBe(true);
  });

  it("every event goes through the scrubber before it leaves", async () => {
    process.env.SENTRY_DSN = DSN;
    const { register } = await load();
    await register();
    const { beforeSend } = sdk.init.mock.calls[0][0];

    const sent = beforeSend({
      message: "refund failed for bob@example.com",
      user: { id: "u1", email: "bob@example.com", ip_address: "203.0.113.9" },
      request: { url: "https://fygs.dev/pay?token=s3cret", headers: { cookie: "session=abc" }, data: { card: "4242" } },
    });

    expect(JSON.stringify(sent)).not.toMatch(/bob@example\.com|203\.0\.113\.9|s3cret|session=abc|4242/);
    expect(sent.user).toEqual({ id: "u1" });
  });

  it("onRequestError hands the request's errors to the SDK once it runs", async () => {
    process.env.SENTRY_DSN = DSN;
    const { register, onRequestError } = await load();
    await register();
    const error = new Error("render failed");

    await onRequestError(error, { path: "/fr/blog", method: "GET", headers: {} } as never, { routerKind: "App Router" } as never);

    expect(sdk.captureRequestError).toHaveBeenCalledWith(error, { path: "/fr/blog", method: "GET", headers: {} }, { routerKind: "App Router" });
  });

  it("does nothing outside the Node.js runtime", async () => {
    process.env.SENTRY_DSN = DSN;
    process.env.NEXT_RUNTIME = "edge";
    const { register } = await load();

    await register();

    expect(sdk.init).not.toHaveBeenCalled();
  });
});

describe("reportClientError", () => {
  it("is a no-op without a DSN: the SDK is not even loaded", async () => {
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;
    const { reportClientError } = await import("@/lib/report-error");

    await reportClientError(new Error("x"));

    expect(sdk.captureException).not.toHaveBeenCalled();
  });

  it("reports the error when a DSN is configured, and never throws", async () => {
    process.env.NEXT_PUBLIC_SENTRY_DSN = DSN;
    try {
      const { reportClientError } = await import("@/lib/report-error");
      const error = new Error("boom");

      await reportClientError(error);
      expect(sdk.captureException).toHaveBeenCalledWith(error);

      sdk.captureException.mockImplementationOnce(() => {
        throw new Error("transport down");
      });
      await expect(reportClientError(error)).resolves.toBeUndefined();
    } finally {
      delete process.env.NEXT_PUBLIC_SENTRY_DSN;
    }
  });
});
