import { describe, it, expect } from "vitest";
import { EventDrivenVisualization } from "@/app/[locale]/(main)/tech-mastry/system-design/distributed/_components/event-driven-visualization";
import { renderWalkSim } from "./render-walk-sim";

describe("EventDrivenVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSim(EventDrivenVisualization);
    expect(states).toBeGreaterThanOrEqual(5);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "30f0880f",
        "526a950d",
        "1515e1de",
        "1515e1de",
        "1515e1de",
        "e87778bf",
        "f2c3dc25",
        "abdc7aa7",
        "abdc7aa7",
        "2dabd054",
        "c12e3d99",
        "7ca9a0bf",
        "0a0ffd8c",
        "c12e3d99",
        "dfa708f6",
        "0f702f03",
        "51b63053",
        "415412db",
        "abdc7aa7",
        "2dabd054",
        "c12e3d99",
        "0db1238a",
        "9271f865",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalkSim(EventDrivenVisualization).hashes).toEqual(renderWalkSim(EventDrivenVisualization).hashes);
  });
});
