import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const m = vi.hoisted(() => ({ summaries: vi.fn(), config: { enabled: false, allowedIPs: ["127.0.0.1"] as string[] } }));

vi.mock("@/lib/redis", () => ({
  default: {
    eval: () => Promise.reject(new Error("redis unavailable")),
    setNxEx: () => Promise.reject(new Error("redis unavailable")),
  },
}));
vi.mock("@/lib/services/review-notification", () => ({
  ReviewNotificationService: { sendWeeklyReviewSummaries: m.summaries },
}));
vi.mock("@/config/maintenance", () => ({ maintenanceConfig: m.config }));
vi.mock("@/lib/structured-logger", () => {
  const noop = () => {};
  const logger = { info: noop, warn: noop, error: noop, debug: noop, generateCorrelationId: () => "c" };
  return { createLogger: () => logger, logger };
});

import { GET as cronGET } from "@/app/api/cron/weekly-review-summaries/route";
import { POST as maintenancePOST } from "@/app/api/maintenance/route";
import { POST as cspPOST } from "@/app/api/csp-report/route";
import { GET as powGET } from "@/app/api/pow/route";
import { __resetRateLimitMemory } from "@/lib/rate-limit";
import { __resetHotBuckets } from "@/lib/anti-automation/hot-buckets";

const SECRET = "k7Qp2mZx9LwR4tYb8NcD1sFh6JgA3eVu5Xo0";
const ip = (n = 1) => ({ "x-forwarded-for": `203.0.113.${n}` });

beforeEach(() => {
  __resetRateLimitMemory();
  __resetHotBuckets();
  m.summaries.mockReset().mockResolvedValue(undefined);
  m.config.enabled = false;
  m.config.allowedIPs = ["127.0.0.1"];
  vi.stubEnv("BETTER_AUTH_SECRET", "Xk9#vQ2mZp7LwR4tYb8NcD1sFh6JgA3e-routes");
});

afterEach(() => vi.unstubAllEnvs());

describe("GET /api/cron/weekly-review-summaries", () => {
  const call = (authorization?: string, n = 1) =>
    cronGET(new NextRequest("http://localhost/api/cron/weekly-review-summaries", { headers: { ...ip(n), ...(authorization ? { authorization } : {}) } }));

  it("runs for the exact secret and for nobody else", async () => {
    vi.stubEnv("CRON_SECRET", SECRET);
    expect((await call(`Bearer ${SECRET}`)).status).toBe(200);
    expect(m.summaries).toHaveBeenCalledTimes(1);
    for (const [i, value] of [undefined, "Bearer wrong", `Bearer ${SECRET}x`, SECRET].entries()) {
      expect((await call(value, i + 2)).status, String(value)).toBe(401);
    }
    expect(m.summaries).toHaveBeenCalledTimes(1);
  });

  it("stays closed when the secret is not set or is too short, even for a client that sends the same value", async () => {
    vi.stubEnv("CRON_SECRET", "");
    expect((await call("Bearer ")).status).toBe(401);
    vi.stubEnv("CRON_SECRET", "123456");
    expect((await call("Bearer 123456", 2)).status).toBe(401);
    expect(m.summaries).not.toHaveBeenCalled();
  });
});

describe("POST /api/maintenance", () => {
  const call = (body: unknown, authorization?: string, n = 1) =>
    maintenancePOST(
      new Request("http://localhost/api/maintenance", {
        method: "POST",
        body: typeof body === "string" ? body : JSON.stringify(body),
        headers: { ...ip(n), ...(authorization ? { authorization } : {}) },
      }),
    );

  it("needs the admin key (32 characters at least)", async () => {
    vi.stubEnv("ADMIN_API_KEY", SECRET);
    expect((await call({ enabled: true })).status).toBe(401);
    expect((await call({ enabled: true }, "Bearer nope", 2)).status).toBe(401);
    expect(m.config.enabled).toBe(false);
    expect((await call({ enabled: true }, `Bearer ${SECRET}`, 3)).status).toBe(200);
    expect(m.config.enabled).toBe(true);

    vi.stubEnv("ADMIN_API_KEY", "short");
    expect((await call({ enabled: false }, "Bearer short", 4)).status).toBe(401);
  });

  it("accepts a short list of plain addresses and nothing else", async () => {
    vi.stubEnv("ADMIN_API_KEY", SECRET);
    const auth = `Bearer ${SECRET}`;
    expect((await call({ allowedIPs: ["198.51.100.4", "2001:db8::1"] }, auth, 1)).status).toBe(200);
    expect(m.config.allowedIPs).toEqual(["198.51.100.4", "2001:db8::1"]);
    for (const [i, bad] of [["<script>"], "198.51.100.4", [1, 2], Array.from({ length: 21 }, () => "198.51.100.4"), ["a b"]].entries()) {
      expect((await call({ allowedIPs: bad }, auth, i + 2)).status, JSON.stringify(bad)).toBe(400);
    }
    expect(m.config.allowedIPs).toEqual(["198.51.100.4", "2001:db8::1"]);
  });

  it("refuses invalid dates, unparsable and oversized bodies", async () => {
    vi.stubEnv("ADMIN_API_KEY", SECRET);
    const auth = `Bearer ${SECRET}`;
    expect((await call({ startTime: "not a date" }, auth, 1)).status).toBe(400);
    expect((await call("{broken", auth, 2)).status).toBe(400);
    expect((await call({ enabled: true, junk: "x".repeat(10_000) }, auth, 3)).status).toBe(413);
  });
});

describe("POST /api/csp-report", () => {
  const report = (body: BodyInit | null, headers: Record<string, string> = {}, n = 1) =>
    cspPOST(
      new NextRequest("http://localhost/api/csp-report", {
        method: "POST",
        body,
        headers: { "content-type": "application/csp-report", ...ip(n), ...headers },
      }),
    );

  it("acknowledges a well-formed report", async () => {
    const response = await report(JSON.stringify({ "csp-report": { "violated-directive": "script-src", "blocked-uri": "inline" } }));
    expect(response.status).toBe(204);
  });

  it("refuses a body over 16 KB however it announces itself", async () => {
    const big = JSON.stringify({ "csp-report": { "blocked-uri": "x".repeat(20_000) } });
    expect((await report(big, {}, 2)).status).toBe(413);
    expect((await report(big, { "content-length": "10" }, 3)).status).toBe(413); // lying Content-Length
  });

  it("answers 415 to another content type and 405 to GET", async () => {
    expect((await report("{}", { "content-type": "text/plain" }, 4)).status).toBe(415);
  });
});

describe("GET /api/pow", () => {
  const call = (query: string, n = 1) => powGET(new NextRequest(`http://localhost/api/pow${query}`, { headers: ip(n) }));

  it("hands out no work when the layer is off", async () => {
    vi.stubEnv("HUMAN_PROOF_MODE", "off");
    const response = await call("?action=sign-up");
    expect(await response.json()).toEqual({ enforced: false });
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("issues a signed, never-cached challenge for a known action", async () => {
    vi.stubEnv("HUMAN_PROOF_MODE", "enforce");
    const response = await call("?action=sign-up");
    const body = await response.json();
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(body).toMatchObject({ enforced: true, difficulty: 18, minAgeMs: 2000, ttlMs: 120000 });
    expect(body.token).toMatch(/^p1\.sign-up\.[A-Za-z0-9_-]+\.\d+\.\d+\.18\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  });

  it("never hands out the same challenge twice", async () => {
    vi.stubEnv("HUMAN_PROOF_MODE", "enforce");
    const tokens = new Set<string>();
    for (let i = 0; i < 5; i++) tokens.add((await (await call("?action=contact")).json()).token);
    expect(tokens.size).toBe(5);
  });

  it("refuses an unknown or missing action", async () => {
    vi.stubEnv("HUMAN_PROOF_MODE", "enforce");
    for (const query of ["", "?action=", "?action=admin", "?action=sign-up%00", "?action[]=sign-up"]) {
      expect((await call(query, 9)).status, query).toBe(400);
    }
  });

  it("rate limits a client that asks for challenges in bulk, and the network gets hotter", async () => {
    vi.stubEnv("HUMAN_PROOF_MODE", "enforce");
    let last = 200;
    for (let i = 0; i < 61; i++) last = (await call("?action=sign-in", 5)).status;
    expect(last).toBe(429);
    // a challenge for a neighbour on the same /24 now costs more
    const neighbour = await (await call("?action=sign-up", 6)).json();
    expect(neighbour.difficulty).toBeGreaterThan(18);
  });
});
