import { describe, it, expect } from "vitest";
import { HeapVisualization } from "@/app/[locale]/(main)/tech-mastry/algorithms/data-structures/_components/visualizations/heap-visualization";
import { renderWalkSimSvg } from "./render-walk-sim-svg";

describe("HeapVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSimSvg(HeapVisualization);
    expect(states).toBeGreaterThanOrEqual(3);
    expect(hashes).toMatchSnapshot();
  });

  it("is deterministic", () => {
    expect(renderWalkSimSvg(HeapVisualization).hashes).toEqual(renderWalkSimSvg(HeapVisualization).hashes);
  });
});
