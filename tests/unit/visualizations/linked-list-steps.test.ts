import { describe, it, expect } from "vitest";
import {
  generateInsertAtSteps,
  generateInsertHeadSteps,
  generateInsertTailSteps,
} from "@/app/[locale]/(main)/tech-mastry/algorithms/data-structures/_components/visualizations/linked-list-visualization/insert-steps";
import {
  generateRemoveAtSteps,
  generateRemoveHeadSteps,
  generateRemoveTailSteps,
} from "@/app/[locale]/(main)/tech-mastry/algorithms/data-structures/_components/visualizations/linked-list-visualization/remove-steps";
import {
  generateAccessSteps,
  generateSearchSteps,
} from "@/app/[locale]/(main)/tech-mastry/algorithms/data-structures/_components/visualizations/linked-list-visualization/traversal-steps";
import type { ListNode } from "@/app/[locale]/(main)/tech-mastry/algorithms/data-structures/_components/visualizations/linked-list-visualization/types";

const list: ListNode[] = [10, 20, 30, 40].map((value) => ({ value, id: `n${value}` }));
const values = (nodes: ListNode[]) => nodes.map((n) => n.value);
const lastOf = <T,>(steps: T[]) => steps[steps.length - 1];

describe("linked list step generators", () => {
  it("access walks to the index", () => {
    const steps = generateAccessSteps(list, 2);
    expect(steps.map((s) => s.message)).toEqual([
      "Accès à l'élément à l'index 2",
      "Parcours du nœud à l'index 0",
      "Parcours du nœud à l'index 1",
      "Élément trouvé à l'index 2: 30",
    ]);
    expect(lastOf(steps).completed).toBe(true);
  });

  it("access rejects an out of range index", () => {
    expect(lastOf(generateAccessSteps(list, 9)).message).toBe("Index 9 hors limites (0-3)");
  });

  it("search reports found and not found", () => {
    const hit = lastOf(generateSearchSteps(list, 30));
    expect(hit).toMatchObject({ found: true, operationCount: 3, message: "Valeur 30 trouvée à l'index 2 après 3 comparaisons" });
    const miss = lastOf(generateSearchSteps(list, 99));
    expect(miss).toMatchObject({ found: false, operationCount: 4, message: "Valeur 99 non trouvée après 4 comparaisons" });
  });

  it("inserts at the head, the tail and inside", () => {
    expect(values(lastOf(generateInsertHeadSteps(list, 5)).nodes)).toEqual([5, 10, 20, 30, 40]);
    expect(values(lastOf(generateInsertTailSteps(list, 50)).nodes)).toEqual([10, 20, 30, 40, 50]);
    expect(values(lastOf(generateInsertAtSteps(list, 25, 2)).nodes)).toEqual([10, 20, 25, 30, 40]);
    // special cases delegate to head / tail
    expect(lastOf(generateInsertAtSteps(list, 1, 0)).message).toBe("Valeur 1 insérée en tête de liste");
    expect(lastOf(generateInsertAtSteps(list, 1, 4)).message).toBe("Valeur 1 insérée en queue de liste");
    expect(lastOf(generateInsertAtSteps(list, 1, 7)).message).toBe("Index 7 invalide (doit être entre 0 et 4)");
  });

  it("removes at the head, the tail and inside", () => {
    expect(values(lastOf(generateRemoveHeadSteps(list)).nodes)).toEqual([20, 30, 40]);
    expect(values(lastOf(generateRemoveTailSteps(list)).nodes)).toEqual([10, 20, 30]);
    expect(values(lastOf(generateRemoveAtSteps(list, 1)).nodes)).toEqual([10, 30, 40]);
    expect(lastOf(generateRemoveAtSteps(list, 0)).message).toBe("Nœud avec la valeur 10 supprimé de la tête de liste");
    expect(lastOf(generateRemoveAtSteps(list, 3)).message).toBe("Nœud avec la valeur 40 supprimé de la queue de liste");
    expect(lastOf(generateRemoveAtSteps(list, -1)).message).toBe("Index -1 invalide (doit être entre 0 et 3)");
  });

  it("removing from an empty list is reported", () => {
    expect(lastOf(generateRemoveHeadSteps([])).message).toBe("La liste est vide, aucun nœud à supprimer");
    expect(lastOf(generateRemoveTailSteps([])).message).toBe("La liste est vide, aucun nœud à supprimer");
  });

  it("never mutates the input list", () => {
    const snapshot = JSON.stringify(list);
    generateInsertAtSteps(list, 1, 2);
    generateRemoveAtSteps(list, 2);
    expect(JSON.stringify(list)).toBe(snapshot);
  });
});
