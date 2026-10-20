import { describe, it, expect } from "vitest";
import { CachingVisualization } from "@/app/[locale]/(main)/tech-mastry/system-design/scalability/_components/caching-visualization";
import { renderWalkSim } from "./render-walk-sim";

describe("CachingVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSim(CachingVisualization);
    expect(states).toBeGreaterThanOrEqual(5);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "8c061ebc",
        "8c061ebc",
        "b82f2b06",
        "0870c47c",
        "0fb28551",
        "b5923609",
        "0fb28551",
        "b8600384",
        "b04ae5d6",
        "0fb28551",
        "0870c47c",
        "7a98a244",
        "0870c47c",
        "c8c25a4b",
        "ac7a5db2",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalkSim(CachingVisualization).hashes).toEqual(renderWalkSim(CachingVisualization).hashes);
  });
});
