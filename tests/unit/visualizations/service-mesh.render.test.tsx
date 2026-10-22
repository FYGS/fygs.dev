import { describe, it, expect } from "vitest";
import { ServiceMeshVisualization } from "@/app/[locale]/(main)/tech-mastry/system-design/distributed/_components/service-mesh-visualization";
import { renderWalkSim } from "./render-walk-sim";

describe("ServiceMeshVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSim(ServiceMeshVisualization);
    expect(states).toBeGreaterThanOrEqual(6);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "f47fcf32",
        "f47fcf32",
        "1146aa63",
        "50b7f0cd",
        "bb2579a3",
        "bb2579a3",
        "96c20437",
        "977c093e",
        "2a7c72a6",
        "691faaae",
        "fa34ee64",
        "2a7c72a6",
        "2a7c72a6",
        "d3351c81",
        "b42e6f3a",
        "80e56283",
        "c1d7b274",
        "9605f670",
        "e6e4668a",
        "b5e8d7be",
        "63d328de",
        "77a2de9f",
        "e6e4668a",
        "b2eaea6e",
        "53a03b3a",
        "e6e4668a",
        "2a7c72a6",
        "d3351c81",
        "b42e6f3a",
        "5cf058c4",
        "c9f8eb90",
        "a561b6c6",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalkSim(ServiceMeshVisualization).hashes).toEqual(
      renderWalkSim(ServiceMeshVisualization).hashes,
    );
  });
});
