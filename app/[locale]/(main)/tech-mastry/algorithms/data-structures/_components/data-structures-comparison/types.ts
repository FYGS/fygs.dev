// Types de structures de données
export type DataStructureType =
  | "array"
  | "linkedList"
  | "stack"
  | "queue"
  | "hashTable"
  | "binaryTree"
  | "heap"
  | "graph";

// Types d'opérations
export type OperationType =
  | "access"
  | "search"
  | "insertion"
  | "deletion"
  | "traversal"
  | "sorting"
  | "memory"
  | "implementation";

// Interface pour les caractéristiques d'une structure de données
export interface DataStructureInfo {
  name: string;
  description: string;
  operations: Record<
    OperationType,
    {
      complexity: string;
      rating: "good" | "medium" | "bad";
      note?: string;
    }
  >;
  useCases: string[];
  advantages: string[];
  disadvantages: string[];
}
