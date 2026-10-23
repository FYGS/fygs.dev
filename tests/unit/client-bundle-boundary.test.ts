import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Regression: a "use client" component imported lib/analytics-helper, which imports the
 * Prisma client (lib/db) and the `pg` driver. `next build` failed with
 * "Can't resolve 'dns' / 'net' / 'tls'" and the browser would have tried to write to the
 * database. Walk the static imports of every client component and refuse any path that
 * reaches the database module, a Node built-in (`node:crypto`...) or `react-dom/server`: webpack
 * cannot bundle them for the browser and `next build` fails (the unit tests and tsc do not see it).
 * Server action files ("use server") are an RPC boundary.
 */
const root = path.resolve(__dirname, "../..");
const SERVER_ONLY = new Set(["lib/db.ts"]);
const SOURCE_DIRS = ["app", "components", "hooks", "providers", "contexts", "stores"];

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next") continue;
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(name) && !/\.d\.ts$/.test(name)) out.push(full);
  }
  return out;
}

function resolveImport(from: string, spec: string): string | null {
  let base: string;
  if (spec.startsWith("@/")) base = path.join(root, spec.slice(2));
  else if (spec.startsWith(".")) base = path.resolve(path.dirname(from), spec);
  else return null; // package
  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, path.join(base, "index.ts"), path.join(base, "index.tsx")]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

const directive = (src: string) => /^\s*(?:\/\/[^\n]*\n|\/\*[\s\S]*?\*\/\s*)*["']use (client|server)["']/.exec(src.replace(/^﻿/, ""))?.[1];

function staticImports(src: string): string[] {
  const specs: string[] = [];
  const re = /(?:^|\n)\s*(?:import|export)\s+(?!type\b)[^"';]*?from\s*["']([^"']+)["']|(?:^|\n)\s*import\s*["']([^"']+)["']/g;
  for (const m of src.matchAll(re)) specs.push(m[1] ?? m[2]);
  return specs;
}

function reachesServerOnly(entry: string): string[] | null {
  const seen = new Set<string>();
  const visit = (file: string, trail: string[]): string[] | null => {
    const rel = path.relative(root, file).replace(/\\/g, "/");
    if (SERVER_ONLY.has(rel)) return [...trail, rel];
    if (seen.has(file)) return null;
    seen.add(file);
    const src = readFileSync(file, "utf8");
    if (file !== entry && directive(src) === "server") return null;
    // code samples in template literals contain import lines that are not imports
    const specs = staticImports(src.replace(/`(?:\\.|[^`\\])*`/g, "``"));
    const forbidden = specs.find((spec) => spec.startsWith("node:") || spec === "react-dom/server");
    if (forbidden) return [...trail, rel, forbidden];
    for (const spec of specs) {
      const target = resolveImport(file, spec);
      if (!target) continue;
      const hit = visit(target, [...trail, rel]);
      if (hit) return hit;
    }
    return null;
  };
  return visit(entry, []);
}

describe("client bundle boundary", () => {
  it("no client component can reach the database, a Node built-in or react-dom/server", () => {
    const offenders: string[] = [];
    for (const dir of SOURCE_DIRS) {
      const abs = path.join(root, dir);
      if (!existsSync(abs)) continue;
      for (const file of walk(abs)) {
        if (directive(readFileSync(file, "utf8")) !== "client") continue;
        const chain = reachesServerOnly(file);
        if (chain) offenders.push(chain.join(" -> "));
      }
    }
    expect(offenders).toEqual([]);
    // walks every client component and what it imports: slow on a loaded machine
  }, 120_000);
});
