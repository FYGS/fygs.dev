import { describe, it, expect } from "vitest";
import { AcidCapVisualization } from "@/app/[locale]/(main)/tech-mastry/system-design/storage/_components/acid-cap-visualization";
import { renderWalk } from "./render-walk";

describe("AcidCapVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalk(AcidCapVisualization, 4);
    expect(states).toBeGreaterThanOrEqual(8);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "7d055a14",
        "7d055a14",
        "e2687c4a",
        "e2687c4a",
        "cb24b9cc",
        "0c2c56d9",
        "0c2c56d9",
        "7d055a14",
        "0c2c56d9",
        "e2687c4a",
        "cb24b9cc",
        "0c2c56d9",
        "0c2c56d9",
        "04efb91f",
        "cb273fb8",
        "7d055a14",
        "cb273fb8",
        "7a4c082d",
        "c4a3d45a",
        "cb273fb8",
        "0c2c56d9",
        "04efb91f",
        "cb273fb8",
        "7d055a14",
        "cb273fb8",
        "7a4c082d",
        "c4a3d45a",
        "cb273fb8",
        "0c2c56d9",
        "04efb91f",
        "cb273fb8",
        "cb31ed32",
        "9ccb6a95",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalk(AcidCapVisualization, 4).hashes).toEqual(
      renderWalk(AcidCapVisualization, 4).hashes,
    );
  });
});
