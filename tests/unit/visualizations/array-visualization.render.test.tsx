import { describe, it, expect } from "vitest";
import { ArrayVisualization } from "@/app/[locale]/(main)/tech-mastry/algorithms/data-structures/_components/visualizations/array-visualization";
import { renderWalkSimSvg } from "./render-walk-sim-svg";

describe("ArrayVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSimSvg(ArrayVisualization);
    expect(states).toBeGreaterThanOrEqual(3);
    expect(hashes).toMatchSnapshot();
  });

  it("is deterministic", () => {
    expect(renderWalkSimSvg(ArrayVisualization).hashes).toEqual(renderWalkSimSvg(ArrayVisualization).hashes);
  });
});
