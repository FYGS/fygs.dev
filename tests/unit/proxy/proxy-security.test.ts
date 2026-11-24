/**
 * proxy.ts security behaviour: per-request CSP nonces, cross-site writes, internal headers, maintenance gate, www redirect.
 * Auth, DB and the maintenance config are mocked (see proxy.characterization.test.ts for the routing contract).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const m = vi.hoisted(() => ({
  getSession: vi.fn(),
  maintenance: { enabled: false, allowedIPs: ["127.0.0.1"] as string[], allowedPaths: [] as string[] },
}));

vi.mock("@/config/maintenance", () => ({ maintenanceConfig: m.maintenance }));
vi.mock("@/lib/db", () => ({ db: {} }));
vi.mock("@/lib/access-service", () => ({ AccessService: {} }));
vi.mock("@/lib/analytics-helper", () => ({ AnalyticsHelper: { emit: vi.fn() } }));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: m.getSession } } }));
vi.mock("@/lib/redis", () => ({ default: {} }));

import { proxy } from "@/proxy";

type Init = { method?: string; headers?: Record<string, string>; host?: string };

function req(path: string, init: Init = {}) {
  const host = init.host ?? "fygs.test";
  return new NextRequest(`https://${host}${path}`, {
    method: init.method ?? "GET",
    headers: { host, ...init.headers },
  });
}

/** What the page will receive: Next.js records overridden request headers on the response as x-middleware-request-*. */
const forwarded = (res: Response, name: string) => res.headers.get(`x-middleware-request-${name}`);

beforeEach(() => {
  m.getSession.mockReset();
  m.getSession.mockResolvedValue({ user: { id: "u1" } });
  m.maintenance.enabled = false;
  m.maintenance.allowedIPs = ["127.0.0.1"];
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("Content-Security-Policy nonces", () => {
  it("a signed-in page gets a fresh nonce, in the request (for Next.js) and in the enforced response policy", async () => {
    const res = await proxy(req("/fr/dashboard"));
    const policy = res.headers.get("content-security-policy") ?? "";
    const nonce = /'nonce-([A-Za-z0-9+/=]+)'/.exec(policy)?.[1];

    expect(nonce).toBeTruthy();
    expect(policy).toContain("'strict-dynamic'");
    expect(policy).not.toMatch(/script-src[^;]*'unsafe-inline'/);
    expect(forwarded(res, "content-security-policy")).toBe(policy);
    expect(forwarded(res, "x-nonce")).toBe(nonce);
    expect(res.headers.get("content-security-policy-report-only")).toBeNull();
  });

  it("two requests never share a nonce", async () => {
    const nonces = new Set<string>();
    for (let i = 0; i < 20; i++) {
      const res = await proxy(req("/fr/learn/react"));
      nonces.add(forwarded(res, "x-nonce") ?? "");
    }
    expect(nonces.size).toBe(20);
  });

  it("a prerendered page keeps the static policy and receives the nonce policy as Report-Only", async () => {
    const res = await proxy(req("/fr/formations"));
    expect(res.headers.get("content-security-policy")).toBeNull(); // next.config.mjs sets the static one
    const reportOnly = res.headers.get("content-security-policy-report-only") ?? "";
    expect(reportOnly).toMatch(/script-src 'self' 'nonce-/);
    expect(reportOnly).toContain("report-uri /api/csp-report");
    expect(forwarded(res, "content-security-policy")).toBeNull();
  });

  it("the playground and its own policy are left alone", async () => {
    const res = await proxy(req("/fr/tech-mastry/playground"));
    expect(res.headers.get("content-security-policy")).toBeNull();
    expect(res.headers.get("content-security-policy-report-only")).toBeNull();
  });

  it("CSP_NONCE_ENFORCE=0 falls back to Report-Only everywhere, and still stamps the nonce for Next.js", async () => {
    vi.stubEnv("CSP_NONCE_ENFORCE", "0");
    const res = await proxy(req("/fr/dashboard"));
    expect(res.headers.get("content-security-policy")).toBeNull();
    expect(res.headers.get("content-security-policy-report-only")).toMatch(/'nonce-/);
    expect(forwarded(res, "content-security-policy-report-only")).toMatch(/'nonce-/);
  });

  it("a Content-Security-Policy or nonce sent by the client never reaches the page", async () => {
    const res = await proxy(
      req("/fr/formations", {
        headers: { "content-security-policy": "script-src 'nonce-evil'", "x-nonce": "evil", "content-security-policy-report-only": "x" },
      }),
    );
    expect(forwarded(res, "content-security-policy")).toBeNull();
    expect(forwarded(res, "x-nonce")).toBeNull();
    expect(forwarded(res, "content-security-policy-report-only")).toBeNull();
  });

  it("keeps the learning-area path header intact", async () => {
    const res = await proxy(req("/fr/learn/react/quizzes/q1?x=1"));
    expect(forwarded(res, "x-learn-path")).toBe("/learn/react/quizzes/q1?x=1");
    expect(forwarded(res, "x-nonce")).toBeTruthy();
  });
});

describe("internal headers", () => {
  it("x-middleware-subrequest is removed from pages and from API requests", async () => {
    const page = await proxy(req("/fr/formations", { headers: { "x-middleware-subrequest": "src/middleware:src/middleware" } }));
    expect(forwarded(page, "x-middleware-subrequest")).toBeNull();
    const api = await proxy(req("/api/health", { headers: { "x-middleware-subrequest": "proxy:proxy:proxy" } }));
    expect(forwarded(api, "x-middleware-subrequest")).toBeNull();
  });
});

describe("cross-site writes to the API", () => {
  const post = (headers: Record<string, string>, path = "/api/profile") =>
    proxy(req(path, { method: "POST", headers }));

  it("refuses a write announced as cross-site, from another origin, or from an opaque origin", async () => {
    const refused: Record<string, string>[] = [
      { "sec-fetch-site": "cross-site" },
      { origin: "https://evil.example" },
      { origin: "null" },
      { "sec-fetch-site": "same-site" },
      { origin: "https://fygs.test.evil.example" },
    ];
    for (const headers of refused) {
      const res = await post(headers);
      expect(res.status, JSON.stringify(headers)).toBe(403);
      expect(await res.json()).toEqual({ error: "cross_origin_request" });
    }
  });

  it("lets same-origin browsers and header-less clients (curl, servers) through", async () => {
    const allowed: Record<string, string>[] = [{ origin: "https://fygs.test", "sec-fetch-site": "same-origin" }, { origin: "https://fygs.test" }, {}];
    for (const headers of allowed) {
      expect((await post(headers)).status, JSON.stringify(headers)).toBe(200);
    }
  });

  it("trusts the configured public URL when the proxy forwards its own host", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.public.example");
    expect((await post({ origin: "https://www.public.example" })).status).toBe(200);
  });

  it("never refuses a read", async () => {
    const res = await proxy(req("/api/health", { headers: { "sec-fetch-site": "cross-site", origin: "https://evil.example" } }));
    expect(res.status).toBe(200);
  });

  it("exempts the endpoints that are called by machines or by the browser's own reporting", async () => {
    for (const path of ["/api/stripe/webhook", "/api/cron/weekly-review-summaries", "/api/csp-report", "/api/auth/sign-in/email", "/api/health"]) {
      const res = await post({ origin: "https://stripe.example", "sec-fetch-site": "cross-site" }, path);
      expect(res.status, path).toBe(200);
    }
  });
});

describe("maintenance gate", () => {
  beforeEach(() => {
    m.maintenance.enabled = true;
    delete (m.maintenance as { startTime?: Date }).startTime;
  });

  it("lets an allowed address through and closes the site to the others", async () => {
    const closed = await proxy(req("/fr/formations", { headers: { "x-forwarded-for": "203.0.113.9" } }));
    expect(closed.headers.get("x-middleware-rewrite")).toContain("/maintenance");
    m.maintenance.allowedIPs = ["203.0.113.9"];
    const open = await proxy(req("/fr/formations", { headers: { "x-forwarded-for": "203.0.113.9" } }));
    expect(open.headers.get("x-middleware-rewrite")).toBeNull();
  });

  it("is not fooled by an address a client wrote in the header: only the proxy's entry counts", async () => {
    // The client claims to be 127.0.0.1; the trusted proxy appended the real address after it
    const res = await proxy(req("/fr/formations", { headers: { "x-forwarded-for": "127.0.0.1, 198.51.100.4" } }));
    expect(res.headers.get("x-middleware-rewrite")).toContain("/maintenance");
  });
});

describe("www redirect", () => {
  it("is permanent but short-lived and varies on the host (not cached for a year)", async () => {
    const res = await proxy(req("/fr/formations", { host: "www.fygs.test" }));
    expect(res.status).toBe(301);
    expect(res.headers.get("cache-control")).toBe("public, max-age=3600");
    expect(res.headers.get("cache-control")).not.toContain("immutable");
    expect(res.headers.get("vary")).toBe("Host");
  });
});
