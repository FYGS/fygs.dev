import { describe, it, expect } from "vitest";
import { EventDrivenVisualization } from "@/app/[locale]/(main)/tech-mastry/system-design/distributed/_components/event-driven-visualization";
import { renderWalkSim } from "./render-walk-sim";

describe("EventDrivenVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSim(EventDrivenVisualization);
    expect(states).toBeGreaterThanOrEqual(5);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "6a4807b8",
        "d87cfdfc",
        "84df2947",
        "84df2947",
        "84df2947",
        "d78955ef",
        "3becebe6",
        "f626823c",
        "f626823c",
        "2136692b",
        "923a4fd2",
        "2a47cfef",
        "191a06bc",
        "923a4fd2",
        "8780c3a9",
        "6d64bbcb",
        "79aa8356",
        "cc6cc18d",
        "f626823c",
        "2136692b",
        "923a4fd2",
        "18514ecf",
        "17e34eff",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalkSim(EventDrivenVisualization).hashes).toEqual(renderWalkSim(EventDrivenVisualization).hashes);
  });
});
