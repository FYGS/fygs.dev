import { describe, it, expect } from "vitest";
import PythonDataPage from "@/app/[locale]/(main)/tech-mastry/data-science/python-data/page";
import { renderWalk } from "./render-walk";

describe("PythonDataPage rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalk(PythonDataPage, 2);
    expect(states).toBeGreaterThanOrEqual(10);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "d820984e",
        "d820984e",
        "908b6b17",
        "04a32e03",
        "ee258a16",
        "0cc78abe",
        "841ec2e3",
        "1ee2357a",
        "841ec2e3",
        "16d0ce88",
        "16d0ce88",
        "ee1fc947",
        "cf958b73",
        "2b22a3b0",
        "e3e3aaff",
        "b61090e9",
        "a9d27459",
        "3d535f99",
        "cf958b73",
        "adc4fd6f",
        "fd46f63a",
        "cf958b73",
        "16d0ce88",
        "ee1fc947",
        "cf958b73",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalk(PythonDataPage).hashes).toEqual(renderWalk(PythonDataPage).hashes);
  });
});
