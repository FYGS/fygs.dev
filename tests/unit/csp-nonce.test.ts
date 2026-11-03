import { describe, expect, it } from "vitest";
import {
  buildGlobalCsp,
  buildNonceCsp,
  generateNonce,
  NONCE_EXCLUDED_PATHS,
  NONCE_ROUTE_PREFIXES,
  nonceEnforced,
  THEME_SCRIPT_SHA256,
  usesNonceCsp,
} from "@/lib/csp.mjs";

/** A partial environment for the functions that take one. */
const envOf = (vars: Record<string, string | undefined>) => vars as unknown as NodeJS.ProcessEnv;

const directive = (policy: string, name: string) =>
  policy.split("; ").find((d) => d === name || d.startsWith(`${name} `)) ?? "";

describe("generateNonce", () => {
  it("is 128 random bits in base64, different every time, and a valid CSP source", () => {
    const seen = new Set(Array.from({ length: 200 }, () => generateNonce()));
    expect(seen.size).toBe(200);
    for (const nonce of seen) {
      expect(nonce).toMatch(/^[A-Za-z0-9+/]{22}==$/);
      // the exact shape Next.js looks for (next/dist/server/app-render/get-script-nonce-from-header)
      expect(`'nonce-${nonce}'`).toMatch(/^'nonce-([A-Za-z0-9+/_-]+={0,2})'$/);
    }
  });
});

describe("the nonce policy", () => {
  const nonce = "AAAAAAAAAAAAAAAAAAAAAA==";
  const production = buildNonceCsp(nonce, { isDev: false });

  it("allows scripts by nonce (and the one hashed theme script) only: no 'unsafe-inline', no 'unsafe-eval', strict-dynamic for what they load", () => {
    const scripts = directive(production, "script-src");
    expect(scripts).toBe(
      `script-src 'self' 'nonce-${nonce}' 'sha256-${THEME_SCRIPT_SHA256}' 'strict-dynamic' https://js.stripe.com`,
    );
    expect(scripts).not.toContain("unsafe-inline");
    expect(scripts).not.toContain("unsafe-eval");
    expect(directive(production, "script-src-attr")).toBe("script-src-attr 'none'");
  });

  it("keeps every other protection of the global policy", () => {
    const global = buildGlobalCsp(false);
    for (const name of ["default-src", "object-src", "base-uri", "form-action", "frame-ancestors", "connect-src", "frame-src", "worker-src", "img-src"]) {
      expect(directive(production, name), name).toBe(directive(global, name));
    }
    expect(directive(production, "worker-src")).toContain("blob:"); // the proof-of-work solver runs in a blob worker
  });

  it("allows eval only in development (React's debugging stacks)", () => {
    expect(directive(buildNonceCsp(nonce, { isDev: true }), "script-src")).toContain("'unsafe-eval'");
  });

  it("reports violations when asked for the Report-Only variant, and not otherwise", () => {
    expect(buildNonceCsp(nonce, { isDev: false, reportOnly: true })).toContain("report-uri /api/csp-report");
    expect(production).not.toContain("report-uri");
  });

  it("is the policy of the static pages that still carries 'unsafe-inline' (documented trade-off)", () => {
    expect(directive(buildGlobalCsp(false), "script-src")).toContain("'unsafe-inline'");
  });
});

describe("which pages get the nonce policy", () => {
  it("the signed-in areas do, with or without a sub-path or a trailing slash", () => {
    for (const path of ["/admin", "/admin/courses/abc", "/dashboard", "/dashboard/billing", "/profile", "/learn/react/lessons/intro", "/community/discussions/1", "/certificates/abc", "/dashboard/", "/auth/new-page"]) {
      expect(usesNonceCsp(path), path).toBe(true);
    }
  });

  it("marketing, catalogue, blog, TechMastery and the playground do not (they are prerendered)", () => {
    for (const path of ["/", "/formations", "/formations/react", "/parcours", "/blog", "/blog/post", "/tech-mastry", "/tech-mastry/playground", "/pricing", "/contact"]) {
      expect(usesNonceCsp(path), path).toBe(false);
    }
  });

  it("does not match look-alike prefixes", () => {
    for (const path of ["/administrator", "/dashboards", "/learner", "/authors", "/profiles"]) expect(usesNonceCsp(path), path).toBe(false);
  });

  it("leaves out the prerendered pages of an included area, and the ones named in CSP_NONCE_EXCLUDE", () => {
    for (const path of NONCE_EXCLUDED_PATHS) expect(usesNonceCsp(path), path).toBe(false);
    // the credential pages are where a password is typed: they are rendered per request and NEVER excluded
    for (const path of ["/auth/login", "/auth/register", "/auth/verify", "/auth/error", "/auth/forgot-password", "/auth/reset-password", "/auth/two-factor"]) {
      expect(NONCE_EXCLUDED_PATHS, path).not.toContain(path);
      expect(usesNonceCsp(path), path).toBe(true);
    }
    expect(usesNonceCsp("/dashboard/billing")).toBe(true);
    expect(usesNonceCsp("/community/topics", envOf({ CSP_NONCE_EXCLUDE: "/community/topics" }))).toBe(false);
    expect(usesNonceCsp("/community/topics/react", envOf({ CSP_NONCE_EXCLUDE: "/community/topics" }))).toBe(false);
    expect(usesNonceCsp("/community/new", envOf({ CSP_NONCE_EXCLUDE: "/community/topics" }))).toBe(true);
  });

  it("lists the areas the review asked for", () => {
    expect(NONCE_ROUTE_PREFIXES).toEqual(expect.arrayContaining(["/admin", "/dashboard", "/auth", "/learn", "/profile", "/community"]));
  });
});

describe("the switch", () => {
  const env = (value?: string) => envOf({ CSP_NONCE_ENFORCE: value });

  it("enforces by default and when set to anything but an off value", () => {
    expect(nonceEnforced(env(undefined))).toBe(true);
    expect(nonceEnforced(env(""))).toBe(true);
    expect(nonceEnforced(env("1"))).toBe(true);
    expect(nonceEnforced(env("true"))).toBe(true);
  });

  it("is turned off by 0, false, off or no (any case)", () => {
    for (const value of ["0", "false", "FALSE", "off", "Off", "no", " 0 "]) expect(nonceEnforced(env(value)), value).toBe(false);
  });
});
