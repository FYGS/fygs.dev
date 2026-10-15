import { describe, it, expect } from "vitest";
import { CachingVisualization } from "@/app/[locale]/(main)/tech-mastry/system-design/scalability/_components/caching-visualization";
import { renderWalkSim } from "./render-walk-sim";

describe("CachingVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSim(CachingVisualization);
    expect(states).toBeGreaterThanOrEqual(5);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "8eebbb11",
        "8eebbb11",
        "be6af849",
        "d4974d29",
        "5712a627",
        "f7bca3e0",
        "5712a627",
        "2ccf8594",
        "904955f7",
        "5712a627",
        "d4974d29",
        "4b7e4fab",
        "d4974d29",
        "aaf30673",
        "f1ea24ae",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalkSim(CachingVisualization).hashes).toEqual(renderWalkSim(CachingVisualization).hashes);
  });
});
