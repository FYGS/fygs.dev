import { describe, it, expect } from "vitest";
import { MicroservicesVisualization } from "@/app/[locale]/(main)/tech-mastry/system-design/distributed/_components/microservices-visualization";
import { renderWalkSim } from "./render-walk-sim";

describe("MicroservicesVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSim(MicroservicesVisualization);
    expect(states).toBeGreaterThanOrEqual(5);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "7b1c92f1",
        "c885806d",
        "72f70c71",
        "2b45b84c",
        "583225ad",
        "6a85480c",
        "920e3ab7",
        "b13b81e6",
        "70b8a37a",
        "0c1e63bb",
        "f750da3f",
        "78702679",
        "3b562609",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalkSim(MicroservicesVisualization).hashes).toEqual(renderWalkSim(MicroservicesVisualization).hashes);
  });
});
