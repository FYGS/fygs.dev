import { describe, it, expect } from "vitest";
import {
  deleteNode,
  generateDeleteSteps,
} from "@/app/[locale]/(main)/tech-mastry/algorithms/data-structures/_components/visualizations/binary-tree-visualization/delete-steps";
import type { TreeNode } from "@/app/[locale]/(main)/tech-mastry/algorithms/data-structures/_components/visualizations/binary-tree-visualization/types";
import { generateInsertSteps } from "@/app/[locale]/(main)/tech-mastry/algorithms/data-structures/_components/visualizations/binary-tree-visualization/insert-steps";
import { generateSearchSteps } from "@/app/[locale]/(main)/tech-mastry/algorithms/data-structures/_components/visualizations/binary-tree-visualization/search-steps";
import { generateTraverseSteps } from "@/app/[locale]/(main)/tech-mastry/algorithms/data-structures/_components/visualizations/binary-tree-visualization/traverse-steps";
import { MinHeap } from "@/app/[locale]/(main)/tech-mastry/algorithms/data-structures/_components/visualizations/graph-visualization/min-heap";
import { generateDijkstraSteps } from "@/app/[locale]/(main)/tech-mastry/algorithms/data-structures/_components/visualizations/graph-visualization/graph-algorithms";

function build(values: number[]): TreeNode | null {
  let root: TreeNode | null = null;
  const insert = (node: TreeNode | null, value: number): TreeNode => {
    if (!node) return { id: `n${value}`, value, left: null, right: null };
    if (value < node.value) node.left = insert(node.left, value);
    else if (value > node.value) node.right = insert(node.right, value);
    return node;
  };
  for (const v of values) root = insert(root, v);
  return root;
}

function inorder(node: TreeNode | null, out: number[] = []): number[] {
  if (!node) return out;
  inorder(node.left, out);
  out.push(node.value);
  inorder(node.right, out);
  return out;
}

const preorder = (node: TreeNode | null, out: number[] = []): number[] => {
  if (!node) return out;
  out.push(node.value);
  preorder(node.left, out);
  preorder(node.right, out);
  return out;
};

const VALUES = [50, 30, 70, 20, 40, 60, 80];

describe("BST deleteNode", () => {
  it("removes a leaf", () => {
    const { root, deleted } = deleteNode(build(VALUES), 20);
    expect(deleted).toBe(true);
    expect(preorder(root)).toEqual([50, 30, 40, 70, 60, 80]);
  });

  it("removes a node with one child", () => {
    const tree = build([50, 30, 70, 20]);
    const { root } = deleteNode(tree, 30);
    expect(preorder(root)).toEqual([50, 20, 70]);
  });

  it("removes a node with two children using the in-order successor", () => {
    const { root } = deleteNode(build(VALUES), 50);
    expect(root?.value).toBe(60);
    expect(inorder(root)).toEqual([20, 30, 40, 60, 70, 80]);
    const second = deleteNode(build(VALUES), 70);
    expect(second.root?.right?.value).toBe(80);
    expect(inorder(second.root)).toEqual([20, 30, 40, 50, 60, 80]);
  });

  it("removes the root of a single-node tree and handles missing values", () => {
    expect(deleteNode(build([5]), 5)).toEqual({ root: null, deleted: true });
    const tree = build(VALUES);
    const result = deleteNode(tree, 999);
    expect(result.deleted).toBe(false);
    expect(inorder(result.root)).toEqual([20, 30, 40, 50, 60, 70, 80]);
    expect(deleteNode(null, 1)).toEqual({ root: null, deleted: false });
  });

  it("does not mutate its input", () => {
    const tree = build(VALUES);
    const snapshot = JSON.stringify(tree);
    deleteNode(tree, 50);
    expect(JSON.stringify(tree)).toBe(snapshot);
  });

  it("keeps the BST invariant for every possible deletion", () => {
    for (const v of VALUES) {
      const { root } = deleteNode(build(VALUES), v);
      expect(inorder(root)).toEqual(VALUES.filter((x) => x !== v).sort((a, b) => a - b));
    }
  });
});

describe("generateDeleteSteps", () => {
  it("ends on the same tree as deleteNode, for every value", () => {
    for (const v of [...VALUES, 999]) {
      const steps = generateDeleteSteps(build(VALUES), v);
      const last = steps[steps.length - 1];
      expect(last.completed).toBe(true);
      expect(last.found).toBe(VALUES.includes(v));
      const expected = deleteNode(build(VALUES), v).root;
      expect(inorder(last.root)).toEqual(inorder(expected));
      expect(preorder(last.root)).toEqual(preorder(expected));
    }
  });

  it("explains the two-children case with the successor", () => {
    const messages = generateDeleteSteps(build(VALUES), 50).map((s) => s.message);
    expect(messages.some((m) => m.includes("deux enfants"))).toBe(true);
    expect(messages.some((m) => m.includes("successeur infixe est 60"))).toBe(true);
  });

  it("handles an empty tree", () => {
    const steps = generateDeleteSteps(null, 3);
    expect(steps[steps.length - 1].found).toBe(false);
  });
});

describe("MinHeap", () => {
  it("pops values in ascending order", () => {
    const heap = new MinHeap<number>((a, b) => a - b);
    [5, 3, 8, 1, 9, 2, 7].forEach((v) => heap.push(v));
    expect(heap.size).toBe(7);
    expect(heap.peek()).toBe(1);
    const out: number[] = [];
    while (heap.size > 0) out.push(heap.pop()!);
    expect(out).toEqual([1, 2, 3, 5, 7, 8, 9]);
    expect(heap.pop()).toBeUndefined();
  });

  it("breaks ties by insertion order", () => {
    const heap = new MinHeap<{ k: number; tag: string }>((a, b) => a.k - b.k);
    heap.push({ k: 1, tag: "a" });
    heap.push({ k: 1, tag: "b" });
    heap.push({ k: 0, tag: "c" });
    expect([heap.pop()!.tag, heap.pop()!.tag, heap.pop()!.tag]).toEqual(["c", "a", "b"]);
  });
});

describe("Dijkstra steps (heap based)", () => {
  const nodes = ["A", "B", "C", "D"].map((id, i) => ({ id, label: id, x: i, y: 0 }));
  const edge = (id: string, source: string, target: string, weight: number) => ({
    id,
    source,
    target,
    weight,
    directed: false,
  });
  const edges = [edge("e1", "A", "B", 4), edge("e2", "A", "C", 1), edge("e3", "C", "B", 2), edge("e4", "B", "D", 5)];

  it("finds the shortest path and its total distance", () => {
    const steps = generateDijkstraSteps(nodes, edges, "A", "D", 0);
    const last = steps[steps.length - 1];
    expect(last.completed).toBe(true);
    expect(last.message).toContain("A -> C -> B -> D");
    expect(last.message).toContain("distance totale: 8");
  });

  it("reports when no path exists", () => {
    const isolated = [...nodes, { id: "Z", label: "Z", x: 9, y: 0 }];
    const steps = generateDijkstraSteps(isolated, edges, "A", "Z", 0);
    expect(steps[steps.length - 1].message).toContain("Aucun chemin");
  });
});

describe("binary tree step snapshots (no shared mutable root)", () => {
  const allDistinctRoots = (steps: { root: TreeNode | null }[]) => {
    const roots = steps.map((st) => st.root).filter((r): r is TreeNode => r !== null);
    return new Set(roots).size === roots.length;
  };

  it("insert: earlier steps show the tree before the new node exists", () => {
    const input = build(VALUES);
    const before = JSON.stringify(input);
    const steps = generateInsertSteps(input, 65);
    expect(JSON.stringify(input)).toBe(before);
    expect(allDistinctRoots(steps)).toBe(true);
    expect(inorder(steps[0].root)).toEqual(VALUES.slice().sort((a, b) => a - b));
    const creation = steps.find((st) => st.message.includes("Création d'un nouveau noeud"))!;
    expect(inorder(creation.root)).toContain(65);
    const idx = steps.indexOf(creation);
    expect(inorder(steps[idx - 1].root)).not.toContain(65);
    const last = steps[steps.length - 1];
    expect(last.completed).toBe(true);
    expect(inorder(last.root)).toEqual([...VALUES, 65].sort((a, b) => a - b));
  });

  it("insert: duplicates and empty trees", () => {
    const dup = generateInsertSteps(build(VALUES), 50);
    expect(dup[dup.length - 1].found).toBe(true);
    expect(inorder(dup[dup.length - 1].root)).toEqual(inorder(build(VALUES)));
    const empty = generateInsertSteps(null, 7);
    expect(empty[empty.length - 1].root?.value).toBe(7);
  });

  it("search and traverse never mutate their input and keep the tree intact", () => {
    const input = build(VALUES);
    const snapshot = JSON.stringify(input);
    const search = generateSearchSteps(input, 60);
    const traverse = generateTraverseSteps(input, "inorder");
    expect(JSON.stringify(input)).toBe(snapshot);
    for (const st of [...search, ...traverse]) {
      expect(inorder(st.root)).toEqual(inorder(input));
    }
  });

  it("delete: each step owns its tree and the first step is the original", () => {
    const input = build(VALUES);
    const steps = generateDeleteSteps(input, 50);
    expect(allDistinctRoots(steps)).toBe(true);
    expect(inorder(steps[0].root)).toEqual(inorder(input));
    expect(inorder(steps[steps.length - 1].root)).not.toContain(50);
  });
});
