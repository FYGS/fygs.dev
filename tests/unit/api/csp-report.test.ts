import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/redis", () => ({
  default: {
    eval: () => Promise.reject(new Error("redis unavailable")),
    setNxEx: () => Promise.reject(new Error("redis unavailable")),
  },
}));

import { POST, GET } from "@/app/api/csp-report/route";
import { __resetRateLimitMemory } from "@/lib/rate-limit";
import { classifyBlocked, pagePath, parseCspReports, ViolationThrottle } from "@/lib/csp-report";

let warn: ReturnType<typeof vi.spyOn>;

const post = (body: unknown, type = "application/csp-report", ip = "203.0.113.5") =>
  POST(
    new NextRequest("http://localhost/api/csp-report", {
      method: "POST",
      body: typeof body === "string" ? body : JSON.stringify(body),
      headers: { "content-type": type, "x-forwarded-for": ip, "user-agent": "Mozilla/5.0 (secret-ua)" },
    }),
  );

const legacy = {
  "csp-report": {
    "document-uri": "https://fygs.dev/fr/blog/my-post?email=jane@example.com&token=abc",
    referrer: "https://www.google.com/search?q=jane",
    "violated-directive": "script-src-elem",
    "effective-directive": "script-src-elem",
    "blocked-uri": "https://evil.example.net/x.js?uid=42",
    "source-file": "https://fygs.dev/_next/static/chunks/app.js?v=1",
    "line-number": 12,
    "script-sample": "const secret = 'jane@example.com'",
    disposition: "report",
  },
};

beforeEach(() => {
  __resetRateLimitMemory();
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("parseCspReports", () => {
  it("reads the legacy report-uri format and keeps origins and paths only", () => {
    const [v] = parseCspReports(legacy);
    expect(v).toEqual({
      directive: "script-src-elem",
      blocked: "https://evil.example.net",
      page: "/fr/blog/my-post",
      scriptUrl: "https://fygs.dev/_next/static/chunks/app.js",
      line: 12,
      disposition: "report",
    });
    expect(JSON.stringify(v)).not.toMatch(/jane|token|uid|secret|google/);
  });

  it("reads the Reporting API format", () => {
    const out = parseCspReports([
      { type: "csp-violation", body: { effectiveDirective: "script-src-elem", blockedURL: "inline", documentURL: "https://fygs.dev/en", disposition: "enforce" } },
      { type: "network-error", body: {} },
    ]);
    expect(out).toEqual([{ directive: "script-src-elem", blocked: "inline", page: "/en", disposition: "enforce", scriptUrl: undefined, line: undefined }]);
  });

  it("ignores junk and caps the number of reports", () => {
    expect(parseCspReports(null)).toEqual([]);
    expect(parseCspReports("x")).toEqual([]);
    expect(parseCspReports({ "csp-report": "no" })).toEqual([]);
    const many = Array.from({ length: 50 }, () => ({ type: "csp-violation", body: { effectiveDirective: "img-src" } }));
    expect(parseCspReports(many)).toHaveLength(10);
  });

  it("classifies blocked resources", () => {
    expect(classifyBlocked("eval")).toBe("eval");
    expect(classifyBlocked("data:text/html,<b>x</b>")).toBe("data");
    expect(classifyBlocked("blob:https://fygs.dev/uuid")).toBe("blob");
    expect(classifyBlocked("wss://x.example.com/socket?k=1")).toBe("wss://x.example.com");
    expect(classifyBlocked("chrome-extension://abc/inject.js")).toBe("other");
    expect(classifyBlocked(undefined)).toBe("unknown");
    expect(pagePath("https://fygs.dev/fr/a/b/c/d/e?x=1")).toBe("/fr/a/b");
  });
});

describe("ViolationThrottle", () => {
  it("lets a signature through once per interval and counts what it skipped", () => {
    const t = new ViolationThrottle(1000, 3);
    expect(t.shouldLog("a", 0)).toEqual({ suppressed: 0 });
    expect(t.shouldLog("a", 10)).toBeNull();
    expect(t.shouldLog("a", 20)).toBeNull();
    expect(t.shouldLog("a", 1500)).toEqual({ suppressed: 2 });
  });

  it("stays bounded", () => {
    const t = new ViolationThrottle(1000, 3);
    for (let i = 0; i < 20; i++) t.shouldLog(`k${i}`, 0);
    expect((t as unknown as { seen: Map<string, unknown> }).seen.size).toBeLessThanOrEqual(3);
  });
});

describe("POST /api/csp-report", () => {
  it("answers 204 and logs one csp.violation without personal data", async () => {
    const res = await post(legacy);
    expect(res.status).toBe(204);
    const calls = warn.mock.calls.filter((c) => (c[1] as { message?: string })?.message === "csp.violation");
    expect(calls).toHaveLength(1);
    const printed = JSON.stringify(warn.mock.calls);
    expect(printed).not.toMatch(/jane|token=|secret|google|Mozilla|203\.0\.113/);
    expect(calls[0][1]).toMatchObject({ metadata: { directive: "script-src-elem", blocked: "https://evil.example.net", page: "/fr/blog/my-post" } });
  });

  it("does not repeat an identical violation within ten minutes", async () => {
    for (let i = 0; i < 5; i++) await post({ "csp-report": { ...legacy["csp-report"], "line-number": 777 } }, "application/csp-report", `198.51.100.${i + 1}`);
    expect(warn.mock.calls.filter((c) => (c[1] as { message?: string })?.message === "csp.violation")).toHaveLength(1);
  });

  it("accepts application/reports+json", async () => {
    const res = await post([{ type: "csp-violation", body: { effectiveDirective: "img-src", blockedURL: "https://x.example", documentURL: "https://fygs.dev/zz" } }], "application/reports+json");
    expect(res.status).toBe(204);
  });

  it("rejects other content types and oversized bodies", async () => {
    expect((await post("x", "text/plain")).status).toBe(415);
    expect((await post("x".repeat(20_000), "application/csp-report")).status).toBe(413);
  });

  it("tolerates malformed JSON", async () => {
    expect((await post("{nope")).status).toBe(204);
    expect(warn).not.toHaveBeenCalled();
  });

  it("is rate limited per client: a flood is dropped quietly", async () => {
    let calls = 0;
    for (let i = 0; i < 40; i++) {
      const res = await post({ "csp-report": { ...legacy["csp-report"], "line-number": 1000 + i } }, "application/csp-report", "192.0.2.9");
      expect(res.status).toBe(204);
    }
    calls = warn.mock.calls.filter((c) => (c[1] as { message?: string })?.message === "csp.violation").length;
    expect(calls).toBe(30);
  });

  it("does not answer GET", () => {
    expect(GET().status).toBe(405);
  });
});
