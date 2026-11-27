import { describe, expect, it } from "vitest";
import heroContent from "../../app/_components/hero.content";
import homeContent from "../../app/_components/home.content";
import { mainSections } from "../../app/_lib/seo/sections-main";

// Spec: docs/specs/homepage-redesign.md — §4 "rien sans preuve", §7 fr + en complete.

type Translation = { en?: string; fr?: string; es?: string };

/** Every translated string of an Intlayer dictionary, with the path that leads to it. */
function collectTranslations(node: unknown, path = ""): { path: string; value: Translation }[] {
  if (node === null || typeof node !== "object") return [];
  const record = node as Record<string, unknown>;
  if (record.nodeType === "translation" && typeof record.translation === "object") {
    return [{ path, value: record.translation as Translation }];
  }
  return Object.entries(record).flatMap(([key, child]) =>
    collectTranslations(child, path ? `${path}.${key}` : key),
  );
}

const dictionaries = [heroContent, homeContent];
const translations = dictionaries.flatMap((dict) => collectTranslations(dict.content, dict.key));

// Claims from the old page that nobody can prove, plus a limited-offer pitch.
const UNPROVEN = [/15[\s,. ]?000/, /94\s?%/, /47\s?%/, /airbnb/i, /offre limitée/i, /limited offer/i, /étudiants formés/i];

describe("home page content", () => {
  it("has translated strings to check", () => {
    expect(translations.length).toBeGreaterThan(40);
  });

  it.each(translations.map((t) => [t.path, t.value] as const))(
    "%s is written in French and English",
    (_path, value) => {
      expect(value.fr?.trim()).toBeTruthy();
      expect(value.en?.trim()).toBeTruthy();
    },
  );

  it("makes no unproven claim in any language", () => {
    const offenders = translations.flatMap(({ path, value }) =>
      Object.values(value).flatMap((text) =>
        UNPROVEN.filter((pattern) => pattern.test(String(text))).map((p) => `${path}: ${p}`),
      ),
    );
    expect(offenders).toEqual([]);
  });

  it("does not leak the confidential client name", () => {
    const text = JSON.stringify(translations).toLowerCase();
    expect(text).not.toContain("allianz");
  });

  it("states the AI-augmented, not-vibe-coding positioning and the custom SaaS offer", () => {
    const text = JSON.stringify(translations).toLowerCase();
    expect(text).toContain("vibe coding");
    expect(text).toContain("saas");
    expect(text).toContain("agent");
  });

  it("keeps the SEO description of the home page free of unproven claims", () => {
    const { description } = mainSections.home;
    for (const text of Object.values(description)) {
      for (const pattern of UNPROVEN) expect(text).not.toMatch(pattern);
    }
  });
});
