// Types d'opérations
export type OperationType = "insert" | "search" | "delete" | "traverse" | "clear";
export type TraversalType = "inorder" | "preorder" | "postorder" | "levelorder";

// Interface pour un nœud d'arbre binaire
export interface TreeNode {
  id: string;
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

// Interface pour une étape de visualisation
export interface BinaryTreeStep {
  root: TreeNode | null;
  activeNodes: string[]; // IDs des nœuds actifs
  highlightedEdges: { from: string; to: string }[];
  message: string;
  operation: OperationType;
  traversalType?: TraversalType;
  operationCount: number;
  targetValue?: number;
  found?: boolean;
  completed?: boolean;
  traversalPath?: number[];
}
