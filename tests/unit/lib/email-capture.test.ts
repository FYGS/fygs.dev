import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { CAPTURE_CONSENT, assertCaptureAllowed, captureEmail } from "@/lib/emails/service/capture";

const dirs: string[] = [];
afterEach(() => {
  while (dirs.length) rmSync(dirs.pop()!, { recursive: true, force: true });
});

function env(overrides: Record<string, string | undefined> = {}) {
  const dir = mkdtempSync(path.join(tmpdir(), "capture-"));
  dirs.push(dir);
  return {
    EMAIL_TRANSPORT: "capture",
    E2E_ALLOW_EMAIL_CAPTURE: CAPTURE_CONSENT,
    EMAIL_CAPTURE_FILE: path.join(dir, "mail.jsonl"),
    DATABASE_URL: "postgresql://postgres:password@localhost:5432/fygs_test",
    ...overrides,
  } as NodeJS.ProcessEnv;
}

describe("test-only email capture", () => {
  it("appends one JSON line per message when every guard holds", () => {
    const e = env();
    captureEmail({ to: "a@b.c", subject: "Hi", html: "<a href='x'>x</a>" }, e);
    captureEmail({ to: "d@e.f", subject: "Yo", html: "<p/>" }, e);
    const lines = readFileSync(e.EMAIL_CAPTURE_FILE!, "utf8").trim().split("\n").map((l) => JSON.parse(l));
    expect(lines.map((l) => l.to)).toEqual(["a@b.c", "d@e.f"]);
  });

  it.each([
    ["no consent flag", { E2E_ALLOW_EMAIL_CAPTURE: undefined }],
    ["wrong consent value", { E2E_ALLOW_EMAIL_CAPTURE: "1" }],
    ["no capture file", { EMAIL_CAPTURE_FILE: undefined }],
    ["no database url", { DATABASE_URL: undefined }],
    ["remote database", { DATABASE_URL: "postgresql://u:p@db.example.com:5432/fygs_test" }],
    ["local database not named test", { DATABASE_URL: "postgresql://u:p@localhost:5432/fygs" }],
  ])("refuses (fails closed) with %s", (_label, overrides) => {
    expect(() => assertCaptureAllowed(env(overrides))).toThrow();
    expect(() => captureEmail({ to: "a@b.c", subject: "s", html: "h" }, env(overrides))).toThrow();
  });
});
