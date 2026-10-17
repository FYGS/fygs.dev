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
        "0786586c",
        "0786586c",
        "f3a12e14",
        "6f58bc6c",
        "6f58bc6c",
        "07f30d33",
        "835f9182",
        "3c2be1b8",
        "83e5a02c",
        "767c65a7",
        "6f58bc6c",
        "64fa66fe",
        "f84a3cc7",
        "8bb533d9",
        "d0832c1a",
      ]
    `);
  });

  it("renders the same markup through a scripted session (nodes, links, failures)", () => {
    const hashes = scriptedSession();
    expect(new Set(hashes).size).toBeGreaterThanOrEqual(25);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "9a237d97",
        "9a237d97",
        "1e4af169",
        "abcd8a59",
        "9519fd75",
        "9519fd75",
        "623b941e",
        "fb5ea72b",
        "e4515431",
        "a7a8c82b",
        "ee6a9e66",
        "cc758014",
        "4748b3dc",
        "8a9afd05",
        "2fd171b3",
        "75c90804",
        "75c90804",
        "f6872a8a",
        "e535311e",
        "e535311e",
        "e535311e",
        "f6872a8a",
        "9b674304",
        "1c94b4e1",
        "d0bab289",
        "1c94b4e1",
        "0d242d8f",
        "157f5a4a",
        "d626881c",
        "157f5a4a",
        "8d6696d8",
        "301e3d5b",
        "301e3d5b",
        "9b674304",
        "65673f78",
        "3f0a122e",
        "3f0a122e",
        "3f0a122e",
        "5c0b9e78",
        "5c0b9e78",
        "5c0b9e78",
        "5c0b9e78",
        "5c0b9e78",
        "d8bb015e",
        "6e7df00f",
        "caf21b82",
        "caf21b82",
        "f415130c",
        "6e579993",
        "938e0a49",
        "938e0a49",
        "d6f57fe2",
        "c49906bd",
        "7cff78e2",
        "d8bb015e",
        "8217a56a",
        "d248f7f5",
        "ec03f789",
        "ec03f789",
        "d62d7fbd",
        "93f5f3f3",
        "93f5f3f3",
        "93f5f3f3",
        "5964bd44",
        "ee6a9e66",
        "1e4af169",
        "1e4af169",
        "abcd8a59",
        "9519fd75",
        "2d0864b4",
        "7527c98d",
        "623b941e",
        "0ec832b1",
        "e4ff17ba",
        "bec81e66",
        "67cdb543",
        "2fc54375",
        "2fd171b3",
        "fe980f83",
        "fe980f83",
        "e535311e",
        "6d49a835",
        "6d49a835",
        "6d49a835",
        "e535311e",
        "956efc78",
        "49b913ac",
        "057de728",
        "c0607295",
        "71770395",
        "17e047db",
        "b952eb9c",
        "7e9ba77e",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(scriptedSession()).toEqual(scriptedSession());
  });
});
