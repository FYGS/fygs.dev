import { compressToEncodedURIComponent } from "lz-string";
import { describe, expect, it } from "vitest";

import {
  SHARED_PROJECT_LIMITS,
  parseSharedProject,
  safeProjectPath,
} from "@/app/[locale]/(main)/tech-mastry/playground/_utils/shared-project";

const encode = (value: unknown) => compressToEncodedURIComponent(typeof value === "string" ? value : JSON.stringify(value));

describe("safeProjectPath", () => {
  it("accepts plain relative paths", () => {
    expect(safeProjectPath("index.js")).toBe("index.js");
    expect(safeProjectPath("src/app/main.ts")).toBe("src/app/main.ts");
    expect(safeProjectPath("  notes v2.md ")).toBe("notes v2.md");
  });

  it.each([
    "../secret",
    "a/../../b",
    "/etc/passwd",
    "C:/windows/x",
    "a\\b",
    "a/./b",
    "a//b",
    "%2e%2e/x",
    ".git/config",
    "node_modules/x/index.js",
    "file.",
    "bad\u0000name",
    "a/b/c/d/e/f/g",
    "x".repeat(SHARED_PROJECT_LIMITS.pathChars + 1),
    "",
    ".hidden-start-with-dot-is-fine-but-dot-dot-is-not/..",
  ])("refuses %j", (path) => {
    expect(safeProjectPath(path)).toBeNull();
  });

  it("refuses anything that is not a string", () => {
    expect(safeProjectPath(undefined)).toBeNull();
    expect(safeProjectPath(12)).toBeNull();
    expect(safeProjectPath({ toString: () => "a.js" })).toBeNull();
  });
});

describe("parseSharedProject", () => {
  it("reads a project and keeps one entry point", () => {
    const result = parseSharedProject(
      encode([
        { p: "a.js", c: "1", e: true },
        { p: "b.js", c: "2", e: true },
      ]),
    );
    expect(result).toEqual({
      ok: true,
      files: [
        { path: "a.js", content: "1", isEntryPoint: true },
        { path: "b.js", content: "2", isEntryPoint: false },
      ],
    });
  });

  it("refuses empty, malformed and non-array input", () => {
    expect(parseSharedProject(null)).toEqual({ ok: false, reason: "empty" });
    expect(parseSharedProject("")).toEqual({ ok: false, reason: "empty" });
    expect(parseSharedProject("not-a-valid-link!!")).toMatchObject({ ok: false });
    expect(parseSharedProject(encode("{not json"))).toEqual({ ok: false, reason: "malformed" });
    expect(parseSharedProject(encode({ p: "a.js" }))).toEqual({ ok: false, reason: "malformed" });
    expect(parseSharedProject(encode([]))).toEqual({ ok: false, reason: "malformed" });
    expect(parseSharedProject(encode([null]))).toEqual({ ok: false, reason: "malformed" });
    expect(parseSharedProject(encode([{ p: "a.js", c: 5 }]))).toEqual({ ok: false, reason: "malformed" });
  });

  it("refuses a bad path anywhere in the project", () => {
    expect(parseSharedProject(encode([{ p: "ok.js", c: "" }, { p: "../x.js", c: "" }]))).toEqual({ ok: false, reason: "bad_path" });
  });

  it("refuses two files of the same name, whatever the case", () => {
    expect(parseSharedProject(encode([{ p: "A.js", c: "" }, { p: "a.JS", c: "" }]))).toEqual({
      ok: false,
      reason: "duplicate_path",
    });
  });

  it("enforces the limits", () => {
    const many = Array.from({ length: SHARED_PROJECT_LIMITS.files + 1 }, (_, i) => ({ p: `f${i}.js`, c: "" }));
    expect(parseSharedProject(encode(many))).toEqual({ ok: false, reason: "too_many_files" });
    const big = [{ p: "a.js", c: "x".repeat(SHARED_PROJECT_LIMITS.fileChars + 1) }];
    expect(parseSharedProject(encode(big))).toEqual({ ok: false, reason: "too_large" });
    const total = Array.from({ length: 4 }, (_, i) => ({ p: `f${i}.js`, c: "x".repeat(SHARED_PROJECT_LIMITS.fileChars) }));
    expect(parseSharedProject(encode(total))).toEqual({ ok: false, reason: "too_large" });
    expect(parseSharedProject("a".repeat(SHARED_PROJECT_LIMITS.encodedChars + 1))).toEqual({ ok: false, reason: "too_large" });
  });

  it("cannot be polluted through __proto__ or inherited properties", () => {
    const json = '[{"p":"a.js","c":"1","__proto__":{"e":true,"p":"../evil"}}]';
    const result = parseSharedProject(encode(json));
    expect(result).toEqual({ ok: true, files: [{ path: "a.js", content: "1", isEntryPoint: false }] });
    expect(({} as Record<string, unknown>).e).toBeUndefined();
  });

  it("does not read a path from the prototype chain", () => {
    expect(parseSharedProject(encode('[{"__proto__":{"p":"a.js"}}]'))).toEqual({ ok: false, reason: "bad_path" });
  });
});
