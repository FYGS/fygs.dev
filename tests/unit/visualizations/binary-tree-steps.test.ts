import { describe, it, expect } from "vitest";
import { generateInsertSteps } from "@/app/[locale]/(main)/tech-mastry/algorithms/data-structures/_components/visualizations/binary-tree-visualization/insert-steps";
import { generateSearchSteps } from "@/app/[locale]/(main)/tech-mastry/algorithms/data-structures/_components/visualizations/binary-tree-visualization/search-steps";
import { generateTraverseSteps } from "@/app/[locale]/(main)/tech-mastry/algorithms/data-structures/_components/visualizations/binary-tree-visualization/traverse-steps";
import { calculateNodePositions } from "@/app/[locale]/(main)/tech-mastry/algorithms/data-structures/_components/visualizations/binary-tree-visualization/tree-layout";
import type { TreeNode } from "@/app/[locale]/(main)/tech-mastry/algorithms/data-structures/_components/visualizations/binary-tree-visualization/types";

const node = (value: number, left: TreeNode | null = null, right: TreeNode | null = null): TreeNode => ({
  id: `n${value}`,
  value,
  left,
  right,
});
// 50 / (30: 20, 40) / (70: 60, 80)
const tree = (): TreeNode =>
  node(50, node(30, node(20), node(40)), node(70, node(60), node(80)));

describe("binary tree step generators", () => {
  it.each([
    ["inorder", [20, 30, 40, 50, 60, 70, 80]],
    ["preorder", [50, 30, 20, 40, 70, 60, 80]],
    ["postorder", [20, 40, 30, 60, 80, 70, 50]],
    ["levelorder", [50, 30, 70, 20, 40, 60, 80]],
  ] as const)("%s traversal visits %j", (type, expected) => {
    const steps = generateTraverseSteps(tree(), type);
    const last = steps[steps.length - 1];
    expect(last.traversalPath).toEqual(expected);
    expect(last.completed).toBe(true);
    expect(last.message).toBe(`Parcours ${type} terminé: [${expected.join(", ")}]`);
    expect(steps).toHaveLength(expected.length + 2);
  });

  it("traversal of an empty tree reports it", () => {
    const steps = generateTraverseSteps(null, "inorder");
    expect(steps.map((s) => s.message)).toEqual([
      "Parcours inorder de l'arbre",
      "L'arbre est vide, aucun parcours possible",
    ]);
  });

  it("search follows the comparisons down to the value", () => {
    const steps = generateSearchSteps(tree(), 40);
    expect(steps.map((s) => s.message)).toEqual([
      "Recherche de la valeur 40",
      "Visite du noeud avec la valeur 50",
      "40 < 50, on cherche à gauche",
      "Visite du noeud avec la valeur 30",
      "40 > 30, on cherche à droite",
      "Visite du noeud avec la valeur 40",
      "Valeur 40 trouvée !",
    ]);
    expect(steps[steps.length - 1]).toMatchObject({ found: true, completed: true });
  });

  it("search reports a missing value", () => {
    const steps = generateSearchSteps(tree(), 45);
    const last = steps[steps.length - 1];
    expect(last.found).toBe(false);
    expect(last.message).toBe("Noeud null atteint, la valeur 45 n'a pas été trouvée");
  });

  it("insert adds the node at the right place without touching the input", () => {
    const original = tree();
    const snapshot = JSON.stringify(original);
    const steps = generateInsertSteps(original, 45);
    expect(JSON.stringify(original)).toBe(snapshot);
    const last = steps[steps.length - 1];
    expect(last).toMatchObject({ completed: true, message: "Insertion de la valeur 45 terminée" });
    expect(last.root?.left?.right?.right?.value).toBe(45);
  });

  it("insert detects duplicates and creates a root in an empty tree", () => {
    const dup = generateInsertSteps(tree(), 30);
    expect(dup[dup.length - 1]).toMatchObject({ found: true, message: "La valeur 30 existe déjà dans l'arbre" });
    const empty = generateInsertSteps(null, 7);
    expect(empty[empty.length - 1].message).toBe("Création du noeud racine avec la valeur 7");
    expect(empty[empty.length - 1].root?.value).toBe(7);
  });

  it("lays out nodes level by level", () => {
    const positions = calculateNodePositions(tree());
    expect(positions.n50.y).toBe(0);
    expect(positions.n30.y).toBe(80);
    expect(positions.n20.y).toBe(160);
    expect(Object.keys(positions)).toHaveLength(7);
  });
});
