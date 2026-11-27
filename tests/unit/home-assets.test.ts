import { existsSync, readFileSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Spec: docs/specs/homepage-redesign.md §9 — mobile performance: Lighthouse >= 90, LCP < 2.5 s.
// The portrait is the largest image above the fold: it is served optimized by next/image, but its source
// still has to be small (the optimizer reads it, and it is what the first request downloads on a cold cache).

const PORTRAIT = "public/images/fernand_photo.webp";
const PORTRAIT_BUDGET_BYTES = 150 * 1024;

describe("home page portrait", () => {
  it("is a WebP under the size budget", () => {
    expect(existsSync(PORTRAIT)).toBe(true);
    expect(statSync(PORTRAIT).size).toBeLessThan(PORTRAIT_BUDGET_BYTES);
  });

  it("does not leave the 1.7 MB original PNG in the repository", () => {
    expect(existsSync("public/images/fernand_photo.png")).toBe(false);
  });

  it("is what the hero shows, as the priority image", () => {
    const hero = readFileSync("app/_components/Hero.tsx", "utf8");
    expect(hero).toContain("/images/fernand_photo.webp");
    expect(hero).not.toContain("fernand_photo.png");
    expect(hero).toMatch(/priority/);
  });
});

describe("hero first paint", () => {
  // Framer Motion's initial={{ opacity: 0 }} is rendered into the server HTML: the title and the portrait, which
  // are the largest contentful elements, would stay invisible until the page hydrates.
  it("does not hide the headline or the portrait until hydration", () => {
    const hero = readFileSync("app/_components/Hero.tsx", "utf8");
    expect(hero).not.toMatch(/initial=\{\{[^}]*opacity:\s*0/);
    expect(hero).not.toContain("framer-motion");
  });
});
