import { describe, it, expect } from "vitest";
import { SortingVisualization } from "@/app/[locale]/(main)/tech-mastry/algorithms/sorting/_components/sections/sorting-visualization";
import { renderWalkSimSvg } from "./render-walk-sim-svg";

describe("SortingVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSimSvg(SortingVisualization);
    expect(states).toBeGreaterThanOrEqual(3);
    expect(hashes).toMatchSnapshot();
  });

  it("is deterministic", () => {
    expect(renderWalkSimSvg(SortingVisualization).hashes).toEqual(renderWalkSimSvg(SortingVisualization).hashes);
  });
});
