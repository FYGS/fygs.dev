import { describe, it, expect, vi, afterEach } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { redact, redactString, maskEmail, installConsoleRedaction, REDACTED, CIRCULAR } from "@/lib/log-redaction";

describe("redactString", () => {
  it("masks email addresses as a***@domain", () => {
    expect(maskEmail("jane.doe@example.com")).toBe("j***@example.com");
    expect(redactString("Sent to jane.doe@example.com and bob@mail.co.uk ok")).toBe(
      "Sent to j***@example.com and b***@mail.co.uk ok",
    );
  });

  it("masks IPv4, bearer tokens, API keys and JWTs", () => {
    expect(redactString("from 203.0.113.42")).toBe("from 203.0.x.x");
    expect(redactString("Authorization: Bearer abcdefghijklmnop")).toBe(`Authorization: Bearer ${REDACTED}`);
    expect(redactString("key sk-ant-api03-abcdefghijkl")).toBe(`key ${REDACTED}`);
    expect(redactString("whsec_abcdefghijklmnop")).toBe(REDACTED);
    expect(redactString("jwt eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0In0.abcd1234")).toBe(`jwt ${REDACTED}`);
  });

  it("is idempotent", () => {
    const once = redactString("a@b.com 1.2.3.4");
    expect(redactString(once)).toBe(once);
  });
});

describe("redact", () => {
  it("drops values under personal and secret keys but keeps ids and counters", () => {
    const out = redact({
      userId: "u_1",
      email: "a@b.com",
      customerEmail: "c@d.com",
      name: "Jane",
      phone: "+33 6 00 00 00 00",
      password: "hunter2",
      accessToken: "abc",
      apiKey: "k",
      headers: { authorization: "Bearer x", cookie: "s=1", "x-csrf-token": "t" },
      inputTokens: 12,
      courseId: "c_9",
      to: "x@y.com",
    });
    expect(out).toEqual({
      userId: "u_1",
      email: REDACTED,
      customerEmail: REDACTED,
      name: REDACTED,
      phone: REDACTED,
      password: REDACTED,
      accessToken: REDACTED,
      apiKey: REDACTED,
      headers: { authorization: REDACTED, cookie: REDACTED, "x-csrf-token": REDACTED },
      inputTokens: 12,
      courseId: "c_9",
      to: REDACTED,
    });
  });

  it("recurses into nested objects and arrays", () => {
    const out = redact({ a: [{ email: "a@b.com", ok: 1 }, "mail me at z@z.org"], b: { c: { secret: "s" } } });
    expect(out).toEqual({ a: [{ email: REDACTED, ok: 1 }, "mail me at z***@z.org"], b: { c: { secret: REDACTED } } });
  });

  it("drops message bodies but keeps short status codes", () => {
    const out = redact({ code: "ECONNREFUSED", html: "<p>Hi Jane</p>", body: { x: 1 }, prompt: "secret question" }) as Record<string, unknown>;
    expect(out.code).toBe("ECONNREFUSED");
    expect(out.html).toBe(REDACTED);
    expect(out.body).toBe(REDACTED);
    expect(out.prompt).toBe(REDACTED);
    expect((redact({ code: "const x = 1;\nconsole.log(x)" }) as { code: string }).code).toBe(REDACTED);
  });

  it("reduces errors to masked name, message, code and stack", () => {
    const err = Object.assign(new Error("No mailbox for jane@example.com"), { code: "EENVELOPE", password: "x" });
    const out = redact(err) as Record<string, unknown>;
    expect(out.name).toBe("Error");
    expect(out.message).toBe("No mailbox for j***@example.com");
    expect(out.code).toBe("EENVELOPE");
    expect(out).not.toHaveProperty("password");
    expect(String(out.stack)).not.toContain("jane@example.com");
  });

  it("keeps error causes redacted", () => {
    const out = redact(new Error("outer", { cause: new Error("inner for a@b.com") })) as { cause: { message: string } };
    expect(out.cause.message).toBe("inner for a***@b.com");
  });

  it("survives circular references without flagging shared ones", () => {
    const a: Record<string, unknown> = { id: 1 };
    a.self = a;
    const shared = { v: 1 };
    const out = redact({ a, x: shared, y: shared }) as { a: { self: unknown }; x: unknown; y: unknown };
    expect(out.a.self).toBe(CIRCULAR);
    expect(out.x).toEqual({ v: 1 });
    expect(out.y).toEqual({ v: 1 });
  });

  it("does not mutate its input and tolerates odd values", () => {
    const input = { email: "a@b.com", n: BigInt(3), f: () => 1, d: new Date(0), m: new Map([["token", "t"]]) };
    const out = redact(input) as Record<string, unknown>;
    expect(input.email).toBe("a@b.com");
    expect(out.n).toBe("3");
    expect(out.f).toBeUndefined();
    expect(out.d).toBe("1970-01-01T00:00:00.000Z");
    expect(out.m).toEqual({ token: REDACTED });
    expect(redact(null)).toBeNull();
    expect(redact(undefined)).toBeUndefined();
  });

  it("caps depth and array length", () => {
    let deep: Record<string, unknown> = { end: true };
    for (let i = 0; i < 20; i++) deep = { child: deep };
    expect(JSON.stringify(redact(deep))).toContain("[MaxDepth]");
    const arr = redact(Array.from({ length: 500 }, (_, i) => i)) as unknown[];
    expect(arr).toHaveLength(101);
  });

  it("never throws on hostile getters", () => {
    const hostile = {
      get boom() {
        throw new Error("nope");
      },
    };
    expect(() => redact(hostile)).not.toThrow();
  });
});

describe("installConsoleRedaction", () => {
  afterEach(() => vi.restoreAllMocks());

  it("redacts what reaches the underlying console and is idempotent", () => {
    const calls: unknown[][] = [];
    const fake = { log: (...a: unknown[]) => calls.push(a), info() {}, warn() {}, error: (...a: unknown[]) => calls.push(a), debug() {} } as unknown as Console;
    installConsoleRedaction(fake);
    installConsoleRedaction(fake);
    fake.log("user a@b.com", { email: "a@b.com", userId: "u1" });
    fake.error("failed", new Error("bad for x@y.com"));
    expect(calls[0]).toEqual(["user a***@b.com", { email: REDACTED, userId: "u1" }]);
    expect((calls[1][1] as { message: string }).message).toBe("bad for x***@y.com");
    expect(calls).toHaveLength(2);
  });
});

describe("structured logger applies redaction", () => {
  it("masks message, context and error before output", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const { logger } = await import("@/lib/structured-logger");
    logger.info("hello jane@example.com", { userId: "u1", metadata: { email: "jane@example.com", ip: "1.2.3.4", nested: { to: "x@y.z" } } });
    logger.error("boom", { userId: "u1" }, new Error("smtp rejected a@b.com"));
    const printed = JSON.stringify([info.mock.calls, error.mock.calls]);
    expect(printed).not.toContain("jane@example.com");
    expect(printed).not.toContain("a@b.com");
    expect(printed).not.toContain("1.2.3.4");
    expect(printed).toContain("u1");
    expect(printed).toContain("j***@example.com");
    info.mockRestore();
    error.mockRestore();
  });
});

// ─── Source scan ─────────────────────────────────────────────────────────────

const ROOT = path.resolve(__dirname, "../../..");
const SCANNED = ["app/api", "app/actions", "lib", "providers", "hooks"];
// Tutorial pages print example code; the logger/redactor tests name the patterns.
const SKIP = [/[\\/]tech-mastry[\\/]/, /log-redaction\.ts$/, /structured-logger\.ts$/];

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next") continue;
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(entry)) out.push(full);
  }
  return out;
}

/** Statements that print a person's data: console.x(`... ${user.email}`) and friends. */
const RISKY = [
  /console\.\w+\([^)]*\$\{[^}]*\b(email|phone|password|token|secret|cookie|authorization|ipAddress)\b/i,
  /console\.\w+\([^)]*,\s*[\w.]*\.(email|password|phone)\b\s*[,)]/i,
  /(logger|log)\.\w+\([^;]*\b(userEmail|customerEmail|studentEmail|instructorEmail|mentorEmail)\s*:/,
  /console\.\w+\(\s*(req|request)\.headers/,
  /console\.\w+\([^)]*(req|request)\.(headers|cookies)\b/,
];

describe("source scan: no obviously risky logging", () => {
  it("finds no console/logger call writing emails, passwords, tokens or cookies", () => {
    const offenders: string[] = [];
    for (const dir of SCANNED) {
      for (const file of walk(path.join(ROOT, dir))) {
        if (SKIP.some((re) => re.test(file))) continue;
        const lines = readFileSync(file, "utf8").split(/\r?\n/);
        lines.forEach((line, i) => {
          if (RISKY.some((re) => re.test(line))) offenders.push(`${path.relative(ROOT, file)}:${i + 1}: ${line.trim()}`);
        });
      }
    }
    expect(offenders).toEqual([]);
  });
});
