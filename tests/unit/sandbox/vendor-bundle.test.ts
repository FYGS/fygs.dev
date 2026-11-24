import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { SANDBOX_REACT } from "@/app/_lib/sandbox-vendor.generated";

const root = path.resolve(__dirname, "../../..");

describe("the self-hosted React bundle of the previews", () => {
  it("is the file whose hash the previews pin (run scripts/build-sandbox-vendor.mjs after a React upgrade)", () => {
    const bytes = fs.readFileSync(path.join(root, "public", SANDBOX_REACT.path));
    const hash = `sha384-${createHash("sha384").update(bytes).digest("base64")}`;
    expect(hash).toBe(SANDBOX_REACT.integrity);
  });

  it("matches the installed React version", () => {
    const installed = JSON.parse(fs.readFileSync(path.join(root, "node_modules/react/package.json"), "utf8")).version;
    expect(SANDBOX_REACT.version).toBe(installed);
  });
});

describe("what the page code is allowed to load", () => {
  const read = (...parts: string[]) => fs.readFileSync(path.join(root, ...parts), "utf8");
  const playgroundDir = path.join(root, "app/[locale]/(main)/tech-mastry/playground");

  function walk(dir: string): string[] {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = path.join(dir, entry.name);
      return entry.isDirectory() ? walk(full) : /\.(ts|tsx)$/.test(entry.name) ? [full] : [];
    });
  }

  it("the site's own pages never load or start Python (it runs in /sandbox/python.html only)", () => {
    const files = [...walk(playgroundDir), path.join(root, "app/_lib/python-executor.ts"), path.join(root, "app/_lib/code-execution.ts")];
    for (const file of files) {
      const text = fs.readFileSync(file, "utf8");
      expect(text, file).not.toMatch(/loadPyodide\s*\(/);
      expect(text, file).not.toMatch(/cdn\.jsdelivr\.net\/pyodide/);
      expect(text, file).not.toMatch(/createElement\(\s*["']script["']\s*\)/);
    }
  });

  it("the Python executor talks to the sandbox page", () => {
    const text = read("app/_lib/python-executor.ts");
    expect(text).toContain("/sandbox/python.html");
  });

  it("previews load React from the site, with its hash, not from a CDN", () => {
    const text = read("app/_lib/code-execution.ts");
    expect(text).toContain("SANDBOX_REACT");
    expect(text).not.toMatch(/unpkg\.com\/react/);
  });

  it("no iframe of the playground combines allow-scripts and allow-same-origin", () => {
    for (const file of walk(playgroundDir)) {
      const text = fs.readFileSync(file, "utf8");
      for (const match of text.matchAll(/sandbox=(?:"([^"]*)"|\{["'`]([^"'`]*)["'`]\})/g)) {
        const value = match[1] ?? match[2] ?? "";
        expect(value, file).not.toContain("allow-same-origin");
      }
    }
    const channel = read("app/_lib/sandbox-channel.ts");
    expect(channel).toMatch(/setAttribute\(\s*"sandbox",\s*"allow-scripts"\s*\)/);
  });
});
