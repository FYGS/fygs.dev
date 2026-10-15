import { describe, it, expect } from "vitest";
// @ts-expect-error plain ESM shared with next.config.mjs
import { buildGlobalCsp, buildPlaygroundCsp, NON_PLAYGROUND_SOURCE } from "@/lib/csp.mjs";

const directive = (policy: string, name: string) =>
  policy.split("; ").find((d) => d === name || d.startsWith(`${name} `)) ?? "";

describe("Content-Security-Policy", () => {
  it("locks down the site-wide policy", () => {
    const csp = buildGlobalCsp();
    expect(directive(csp, "default-src")).toBe("default-src 'self'");
    expect(directive(csp, "object-src")).toBe("object-src 'none'");
    expect(directive(csp, "base-uri")).toBe("base-uri 'self'");
    expect(directive(csp, "frame-ancestors")).toBe("frame-ancestors 'self'");
    expect(directive(csp, "form-action")).toBe("form-action 'self'");
    expect(directive(csp, "connect-src")).not.toMatch(/https:(\s|$)/);
    expect(directive(csp, "frame-src")).not.toMatch(/https:(\s|$)/);
  });

  it("allows eval only in development", () => {
    expect(directive(buildGlobalCsp(false), "script-src")).not.toContain("'unsafe-eval'");
    expect(directive(buildGlobalCsp(true), "script-src")).toContain("'unsafe-eval'");
  });

  it("gives the playground the CDNs, eval and frames it needs", () => {
    const csp = buildPlaygroundCsp();
    const script = directive(csp, "script-src");
    for (const origin of ["https://cdn.jsdelivr.net", "https://unpkg.com", "https://esm.sh", "'unsafe-eval'", "'wasm-unsafe-eval'", "blob:"]) {
      expect(script).toContain(origin);
    }
    expect(directive(csp, "frame-src")).toContain("https:");
    expect(directive(csp, "object-src")).toBe("object-src 'none'");
  });

  it("applies the site-wide policy to every route except the playground", () => {
    const re = new RegExp(`^${NON_PLAYGROUND_SOURCE.replace(/^\//, "\/")}$`);
    expect(re.test("/fr/blog/x")).toBe(true);
    expect(re.test("/fr/tech-mastry/system-design")).toBe(true);
    expect(re.test("/fr/tech-mastry/playground")).toBe(false);
    expect(re.test("/en/tech-mastry/playground")).toBe(false);
  });
});
