import { describe, it, expect } from "vitest";
import {
  generateInsertAtSteps,
  generateInsertEndSteps,
  generateInsertStartSteps,
} from "@/app/[locale]/(main)/tech-mastry/algorithms/data-structures/_components/visualizations/array-visualization/insert-steps";
import {
  generateAccessSteps,
  generateSearchSteps,
} from "@/app/[locale]/(main)/tech-mastry/algorithms/data-structures/_components/visualizations/array-visualization/read-steps";
import {
  generateRemoveAtSteps,
  generateRemoveEndSteps,
  generateRemoveStartSteps,
} from "@/app/[locale]/(main)/tech-mastry/algorithms/data-structures/_components/visualizations/array-visualization/remove-steps";

const arr = [10, 20, 30, 40];
const last = <T,>(steps: T[]) => steps[steps.length - 1];

describe("array step generators", () => {
  it("access returns the element or an out-of-range message", () => {
    expect(last(generateAccessSteps(arr, 2))).toMatchObject({ message: "Élément trouvé: 30 à l'index 2", activeIndices: [2], completed: true });
    expect(last(generateAccessSteps(arr, 4)).message).toBe("Index 4 hors limites (0-3)");
  });

  it("search is a linear scan", () => {
    const hit = generateSearchSteps(arr, 30);
    expect(hit.map((s) => s.operationCount)).toEqual([0, 1, 2, 3, 3]);
    expect(last(hit)).toMatchObject({ found: true, message: "Valeur 30 trouvée à l'index 2 après 3 comparaisons" });
    expect(last(generateSearchSteps(arr, 99))).toMatchObject({ found: false, operationCount: 4 });
  });

  it("inserts at the end, at the start and inside", () => {
    expect(last(generateInsertEndSteps(arr, 50)).array).toEqual([10, 20, 30, 40, 50]);
    const start = generateInsertStartSteps(arr, 5);
    expect(start[1].activeIndices).toEqual([0, 1, 2, 3]);
    expect(last(start).array).toEqual([5, 10, 20, 30, 40]);
    const at = generateInsertAtSteps(arr, 25, 2);
    expect(at[1].message).toBe("Décalage des éléments à partir de l'index 2 vers la droite");
    expect(last(at).array).toEqual([10, 20, 25, 30, 40]);
    expect(last(generateInsertAtSteps(arr, 1, 9)).message).toBe("Index 9 invalide (doit être entre 0 et 4)");
  });

  it("removes at the end, at the start and inside", () => {
    expect(last(generateRemoveEndSteps(arr)).array).toEqual([10, 20, 30]);
    expect(last(generateRemoveStartSteps(arr)).array).toEqual([20, 30, 40]);
    const at = generateRemoveAtSteps(arr, 1);
    expect(at.map((s) => s.message)).toEqual([
      "Suppression de l'élément à l'index 1",
      "Suppression de la valeur 20 à l'index 1",
      "Décalage des éléments à partir de l'index 2 vers la gauche",
      "Valeur 20 supprimée",
    ]);
    expect(last(at).array).toEqual([10, 30, 40]);
    expect(last(generateRemoveAtSteps(arr, -1)).message).toBe("Index -1 invalide (doit être entre 0 et 3)");
  });

  it("removing from an empty array is reported and the input is never mutated", () => {
    expect(last(generateRemoveEndSteps([])).message).toBe("Le tableau est vide, aucun élément à supprimer");
    expect(last(generateRemoveStartSteps([])).message).toBe("Le tableau est vide, aucun élément à supprimer");
    generateInsertAtSteps(arr, 1, 1);
    generateRemoveAtSteps(arr, 1);
    expect(arr).toEqual([10, 20, 30, 40]);
  });
});
