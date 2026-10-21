import { describe, it, expect } from "vitest";
import { LoadBalancerVisualization } from "@/app/[locale]/(main)/tech-mastry/system-design/scalability/_components/load-balancer-visualization";
import { renderWalkSim } from "./render-walk-sim";

describe("LoadBalancerVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSim(LoadBalancerVisualization);
    expect(states).toBeGreaterThanOrEqual(5);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "f52e6058",
        "4d276d48",
        "86ebae63",
        "1e35f170",
        "b3ad9ce6",
        "23b80aaa",
        "b3ad9ce6",
        "ce03f018",
        "e44be5ad",
        "b3ad9ce6",
        "1e35f170",
        "73281da3",
        "1e35f170",
        "cc081b5e",
        "8f3fcb63",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalkSim(LoadBalancerVisualization).hashes).toEqual(renderWalkSim(LoadBalancerVisualization).hashes);
  });
});
