// Types d'opérations
export type OperationType = "insert" | "extractMax" | "heapify" | "clear";
export type HeapType = "max" | "min";

// Interface pour un nœud de tas
export interface HeapNode {
  id: string;
  value: number;
}

// Interface pour une étape de visualisation
export interface HeapStep {
  heap: HeapNode[];
  activeIndices: number[];
  swappedIndices: [number, number] | null;
  message: string;
  operation: OperationType;
  heapType: HeapType;
  operationCount: number;
  targetValue?: number;
  completed?: boolean;
}
