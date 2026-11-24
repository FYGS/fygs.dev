import { describe, it, expect } from "vitest";
import { SortingAlgorithmsVisualization } from "@/app/[locale]/(main)/tech-mastry/algorithms/complexity/_components/visualizations/sorting-algorithms-visualization";
import { renderWalkSimSvg } from "./render-walk-sim-svg";

describe("SortingAlgorithmsVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSimSvg(SortingAlgorithmsVisualization);
    expect(states).toBeGreaterThanOrEqual(3);
    expect(hashes).toMatchSnapshot();
  });

  it("is deterministic", () => {
    expect(renderWalkSimSvg(SortingAlgorithmsVisualization).hashes).toEqual(renderWalkSimSvg(SortingAlgorithmsVisualization).hashes);
  });
});
