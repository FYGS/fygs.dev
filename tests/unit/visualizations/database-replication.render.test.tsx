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
        "5f537b0b",
        "5f537b0b",
        "c0273903",
        "b91b783f",
        "b91b783f",
        "be0c3848",
        "5249323f",
        "a49b67cf",
        "b8738eca",
        "995d70b8",
        "b91b783f",
        "62bc3b67",
        "ca75a93d",
        "0b16ad57",
        "67a8ebe6",
      ]
    `);
  });

  it("renders the same markup through a scripted session (nodes, links, failures)", () => {
    const hashes = scriptedSession();
    expect(new Set(hashes).size).toBeGreaterThanOrEqual(25);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "8074b4c2",
        "8074b4c2",
        "de8f5b1a",
        "10df6760",
        "8ec77e1d",
        "8ec77e1d",
        "104cd4d9",
        "9f524f74",
        "e0289147",
        "afdfc6e4",
        "24131144",
        "41b1c799",
        "9ecec566",
        "3dfcfd88",
        "5b12394b",
        "9c6f6271",
        "9c6f6271",
        "5ff8cf81",
        "dd6dc420",
        "dd6dc420",
        "dd6dc420",
        "5ff8cf81",
        "dbd5ef26",
        "810ebcd4",
        "b8e98be9",
        "810ebcd4",
        "762373d5",
        "5465b95d",
        "5a2086c8",
        "5465b95d",
        "e39caa64",
        "993bbcc8",
        "993bbcc8",
        "dbd5ef26",
        "0ee80de4",
        "34431ca6",
        "34431ca6",
        "34431ca6",
        "6d0c6ae1",
        "6d0c6ae1",
        "6d0c6ae1",
        "6d0c6ae1",
        "6d0c6ae1",
        "5ed881d3",
        "0328ca9a",
        "53270a8f",
        "53270a8f",
        "1fb90fa9",
        "5b3d4670",
        "4c3adb0e",
        "4c3adb0e",
        "1c7aafad",
        "3128f3c3",
        "bfd96945",
        "5ed881d3",
        "1f2e1345",
        "3a71b682",
        "2983474b",
        "2983474b",
        "5379d743",
        "ada716e6",
        "ada716e6",
        "ada716e6",
        "d8e8d0be",
        "24131144",
        "de8f5b1a",
        "de8f5b1a",
        "10df6760",
        "8ec77e1d",
        "9ff857ec",
        "6389a315",
        "104cd4d9",
        "23486141",
        "2c05fb71",
        "764df151",
        "44b1a73b",
        "6b1d2805",
        "5b12394b",
        "8aa5791a",
        "8aa5791a",
        "dd6dc420",
        "ac6c2a82",
        "ac6c2a82",
        "ac6c2a82",
        "dd6dc420",
        "fb5054e6",
        "0f52e311",
        "46a24306",
        "45ce3dff",
        "35d6d921",
        "35aade2d",
        "74b4a7fb",
        "572d3a5b",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(scriptedSession()).toEqual(scriptedSession());
  });
});
