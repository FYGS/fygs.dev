import { describe, it, expect } from "vitest";
import { LoadBalancerVisualization } from "@/app/[locale]/(main)/tech-mastry/system-design/scalability/_components/load-balancer-visualization";
import { renderWalkSim } from "./render-walk-sim";

describe("LoadBalancerVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSim(LoadBalancerVisualization);
    expect(states).toBeGreaterThanOrEqual(5);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "afcb4abb",
        "0c00ea87",
        "02d3bbc5",
        "4f0ec45f",
        "bf5083f8",
        "f169026c",
        "bf5083f8",
        "6c3dabb2",
        "841489c0",
        "bf5083f8",
        "4f0ec45f",
        "58d41e80",
        "4f0ec45f",
        "186ef30d",
        "40838bc8",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalkSim(LoadBalancerVisualization).hashes).toEqual(renderWalkSim(LoadBalancerVisualization).hashes);
  });
});
