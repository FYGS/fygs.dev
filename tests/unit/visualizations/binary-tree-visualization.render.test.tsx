import { describe, it, expect } from "vitest";
import { BinaryTreeVisualization } from "@/app/[locale]/(main)/tech-mastry/algorithms/data-structures/_components/visualizations/binary-tree-visualization";
import { renderWalkSimSvg } from "./render-walk-sim-svg";

describe("BinaryTreeVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSimSvg(BinaryTreeVisualization);
    expect(states).toBeGreaterThanOrEqual(3);
    expect(hashes).toMatchSnapshot();
  });

  it("is deterministic", () => {
    expect(renderWalkSimSvg(BinaryTreeVisualization).hashes).toEqual(renderWalkSimSvg(BinaryTreeVisualization).hashes);
  });
});
