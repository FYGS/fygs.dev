import { createHash } from "crypto";
import { describe, expect, it } from "vitest";

import {
  getCategoriesAndSubcategories,
  getUniqueKeywords,
  searchIndex,
} from "@/app/[locale]/(main)/tech-mastry/_utils/search-index";

const hash = (v: unknown) =>
  createHash("sha256").update(JSON.stringify(v)).digest("hex");

describe("tech-mastry search-index (pinned)", () => {
  it("has the same size, content hash and order", () => {
    expect(searchIndex.length).toMatchSnapshot();
    expect(hash(searchIndex)).toMatchSnapshot();
    expect(searchIndex.map((i) => i.href)).toMatchSnapshot();
  });

  it("keeps the per-category counts", () => {
    const counts: Record<string, number> = {};
    for (const i of searchIndex) counts[i.category] = (counts[i.category] ?? 0) + 1;
    expect(counts).toMatchSnapshot();
  });

  it("every item is well-formed", () => {
    for (const i of searchIndex) {
      expect(i.title).toBeTruthy();
      expect(i.href.startsWith("/tech-mastry")).toBe(true);
      expect(["essential", "high", "medium", "low"]).toContain(i.importance);
      expect(Array.isArray(i.keywords)).toBe(true);
    }
  });

  it("derived helpers are stable", () => {
    const kw = getUniqueKeywords();
    expect(kw.length).toMatchSnapshot();
    expect(hash(kw)).toMatchSnapshot();
    expect(getCategoriesAndSubcategories()).toMatchSnapshot();
  });
});
