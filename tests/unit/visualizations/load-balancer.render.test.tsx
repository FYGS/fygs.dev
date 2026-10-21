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
        "bbe79da4",
        "fe966559",
        "35e33d8b",
        "fe966559",
        "707d99a0",
        "cbaa93b5",
        "fe966559",
        "bbe79da4",
        "1a9543db",
        "bbe79da4",
        "366f6da1",
        "e8893bf3",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalkSim(LoadBalancerVisualization).hashes).toEqual(renderWalkSim(LoadBalancerVisualization).hashes);
  });
});
