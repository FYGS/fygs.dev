import { describe, it, expect, vi, beforeEach } from "vitest";
import { PracticeSections } from "@/app/[locale]/(main)/tech-mastry/_components/practice-sections";
import { createHash } from "crypto";
import { sections } from "@/app/[locale]/(main)/tech-mastry/_components/practice-sections/data";
import { renderWalkSim } from "../visualizations/render-walk-sim";

// A tiny router: pushing "?page=2" swaps the search params the hook reads.
const nav = vi.hoisted(() => ({ params: new URLSearchParams() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: async (url: string) => {
      nav.params = new URLSearchParams(url.slice(url.indexOf("?") + 1));
    },
  }),
  useSearchParams: () => nav.params,
  usePathname: () => "/tech-mastry",
}));

describe("practice sections data", () => {
  // Pinned before the file was split: subsections are not rendered, so the cards alone do not cover them.
  it("keeps the 20 sections and their 85 subsections unchanged", () => {
    const flat = sections.map((s) => ({ ...s, icon: (s.icon as unknown as { displayName?: string }).displayName }));
    expect(sections).toHaveLength(20);
    expect(sections.reduce((n, s) => n + (s.subsections?.length ?? 0), 0)).toBe(85);
    expect(createHash("md5").update(JSON.stringify(flat)).digest("hex")).toBe("362e289e12518f0a340228b4e7589fa1");
  });
});

describe("PracticeSections rendering", () => {
  beforeEach(() => {
    nav.params = new URLSearchParams();
  });

  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSim(PracticeSections, { passes: 3 });
    expect(states).toBeGreaterThanOrEqual(2);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "0beb2a27",
        "0beb2a27",
        "c7ce5368",
      ]
    `);
  });

  it("renders the second page of cards", () => {
    nav.params = new URLSearchParams("page=2");
    const { hashes } = renderWalkSim(PracticeSections, { passes: 1 });
    expect(hashes).toMatchInlineSnapshot(`
      [
        "b2abe509",
        "c7ce5368",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalkSim(PracticeSections).hashes).toEqual(renderWalkSim(PracticeSections).hashes);
  });
});
