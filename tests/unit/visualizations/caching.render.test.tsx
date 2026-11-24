import { describe, it, expect } from "vitest";
import { CachingVisualization } from "@/app/[locale]/(main)/tech-mastry/system-design/scalability/_components/caching-visualization";
import { renderWalkSim } from "./render-walk-sim";

describe("CachingVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSim(CachingVisualization);
    expect(states).toBeGreaterThanOrEqual(5);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "631eaaa3",
        "631eaaa3",
        "6eaa477e",
        "aa88c88a",
        "2e0185a3",
        "538ce351",
        "2e0185a3",
        "83d6ad95",
        "d0a88c52",
        "2e0185a3",
        "aa88c88a",
        "23a9e7c3",
        "aa88c88a",
        "f0269343",
        "0439cf7e",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalkSim(CachingVisualization).hashes).toEqual(renderWalkSim(CachingVisualization).hashes);
  });
});
