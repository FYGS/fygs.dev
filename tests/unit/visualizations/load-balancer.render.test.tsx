import { describe, it, expect } from "vitest";
import { LoadBalancerVisualization } from "@/app/[locale]/(main)/tech-mastry/system-design/scalability/_components/load-balancer-visualization";
import { renderWalkSim } from "./render-walk-sim";

describe("LoadBalancerVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSim(LoadBalancerVisualization);
    expect(states).toBeGreaterThanOrEqual(5);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "9cb547cc",
        "457fdf40",
        "11e61f0f",
        "8d9c2d7b",
        "a9a38a5a",
        "5fc1f606",
        "a9a38a5a",
        "13c616f5",
        "5b554054",
        "a9a38a5a",
        "8d9c2d7b",
        "b1bc64ad",
        "8d9c2d7b",
        "0ded6d55",
        "e8893bf3",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalkSim(LoadBalancerVisualization).hashes).toEqual(renderWalkSim(LoadBalancerVisualization).hashes);
  });
});
