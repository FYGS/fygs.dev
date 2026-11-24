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
      click(screen.getByText("Supprimer").closest("button") as Element);
      record();
      // zoom, then pan with the pan tool
      const buttons = () => [...container.querySelectorAll("button")];
      const header = container.querySelector(".justify-between > .gap-2:last-child") as HTMLElement;
      const [zoomIn, zoomOut, zoomReset] = [...header.querySelectorAll("button")];
      click(zoomIn); record();
      click(zoomIn); record();
      click(zoomOut); record();
      click(zoomReset); record();
      click(screen.getByText("Déplacer").closest("button") as Element); record();
      fireEvent.mouseDown(canvas(), { clientX: 10, clientY: 10 });
      fireEvent.mouseMove(canvas(), { clientX: 60, clientY: 40 });
      fireEvent.mouseUp(canvas());
      record();
      // add every kind of component
      click(screen.getByText("Sélection").closest("button") as Element);
      for (const label of ["Client", "Serveur", "BDD", "API", "Cache", "LB"]) {
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
      for (const label of ["Modèles", "Documentation", "Diagramme"]) {
        click(tabs.find((t) => t.textContent?.includes(label)) as Element);
        record();
      }
      click(tabs.find((t) => t.textContent?.includes("Modèles")) as Element);
      const useButtons = screen.getAllByText("Utiliser le modèle");
      for (const b of useButtons) {
        fireEvent.click(b.closest(".cursor-pointer") as Element);
        click(tabs.find((t) => t.textContent?.includes("Diagramme")) as Element);
        record();
        click(tabs.find((t) => t.textContent?.includes("Modèles")) as Element);
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
        "2a95a22d",
        "aa86dbf8",
        "0de5bafb",
        "0de5bafb",
        "0de5bafb",
        "b719496d",
        "b719496d",
        "9c407ab3",
        "8a1a2141",
        "17c94e7f",
        "1aa5f1e5",
        "5c63277d",
        "21de7d54",
        "426755df",
        "21de7d54",
        "21de7d54",
        "42afe465",
        "21de7d54",
        "21de7d54",
        "4a8675d2",
        "d1a184d7",
        "7e21ad9f",
        "602eb2ee",
        "be546cfc",
        "17c2028e",
        "d9c0f28d",
        "be1b9843",
        "8f9f501d",
      ]
    `);
  });

  it("renders the same markup through a scripted drag / pan / edit session", () => {
    const hashes = scriptedSession();
    expect(new Set(hashes).size).toBeGreaterThanOrEqual(20);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "2a95a22d",
        "19a3ba3f",
        "7312ceee",
        "19a3ba3f",
        "d0da7325",
        "e4acf836",
        "d0da7325",
        "e4acf836",
        "d196a219",
        "44a23908",
        "dd14e2ed",
        "44a23908",
        "07fc7c7d",
        "54a705c7",
        "4e0b455a",
        "54a705c7",
        "cc1a3e1f",
        "54a705c7",
        "4e0b455a",
        "54a705c7",
        "07fc7c7d",
        "54a705c7",
        "6feee3df",
        "54a705c7",
        "d0dc483d",
        "54a705c7",
        "b0790cc9",
        "4537567a",
        "df8099c6",
        "0e693842",
        "3ada0aca",
        "0e693842",
        "11ebfa97",
        "0e693842",
        "55660861",
        "0e693842",
        "a2fcdc7d",
        "0e693842",
        "a2fcdc7d",
        "0e693842",
        "be1b9843",
        "d41d8cd9",
        "8f9f501d",
        "f2955895",
        "bef6962a",
        "0e693842",
        "fe803195",
        "0a5d843b",
        "fe803195",
        "0a5d843b",
        "fe803195",
        "0a5d843b",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(scriptedSession()).toEqual(scriptedSession());
  });
});
