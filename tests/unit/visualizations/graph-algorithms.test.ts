import { describe, it, expect } from "vitest";
import {
  generateBfsSteps,
  generateDfsSteps,
  generateDijkstraSteps,
} from "@/app/[locale]/(main)/tech-mastry/algorithms/data-structures/_components/visualizations/graph-visualization/graph-algorithms";
import type {
  GraphEdge,
  GraphNode,
} from "@/app/[locale]/(main)/tech-mastry/algorithms/data-structures/_components/visualizations/graph-visualization/types";

const nodes: GraphNode[] = ["A", "B", "C", "D", "E"].map((label, i) => ({
  id: label.toLowerCase(),
  label,
  x: 50 + i * 40,
  y: 50,
}));
const edge = (id: string, source: string, target: string, weight: number): GraphEdge => ({
  id,
  source,
  target,
  weight,
  directed: false,
});
const edges: GraphEdge[] = [
  edge("ab", "a", "b", 4),
  edge("ac", "a", "c", 1),
  edge("cb", "c", "b", 2),
  edge("bd", "b", "d", 5),
];

describe("graph step generators", () => {
  it("BFS visits neighbours level by level and reports the order", () => {
    const steps = generateBfsSteps(nodes, edges, "a", 3);
    expect(steps.map((s) => s.visitedNodeIds.join(""))).toEqual(["a", "ab", "abc", "abcd", "abcd"]);
    expect(steps.map((s) => s.operationCount)).toEqual([4, 5, 6, 7, 8]);
    const last = steps[steps.length - 1];
    expect(last.completed).toBe(true);
    expect(last.message).toBe("Parcours en largeur (BFS) terminé. Ordre de visite: A -> B -> C -> D");
  });

  it("DFS goes deep first", () => {
    const steps = generateDfsSteps(nodes, edges, "a", 0);
    const last = steps[steps.length - 1];
    expect(last.visitedNodeIds).toEqual(["a", "b", "c", "d"]);
    expect(last.message).toBe("Parcours en profondeur (DFS) terminé. Ordre de visite: A -> B -> C -> D");
    expect(steps[0].visitedNodeIds).toEqual([]);
  });

  it("Dijkstra finds the cheapest path", () => {
    const steps = generateDijkstraSteps(nodes, edges, "a", "d", 0);
    const last = steps[steps.length - 1];
    expect(last.completed).toBe(true);
    expect(last.activeNodeIds).toEqual(["a", "c", "b", "d"]);
    expect(last.message).toContain("A -> C -> B -> D (distance totale: 8)");
  });

  it("Dijkstra reports an unreachable target", () => {
    const steps = generateDijkstraSteps(nodes, edges, "a", "e", 0);
    expect(steps[steps.length - 1].message).toBe('Aucun chemin trouvé entre "A" et "E"');
  });

  it("does not mutate its inputs", () => {
    const n = JSON.stringify(nodes);
    const e = JSON.stringify(edges);
    generateBfsSteps(nodes, edges, "a", 0);
    generateDfsSteps(nodes, edges, "a", 0);
    generateDijkstraSteps(nodes, edges, "a", "d", 0);
    expect(JSON.stringify(nodes)).toBe(n);
    expect(JSON.stringify(edges)).toBe(e);
  });
});
