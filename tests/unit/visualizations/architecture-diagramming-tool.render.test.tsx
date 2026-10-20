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
        "ac0b1c94",
        "6a2fd175",
        "ae4204ff",
        "ae4204ff",
        "ae4204ff",
        "2e6f3f26",
        "2e6f3f26",
        "fed790f5",
        "5ac0c9b2",
        "4e12cb5a",
        "3bc8ed9f",
        "2429156b",
        "fff6c818",
        "39b1ae36",
        "fff6c818",
        "fff6c818",
        "c0ac041b",
        "fff6c818",
        "fff6c818",
        "3408445a",
        "2d0a73b2",
        "41619bef",
        "dda6ea82",
        "dd2297bc",
        "7926fc46",
        "5e446dc4",
        "cf00395c",
        "3c8b1f51",
      ]
    `);
  });

  it("renders the same markup through a scripted drag / pan / edit session", () => {
    const hashes = scriptedSession();
    expect(new Set(hashes).size).toBeGreaterThanOrEqual(20);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "ac0b1c94",
        "19a3ba3f",
        "5168385a",
        "19a3ba3f",
        "1c8207b8",
        "e4acf836",
        "1c8207b8",
        "e4acf836",
        "03d16ff4",
        "44a23908",
        "68534d01",
        "44a23908",
        "68f5dd8a",
        "54a705c7",
        "6e6f9f1a",
        "54a705c7",
        "cccaa29a",
        "54a705c7",
        "6e6f9f1a",
        "54a705c7",
        "68f5dd8a",
        "54a705c7",
        "fdc4cb09",
        "54a705c7",
        "709fbbbc",
        "54a705c7",
        "1d083fe7",
        "4537567a",
        "73cdd081",
        "0e693842",
        "16786c3b",
        "0e693842",
        "39f3a2b2",
        "0e693842",
        "811308b9",
        "0e693842",
        "4932bc5f",
        "0e693842",
        "4932bc5f",
        "0e693842",
        "cf00395c",
        "d41d8cd9",
        "3c8b1f51",
        "f2955895",
        "e4115c20",
        "0e693842",
        "b8460f8f",
        "0a5d843b",
        "b8460f8f",
        "0a5d843b",
        "b8460f8f",
        "0a5d843b",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(scriptedSession()).toEqual(scriptedSession());
  });
});
