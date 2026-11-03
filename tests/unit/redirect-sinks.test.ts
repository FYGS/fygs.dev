import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Regression for the open redirect / DOM XSS of the login page (`?callbackUrl=javascript:...` was handed to
 * `window.location.href`). Every navigation that assigns the browser location must take a path that went through
 * `safeInternalPath` (lib/safe-redirect.ts), a literal path of this site, or an address the server built.
 * The scan reads the sources: a new sink with an unvalidated argument fails here.
 */
const root = path.resolve(__dirname, "../..");
const SOURCE_DIRS = ["app", "components", "lib", "hooks", "providers", "contexts", "stores"];

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next" || name === "generated") continue;
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(name) && !/\.d\.ts$/.test(name)) out.push(full);
  }
  return out;
}

interface Sink {
  file: string;
  line: number;
  argument: string;
}

function sinksOf(file: string): Sink[] {
  const source = readFileSync(file, "utf8");
  const found: Sink[] = [];
  const patterns = [
    /hardNavigate\(\s*([^)\n]+)/g,
    /window\.location\.href\s*=\s*([^;\n]+)/g,
    /window\.location\.(?:assign|replace)\(\s*([^)\n]+)/g,
  ];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      const line = source.slice(0, match.index).split("\n").length;
      found.push({ file: path.relative(root, file).replace(/\\/g, "/"), line, argument: match[1].trim() });
    }
  }
  return found;
}

/** Arguments that cannot be steered by whoever built the link. */
const SAFE_ARGUMENT = [
  /^destination\b/, // a value that went through safeInternalPath
  /^[`"']\/(?!\/)/, // a literal path of this site: "/", "/auth/two-factor?..."
  /^new URL\(["']\/(?!\/)/, // new URL("/formations", window.location.origin).href
];

/** Addresses the server answered (Stripe checkout and billing portal sessions), not read from the page address. */
const SERVER_BUILT = new Map<string, RegExp>([
  ["app/_components/payment/course-offer-panel.tsx", /^data\.url\b/],
  ["app/_components/payment/subscription-plans.tsx", /^data\.url\b/],
  ["components/billing/billing-actions.tsx", /^data\.url\b/],
]);

describe("browser location sinks", () => {
  const sinks = SOURCE_DIRS.filter((dir) => existsSync(path.join(root, dir)))
    .flatMap((dir) => walk(path.join(root, dir)))
    .filter((file) => !file.endsWith(path.join("lib", "browser-effects.ts"))) // the wrapper itself
    .flatMap(sinksOf);

  it("finds the sinks of the sign-in flow (the scan is not empty)", () => {
    expect(sinks.some((s) => s.file.endsWith("login-form.tsx"))).toBe(true);
    expect(sinks.some((s) => s.file.endsWith("two-factor/page.tsx"))).toBe(true);
  });

  it("gives every sink a validated or literal path", () => {
    const unsafe = sinks.filter((sink) => {
      if (SAFE_ARGUMENT.some((pattern) => pattern.test(sink.argument))) return false;
      const serverBuilt = SERVER_BUILT.get(sink.file);
      return !(serverBuilt && serverBuilt.test(sink.argument));
    });
    expect(unsafe.map((s) => `${s.file}:${s.line}  ${s.argument}`)).toEqual([]);
  });

  it("does not keep the old callback page that navigated to a stored address", () => {
    expect(existsSync(path.join(root, "app/[locale]/(main)/auth/callback/page.tsx"))).toBe(false);
  });
});
