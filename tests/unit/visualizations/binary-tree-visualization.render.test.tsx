import { describe, it, expect } from "vitest";
import { BinaryTreeVisualization } from "@/app/[locale]/(main)/tech-mastry/data-structures/trees/_components/binary-tree-visualization";
import { renderWalkSim } from "./render-walk-sim";

describe("BinaryTreeVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSim(BinaryTreeVisualization, { passes: 4 });
    expect(states).toBeGreaterThanOrEqual(8);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "7481b62b",
        "7481b62b",
        "7f2f92c1",
        "5066a4f2",
        "84835ef1",
        "fe4839b6",
        "84835ef1",
        "84835ef1",
        "84835ef1",
        "dd6d152c",
        "dd6d152c",
        "2dd3fb3c",
        "76bfe58a",
        "5c345975",
        "4222619b",
        "1cfb7ebb",
        "25161b96",
        "5c345975",
        "ee2fbb5c",
        "5c345975",
        "5c345975",
        "5c345975",
        "a08eb42e",
        "5f2f3111",
        "0313f94c",
        "5c345975",
        "76bfe58a",
        "0c3961e2",
        "6f74fcd0",
        "f16bef28",
        "76bfe58a",
        "9da3f63e",
        "76bfe58a",
        "76bfe58a",
        "76bfe58a",
        "655da83c",
        "655da83c",
        "2dd3fb3c",
        "76bfe58a",
        "5c345975",
        "4222619b",
        "1cfb7ebb",
        "25161b96",
        "5c345975",
        "ee2fbb5c",
        "5c345975",
        "5c345975",
        "5c345975",
        "a08eb42e",
        "5f2f3111",
        "0313f94c",
        "5c345975",
        "76bfe58a",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalkSim(BinaryTreeVisualization).hashes).toEqual(renderWalkSim(BinaryTreeVisualization).hashes);
  });
});
