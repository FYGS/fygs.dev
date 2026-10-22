import { describe, it, expect } from "vitest";
import { TreesGuide } from "@/app/[locale]/(main)/tech-mastry/data-structures/trees/_components/trees-guide";
import { renderWalkSim } from "./render-walk-sim";

describe("TreesGuide rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSim(TreesGuide, { passes: 1 });
    expect(states).toBeGreaterThanOrEqual(8);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "808b4bea",
        "808b4bea",
        "3f71479f",
        "8179886b",
        "b44dd072",
        "8647a068",
        "b44dd072",
        "b44dd072",
        "b44dd072",
        "54a1e1e7",
        "54a1e1e7",
        "a8aea8a0",
        "81c69fd8",
        "67e7d056",
        "5a1bd5fc",
        "5a1bd5fc",
        "2e4f4e99",
        "62e86e0d",
        "2e4f4e99",
        "2e4f4e99",
        "2e4f4e99",
        "8e430006",
        "8e430006",
        "8e8f70e9",
        "6c272f28",
        "880c91a6",
        "ea1b8571",
        "8fade19f",
        "3aea48a3",
        "8b5d0952",
        "b30e9949",
        "7dd347f2",
        "0ccf7d34",
        "8c76de09",
        "c81776f1",
        "8dffae23",
        "822a145d",
        "e5a205c6",
        "e1ec7295",
        "34af150e",
        "0fdfe735",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalkSim(TreesGuide, { passes: 1 }).hashes).toEqual(renderWalkSim(TreesGuide, { passes: 1 }).hashes);
  });
});
