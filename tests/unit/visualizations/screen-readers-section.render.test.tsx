import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ScreenReadersSection } from "@/app/[locale]/(main)/tech-mastry/frontend/accessibility/_components/sections/screen-readers-section";
import { renderWalkSim } from "./render-walk-sim";

beforeEach(() => {
  // the code examples have a "copy" button
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
    configurable: true,
  });
  // the aria-live demo prints the current time: pin it, whatever the machine locale
  vi.spyOn(Date.prototype, "toLocaleTimeString").mockReturnValue("12:00:00");
});
afterEach(() => vi.restoreAllMocks());

describe("ScreenReadersSection rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSim(ScreenReadersSection, { passes: 2 });
    expect(states).toBeGreaterThanOrEqual(5);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "c83573b9",
        "5cf596fe",
        "5cf596fe",
        "5cf596fe",
        "5cf596fe",
        "5cf596fe",
        "3bcebd71",
        "645014c4",
        "81fb5534",
        "81fb5534",
        "81fb5534",
        "81fb5534",
        "81fb5534",
        "81fb5534",
        "aecea447",
        "b66ea356",
        "5cf596fe",
        "39d44287",
        "85b00a3d",
        "c1c7d694",
        "91b44ba2",
        "cb17ad7b",
        "dcc9f1e4",
        "858de8bd",
        "d0d43067",
        "59c6b97d",
        "200c6905",
        "676143d1",
        "8deee77a",
        "65060e11",
        "a4bac750",
        "9ea0dd92",
        "5e54a2e7",
        "610a2df9",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalkSim(ScreenReadersSection).hashes).toEqual(renderWalkSim(ScreenReadersSection).hashes);
  });
});
