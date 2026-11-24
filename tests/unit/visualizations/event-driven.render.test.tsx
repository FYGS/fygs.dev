import { describe, it, expect } from "vitest";
import { EventDrivenVisualization } from "@/app/[locale]/(main)/tech-mastry/system-design/distributed/_components/event-driven-visualization";
import { renderWalkSim } from "./render-walk-sim";

describe("EventDrivenVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSim(EventDrivenVisualization);
    expect(states).toBeGreaterThanOrEqual(5);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "366f9d79",
        "6f8783dc",
        "048175a8",
        "048175a8",
        "048175a8",
        "91514645",
        "0326c02e",
        "cde4e0f2",
        "cde4e0f2",
        "ab2feb39",
        "40dc9112",
        "c04a443d",
        "fc512955",
        "40dc9112",
        "23b92435",
        "94df31d9",
        "db462382",
        "be4054bf",
        "cde4e0f2",
        "ab2feb39",
        "40dc9112",
        "c7e53f66",
        "5f580a94",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalkSim(EventDrivenVisualization).hashes).toEqual(renderWalkSim(EventDrivenVisualization).hashes);
  });
});
