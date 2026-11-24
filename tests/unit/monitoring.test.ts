import { afterEach, describe, expect, it } from "vitest";
// @ts-expect-error plain ESM shared with next.config.mjs
import { buildGlobalCsp, buildReportOnlyCsp, sentryOrigin } from "@/lib/csp.mjs";
import { IGNORED_ERRORS, monitoringOptions, scrubEvent } from "@/lib/monitoring";

describe("monitoringOptions", () => {
  it("is off without a DSN, on either side", () => {
    expect(monitoringOptions("server", {})).toBeNull();
    expect(monitoringOptions("client", {})).toBeNull();
    expect(monitoringOptions("server", { SENTRY_DSN: "   " })).toBeNull();
  });

  it("the server reads SENTRY_DSN, the browser NEXT_PUBLIC_SENTRY_DSN: one does not enable the other", () => {
    expect(monitoringOptions("server", { SENTRY_DSN: "https://k@o1.ingest.sentry.io/2" })?.dsn).toBe("https://k@o1.ingest.sentry.io/2");
    expect(monitoringOptions("client", { SENTRY_DSN: "https://k@o1.ingest.sentry.io/2" })).toBeNull();
    expect(monitoringOptions("client", { NEXT_PUBLIC_SENTRY_DSN: "https://k@o1.ingest.sentry.io/2" })?.dsn).toBe("https://k@o1.ingest.sentry.io/2");
  });

  it("names the environment and the release", () => {
    expect(
      monitoringOptions("server", { SENTRY_DSN: "https://k@o1.ingest.sentry.io/2", NODE_ENV: "production", GIT_COMMIT_SHA: "abc123" }),
    ).toEqual({ dsn: "https://k@o1.ingest.sentry.io/2", environment: "production", release: "abc123" });
    expect(
      monitoringOptions("server", { SENTRY_DSN: "https://k@o1.ingest.sentry.io/2", SENTRY_ENVIRONMENT: "staging", SENTRY_RELEASE: "1.2.3", GIT_COMMIT_SHA: "abc" }),
    ).toMatchObject({ environment: "staging", release: "1.2.3" });
  });
});

describe("IGNORED_ERRORS", () => {
  const ignored = (message: string) => IGNORED_ERRORS.some((rule) => (typeof rule === "string" ? message.includes(rule) : rule.test(message)));

  it("skips Next.js control flow and browser noise, not real errors", () => {
    expect(ignored("NEXT_REDIRECT")).toBe(true);
    expect(ignored("NEXT_NOT_FOUND")).toBe(true);
    expect(ignored("ResizeObserver loop limit exceeded")).toBe(true);
    expect(ignored("AbortError: The user aborted a request.")).toBe(true);
    expect(ignored("TypeError: Cannot read properties of undefined")).toBe(false);
    expect(ignored("Redirect target not found in the database")).toBe(false);
  });
});

describe("scrubEvent", () => {
  const event = {
    event_id: "e1",
    message: "Payment failed for bob@example.com",
    server_name: "web-3.internal",
    level: "error",
    user: { id: "user_42", email: "bob@example.com", username: "Bob Martin", ip_address: "203.0.113.7" },
    request: {
      method: "POST",
      url: "https://fygs.dev/api/checkout?token=secret&email=bob@example.com#frag",
      headers: { cookie: "session=abc", authorization: "Bearer xyz", "user-agent": "Chrome" },
      cookies: { session: "abc" },
      data: { cardNumber: "4242424242424242", email: "bob@example.com" },
      query_string: "token=secret",
    },
    exception: { values: [{ type: "Error", value: "SMTP refused rcpt bob@example.com" }] },
    breadcrumbs: [{ message: "sent to bob@example.com", data: { to: "bob@example.com", courseId: "c1" } }],
    extra: { password: "hunter2", userId: "user_42", note: "call 203.0.113.7 back" },
  };

  it("keeps the person as an opaque id and nothing else", () => {
    expect(scrubEvent(event).user).toEqual({ id: "user_42" });
  });

  it("an event without an id has no user at all", () => {
    expect(scrubEvent({ user: { email: "a@b.test" } }).user).toBeUndefined();
  });

  it("says where the request went, not what it carried", () => {
    expect(scrubEvent(event).request).toEqual({ method: "POST", url: "https://fygs.dev/api/checkout" });
  });

  it("masks e-mail addresses in messages and exceptions", () => {
    const out = scrubEvent(event);
    expect(JSON.stringify(out)).not.toContain("bob@example.com");
    expect(out.message).toContain("b***@example.com");
  });

  it("redacts secrets and personal fields in breadcrumbs and extras, keeping opaque ids", () => {
    const out = scrubEvent(event) as { breadcrumbs: Array<{ data: Record<string, string> }>; extra: Record<string, string> };

    expect(out.breadcrumbs[0].data).toEqual({ to: "[REDACTED]", courseId: "c1" });
    expect(out.extra.password).toBe("[REDACTED]");
    expect(out.extra.userId).toBe("user_42");
    expect(out.extra.note).not.toContain("203.0.113.7");
  });

  it("drops the host name", () => {
    expect(scrubEvent(event)).not.toHaveProperty("server_name");
  });

  it("does not change what it is given", () => {
    const copy = JSON.parse(JSON.stringify(event));
    scrubEvent(event);
    expect(event).toEqual(copy);
  });

  it("never throws: an unscrubbable event is replaced, not leaked", () => {
    const hostile = {} as Record<string, unknown>;
    Object.defineProperty(hostile, "user", {
      enumerable: true,
      get() {
        throw new Error("boom");
      },
    });

    const out = scrubEvent(hostile);

    expect(JSON.stringify(out)).not.toContain("boom");
  });
});

describe("sentryOrigin and the CSP", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;
  });

  it.each([
    ["https://abc123@o4500.ingest.sentry.io/6789", "https://o4500.ingest.sentry.io"],
    ["https://abc123@sentry.example.org:8443/1", "https://sentry.example.org:8443"],
    ["http://abc@insecure.test/1", null],
    ["not a url", null],
    ["", null],
    [undefined, null],
  ])("%s -> %s", (dsn, origin) => {
    expect(sentryOrigin(dsn as string)).toBe(origin);
  });

  it("the browser may report to the monitoring host only when one is configured", () => {
    expect(buildGlobalCsp(false)).not.toContain("sentry");

    process.env.NEXT_PUBLIC_SENTRY_DSN = "https://abc123@o4500.ingest.sentry.io/6789";
    const csp = buildGlobalCsp(false);
    const connect = csp.split("; ").find((d: string) => d.startsWith("connect-src"))!;

    expect(connect).toContain("https://o4500.ingest.sentry.io");
    expect(connect).not.toMatch(/https:(\s|$)/); // still no blanket https:
    expect(buildReportOnlyCsp(false)).toContain("https://o4500.ingest.sentry.io");
  });

  it("a bad DSN adds nothing", () => {
    process.env.NEXT_PUBLIC_SENTRY_DSN = "ftp://nope";
    expect(buildGlobalCsp(false)).not.toContain("ftp");
  });
});
