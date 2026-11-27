import { describe, it, expect } from "vitest";
import { CachingVisualization } from "@/app/[locale]/(main)/tech-mastry/system-design/scalability/_components/caching-visualization";
import { renderWalkSim } from "./render-walk-sim";

describe("CachingVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSim(CachingVisualization);
    expect(states).toBeGreaterThanOrEqual(5);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "8a007a92",
        "8a007a92",
        "7b88f6cf",
        "e55a1865",
        "bf22daf6",
        "99b69e56",
        "bf22daf6",
        "5e9409b5",
        "8bc4840c",
        "bf22daf6",
        "e55a1865",
        "830d56d2",
        "e55a1865",
        "f97bcf7a",
        "520a5af4",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalkSim(CachingVisualization).hashes).toEqual(renderWalkSim(CachingVisualization).hashes);
  });
});
