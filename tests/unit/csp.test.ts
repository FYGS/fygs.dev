import { describe, it, expect } from "vitest";
// @ts-expect-error plain ESM shared with next.config.mjs
import {
  buildGlobalCsp,
  buildPlaygroundCsp,
  buildReportOnlyCsp,
  buildSandboxCsp,
  CSP_REPORT_PATH,
  NON_PLAYGROUND_SOURCE,
  REPORT_ONLY_HEADER,
  REPORTING_ENDPOINTS_VALUE,
  SANDBOX_SOURCE,
} from "@/lib/csp.mjs";

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

  it("blocks inline event-handler attributes", () => {
    expect(directive(buildGlobalCsp(), "script-src-attr")).toBe("script-src-attr 'none'");
  });

  it("allows eval only in development", () => {
    expect(directive(buildGlobalCsp(false), "script-src")).not.toContain("'unsafe-eval'");
    expect(directive(buildGlobalCsp(true), "script-src")).toContain("'unsafe-eval'");
  });

  it("gives the playground the eval and frames it needs, but no third-party script host", () => {
    const csp = buildPlaygroundCsp();
    const script = directive(csp, "script-src");
    for (const origin of ["'self'", "'unsafe-eval'", "blob:"]) expect(script).toContain(origin);
    // the previews and Python run in sandbox pages with their own policy: the page itself loads no CDN script
    for (const origin of ["cdn.jsdelivr.net", "unpkg.com", "esm.sh", "'wasm-unsafe-eval'"]) {
      expect(script).not.toContain(origin);
    }
    expect(directive(csp, "frame-src")).toContain("https:");
    expect(directive(csp, "frame-src")).not.toMatch(/blob:|data:/);
    expect(directive(csp, "object-src")).toBe("object-src 'none'");
  });

  describe("Python sandbox policy", () => {
    const csp = buildSandboxCsp("python");

    it("allows WebAssembly and the runtime's own files, and no network", () => {
      expect(directive(csp, "default-src")).toBe("default-src 'none'");
      const script = directive(csp, "script-src");
      expect(script).toContain("'self'");
      expect(script).toContain("'wasm-unsafe-eval'");
      expect(script).not.toContain("'unsafe-inline'");
      expect(csp).not.toMatch(/https?:/);
      expect(directive(csp, "connect-src")).toBe("connect-src 'self'");
      expect(directive(csp, "frame-ancestors")).toBe("frame-ancestors 'self'");
      expect(directive(csp, "form-action")).toBe("form-action 'none'");
    });
  });

  describe("preview sandbox policy", () => {
    const csp = buildSandboxCsp("preview");

    it("is the only place the CDNs may run scripts, and it cannot be framed by other sites or submit forms", () => {
      const script = directive(csp, "script-src");
      for (const origin of ["https://cdn.jsdelivr.net", "https://unpkg.com", "https://esm.sh"]) expect(script).toContain(origin);
      expect(directive(csp, "frame-ancestors")).toBe("frame-ancestors 'self'");
      expect(directive(csp, "form-action")).toBe("form-action 'none'");
      expect(directive(csp, "object-src")).toBe("object-src 'none'");
    });
  });

  it("applies the site-wide policy to every route except the playground", () => {
    const re = new RegExp(`^${NON_PLAYGROUND_SOURCE.replace(/^\//, "\/")}$`);
    expect(re.test("/fr/blog/x")).toBe(true);
    expect(re.test("/fr/tech-mastry/system-design")).toBe(true);
    expect(re.test("/fr/tech-mastry/playground")).toBe(false);
    expect(re.test("/en/tech-mastry/playground")).toBe(false);
  });

  describe("code sandbox policy", () => {
    const csp = buildSandboxCsp();

    it("allows eval for the worker and nothing else", () => {
      expect(directive(csp, "default-src")).toBe("default-src 'none'");
      expect(directive(csp, "script-src")).toBe("script-src 'self' 'unsafe-eval'");
      expect(directive(csp, "worker-src")).toBe("worker-src blob:");
      // no network at all: inherited by the worker, so learners' code cannot send anything anywhere
      expect(directive(csp, "connect-src")).toBe("connect-src 'none'");
    });

    it("cannot be framed by another site, nor submit forms, nor change the base URL", () => {
      expect(directive(csp, "frame-ancestors")).toBe("frame-ancestors 'self'");
      expect(directive(csp, "form-action")).toBe("form-action 'none'");
      expect(directive(csp, "base-uri")).toBe("base-uri 'none'");
    });

    it("does not allow remote scripts, inline scripts or styles", () => {
      expect(csp).not.toMatch(/https?:/);
      expect(directive(csp, "script-src")).not.toContain("'unsafe-inline'");
      expect(directive(csp, "style-src")).toBe(""); // falls back to default-src 'none'
    });

    it("is served from /sandbox only, which the site-wide policy leaves alone", () => {
      const sandbox = new RegExp(`^${SANDBOX_SOURCE.replace(":path*", ".*")}$`);
      expect(sandbox.test("/sandbox/runner.html")).toBe(true);
      expect(sandbox.test("/sandbox/runner.js")).toBe(true);
      expect(sandbox.test("/fr/sandbox/runner.html")).toBe(false);

      // two policies on one response are intersected: the sandbox must not get the site-wide one too
      const global = new RegExp(`^${NON_PLAYGROUND_SOURCE}$`);
      expect(global.test("/sandbox/runner.html")).toBe(false);
      expect(global.test("/sandbox/runner.js")).toBe(false);
      expect(global.test("/fr/blog/sandbox-tips")).toBe(true); // only the real directory is excluded
    });
  });

  describe("report-only candidate policy", () => {
    it("drops 'unsafe-inline' for scripts and styles and never allows eval, even in dev", () => {
      for (const dev of [false, true]) {
        const csp = buildReportOnlyCsp(dev);
        expect(directive(csp, "script-src")).toBe("script-src 'self' https://js.stripe.com");
        expect(directive(csp, "script-src")).not.toContain("unsafe");
        expect(directive(csp, "style-src")).toBe("style-src 'self'");
      }
    });

    it("keeps every other restriction of the enforced policy and reports to /api/csp-report", () => {
      const csp = buildReportOnlyCsp(false);
      expect(directive(csp, "default-src")).toBe("default-src 'self'");
      expect(directive(csp, "object-src")).toBe("object-src 'none'");
      expect(directive(csp, "frame-ancestors")).toBe("frame-ancestors 'self'");
      expect(directive(csp, "report-uri")).toBe(`report-uri ${CSP_REPORT_PATH}`);
      expect(directive(csp, "report-to")).toBe("report-to csp");
      expect(REPORTING_ENDPOINTS_VALUE).toBe(`csp="${CSP_REPORT_PATH}"`);
      expect(REPORT_ONLY_HEADER).toBe("Content-Security-Policy-Report-Only");
    });

    it("is strictly stricter than the enforced one on scripts (so it measures something)", () => {
      expect(directive(buildGlobalCsp(false), "script-src")).toContain("'unsafe-inline'");
      expect(directive(buildReportOnlyCsp(false), "script-src")).not.toContain("'unsafe-inline'");
    });
  });
});
