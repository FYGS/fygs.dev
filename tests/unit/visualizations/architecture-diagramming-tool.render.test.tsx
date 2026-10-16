import { createHash } from "crypto";
import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, cleanup, screen, act } from "@testing-library/react";
import { ArchitectureDiagrammingTool } from "@/app/[locale]/(main)/tech-mastry/system-design/_components/architecture-diagramming-tool";
import { renderWalkSim } from "./render-walk-sim";
import { withNeutralMatchMedia } from "./match-media";

/**
 * Drag, pan, rename, delete and apply-template are not reachable by clicking
 * buttons only: this scripted scenario drives the mouse events too. The clock
 * and Math.random are faked so that the generated ids and positions are stable.
 */
function scriptedSession() {
  return withNeutralMatchMedia(() => {
    vi.useFakeTimers({ now: new Date("2025-01-01T00:00:00Z") });
    let seed = 987654321;
    const random = vi.spyOn(Math, "random").mockImplementation(() => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    });
    try {
      const { container } = render(<ArchitectureDiagrammingTool />);
      const hashes: string[] = [];
      const snap = () =>
        hashes.push(
          createHash("md5")
            .update(container.innerHTML.replace(/_r_[0-9a-z]+_/g, "_r_X_").replace(/<svg[\s\S]*?<\/svg>/g, "<svg/>"))
            .digest("hex")
            .slice(0, 8)
        );
      // keep the connection lines in the fingerprint: they are svg <line> elements
      const lines = () => [...container.querySelectorAll("line")].map((l) => l.outerHTML).join("|");
      const click = (el: Element) => {
        fireEvent.mouseDown(el, { button: 0 });
        fireEvent.click(el);
      };
      const canvas = () => container.querySelector(".bg-grid-pattern") as HTMLElement;
      const node = (name: string) => screen.getByText(name).closest(".cursor-move") as HTMLElement;
      const record = () => {
        snap();
        hashes.push(createHash("md5").update(lines()).digest("hex").slice(0, 8));
      };
      record();

      // select + drag a component
      fireEvent.mouseDown(node("Application Server"), { clientX: 300, clientY: 200 });
      record();
      fireEvent.mouseMove(canvas(), { clientX: 380, clientY: 260 });
      record();
      fireEvent.mouseUp(canvas());
      record();
      // drag past the origin: position is clamped
      fireEvent.mouseDown(node("Web Client"), { clientX: 60, clientY: 60 });
      fireEvent.mouseMove(canvas(), { clientX: -500, clientY: -500 });
      fireEvent.mouseUp(canvas());
      record();
      // rename then delete the selected component
      fireEvent.change(container.querySelector("#component-name") as HTMLInputElement, { target: { value: "Edge Client" } });
      record();
      click(screen.getByText("Delete").closest("button") as Element);
      record();
      // zoom, then pan with the pan tool
      const buttons = () => [...container.querySelectorAll("button")];
      const header = container.querySelector(".justify-between > .gap-2:last-child") as HTMLElement;
      const [zoomIn, zoomOut, zoomReset] = [...header.querySelectorAll("button")];
      click(zoomIn); record();
      click(zoomIn); record();
      click(zoomOut); record();
      click(zoomReset); record();
      click(screen.getByText("Pan").closest("button") as Element); record();
      fireEvent.mouseDown(canvas(), { clientX: 10, clientY: 10 });
      fireEvent.mouseMove(canvas(), { clientX: 60, clientY: 40 });
      fireEvent.mouseUp(canvas());
      record();
      // add every kind of component
      click(screen.getByText("Select").closest("button") as Element);
      for (const label of ["Client", "Server", "DB", "API", "Cache", "LB"]) {
        click(screen.getByText(label).closest("button") as Element);
        act(() => { vi.advanceTimersByTime(5); });
        record();
      }
      expect(buttons().length).toBeGreaterThan(5);
      // click on empty canvas deselects
      fireEvent.mouseDown(canvas());
      record();
      // templates and documentation tabs
      const tabs = screen.getAllByRole("tab");
      for (const label of ["Templates", "Documentation", "Diagram"]) {
        click(tabs.find((t) => t.textContent?.includes(label)) as Element);
        record();
      }
      click(tabs.find((t) => t.textContent?.includes("Templates")) as Element);
      const useButtons = screen.getAllByText("Use Template");
      for (const b of useButtons) {
        fireEvent.click(b.closest(".cursor-pointer") as Element);
        click(tabs.find((t) => t.textContent?.includes("Diagram")) as Element);
        record();
        click(tabs.find((t) => t.textContent?.includes("Templates")) as Element);
      }
      cleanup();
      return hashes;
    } finally {
      random.mockRestore();
      vi.useRealTimers();
    }
  });
}

describe("ArchitectureDiagrammingTool rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSim(ArchitectureDiagrammingTool);
    expect(states).toBeGreaterThanOrEqual(5);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "f50d9497",
        "1539982e",
        "0ef6cb50",
        "0ef6cb50",
        "0ef6cb50",
        "691dc2e9",
        "691dc2e9",
        "e509441a",
        "927d0273",
        "da3e0943",
        "e491cd35",
        "4b1c77fb",
        "46b29622",
        "d2c0dc54",
        "46b29622",
        "46b29622",
        "fd5bcf94",
        "46b29622",
        "46b29622",
        "54469374",
        "ec9dac82",
        "004ad94a",
        "52cb615b",
        "b16f65b4",
        "630242a1",
        "442d4a47",
        "3ac00251",
        "209114ad",
      ]
    `);
  });

  it("renders the same markup through a scripted drag / pan / edit session", () => {
    const hashes = scriptedSession();
    expect(new Set(hashes).size).toBeGreaterThanOrEqual(20);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "f50d9497",
        "19a3ba3f",
        "d1dd1869",
        "19a3ba3f",
        "966a70e9",
        "e4acf836",
        "966a70e9",
        "e4acf836",
        "785ae4da",
        "44a23908",
        "c867a6d7",
        "44a23908",
        "18265750",
        "54a705c7",
        "3f497492",
        "54a705c7",
        "e096a5e3",
        "54a705c7",
        "3f497492",
        "54a705c7",
        "18265750",
        "54a705c7",
        "7dc23d52",
        "54a705c7",
        "c69e346c",
        "54a705c7",
        "373dfdf5",
        "4537567a",
        "62864a45",
        "0e693842",
        "8ca6a3f5",
        "0e693842",
        "afb80506",
        "0e693842",
        "7d4b2070",
        "0e693842",
        "101c7093",
        "0e693842",
        "101c7093",
        "0e693842",
        "3ac00251",
        "d41d8cd9",
        "209114ad",
        "f2955895",
        "8a1d3d97",
        "0e693842",
        "cb0ecd16",
        "0a5d843b",
        "cb0ecd16",
        "0a5d843b",
        "cb0ecd16",
        "0a5d843b",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(scriptedSession()).toEqual(scriptedSession());
  });
});
