import { createHash } from "node:crypto";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { buildNonceCsp, THEME_SCRIPT_SHA256 } from "@/lib/csp.mjs";
import { DEFAULT_THEME, THEME_INIT_SCRIPT, THEME_STORAGE_KEY } from "@/lib/theme-init-script.mjs";
import { ThemeProvider } from "@/providers/theme-provider";

describe("the theme initialisation script and the Content-Security-Policy", () => {
  it("has the hash the policy allows (edit the script, then put the printed value in theme-init-script.mjs)", () => {
    const actual = createHash("sha256").update(THEME_INIT_SCRIPT).digest("base64");
    expect(THEME_SCRIPT_SHA256, `put '${actual}' in THEME_SCRIPT_SHA256`).toBe(actual);
  });

  it("is allowed by the nonce policy and by its report-only twin, which still refuse other inline scripts", () => {
    for (const reportOnly of [false, true]) {
      const policy = buildNonceCsp("abc", { reportOnly });
      expect(policy).toContain(`'sha256-${THEME_SCRIPT_SHA256}'`);
      expect(policy).toContain("'nonce-abc'");
      expect(policy).not.toContain("'unsafe-inline' https://js.stripe.com");
    }
  });

  it("is the only script the provider leaves executable: the library's own one is an inert data block", () => {
    const html = renderToString(
      <ThemeProvider>
        <div />
      </ThemeProvider>,
    );
    const scripts = [...html.matchAll(/<script([^>]*)>/g)].map((match) => match[1]);
    expect(scripts.length).toBeGreaterThan(0);
    for (const attributes of scripts) expect(attributes).toContain('type="application/json"');
  });
});

describe("what the script does to the page", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    document.documentElement.className = "";
    document.documentElement.style.colorScheme = "";
    localStorage.clear();
  });

  function run(stored: string | null, systemIsDark = true) {
    if (stored !== null) localStorage.setItem(THEME_STORAGE_KEY, stored);
    vi.stubGlobal("matchMedia", () => ({ matches: systemIsDark }));
    new Function(THEME_INIT_SCRIPT)();
    return { classes: [...document.documentElement.classList], scheme: document.documentElement.style.colorScheme };
  }

  it("uses the default theme when nothing was chosen", () => {
    expect(run(null)).toEqual({ classes: [DEFAULT_THEME], scheme: DEFAULT_THEME });
  });

  it("applies the stored choice, replacing a class left by the server", () => {
    document.documentElement.classList.add("dark");
    expect(run("light")).toEqual({ classes: ["light"], scheme: "light" });
  });

  it("resolves 'system' with the operating system preference", () => {
    expect(run("system", true).classes).toEqual(["dark"]);
    document.documentElement.className = "";
    expect(run("system", false).classes).toEqual(["light"]);
  });

  it("ignores a stored value that is not a theme, and never throws when storage is unavailable", () => {
    expect(run("<script>").classes).toEqual([DEFAULT_THEME]);
    vi.stubGlobal("localStorage", {
      getItem() {
        throw new Error("blocked");
      },
    });
    expect(() => new Function(THEME_INIT_SCRIPT)()).not.toThrow();
  });
});
