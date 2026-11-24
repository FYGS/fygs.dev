import { describe, it, expect } from "vitest";
import { createSortedArray, getColorForState } from "@/app/[locale]/(main)/tech-mastry/algorithms/searching/_components/sections/3d-visualization/binary-search-3d/elements";
import { applySearchStep, binarySearchSteps } from "@/app/[locale]/(main)/tech-mastry/algorithms/searching/_components/sections/3d-visualization/binary-search-3d/search-steps";

const values = createSortedArray(15).map((item) => item.value);

describe("binary search 3D logic", () => {
  it("builds a sorted array of odd values", () => {
    expect(values).toEqual([1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29]);
    expect(createSortedArray(3).every((item) => item.state === "default")).toBe(true);
  });

  it("finds the middle element at once", () => {
    const { steps, found, foundIndex } = binarySearchSteps(values, 15);
    expect(found).toBe(true);
    expect(foundIndex).toBe(7);
    expect(steps).toEqual([
      { left: 0, right: 14, mid: 7, state: "searching", message: "Comparaison de 15 avec 15" },
      { left: 0, right: 14, mid: 7, state: "found", message: "L'élément 15 est trouvé à l'index 7." },
    ]);
  });

  it("narrows the range on each side, then gives up", () => {
    const { steps, found, foundIndex } = binarySearchSteps(values, 4);
    expect(found).toBe(false);
    expect(foundIndex).toBe(-1);
    expect(steps.map((s) => [s.state, s.left, s.right, s.mid])).toEqual([
      ["searching", 0, 14, 7],
      ["range", 0, 6, undefined],
      ["searching", 0, 6, 3],
      ["range", 0, 2, undefined],
      ["searching", 0, 2, 1],
      ["range", 2, 2, undefined],
      ["searching", 2, 2, 2],
      ["range", 2, 1, undefined],
      ["not-found", undefined, undefined, undefined],
    ]);
    expect(steps[1].message).toBe("L'élément 15 est plus grand que 4, on cherche à gauche.");
    expect(steps[steps.length - 1].message).toBe("L'élément 4 n'est pas trouvé dans le tableau.");
    expect(binarySearchSteps(values, 100).steps[1].message).toBe("L'élément 15 est plus petit que 100, on cherche à droite.");
  });

  it("marks the compared element, the range, and the result on the array", () => {
    const base = createSortedArray(5);
    const states = (step: Parameters<typeof applySearchStep>[1]) => applySearchStep(base, step).map((item) => item.state);
    expect(states({ state: "searching", left: 0, right: 4, mid: 2 })).toEqual(["range", "range", "current", "range", "range"]);
    expect(states({ state: "range", left: 3, right: 4 })).toEqual(["default", "default", "default", "range", "range"]);
    expect(states({ state: "found", mid: 1 })).toEqual(["default", "found", "default", "default", "default"]);
    expect(states({ state: "not-found" })).toEqual(Array(5).fill("not-found"));
    // never mutates its input
    expect(base.every((item) => item.state === "default")).toBe(true);
  });

  it("colours each state", () => {
    expect(getColorForState("found")).toBe(0x10b981);
    expect(getColorForState("unknown")).toBe(0xcccccc);
  });
});
