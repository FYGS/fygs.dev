import type { BinaryTreeStep, TraversalType, TreeNode } from "./types";

// Générer les étapes pour le parcours de l'arbre
export function generateTraverseSteps(currentRoot: TreeNode | null, type: TraversalType): BinaryTreeStep[] {
  const steps: BinaryTreeStep[] = [];
  const newRoot = currentRoot
    ? JSON.parse(JSON.stringify(currentRoot))
    : null;

  // Étape initiale
  steps.push({
    root: newRoot,
    activeNodes: [],
    highlightedEdges: [],
    message: `Parcours ${type} de l'arbre`,
    operation: "traverse",
    traversalType: type,
    operationCount: 0,
    traversalPath: [],
  });

  if (!newRoot) {
    // Arbre vide
    steps.push({
      root: null,
      activeNodes: [],
      highlightedEdges: [],
      message: `L'arbre est vide, aucun parcours possible`,
      operation: "traverse",
      traversalType: type,
      operationCount: 1,
      traversalPath: [],
      completed: true,
    });

    return steps;
  }

  // Tableau pour stocker le chemin de parcours
  const traversalPath: number[] = [];

  // Implémentation simplifiée pour résoudre la référence circulaire
  // Nous implémenterons les détails dans une étape ultérieure

  // Parcours infixe simple pour démonstration
  const inorderTraversal = (node: TreeNode | null) => {
    if (!node) return;
    inorderTraversal(node.left);
    traversalPath.push(node.value);
    steps.push({
      root: newRoot,
      activeNodes: [node.id],
      highlightedEdges: [],
      message: `Visite du noeud ${node.value}`,
      operation: "traverse",
      traversalType: type,
      operationCount: traversalPath.length,
      traversalPath: [...traversalPath],
    });
    inorderTraversal(node.right);
  };

  // Parcours préfixe simple
  const preorderTraversal = (node: TreeNode | null) => {
    if (!node) return;
    traversalPath.push(node.value);
    steps.push({
      root: newRoot,
      activeNodes: [node.id],
      highlightedEdges: [],
      message: `Visite du noeud ${node.value}`,
      operation: "traverse",
      traversalType: type,
      operationCount: traversalPath.length,
      traversalPath: [...traversalPath],
    });
    preorderTraversal(node.left);
    preorderTraversal(node.right);
  };

  // Parcours postfixe simple
  const postorderTraversal = (node: TreeNode | null) => {
    if (!node) return;
    postorderTraversal(node.left);
    postorderTraversal(node.right);
    traversalPath.push(node.value);
    steps.push({
      root: newRoot,
      activeNodes: [node.id],
      highlightedEdges: [],
      message: `Visite du noeud ${node.value}`,
      operation: "traverse",
      traversalType: type,
      operationCount: traversalPath.length,
      traversalPath: [...traversalPath],
    });
  };

  // Parcours par niveau simple
  const levelOrderTraversal = () => {
    if (!newRoot) return;

    const queue: TreeNode[] = [newRoot];

    while (queue.length > 0) {
      const node = queue.shift()!;
      traversalPath.push(node.value);
      steps.push({
        root: newRoot,
        activeNodes: [node.id],
        highlightedEdges: [],
        message: `Visite du noeud ${node.value}`,
        operation: "traverse",
        traversalType: type,
        operationCount: traversalPath.length,
        traversalPath: [...traversalPath],
      });

      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
  };

  // Exécuter le parcours selon le type sélectionné
  switch (type) {
    case "inorder":
      inorderTraversal(newRoot);
      break;
    case "preorder":
      preorderTraversal(newRoot);
      break;
    case "postorder":
      postorderTraversal(newRoot);
      break;
    case "levelorder":
      levelOrderTraversal();
      break;
  }

  // Ajouter une étape finale
  steps.push({
    root: newRoot,
    activeNodes: [],
    highlightedEdges: [],
    message: `Parcours ${type} terminé: [${traversalPath.join(", ")}]`,
    operation: "traverse",
    traversalType: type,
    operationCount: traversalPath.length + 1,
    traversalPath,
    completed: true,
  });

  return steps;
}
