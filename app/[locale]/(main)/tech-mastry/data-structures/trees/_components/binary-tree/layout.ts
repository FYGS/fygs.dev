import type { TreeNode } from "./types";

// Calculate positions for tree visualization
export const calculatePositions = (
  node: TreeNode | null,
  depth: number = 0,
  position: number = 0,
  horizontalSpacing: number = 100,
  verticalSpacing: number = 85
): TreeNode | null => {
  if (!node) return null;

  // Create a new node to avoid mutating the original
  const newNode = { ...node };

  // Calculate x and y positions
  newNode.x = position * horizontalSpacing;
  newNode.y = depth * verticalSpacing;

  // Calculate positions for children with spacing that scales with depth
  // For deeper levels, we need wider spacing to prevent overlap
  // Using a smaller base (1.6) for more compact horizontal layout
  const spacingFactor = Math.pow(1.6, Math.max(4 - depth, 0));
  const leftSpacing = position - spacingFactor;
  const rightSpacing = position + spacingFactor;

  newNode.left = calculatePositions(
    node.left,
    depth + 1,
    leftSpacing,
    horizontalSpacing,
    verticalSpacing
  );
  newNode.right = calculatePositions(
    node.right,
    depth + 1,
    rightSpacing,
    horizontalSpacing,
    verticalSpacing
  );

  return newNode;
};

// Deep clone a tree to ensure immutability
export const cloneTree = (node: TreeNode | null): TreeNode | null => {
  if (!node) return null;

  return {
    ...node,
    left: cloneTree(node.left),
    right: cloneTree(node.right),
  };
};
