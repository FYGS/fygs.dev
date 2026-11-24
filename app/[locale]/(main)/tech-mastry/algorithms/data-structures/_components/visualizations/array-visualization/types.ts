// Types d'opérations
export type OperationType =
  | "access"
  | "search"
  | "insertEnd"
  | "insertStart"
  | "insertAt"
  | "removeEnd"
  | "removeStart"
  | "removeAt";

// Interface pour une étape de visualisation
export interface ArrayStep {
  array: number[];
  activeIndices: number[];
  message: string;
  operation: OperationType;
  operationCount: number;
  targetValue?: number;
  targetIndex?: number;
  found?: boolean;
  completed?: boolean;
}
