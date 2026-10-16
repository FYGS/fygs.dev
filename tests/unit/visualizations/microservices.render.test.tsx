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
        "b6169850",
        "a7558070",
        "b7db7a46",
        "12269ae5",
        "2ce67c46",
        "2a3c6bb9",
        "d9e5f816",
        "fb70947f",
        "202a5aea",
        "2393f52a",
        "deb0f814",
        "acbb4b4d",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalkSim(MicroservicesVisualization).hashes).toEqual(renderWalkSim(MicroservicesVisualization).hashes);
  });
});
