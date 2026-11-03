import { describe, expect, it, vi } from "vitest";
import { BEARER_MIN_LENGTH, bearerSecretProblem, checkBearer } from "@/lib/bearer";
import { readBodyText, readJsonBody } from "@/lib/http/read-body";
import {
  checkWriteOrigin,
  isCrossOriginExempt,
  stripInboundHeaders,
  trustedOrigins,
} from "@/lib/request-guard";

const SECRET = "k7Qp2mZx9LwR4tYb8NcD1sFh6JgA3eVu5Xo0";
const url = (path = "/api/profile") => new URL(`https://fygs.test${path}`);
const headers = (init: Record<string, string>) => new Headers({ host: "fygs.test", ...init });

describe("checkBearer", () => {
  const request = (value?: string) => new Request("http://x", { headers: value ? { authorization: value } : {} });

  it("accepts the exact secret with the Bearer scheme, in any case of the scheme", () => {
    expect(checkBearer(request(`Bearer ${SECRET}`), SECRET)).toBe(true);
    expect(checkBearer(request(`bearer ${SECRET}`), SECRET)).toBe(true);
    expect(checkBearer(new Headers({ authorization: `Bearer ${SECRET}` }), SECRET)).toBe(true);
  });

  it("refuses anything else: missing, wrong, truncated, extended, other scheme", () => {
    for (const value of [undefined, "", `Bearer ${SECRET}x`, `Bearer ${SECRET.slice(0, -1)}`, "Bearer wrong", SECRET, `Basic ${SECRET}`, `Bearer ${SECRET} extra`, "Bearer"]) {
      expect(checkBearer(request(value), SECRET), String(value)).toBe(false);
    }
  });

  it("never matches when the configured secret is missing or too short, even if the client sends the same short value", () => {
    expect(checkBearer(request("Bearer "), "")).toBe(false);
    expect(checkBearer(request("Bearer undefined"), undefined)).toBe(false);
    expect(checkBearer(request("Bearer 1234"), "1234")).toBe(false);
    expect(checkBearer(request(`Bearer ${"a".repeat(BEARER_MIN_LENGTH - 1)}`), "a".repeat(BEARER_MIN_LENGTH - 1))).toBe(false);
    expect(checkBearer(request(`Bearer ${"a".repeat(BEARER_MIN_LENGTH)}`), "a".repeat(BEARER_MIN_LENGTH))).toBe(true);
  });

  it("describes why a secret is unusable", () => {
    expect(bearerSecretProblem(undefined)).toMatch(/not set/);
    expect(bearerSecretProblem("short")).toMatch(/shorter/);
    expect(bearerSecretProblem(SECRET)).toBeNull();
  });

  it("compares in constant time: the same work whatever the length of the guess", () => {
    // Both sides are hashed to 32 bytes before timingSafeEqual: a guess of any length is a valid input (no exception, no early exit)
    for (const length of [1, 8, 32, 64, 4096]) {
      expect(() => checkBearer(request(`Bearer ${"z".repeat(length)}`), SECRET)).not.toThrow();
      expect(checkBearer(request(`Bearer ${"z".repeat(length)}`), SECRET)).toBe(false);
    }
  });
});

describe("readBodyText / readJsonBody", () => {
  const post = (body: BodyInit | null, extra: Record<string, string> = {}) =>
    new Request("http://x", { method: "POST", body, headers: extra, ...(body instanceof ReadableStream ? { duplex: "half" } : {}) } as RequestInit);

  it("reads a body within the limit", async () => {
    expect(await readBodyText(post("hello"), 100)).toEqual({ ok: true, text: "hello" });
    expect(await readJsonBody(post(JSON.stringify({ a: 1 })), 100)).toEqual({ ok: true, value: { a: 1 } });
    expect(await readBodyText(post(null), 100)).toEqual({ ok: true, text: "" });
  });

  it("refuses at once when Content-Length already says the body is too big", async () => {
    const result = await readBodyText(post("x", { "content-length": "5000" }), 100);
    expect(result).toEqual({ ok: false, status: 413, error: "too_large" });
  });

  it("stops reading a stream that grows past the limit, even without a Content-Length", async () => {
    let pulled = 0;
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        pulled += 1;
        controller.enqueue(new Uint8Array(1024).fill(97));
        if (pulled > 10_000) controller.close();
      },
    });
    const result = await readBodyText(post(stream), 4096);
    expect(result).toEqual({ ok: false, status: 413, error: "too_large" });
    // It cancelled the stream instead of buffering the megabytes the sender was ready to push
    expect(pulled).toBeLessThan(50);
  });

  it("refuses bytes that are not UTF-8 and JSON that does not parse", async () => {
    expect(await readBodyText(post(new Uint8Array([0xff, 0xfe, 0xfd])), 100)).toEqual({ ok: false, status: 400, error: "unreadable" });
    expect(await readJsonBody(post("{not json"), 100)).toEqual({ ok: false, status: 400, error: "invalid_json" });
    expect(await readJsonBody(post(""), 100)).toEqual({ ok: false, status: 400, error: "invalid_json" });
  });

  it("applies the limit to the decoded bytes, not the characters", async () => {
    const text = "é".repeat(60); // 120 bytes
    expect((await readBodyText(post(text), 100)).ok).toBe(false);
    expect((await readBodyText(post(text), 120)).ok).toBe(true);
  });
});

describe("checkWriteOrigin", () => {
  it("never judges a read or a preflight", () => {
    for (const method of ["GET", "HEAD", "OPTIONS"]) {
      expect(checkWriteOrigin(method, headers({ origin: "https://evil.example", "sec-fetch-site": "cross-site" }), url())).toEqual({ ok: true });
    }
  });

  it("refuses a write a browser says is cross-site, whatever else it sends", () => {
    expect(checkWriteOrigin("POST", headers({ "sec-fetch-site": "cross-site", origin: "https://fygs.test" }), url())).toEqual({ ok: false, reason: "cross_site" });
  });

  it("refuses another origin, an opaque origin, and a sibling subdomain", () => {
    expect(checkWriteOrigin("PATCH", headers({ origin: "https://evil.example" }), url())).toEqual({ ok: false, reason: "origin_mismatch" });
    expect(checkWriteOrigin("DELETE", headers({ origin: "null" }), url())).toEqual({ ok: false, reason: "opaque_origin" });
    expect(checkWriteOrigin("POST", headers({ "sec-fetch-site": "same-site" }), url())).toEqual({ ok: false, reason: "origin_mismatch" });
    expect(checkWriteOrigin("POST", headers({ origin: "https://evil.fygs.test" }), url())).toEqual({ ok: false, reason: "origin_mismatch" });
  });

  it("accepts this site, a configured public URL, and clients that send no origin information", () => {
    expect(checkWriteOrigin("POST", headers({ origin: "https://fygs.test" }), url())).toEqual({ ok: true });
    expect(checkWriteOrigin("POST", headers({ origin: "https://fygs.test", "sec-fetch-site": "same-origin" }), url())).toEqual({ ok: true });
    expect(checkWriteOrigin("POST", headers({ origin: "https://www.example.org" }), url(), { NEXT_PUBLIC_SITE_URL: "https://www.example.org" } as unknown as NodeJS.ProcessEnv)).toEqual({ ok: true });
    expect(checkWriteOrigin("POST", headers({}), url())).toEqual({ ok: true });
  });

  it("uses the scheme the browser used when a proxy terminates TLS", () => {
    const origins = trustedOrigins(headers({ "x-forwarded-proto": "https" }), new URL("http://fygs.test/api/x"));
    expect(origins.has("https://fygs.test")).toBe(true);
  });

  it("does not trust a malformed Host header", () => {
    const origins = trustedOrigins(new Headers({ host: "evil.example/path?x" }), url(), {} as NodeJS.ProcessEnv);
    expect(origins.size).toBe(0);
  });
});

describe("isCrossOriginExempt", () => {
  it("exempts the machine endpoints and their sub-paths, and only them", () => {
    for (const path of ["/api/stripe/webhook", "/api/cron/weekly-review-summaries", "/api/csp-report", "/api/auth/sign-in/email", "/api/health"]) {
      expect(isCrossOriginExempt(path), path).toBe(true);
    }
    for (const path of ["/api/profile", "/api/stripe/checkout", "/api/upload/image", "/api/authentic", "/api/cronos", "/api/healthz", "/api/stripe/webhooks-fake"]) {
      expect(isCrossOriginExempt(path), path).toBe(false);
    }
  });
});

describe("stripInboundHeaders", () => {
  it("removes the internal and policy headers a client must not set, and keeps the rest", () => {
    const { headers: cleaned, changed } = stripInboundHeaders(
      new Headers({ "x-middleware-subrequest": "a", "Content-Security-Policy": "x", "content-security-policy-report-only": "y", "x-nonce": "z", cookie: "s=1", accept: "*/*" }),
    );
    expect(changed).toBe(true);
    expect([...cleaned.keys()].sort()).toEqual(["accept", "cookie"]);
  });

  it("reports no change when there is nothing to remove, and does not touch the original", () => {
    const original = new Headers({ accept: "*/*" });
    expect(stripInboundHeaders(original).changed).toBe(false);
    const dirty = new Headers({ "x-nonce": "z" });
    stripInboundHeaders(dirty);
    expect(dirty.get("x-nonce")).toBe("z");
  });
});

vi.setConfig({ testTimeout: 15000 });
