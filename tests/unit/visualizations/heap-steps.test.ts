import { describe, it, expect } from "vitest";
import { generateExtractMaxSteps } from "@/app/[locale]/(main)/tech-mastry/algorithms/data-structures/_components/visualizations/heap-visualization/extract-steps";
import { generateHeapifySteps } from "@/app/[locale]/(main)/tech-mastry/algorithms/data-structures/_components/visualizations/heap-visualization/heapify-steps";
import { heapify } from "@/app/[locale]/(main)/tech-mastry/algorithms/data-structures/_components/visualizations/heap-visualization/heap-operations";
import { calculateNodePositions } from "@/app/[locale]/(main)/tech-mastry/algorithms/data-structures/_components/visualizations/heap-visualization/heap-layout";
import { generateInsertSteps } from "@/app/[locale]/(main)/tech-mastry/algorithms/data-structures/_components/visualizations/heap-visualization/insert-steps";
import type { HeapNode } from "@/app/[locale]/(main)/tech-mastry/algorithms/data-structures/_components/visualizations/heap-visualization/types";

const nodes = (...values: number[]): HeapNode[] => values.map((value) => ({ id: `n${value}`, value }));
const values = (heap: HeapNode[]) => heap.map((n) => n.value);

describe("heap operations", () => {
  it("heapify builds a valid max heap and a valid min heap without mutating its input", () => {
    const input = nodes(45, 30, 60, 10, 25, 50, 70);
    expect(values(heapify(input, "max"))).toEqual([70, 30, 60, 10, 25, 50, 45]);
    expect(values(heapify(input, "min"))).toEqual([10, 25, 50, 30, 45, 60, 70]);
    expect(values(input)).toEqual([45, 30, 60, 10, 25, 50, 70]);
  });

  it("insert bubbles the value up and completes", () => {
    const heap = heapify(nodes(45, 30, 60, 10, 25, 50, 70), "max");
    const steps = generateInsertSteps(heap, 80, "max");
    const last = steps[steps.length - 1];
    expect(last.completed).toBe(true);
    expect(last.message).toBe("La valeur 80 est maintenant à la racine du tas, l'insertion est terminée");
    expect(values(last.heap)[0]).toBe(80);
    expect(values(heap)).toEqual([70, 30, 60, 10, 25, 50, 45]);
  });

  it("insert stops at the first parent that is already larger", () => {
    const steps = generateInsertSteps(nodes(70, 30, 60), 10, "max");
    const last = steps[steps.length - 1];
    expect(last.message).toBe("Comparaison avec le parent (30): pas besoin d'échanger, l'insertion est terminée");
    expect(values(last.heap)).toEqual([70, 30, 60, 10]);
  });

  it("extract removes the root and restores the heap order", () => {
    const heap = heapify(nodes(45, 30, 60, 10, 25, 50, 70), "max");
    const steps = generateExtractMaxSteps(heap, "max");
    expect(steps[0].message).toBe("Extraction de la valeur maximale (70)");
    const last = steps[steps.length - 1];
    expect(last.completed).toBe(true);
    expect(values(last.heap)).toEqual([60, 30, 50, 10, 25, 45]);
  });

  it("extract handles the empty and single-element heaps", () => {
    expect(generateExtractMaxSteps([], "max")[0].message).toBe("Le tas est vide, impossible d'extraire un élément");
    const single = generateExtractMaxSteps(nodes(5), "min");
    expect(single[single.length - 1].message).toBe("Suppression de la seule valeur du tas (5)");
  });

  it("heapify steps end on a valid heap", () => {
    const steps = generateHeapifySteps(nodes(1, 2, 3, 4, 5, 6, 7), "max");
    const last = steps[steps.length - 1];
    expect(last.completed).toBe(true);
    expect(values(last.heap)).toEqual([7, 5, 6, 4, 2, 1, 3]);
    expect(last.message).toBe("Heapify terminé, le tas maximum est maintenant valide");
  });

  it("lays out nodes by level", () => {
    const positions = calculateNodePositions(nodes(1, 2, 3));
    expect(positions[0]).toEqual({ x: 0, y: 0 });
    expect(positions[1]).toEqual({ x: -40, y: 70 });
    expect(positions[2]).toEqual({ x: 40, y: 70 });
  });
});
