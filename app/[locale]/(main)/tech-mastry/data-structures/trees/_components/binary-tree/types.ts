// Node type for binary tree
export interface TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
  x: number;
  y: number;
  highlighted?: boolean;
  visited?: boolean;
}

// Traversal types
export type TraversalType = "inorder" | "preorder" | "postorder" | "levelorder";

// State type
export interface VisualizationState {
  tree: TreeNode | null;
  traversalSteps: TreeNode[];
  currentStep: number;
  isPlaying: boolean;
  speed: number;
  initialized: boolean;
}

// Action types
export type Action =
  | {
      type: "INITIALIZE";
      payload: { tree: TreeNode | null; steps: TreeNode[] };
    }
  | {
      type: "SET_TRAVERSAL";
      payload: { type: TraversalType; steps: TreeNode[] };
    }
  | { type: "SET_CURRENT_STEP"; payload: number }
  | { type: "PLAY" }
  | { type: "PAUSE" }
  | { type: "RESET" }
  | { type: "STEP_FORWARD" }
  | { type: "STEP_BACKWARD" }
  | { type: "SKIP_TO_END" }
  | { type: "SET_SPEED"; payload: number }
  | { type: "UPDATE_TREE"; payload: TreeNode | null };
