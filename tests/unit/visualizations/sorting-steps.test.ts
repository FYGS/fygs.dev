import { createHash } from "crypto";
import { describe, it, expect } from "vitest";
import { generateSortingSteps } from "@/app/[locale]/(main)/tech-mastry/algorithms/sorting/_components/sections/sorting-visualization/steps";
import type { SortingAlgorithm } from "@/app/[locale]/(main)/tech-mastry/algorithms/sorting/_components/sections/sorting-visualization/types";

const algorithms: SortingAlgorithm[] = ["bubble", "selection", "insertion", "merge", "quick", "heap"];
const input = [34, 7, 23, 32, 5, 62, 32, 7, 1];

describe("sorting step generators", () => {
  it.each(algorithms)("%s sort ends on the sorted array with every index marked", (algorithm) => {
    const steps = generateSortingSteps(algorithm, input);
    const last = steps[steps.length - 1];
    expect(last.array).toEqual([...input].sort((a, b) => a - b));
    expect(last.sortedIndices).toEqual(input.map((_, i) => i));
    expect(last.message).toMatch(/^Tri terminé en \d+ comparaisons et \d+ (échanges|déplacements)\.$/);
    expect(steps[0].array).toEqual(input);
  });

  it("does not mutate its input", () => {
    const copy = [...input];
    algorithms.forEach((algorithm) => generateSortingSteps(algorithm, copy));
    expect(copy).toEqual(input);
  });

  it.each(algorithms)("%s sort produces a stable, pinned step list", (algorithm) => {
    const steps = generateSortingSteps(algorithm, input);
    const digest = createHash("md5").update(JSON.stringify(steps)).digest("hex").slice(0, 8);
    expect({ count: steps.length, digest }).toMatchSnapshot();
  });
});
