import { describe, it, expect } from "vitest";
import { MicroservicesVisualization } from "@/app/[locale]/(main)/tech-mastry/system-design/distributed/_components/microservices-visualization";
import { renderWalkSim } from "./render-walk-sim";

describe("MicroservicesVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSim(MicroservicesVisualization);
    expect(states).toBeGreaterThanOrEqual(5);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "8ec3d401",
        "8ec3d401",
        "52dde19d",
        "5f481826",
        "99027e34",
        "bc14c7f1",
        "4bd04754",
        "e52b9b9e",
        "87c5515b",
        "06d08628",
        "c624f039",
        "0e962f59",
        "acbb4b4d",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalkSim(MicroservicesVisualization).hashes).toEqual(renderWalkSim(MicroservicesVisualization).hashes);
  });
});
