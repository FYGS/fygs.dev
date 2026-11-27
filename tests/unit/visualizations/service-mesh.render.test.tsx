import { describe, it, expect } from "vitest";
import { ServiceMeshVisualization } from "@/app/[locale]/(main)/tech-mastry/system-design/distributed/_components/service-mesh-visualization";
import { renderWalkSim } from "./render-walk-sim";

describe("ServiceMeshVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSim(ServiceMeshVisualization);
    expect(states).toBeGreaterThanOrEqual(6);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "7ccacb43",
        "7ccacb43",
        "3ff35482",
        "cfbc1fe1",
        "be4afc27",
        "be4afc27",
        "2e840275",
        "a253a3f7",
        "fe0007ef",
        "bc395b67",
        "f3f98142",
        "fe0007ef",
        "fe0007ef",
        "26d49791",
        "674a00bd",
        "2ff40197",
        "ff6286b3",
        "9c84fe66",
        "5082fcf1",
        "407a7e91",
        "068def6b",
        "3f85540f",
        "5082fcf1",
        "9f105974",
        "6b239d9a",
        "5082fcf1",
        "fe0007ef",
        "26d49791",
        "674a00bd",
        "d4637fd6",
        "2b3a261d",
        "d56f860f",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalkSim(ServiceMeshVisualization).hashes).toEqual(
      renderWalkSim(ServiceMeshVisualization).hashes,
    );
  });
});
