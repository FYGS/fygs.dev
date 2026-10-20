import { createHash } from "crypto";
import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, cleanup, screen, act } from "@testing-library/react";
import { DatabaseReplicationVisualization } from "@/app/[locale]/(main)/tech-mastry/system-design/storage/_components/database-replication-visualization";
import { renderWalkSim } from "./render-walk-sim";
import { withNeutralMatchMedia } from "./match-media";

/**
 * Scripted session: switches replication type and consistency model, lets the
 * simulation tick (fake clock, seeded Math.random), fails and recovers nodes
 * by clicking them, moves the sliders (mouse) and visits the explanation tab. Only the
 * lucide icons are blanked out, so link paths and node geometry are covered.
 */
function scriptedSession() {
  return withNeutralMatchMedia(() => {
    vi.useFakeTimers({ now: new Date("2025-01-01T00:00:00Z") });
    let seed = 55555;
    const random = vi.spyOn(Math, "random").mockImplementation(() => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    });
    try {
      const { container } = render(<DatabaseReplicationVisualization />);
      const hashes: string[] = [];
      const snap = () =>
        hashes.push(
          createHash("md5")
            .update(container.innerHTML.replace(/_r_[0-9a-z]+_/g, "_r_X_").replace(/<svg[^>]*lucide[^>]*>[\s\S]*?<\/svg>/g, "<icon/>"))
            .digest("hex")
            .slice(0, 8)
        );
      const click = (el: Element) => {
        fireEvent.mouseDown(el, { button: 0 });
        fireEvent.click(el);
      };
      const tick = (ms = 2000) => act(() => { vi.advanceTimersByTime(ms); });
      const nodes = () => [...container.querySelectorAll(".cursor-pointer")];
      const button = (label: string) => screen.getByText(label).closest("button") as Element;

      snap();
      for (const type of ["Master-Slave", "Master-Master", "Multi-Master", "Master-Slave"]) {
        click(button(type)); snap();
        for (const model of ["Synchrone", "Semi-Sync", "Asynchrone"]) {
          click(button(model));
          for (let i = 0; i < 4; i++) { tick(); snap(); }
        }
        // fail a node, let the simulation run, recover it
        click(nodes()[0]); snap();
        tick(); snap();
        tick(1000); snap();
        click(nodes()[nodes().length - 1]); snap();
        tick(); snap();
        click(nodes()[0]); snap();
        click(nodes()[nodes().length - 1]); snap();
        tick(); snap();
      }
      // the slider tracks have no layout in jsdom: give them a 100px width
      const rect = vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
        x: 0, y: 0, left: 0, top: 0, right: 100, bottom: 10, width: 100, height: 10, toJSON: () => ({}),
      });
      for (const track of container.querySelectorAll('div[class*="bg-primary/20"]')) {
        for (const x of [10, 95, 55]) {
          fireEvent.mouseDown(track, { clientX: x });
          fireEvent.mouseUp(document);
          snap();
        }
      }
      rect.mockRestore();
      click(screen.getByRole("tab", { name: "Explication" })); snap();
      click(screen.getByRole("tab", { name: "Visualisation" })); snap();
      cleanup();
      return hashes;
    } finally {
      random.mockRestore();
      vi.useRealTimers();
    }
  });
}

describe("DatabaseReplicationVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSim(DatabaseReplicationVisualization);
    expect(states).toBeGreaterThanOrEqual(5);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "ddbb3a9b",
        "ddbb3a9b",
        "2679b5d4",
        "b71c2879",
        "b71c2879",
        "29eb5ad8",
        "458ba36b",
        "5db65abf",
        "45762995",
        "74949cfb",
        "b71c2879",
        "52e4464f",
        "4d87c44d",
        "8e4ea2e4",
        "59669852",
      ]
    `);
  });

  it("renders the same markup through a scripted session (nodes, links, failures)", () => {
    const hashes = scriptedSession();
    expect(new Set(hashes).size).toBeGreaterThanOrEqual(25);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "c8d48d3b",
        "c8d48d3b",
        "703ed7ab",
        "4e778bfe",
        "e089928c",
        "e089928c",
        "772df9a3",
        "185740c0",
        "8f11ac05",
        "2af2b547",
        "2747617d",
        "53844267",
        "f0c7a88b",
        "6a6c27a4",
        "6feb40d3",
        "f6363d40",
        "f6363d40",
        "18f689df",
        "7c23c05a",
        "7c23c05a",
        "7c23c05a",
        "18f689df",
        "32c0c1e1",
        "5b1a4e04",
        "c466a02f",
        "5b1a4e04",
        "706e5a1e",
        "9da0e7d7",
        "28c9d723",
        "9da0e7d7",
        "272ef999",
        "7eea514e",
        "7eea514e",
        "32c0c1e1",
        "7cec89b2",
        "79e30104",
        "79e30104",
        "79e30104",
        "a1d6331a",
        "a1d6331a",
        "a1d6331a",
        "a1d6331a",
        "a1d6331a",
        "26e5bd5e",
        "aaad0978",
        "6c8eda74",
        "6c8eda74",
        "740048a5",
        "8834da72",
        "847b007d",
        "847b007d",
        "410a2c4d",
        "9733a0ec",
        "58893419",
        "26e5bd5e",
        "911ae210",
        "cadbfb21",
        "615b408a",
        "615b408a",
        "78e8e33b",
        "9de7b046",
        "9de7b046",
        "9de7b046",
        "b0ff0cf7",
        "2747617d",
        "703ed7ab",
        "703ed7ab",
        "4e778bfe",
        "e089928c",
        "db3d1e9d",
        "ff03d94f",
        "772df9a3",
        "fad91dd6",
        "20ef0964",
        "d8de0f1a",
        "9f77b6da",
        "8fc0615c",
        "6feb40d3",
        "71bfe7d1",
        "71bfe7d1",
        "7c23c05a",
        "743805bc",
        "743805bc",
        "743805bc",
        "7c23c05a",
        "abc4ea13",
        "d128111b",
        "b04dfcac",
        "a9d33a79",
        "f681fee2",
        "3ee181b7",
        "45c31cee",
        "ed3243fb",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(scriptedSession()).toEqual(scriptedSession());
  });
});
