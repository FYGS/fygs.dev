import { describe, it, expect } from "vitest";
import { TreesGuide } from "@/app/[locale]/(main)/tech-mastry/data-structures/trees/_components/trees-guide";
import { renderWalkSim } from "./render-walk-sim";

describe("TreesGuide rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSim(TreesGuide, { passes: 1 });
    expect(states).toBeGreaterThanOrEqual(8);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "03bb2bba",
        "03bb2bba",
        "dddf44e4",
        "4954b12d",
        "69835a86",
        "4643184f",
        "69835a86",
        "69835a86",
        "69835a86",
        "a9c73674",
        "a9c73674",
        "6b23d652",
        "63af627b",
        "01b3331e",
        "8966114c",
        "8966114c",
        "a803e4be",
        "dea0d9f7",
        "a803e4be",
        "a803e4be",
        "a803e4be",
        "bca0dc98",
        "bca0dc98",
        "66000aa2",
        "cff9dbcb",
        "55788398",
        "516ccf9c",
        "fe788b26",
        "7ae1ea2c",
        "426326ee",
        "253f1c43",
        "e51f8f14",
        "125bf747",
        "7bd249b6",
        "7f814dab",
        "c794e17f",
        "2a0dfdc3",
        "67bf09be",
        "cc0f1e89",
        "1d0b2ea4",
        "f34287c1",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalkSim(TreesGuide, { passes: 1 }).hashes).toEqual(renderWalkSim(TreesGuide, { passes: 1 }).hashes);
  });
});
