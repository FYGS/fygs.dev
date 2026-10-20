import { describe, it, expect } from "vitest";
import { LoadBalancerVisualization } from "@/app/[locale]/(main)/tech-mastry/system-design/scalability/_components/load-balancer-visualization";
import { renderWalkSim } from "./render-walk-sim";

describe("LoadBalancerVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSim(LoadBalancerVisualization);
    expect(states).toBeGreaterThanOrEqual(5);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "c90e38a1",
        "37c79ef2",
        "0642fa1f",
        "d47c0401",
        "0bea8b0b",
        "55c787d2",
        "0bea8b0b",
        "153d3659",
        "2f4a2791",
        "0bea8b0b",
        "d47c0401",
        "f33a6a7e",
        "d47c0401",
        "e217545e",
        "8f3fcb63",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalkSim(LoadBalancerVisualization).hashes).toEqual(renderWalkSim(LoadBalancerVisualization).hashes);
  });
});
