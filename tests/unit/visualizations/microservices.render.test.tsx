import { describe, it, expect } from "vitest";
import { MicroservicesVisualization } from "@/app/[locale]/(main)/tech-mastry/system-design/distributed/_components/microservices-visualization";
import { renderWalkSim } from "./render-walk-sim";

describe("MicroservicesVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSim(MicroservicesVisualization);
    expect(states).toBeGreaterThanOrEqual(5);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "b27622db",
        "b27622db",
        "051e2fa0",
        "a8594f4a",
        "3ff82fb8",
        "3078ffb3",
        "bc2cf4a5",
        "728a5dbe",
        "8f31c8f8",
        "1388ede1",
        "b240148d",
        "4b9608cc",
        "2112105c",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalkSim(MicroservicesVisualization).hashes).toEqual(renderWalkSim(MicroservicesVisualization).hashes);
  });
});
