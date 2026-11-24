import type { HeapNode, HeapType } from "./types";

// Fonction pour faire descendre un nœud dans le tas
export function siftDown(
  nodes: HeapNode[],
  start: number,
  end: number,
  type: HeapType
): void {
  let root = start;

  while (2 * root + 1 < end) {
    const child = 2 * root + 1;
    let swap = root;

    // Comparer avec le fils gauche
    if (
      type === "max"
        ? nodes[swap].value < nodes[child].value
        : nodes[swap].value > nodes[child].value
    ) {
      swap = child;
    }

    // Comparer avec le fils droit si existe
    if (
      child + 1 < end &&
      (type === "max"
        ? nodes[swap].value < nodes[child + 1].value
        : nodes[swap].value > nodes[child + 1].value)
    ) {
      swap = child + 1;
    }

    // Si pas besoin d'échanger, on a terminé
    if (swap === root) {
      break;
    }

    // Échanger les nœuds
    [nodes[root], nodes[swap]] = [nodes[swap], nodes[root]];
    root = swap;
  }
}

// Fonction pour heapify un tableau
export function heapify(nodes: HeapNode[], type: HeapType): HeapNode[] {
  const result = [...nodes];

  // Heapify de bas en haut
  for (let i = Math.floor(result.length / 2) - 1; i >= 0; i--) {
    siftDown(result, i, result.length, type);
  }

  return result;
}
