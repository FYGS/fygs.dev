// Types d'opérations
export type OperationType = "insert" | "get" | "remove" | "clear" | "resize";

// Interface pour un élément de la table de hachage
export interface HashTableEntry {
  key: string;
  value: string;
  id: string; // Pour l'animation stable
}

// Interface pour un bucket de la table de hachage
export interface HashTableBucket {
  index: number;
  entries: HashTableEntry[];
}

// Interface pour une étape de visualisation
export interface HashTableStep {
  buckets: HashTableBucket[];
  activeIndices: number[];
  activeEntries: string[]; // IDs des entrées actives
  message: string;
  operation: OperationType;
  operationCount: number;
  targetKey?: string;
  targetValue?: string;
  targetIndex?: number;
  found?: boolean;
  completed?: boolean;
}
