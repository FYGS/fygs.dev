import type { BinaryTreeStep, TreeNode } from "./types";

// Générer les étapes pour la recherche d'une valeur
export function generateSearchSteps(currentRoot: TreeNode | null, valueToSearch: number): BinaryTreeStep[] {
  const steps: BinaryTreeStep[] = [];
  const newRoot = currentRoot
    ? JSON.parse(JSON.stringify(currentRoot))
    : null;

  // Étape initiale
  steps.push({
    root: newRoot,
    activeNodes: [],
    highlightedEdges: [],
    message: `Recherche de la valeur ${valueToSearch}`,
    operation: "search",
    operationCount: 0,
    targetValue: valueToSearch,
  });

  if (!newRoot) {
    // Arbre vide
    steps.push({
      root: null,
      activeNodes: [],
      highlightedEdges: [],
      message: `L'arbre est vide, la valeur ${valueToSearch} n'a pas été trouvée`,
      operation: "search",
      operationCount: 1,
      targetValue: valueToSearch,
      found: false,
      completed: true,
    });

    return steps;
  }

  // Fonction récursive pour rechercher une valeur et générer les étapes
  const searchWithSteps = (
    node: TreeNode | null,
    value: number,
    path: TreeNode[] = [],
    operationCount = 1
  ): { found: boolean; operationCount: number } => {
    if (node === null) {
      // Valeur non trouvée
      steps.push({
        root: newRoot,
        activeNodes: [],
        highlightedEdges:
          path.length > 0
            ? [{ from: path[path.length - 1].id, to: "null" }]
            : [],
        message: `Noeud null atteint, la valeur ${value} n'a pas été trouvée`,
        operation: "search",
        operationCount,
        targetValue: value,
        found: false,
        completed: true,
      });

      return { found: false, operationCount: operationCount + 1 };
    }

    // Ajouter une étape pour la visite du noeud actuel
    steps.push({
      root: newRoot,
      activeNodes: [node.id],
      highlightedEdges:
        path.length > 0
          ? [{ from: path[path.length - 1].id, to: node.id }]
          : [],
      message: `Visite du noeud avec la valeur ${node.value}`,
      operation: "search",
      operationCount,
      targetValue: value,
    });

    // Mettre à jour le chemin
    const newPath = [...path, node];

    // Comparer la valeur avec le noeud actuel
    if (value === node.value) {
      // Valeur trouvée
      steps.push({
        root: newRoot,
        activeNodes: [node.id],
        highlightedEdges:
          path.length > 0
            ? [{ from: path[path.length - 1].id, to: node.id }]
            : [],
        message: `Valeur ${value} trouvée !`,
        operation: "search",
        operationCount: operationCount + 1,
        targetValue: value,
        found: true,
        completed: true,
      });

      return { found: true, operationCount: operationCount + 2 };
    } else if (value < node.value) {
      // Rechercher dans le sous-arbre gauche
      steps.push({
        root: newRoot,
        activeNodes: [node.id],
        highlightedEdges:
          path.length > 0
            ? [{ from: path[path.length - 1].id, to: node.id }]
            : [],
        message: `${value} < ${node.value}, on cherche à gauche`,
        operation: "search",
        operationCount: operationCount + 1,
        targetValue: value,
      });

      return searchWithSteps(node.left, value, newPath, operationCount + 2);
    } else {
      // Rechercher dans le sous-arbre droit
      steps.push({
        root: newRoot,
        activeNodes: [node.id],
        highlightedEdges:
          path.length > 0
            ? [{ from: path[path.length - 1].id, to: node.id }]
            : [],
        message: `${value} > ${node.value}, on cherche à droite`,
        operation: "search",
        operationCount: operationCount + 1,
        targetValue: value,
      });

      return searchWithSteps(
        node.right,
        value,
        newPath,
        operationCount + 2
      );
    }
  };

  // Rechercher la valeur et générer les étapes
  searchWithSteps(newRoot, valueToSearch, []);

  return steps;
}
