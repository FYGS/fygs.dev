import { describe, it, expect } from "vitest";
import { HashTableVisualization } from "@/app/[locale]/(main)/tech-mastry/algorithms/data-structures/_components/visualizations/hash-table-visualization";
import { renderWalkSimSvg } from "./render-walk-sim-svg";

describe("HashTableVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSimSvg(HashTableVisualization);
    expect(states).toBeGreaterThanOrEqual(3);
    expect(hashes).toMatchSnapshot();
  });

  it("is deterministic", () => {
    expect(renderWalkSimSvg(HashTableVisualization).hashes).toEqual(renderWalkSimSvg(HashTableVisualization).hashes);
  });
});
