import { describe, it, expect } from "vitest";
import { LinkedListVisualization } from "@/app/[locale]/(main)/tech-mastry/algorithms/data-structures/_components/visualizations/linked-list-visualization";
import { renderWalkSimSvg } from "./render-walk-sim-svg";

describe("LinkedListVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSimSvg(LinkedListVisualization);
    expect(states).toBeGreaterThanOrEqual(3);
    expect(hashes).toMatchSnapshot();
  });

  it("is deterministic", () => {
    expect(renderWalkSimSvg(LinkedListVisualization).hashes).toEqual(renderWalkSimSvg(LinkedListVisualization).hashes);
  });
});
