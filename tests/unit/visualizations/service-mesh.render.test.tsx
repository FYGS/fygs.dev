import { describe, it, expect } from "vitest";
import { ServiceMeshVisualization } from "@/app/[locale]/(main)/tech-mastry/system-design/distributed/_components/service-mesh-visualization";
import { renderWalkSim } from "./render-walk-sim";

describe("ServiceMeshVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSim(ServiceMeshVisualization);
    expect(states).toBeGreaterThanOrEqual(6);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "f60d641e",
        "f60d641e",
        "61db2e6d",
        "1a63dd97",
        "6f9b875f",
        "6f9b875f",
        "f9c061b1",
        "3853ee0f",
        "349b64df",
        "10c27540",
        "04082f87",
        "349b64df",
        "349b64df",
        "63535d11",
        "1b80290c",
        "6ad5dc0e",
        "f31eb72d",
        "bd1d720b",
        "1717548d",
        "9d82fdee",
        "639b55d7",
        "5157e5ea",
        "1717548d",
        "3606c4ab",
        "1717548d",
        "1717548d",
        "349b64df",
        "63535d11",
        "1b80290c",
        "1f6a0f06",
        "c7da34f4",
        "87ba57b5",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalkSim(ServiceMeshVisualization).hashes).toEqual(
      renderWalkSim(ServiceMeshVisualization).hashes,
    );
  });
});
