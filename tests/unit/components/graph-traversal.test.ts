import { describe, it, expect } from "vitest";
import { createSampleGraph } from "@/app/[locale]/(main)/tech-mastry/data-structures/trees/_components/graph-visualization/data";
import { calculatePositions } from "@/app/[locale]/(main)/tech-mastry/data-structures/trees/_components/graph-visualization/layout";
import {
  getStepExplanation,
  getTraversalSteps,
  resetGraphHighlights,
  updateGraphHighlights,
} from "@/app/[locale]/(main)/tech-mastry/data-structures/trees/_components/graph-visualization/traversal";
import { reducer } from "@/app/[locale]/(main)/tech-mastry/data-structures/trees/_components/graph-visualization/reducer";
import type { VisualizationState } from "@/app/[locale]/(main)/tech-mastry/data-structures/trees/_components/graph-visualization/types";

describe("graph visualization logic", () => {
  const graph = createSampleGraph();

  it("walks the sample graph depth-first and breadth-first", () => {
    const dfs = getTraversalSteps(graph, "A", "dfs");
    expect(dfs.nodes).toEqual(["A", "B", "D", "C", "F", "E", "G"]);
    expect(dfs.edges).toHaveLength(6);
    expect(dfs.edges[0]).toEqual({ source: "A", target: "B" });
    const bfs = getTraversalSteps(graph, "A", "bfs");
    expect(bfs.nodes).toEqual(["A", "B", "C", "E", "D", "F", "G"]);
    expect(bfs.edges).toHaveLength(6);
  });

  it("lays the nodes out deterministically without mutating the input", () => {
    const positioned = calculatePositions(graph);
    expect(graph.nodes.every((n) => n.x === 0 && n.y === 0)).toBe(true);
    expect(positioned.nodes).toHaveLength(7);
    expect(calculatePositions(graph)).toEqual(positioned);
    expect(positioned.nodes.some((n) => n.x !== 0 || n.y !== 0)).toBe(true);
  });

  it("highlights the current node, the visited ones and the last edge", () => {
    const { nodes, edges } = getTraversalSteps(graph, "A", "dfs");
    const updated = updateGraphHighlights(graph, 2, nodes, edges);
    expect(updated.nodes.filter((n) => n.highlighted).map((n) => n.id)).toEqual(["D"]);
    expect(updated.nodes.filter((n) => n.visited).map((n) => n.id)).toEqual(["A", "B", "D"]);
    expect(updated.edges.filter((e) => e.highlighted).map((e) => `${e.source}${e.target}`)).toEqual(["BD"]);
    expect(updated.edges.filter((e) => e.visited)).toHaveLength(2);
    expect(updateGraphHighlights(graph, -1, nodes, edges)).toBe(graph);
    const reset = resetGraphHighlights(updated);
    expect(reset.nodes.every((n) => !n.highlighted && !n.visited)).toBe(true);
  });

  it("explains each step in French", () => {
    expect(getStepExplanation("dfs", 0, 7, "A")).toBe("Parcours en profondeur (DFS): Visite du nœud A (étape 1/7)");
    expect(getStepExplanation("bfs", 2, 7, "C")).toBe("Parcours en largeur (BFS): Visite du nœud C (étape 3/7)");
    expect(getStepExplanation("bfs", 2, 7, null)).toBe("");
  });

  it("reducer clamps stepping and resets on a new traversal", () => {
    const base: VisualizationState = { graph: null, nodeSteps: ["A", "B"], edgeSteps: [], currentStep: -1, isPlaying: true, speed: 1, initialized: true };
    expect(reducer(base, { type: "STEP_FORWARD" }).currentStep).toBe(0);
    const atEnd = { ...base, currentStep: 1 };
    expect(reducer(atEnd, { type: "STEP_FORWARD" })).toBe(atEnd);
    expect(reducer(base, { type: "STEP_BACKWARD" })).toBe(base);
    expect(reducer(base, { type: "SKIP_TO_END" })).toMatchObject({ currentStep: 1, isPlaying: false });
    expect(reducer(atEnd, { type: "SET_TRAVERSAL", payload: { nodeSteps: ["Z"], edgeSteps: [] } })).toMatchObject({ currentStep: -1, isPlaying: false, nodeSteps: ["Z"] });
  });
});
