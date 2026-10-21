import { describe, it, expect } from "vitest";
import { MicroservicesVisualization } from "@/app/[locale]/(main)/tech-mastry/system-design/distributed/_components/microservices-visualization";
import { renderWalkSim } from "./render-walk-sim";

describe("MicroservicesVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSim(MicroservicesVisualization);
    expect(states).toBeGreaterThanOrEqual(5);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "11e8bc45",
        "11e8bc45",
        "98ff70b5",
        "a458407f",
        "15ed561f",
        "9d5967d8",
        "0a26dcdb",
        "c4f51c29",
        "493c0d58",
        "9d584763",
        "2fc886d3",
        "eafcaa36",
        "71aed7a4",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalkSim(MicroservicesVisualization).hashes).toEqual(renderWalkSim(MicroservicesVisualization).hashes);
  });
});
