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
        "0b3bda9c",
        "aa3c9add",
        "fade72d1",
        "fade72d1",
        "fade72d1",
        "0184f234",
        "0184f234",
        "86160e4b",
        "6f99391d",
        "7446bf1b",
        "4bd3c0c9",
        "0270b5fe",
        "c0d5003c",
        "d29b09bb",
        "c0d5003c",
        "c0d5003c",
        "e3c6f368",
        "c0d5003c",
        "c0d5003c",
        "cfe2442b",
        "69131b93",
        "499fb197",
        "c948422e",
        "952b25f4",
        "f30c8681",
        "80c7f426",
        "417208d4",
        "54bdd23f",
      ]
    `);
  });

  it("renders the same markup through a scripted drag / pan / edit session", () => {
    const hashes = scriptedSession();
    expect(new Set(hashes).size).toBeGreaterThanOrEqual(20);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "0b3bda9c",
        "19a3ba3f",
        "99265aa2",
        "19a3ba3f",
        "d2405818",
        "e4acf836",
        "d2405818",
        "e4acf836",
        "5b4ed0ad",
        "44a23908",
        "1ad69a5e",
        "44a23908",
        "de16e9c5",
        "54a705c7",
        "1f6acc58",
        "54a705c7",
        "aa06681e",
        "54a705c7",
        "1f6acc58",
        "54a705c7",
        "de16e9c5",
        "54a705c7",
        "492c871f",
        "54a705c7",
        "4f300a5c",
        "54a705c7",
        "c999dc77",
        "4537567a",
        "9cd28922",
        "0e693842",
        "ec750055",
        "0e693842",
        "2de2d30d",
        "0e693842",
        "bafee474",
        "0e693842",
        "0c52c966",
        "0e693842",
        "0c52c966",
        "0e693842",
        "417208d4",
        "d41d8cd9",
        "54bdd23f",
        "f2955895",
        "2a08e229",
        "0e693842",
        "b6b1e63a",
        "0a5d843b",
        "b6b1e63a",
        "0a5d843b",
        "b6b1e63a",
        "0a5d843b",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(scriptedSession()).toEqual(scriptedSession());
  });
});
