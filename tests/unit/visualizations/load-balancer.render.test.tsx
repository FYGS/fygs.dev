import { describe, it, expect } from "vitest";
import { LoadBalancerVisualization } from "@/app/[locale]/(main)/tech-mastry/system-design/scalability/_components/load-balancer-visualization";
import { renderWalkSim } from "./render-walk-sim";

describe("LoadBalancerVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSim(LoadBalancerVisualization);
    expect(states).toBeGreaterThanOrEqual(5);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "57c9bbe6",
        "dccc46a1",
        "435f5c2c",
        "6bd9ed59",
        "ab8f9c4b",
        "dbafde7b",
        "ab8f9c4b",
        "15086d6a",
        "48bd447f",
        "ab8f9c4b",
        "6bd9ed59",
        "f8e3cdc9",
        "6bd9ed59",
        "32ecf029",
        "576932fb",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalkSim(LoadBalancerVisualization).hashes).toEqual(renderWalkSim(LoadBalancerVisualization).hashes);
  });
});
