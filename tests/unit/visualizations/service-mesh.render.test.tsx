import { describe, it, expect } from "vitest";
import { ServiceMeshVisualization } from "@/app/[locale]/(main)/tech-mastry/system-design/distributed/_components/service-mesh-visualization";
import { renderWalkSim } from "./render-walk-sim";

describe("ServiceMeshVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSim(ServiceMeshVisualization);
    expect(states).toBeGreaterThanOrEqual(6);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "49e214fa",
        "49e214fa",
        "82b397a6",
        "9d8ff188",
        "f1724aa7",
        "f1724aa7",
        "685df3b1",
        "edb60165",
        "bd8c7cbb",
        "84bf0e22",
        "4da75e9e",
        "bd8c7cbb",
        "bd8c7cbb",
        "49e25dae",
        "e8cb02fd",
        "2545ea03",
        "62b636dd",
        "07462764",
        "41a750d4",
        "0dc0fb0d",
        "61cef4c5",
        "0587f272",
        "41a750d4",
        "edb851b8",
        "41a750d4",
        "41a750d4",
        "bd8c7cbb",
        "49e25dae",
        "e8cb02fd",
        "b4779cb5",
        "3eee33c6",
        "72cafaa8",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalkSim(ServiceMeshVisualization).hashes).toEqual(
      renderWalkSim(ServiceMeshVisualization).hashes,
    );
  });
});
