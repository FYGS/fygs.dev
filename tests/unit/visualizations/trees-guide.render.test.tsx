import { describe, it, expect } from "vitest";
import { TreesGuide } from "@/app/[locale]/(main)/tech-mastry/data-structures/trees/_components/trees-guide";
import { renderWalkSim } from "./render-walk-sim";

describe("TreesGuide rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSim(TreesGuide, { passes: 1 });
    expect(states).toBeGreaterThanOrEqual(8);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "d515cf47",
        "d515cf47",
        "fb7e5035",
        "f95503f7",
        "5bd94ae1",
        "33d0ce93",
        "5bd94ae1",
        "5bd94ae1",
        "5bd94ae1",
        "27efce84",
        "27efce84",
        "e4a839fd",
        "4060c881",
        "8abdf6b4",
        "87295e3b",
        "87295e3b",
        "b6fd8e7c",
        "25f1d150",
        "b6fd8e7c",
        "b6fd8e7c",
        "b6fd8e7c",
        "13091d9b",
        "13091d9b",
        "870d3a32",
        "ca2ca5f7",
        "e84ec528",
        "6ad25daa",
        "3ee466dc",
        "8990f0d3",
        "da4ac181",
        "7768c29d",
        "3c7d9e26",
        "5b7afe4c",
        "bed056f4",
        "a97a82a6",
        "c1b1f951",
        "70ee6c34",
        "e8458903",
        "1c84a728",
        "15f568a7",
        "0d4327b3",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalkSim(TreesGuide, { passes: 1 }).hashes).toEqual(renderWalkSim(TreesGuide, { passes: 1 }).hashes);
  });
});
