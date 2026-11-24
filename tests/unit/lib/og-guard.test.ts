import { describe, expect, it } from "vitest";
import type { NextRequest } from "next/server";

import { OG_CACHE_HEADERS, ogChoice, ogNumber, ogText } from "@/lib/og-guard";

const request = (query: string) => ({ nextUrl: new URL(`https://fygs.dev/api/og/x?${query}`) }) as unknown as NextRequest;

describe("share-image parameters", () => {
  it("bounds and cleans free text", () => {
    expect(ogText(request("title=" + "a".repeat(500)), "title", "Défaut", 70)).toHaveLength(70);
    // bidi override and zero-width characters are removed, whitespace collapsed
    expect(ogText(request("title=Bonjour%E2%80%AE%20%E2%80%8Bmonde%0A%0Atout"), "title", "Défaut", 70)).toBe("Bonjour monde tout");
  });

  it("uses the fallback when the text is absent or empty after cleaning", () => {
    expect(ogText(request(""), "title", "Défaut", 70)).toBe("Défaut");
    expect(ogText(request("title=%E2%80%8B%E2%80%8B"), "title", "Défaut", 70)).toBe("Défaut");
  });

  it("only takes a choice from the list", () => {
    const sections = ["algorithms", "frontend"] as const;
    expect(ogChoice(request("section=frontend"), "section", sections, "algorithms")).toBe("frontend");
    expect(ogChoice(request("section=__proto__"), "section", sections, "algorithms")).toBe("algorithms");
    expect(ogChoice(request(""), "section", sections, "algorithms")).toBe("algorithms");
  });

  it("keeps numbers in range", () => {
    expect(ogNumber(request("n=7"), "n", 0, 99)).toBe(7);
    expect(ogNumber(request("n=-5"), "n", 0, 99)).toBe(0);
    expect(ogNumber(request("n=100000"), "n", 0, 99)).toBe(99);
    expect(ogNumber(request("n=abc"), "n", 0, 99)).toBe(0);
  });

  it("lets a CDN keep a rendered image", () => {
    expect(OG_CACHE_HEADERS["Cache-Control"]).toMatch(/public/);
    expect(OG_CACHE_HEADERS["Cache-Control"]).toMatch(/s-maxage=\d+/);
  });
});
