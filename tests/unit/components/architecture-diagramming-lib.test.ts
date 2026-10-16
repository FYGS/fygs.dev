import { describe, it, expect, vi, afterEach } from "vitest";
import {
  clampZoom,
  createComponent,
  getComponentColor,
  getDragOffset,
  getDraggedPosition,
} from "@/app/[locale]/(main)/tech-mastry/system-design/_components/architecture-diagramming-tool/lib";

describe("architecture diagramming helpers", () => {
  afterEach(() => vi.restoreAllMocks());

  it("keeps the zoom between 50% and 200%", () => {
    expect(clampZoom(1, 0.1)).toBeCloseTo(1.1);
    expect(clampZoom(0.5, -0.1)).toBe(0.5);
    expect(clampZoom(2, 0.1)).toBe(2);
  });

  it("computes the drag offset and the dragged position consistently", () => {
    const rect = { left: 10, top: 20 };
    const pan = { x: 5, y: -5 };
    const offset = getDragOffset({ x: 300, y: 200 }, rect, { x: 100, y: 50 }, 2, pan);
    expect(offset).toEqual({ x: 300 - 10 - 200 - 5, y: 200 - 20 - 100 + 5 });
    // moving the pointer by (+40, +20) moves the component by (+20, +10) at zoom 2
    expect(getDraggedPosition({ x: 340, y: 220 }, rect, offset, 2, pan)).toEqual({ x: 120, y: 60 });
  });

  it("never drags a component above or left of the origin", () => {
    expect(getDraggedPosition({ x: -999, y: -999 }, { left: 0, top: 0 }, { x: 0, y: 0 }, 1, { x: 0, y: 0 })).toEqual({ x: 0, y: 0 });
  });

  it("creates a numbered component at a random position", () => {
    const existing = [createComponent("cache", [])];
    vi.spyOn(Date, "now").mockReturnValue(42);
    vi.spyOn(Math, "random").mockReturnValueOnce(0.5).mockReturnValueOnce(0.25);
    const created = createComponent("cache", existing);
    expect(created).toMatchObject({ id: "comp-42", type: "cache", name: "Cache 2", x: 300, y: 100, width: 120, height: 60, connections: [], visible: true, locked: false });
  });

  it("maps every type to a colour, with a grey fallback", () => {
    expect(getComponentColor("database")).toContain("blue");
    expect(getComponentColor("microservice")).toContain("emerald");
    expect(getComponentColor("nope" as never)).toContain("gray");
  });
});
