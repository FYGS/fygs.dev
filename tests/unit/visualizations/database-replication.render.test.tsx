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
        "00796c4b",
        "00796c4b",
        "eaa18c2f",
        "07ec46ed",
        "07ec46ed",
        "18887308",
        "5f76d36e",
        "abeb9e00",
        "ea6c0358",
        "a144fe77",
        "07ec46ed",
        "fd13c4b6",
        "c9ceb117",
        "0a32aed2",
        "0fc55bfa",
      ]
    `);
  });

  it("renders the same markup through a scripted session (nodes, links, failures)", () => {
    const hashes = scriptedSession();
    expect(new Set(hashes).size).toBeGreaterThanOrEqual(25);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "9dcfa28a",
        "9dcfa28a",
        "8acf0b12",
        "bd4642b8",
        "61dff88e",
        "61dff88e",
        "b499735b",
        "3dc6e03a",
        "e46bf93d",
        "f9fb63db",
        "c14491aa",
        "f22bb351",
        "00f824bc",
        "95ea7930",
        "6ec3a8ea",
        "5693dcf2",
        "5693dcf2",
        "e4fe92d0",
        "d340a6fc",
        "d340a6fc",
        "d340a6fc",
        "e4fe92d0",
        "1adc3d09",
        "f6bb5588",
        "00fe9e34",
        "f6bb5588",
        "0e9acb4d",
        "178eaac7",
        "728e65e2",
        "178eaac7",
        "06999bf1",
        "9ad349df",
        "9ad349df",
        "1adc3d09",
        "f7b83557",
        "fb81e386",
        "fb81e386",
        "fb81e386",
        "046a052c",
        "046a052c",
        "046a052c",
        "046a052c",
        "046a052c",
        "e89c0ac3",
        "da7f84b2",
        "75f2a391",
        "75f2a391",
        "18e3b787",
        "c2cf1816",
        "7bfbf8a9",
        "7bfbf8a9",
        "b29eee05",
        "91ff4f6a",
        "03cd20bf",
        "e89c0ac3",
        "8e07ca36",
        "31af2ea1",
        "5c801fcd",
        "5c801fcd",
        "edc2801b",
        "37f7368f",
        "37f7368f",
        "37f7368f",
        "ebb8d3b3",
        "c14491aa",
        "8acf0b12",
        "8acf0b12",
        "bd4642b8",
        "61dff88e",
        "ea487785",
        "a2163c73",
        "b499735b",
        "91bffdcf",
        "1b95b2b3",
        "ccd01d51",
        "1a6cc3f8",
        "bf853f83",
        "6ec3a8ea",
        "e5e6ee16",
        "e5e6ee16",
        "d340a6fc",
        "a54349be",
        "a54349be",
        "a54349be",
        "d340a6fc",
        "01510cab",
        "7852d7a7",
        "66f222c2",
        "4ff19ab9",
        "4aaefeb1",
        "69a0b3bf",
        "61b46540",
        "5a59ad6a",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(scriptedSession()).toEqual(scriptedSession());
  });
});
