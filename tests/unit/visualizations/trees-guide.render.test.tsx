import { describe, it, expect } from "vitest";
import { TreesGuide } from "@/app/[locale]/(main)/tech-mastry/data-structures/trees/_components/trees-guide";
import { renderWalkSim } from "./render-walk-sim";

describe("TreesGuide rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSim(TreesGuide, { passes: 1 });
    expect(states).toBeGreaterThanOrEqual(8);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "ae619169",
        "ae619169",
        "9831122a",
        "6f9cdaaa",
        "e2ba7bca",
        "a7b188ab",
        "e2ba7bca",
        "e2ba7bca",
        "e2ba7bca",
        "ab007049",
        "ab007049",
        "25c9c576",
        "75db5212",
        "1b4946c4",
        "2c64dd28",
        "2c64dd28",
        "b7f82503",
        "d0d34d8b",
        "b7f82503",
        "b7f82503",
        "b7f82503",
        "572041e4",
        "572041e4",
        "d2ae3612",
        "674eae79",
        "73f493ab",
        "bb256594",
        "8af361cd",
        "88a1d674",
        "82a5cd32",
        "1f429ca3",
        "c19398bf",
        "2a27ec90",
        "865403fa",
        "90d1ad15",
        "f32072a1",
        "42febe60",
        "bad921d9",
        "e5ff28fd",
        "79b4601c",
        "c1895061",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalkSim(TreesGuide, { passes: 1 }).hashes).toEqual(renderWalkSim(TreesGuide, { passes: 1 }).hashes);
  });
});
