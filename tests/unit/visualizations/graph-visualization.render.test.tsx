import { describe, it, expect } from "vitest";
import { GraphVisualization } from "@/app/[locale]/(main)/tech-mastry/algorithms/data-structures/_components/visualizations/graph-visualization";
import { renderWalkSimSvg } from "./render-walk-sim-svg";

describe("GraphVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSimSvg(GraphVisualization);
    expect(states).toBeGreaterThanOrEqual(3);
    expect(hashes).toMatchSnapshot();
  });

  it("is deterministic", () => {
    expect(renderWalkSimSvg(GraphVisualization).hashes).toEqual(renderWalkSimSvg(GraphVisualization).hashes);
  });
});
