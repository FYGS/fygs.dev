import { describe, it, expect } from "vitest";
import { createSampleTree } from "@/app/[locale]/(main)/tech-mastry/data-structures/trees/_components/binary-tree/data";
import { calculatePositions } from "@/app/[locale]/(main)/tech-mastry/data-structures/trees/_components/binary-tree/layout";
import {
  getStepExplanation,
  getTraversalSteps,
  resetTreeHighlights,
  updateTreeHighlights,
} from "@/app/[locale]/(main)/tech-mastry/data-structures/trees/_components/binary-tree/traversal";
import { reducer } from "@/app/[locale]/(main)/tech-mastry/data-structures/trees/_components/binary-tree/reducer";
import type { VisualizationState } from "@/app/[locale]/(main)/tech-mastry/data-structures/trees/_components/binary-tree/types";

describe("binary tree logic", () => {
  const tree = calculatePositions(createSampleTree());
  const values = (type: Parameters<typeof getTraversalSteps>[1]) => getTraversalSteps(tree, type).map((n) => n.value);

  it("produces the four classic traversals of the sample tree", () => {
    expect(values("inorder")).toEqual([20, 30, 40, 50, 60, 70, 80]);
    expect(values("preorder")).toEqual([50, 30, 20, 40, 70, 60, 80]);
    expect(values("postorder")).toEqual([20, 40, 30, 60, 80, 70, 50]);
    expect(values("levelorder")).toEqual([50, 30, 70, 20, 40, 60, 80]);
    expect(getTraversalSteps(null, "inorder")).toEqual([]);
  });

  it("spaces the nodes symmetrically around the root", () => {
    expect(tree).toMatchObject({ x: 0, y: 0 });
    expect(tree?.left?.y).toBe(85);
    expect(tree?.left?.x).toBeCloseTo(-(tree?.right?.x ?? 0));
    expect(tree?.left?.left?.y).toBe(170);
  });

  it("highlights the current node and keeps the visited ones", () => {
    const steps = getTraversalSteps(tree, "inorder");
    const updated = updateTreeHighlights(tree, 2, steps);
    expect(updated?.left?.highlighted).toBe(false);
    expect(updated?.left?.right?.highlighted).toBe(true);
    expect(updated?.left?.left?.visited).toBe(true);
    expect(updated?.right?.visited).toBe(false);
    expect(updateTreeHighlights(tree, -1, steps)).toBe(tree);
    const reset = resetTreeHighlights(updated);
    expect(reset?.left?.right?.highlighted).toBe(false);
    expect(reset?.left?.left?.visited).toBe(false);
  });

  it("explains each step in French", () => {
    const node = tree!;
    expect(getStepExplanation("levelorder", 0, 7, node)).toBe("Parcours par niveau: Visite du nœud 50 (étape 1/7)");
    expect(getStepExplanation("inorder", 3, 7, node)).toBe("Parcours inordre (gauche → racine → droite): Visite du nœud 50 (étape 4/7)");
    expect(getStepExplanation("inorder", 3, 7, null)).toBe("");
  });

  it("reducer keeps the step inside the traversal", () => {
    const base: VisualizationState = { tree: null, traversalSteps: [tree!, tree!], currentStep: -1, isPlaying: false, speed: 1, initialized: true };
    expect(reducer(base, { type: "STEP_FORWARD" }).currentStep).toBe(0);
    const end = { ...base, currentStep: 1 };
    expect(reducer(end, { type: "STEP_FORWARD" })).toBe(end);
    expect(reducer(end, { type: "SKIP_TO_END" }).currentStep).toBe(1);
    expect(reducer(end, { type: "STEP_BACKWARD" }).currentStep).toBe(0);
    expect(reducer(base, { type: "SET_SPEED", payload: 2 }).speed).toBe(2);
  });
});
