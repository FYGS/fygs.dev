import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Spec: docs/specs/homepage-redesign.md — the "Resources & Trends" block stays on the home page, and the
// "Transform your career" pitch moves to the formations and paths pages, without claims nobody can prove.

const read = (path: string) => readFileSync(path, "utf8");
const UNPROVEN = [/15[\s,. ]?000/, /94\s?%/, /50\+/, /offre limitée/i, /garantie/i, /rembours/i, /24\/7/, /à vie/i, /30 jours/i];

describe("home page blocks", () => {
  it("keeps the Resources & Trends (blog preview) block on the home page", () => {
    const page = read("app/[locale]/(main)/page.tsx");
    expect(page).toContain("<BlogPreview");
  });

  it("no longer renders the career pitch on the home page", () => {
    const page = read("app/[locale]/(main)/page.tsx");
    expect(page).not.toContain("CallToAction");
    expect(page).not.toContain("FormationsCta");
  });
});

describe("career pitch on the formations and paths pages", () => {
  const cta = read("components/formations/formations-cta.tsx");

  it("is shown on both pages", () => {
    expect(read("app/[locale]/(main)/formations/page.tsx")).toContain("<FormationsCta");
    expect(read("app/[locale]/(main)/parcours/page.tsx")).toContain("<FormationsCta");
  });

  it("keeps its headline", () => {
    expect(cta).toContain("Transformez votre carrière de développeur");
  });

  it.each(UNPROVEN.map((p) => [String(p), p] as const))("makes no claim matching %s", (_name, pattern) => {
    expect(cta).not.toMatch(pattern);
  });

  it("replaces the old generic component instead of leaving a copy", () => {
    expect(existsSync("app/_components/CallToAction.tsx")).toBe(false);
    expect(existsSync("app/_components/callToAction.content.ts")).toBe(false);
  });
});
