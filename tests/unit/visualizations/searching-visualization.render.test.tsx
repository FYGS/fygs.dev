import { describe, it, expect } from "vitest";
import { SearchingVisualization } from "@/app/[locale]/(main)/tech-mastry/algorithms/searching/_components/sections/searching-visualization";
import { renderWalkSimSvg } from "./render-walk-sim-svg";

describe("SearchingVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSimSvg(SearchingVisualization);
    expect(states).toBeGreaterThanOrEqual(3);
    expect(hashes).toMatchSnapshot();
  });

  it("is deterministic", () => {
    expect(renderWalkSimSvg(SearchingVisualization).hashes).toEqual(renderWalkSimSvg(SearchingVisualization).hashes);
  });
});
