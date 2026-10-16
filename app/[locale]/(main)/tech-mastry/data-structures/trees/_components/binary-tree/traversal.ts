import { cloneTree } from "./layout";
import type { TraversalType, TreeNode } from "./types";

// Get traversal steps
export const getTraversalSteps = (
  root: TreeNode | null,
  type: TraversalType
): TreeNode[] => {
  if (!root) return [];

  const steps: TreeNode[] = [];
  // Clone the root to avoid mutating the original
  const clonedRoot = cloneTree(root);

  const inorder = (node: TreeNode | null) => {
    if (!node) return;
    inorder(node.left);
    steps.push(node);
    inorder(node.right);
  };

  const preorder = (node: TreeNode | null) => {
    if (!node) return;
    steps.push(node);
    preorder(node.left);
    preorder(node.right);
  };

  const postorder = (node: TreeNode | null) => {
    if (!node) return;
    postorder(node.left);
    postorder(node.right);
    steps.push(node);
  };

  const levelorder = (node: TreeNode | null) => {
    if (!node) return;
    const queue: TreeNode[] = [node];

    while (queue.length > 0) {
      const current = queue.shift()!;
      steps.push(current);

      if (current.left) queue.push(current.left);
      if (current.right) queue.push(current.right);
    }
  };

  switch (type) {
    case "inorder":
      inorder(clonedRoot);
      break;
    case "preorder":
      preorder(clonedRoot);
      break;
    case "postorder":
      postorder(clonedRoot);
      break;
    case "levelorder":
      levelorder(clonedRoot);
      break;
  }

  return steps;
};

// Get explanation for each step
export const getStepExplanation = (
  traversalType: TraversalType,
  currentStep: number,
  totalSteps: number,
  currentNode: TreeNode | null
): string => {
  if (!currentNode) return "";

  switch (traversalType) {
    case "inorder":
      return `Parcours inordre (gauche → racine → droite): Visite du nœud ${
        currentNode.value
      } (étape ${currentStep + 1}/${totalSteps})`;
    case "preorder":
      return `Parcours préordre (racine → gauche → droite): Visite du nœud ${
        currentNode.value
      } (étape ${currentStep + 1}/${totalSteps})`;
    case "postorder":
      return `Parcours postordre (gauche → droite → racine): Visite du nœud ${
        currentNode.value
      } (étape ${currentStep + 1}/${totalSteps})`;
    case "levelorder":
      return `Parcours par niveau: Visite du nœud ${currentNode.value} (étape ${
        currentStep + 1
      }/${totalSteps})`;
    default:
      return "";
  }
};

// Reset all highlights in a tree
export const resetTreeHighlights = (node: TreeNode | null): TreeNode | null => {
  if (!node) return null;

  return {
    ...node,
    highlighted: false,
    visited: false,
    left: resetTreeHighlights(node.left),
    right: resetTreeHighlights(node.right),
  };
};

// Update highlights in a tree based on current step
export const updateTreeHighlights = (
  node: TreeNode | null,
  currentStep: number,
  traversalSteps: TreeNode[]
): TreeNode | null => {
  if (!node || currentStep < 0 || currentStep >= traversalSteps.length) {
    return node;
  }

  const nodeToHighlight = traversalSteps[currentStep];

  const highlight = (node: TreeNode | null): TreeNode | null => {
    if (!node) return null;

    const newNode = { ...node };

    if (node.value === nodeToHighlight.value) {
      newNode.highlighted = true;
      newNode.visited = true;
    } else {
      newNode.highlighted = false;
      // Keep visited state for nodes that were previously visited
      newNode.visited =
        currentStep > 0 &&
        traversalSteps
          .slice(0, currentStep)
          .some((step) => step.value === node.value);
    }

    newNode.left = highlight(node.left);
    newNode.right = highlight(node.right);

    return newNode;
  };

  return highlight(cloneTree(node));
};
