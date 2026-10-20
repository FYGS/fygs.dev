import { describe, it, expect } from "vitest";
import { ServiceMeshVisualization } from "@/app/[locale]/(main)/tech-mastry/system-design/distributed/_components/service-mesh-visualization";
import { renderWalkSim } from "./render-walk-sim";

describe("ServiceMeshVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSim(ServiceMeshVisualization);
    expect(states).toBeGreaterThanOrEqual(6);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "5ee8b29f",
        "5ee8b29f",
        "d46fdc00",
        "7e479069",
        "0c5a969b",
        "0c5a969b",
        "41450e6b",
        "b6e8725b",
        "1dafb4a1",
        "ad58ceb2",
        "cea4721a",
        "1dafb4a1",
        "1dafb4a1",
        "1ddf5020",
        "bb06dbe9",
        "8c45c713",
        "b0816147",
        "ce3812e9",
        "29d8f61c",
        "d6103e76",
        "8051e5dc",
        "9b622e51",
        "29d8f61c",
        "32db2684",
        "fd1e68de",
        "29d8f61c",
        "1dafb4a1",
        "1ddf5020",
        "bb06dbe9",
        "3d7b3cc9",
        "18445002",
        "ea2bca51",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalkSim(ServiceMeshVisualization).hashes).toEqual(
      renderWalkSim(ServiceMeshVisualization).hashes,
    );
  });
});
