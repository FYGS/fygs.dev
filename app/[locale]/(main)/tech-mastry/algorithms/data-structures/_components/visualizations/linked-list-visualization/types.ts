// Types d'opérations
export type OperationType =
  | "access"
  | "search"
  | "insertHead"
  | "insertTail"
  | "insertAt"
  | "removeHead"
  | "removeTail"
  | "removeAt";

// Interface pour un nœud de liste chaînée
export interface ListNode {
  value: number;
  id: string; // Pour l'animation stable
}

// Interface pour une étape de visualisation
export interface LinkedListStep {
  nodes: ListNode[];
  activeIndices: number[];
  message: string;
  operation: OperationType;
  operationCount: number;
  targetValue?: number;
  targetIndex?: number;
  found?: boolean;
  completed?: boolean;
}
