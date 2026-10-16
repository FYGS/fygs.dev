import type { BinaryTreeStep, TreeNode } from "./types";

// Générer les étapes pour l'insertion d'une valeur
export function generateInsertSteps(currentRoot: TreeNode | null, valueToInsert: number): BinaryTreeStep[] {
  const steps: BinaryTreeStep[] = [];
  let newRoot = currentRoot
    ? JSON.parse(JSON.stringify(currentRoot))
    : null;

  // Étape initiale
  steps.push({
    root: newRoot,
    activeNodes: [],
    highlightedEdges: [],
    message: `Insertion de la valeur ${valueToInsert}`,
    operation: "insert",
    operationCount: 0,
    targetValue: valueToInsert,
  });

  // Fonction récursive pour insérer une valeur et générer les étapes
  const insertWithSteps = (
    node: TreeNode | null,
    value: number,
    path: TreeNode[] = [],
    operationCount = 1
  ): { node: TreeNode; operationCount: number } => {
    // Si le noeud est null, créer un nouveau noeud
    if (node === null) {
      const newNode: TreeNode = {
        id: `node-${value}-${Date.now()}`,
        value,
        left: null,
        right: null,
      };

      // Ajouter une étape pour la création du nouveau noeud
      steps.push({
        root: newRoot,
        activeNodes: [newNode.id],
        highlightedEdges:
          path.length > 0
            ? [{ from: path[path.length - 1].id, to: newNode.id }]
            : [],
        message: `Création d'un nouveau noeud avec la valeur ${value}`,
        operation: "insert",
        operationCount,
        targetValue: value,
      });

      return { node: newNode, operationCount: operationCount + 1 };
    }

    // Ajouter une étape pour la comparaison avec le noeud actuel
    steps.push({
      root: newRoot,
      activeNodes: [node.id],
      highlightedEdges:
        path.length > 0
          ? [{ from: path[path.length - 1].id, to: node.id }]
          : [],
      message: `Comparaison avec le noeud ${node.value}`,
      operation: "insert",
      operationCount,
      targetValue: value,
    });

    // Mettre à jour le chemin
    const newPath = [...path, node];

    // Insérer dans le sous-arbre gauche ou droit selon la valeur
    if (value < node.value) {
      steps.push({
        root: newRoot,
        activeNodes: [node.id],
        highlightedEdges:
          path.length > 0
            ? [{ from: path[path.length - 1].id, to: node.id }]
            : [],
        message: `${value} < ${node.value}, on va insérer à gauche`,
        operation: "insert",
        operationCount: operationCount + 1,
        targetValue: value,
      });

      const result = insertWithSteps(
        node.left,
        value,
        newPath,
        operationCount + 2
      );
      node.left = result.node;
      return { node, operationCount: result.operationCount };
    } else if (value > node.value) {
      steps.push({
        root: newRoot,
        activeNodes: [node.id],
        highlightedEdges:
          path.length > 0
            ? [{ from: path[path.length - 1].id, to: node.id }]
            : [],
        message: `${value} > ${node.value}, on va insérer à droite`,
        operation: "insert",
        operationCount: operationCount + 1,
        targetValue: value,
      });

      const result = insertWithSteps(
        node.right,
        value,
        newPath,
        operationCount + 2
      );
      node.right = result.node;
      return { node, operationCount: result.operationCount };
    } else {
      // La valeur existe déjà dans l'arbre
      steps.push({
        root: newRoot,
        activeNodes: [node.id],
        highlightedEdges:
          path.length > 0
            ? [{ from: path[path.length - 1].id, to: node.id }]
            : [],
        message: `La valeur ${value} existe déjà dans l'arbre`,
        operation: "insert",
        operationCount: operationCount + 1,
        targetValue: value,
        found: true,
        completed: true,
      });

      return { node, operationCount: operationCount + 2 };
    }
  };

  // Insérer la valeur et générer les étapes
  if (newRoot === null) {
    const newNode: TreeNode = {
      id: `node-${valueToInsert}-${Date.now()}`,
      value: valueToInsert,
      left: null,
      right: null,
    };

    steps.push({
      root: newNode,
      activeNodes: [newNode.id],
      highlightedEdges: [],
      message: `Création du noeud racine avec la valeur ${valueToInsert}`,
      operation: "insert",
      operationCount: 1,
      targetValue: valueToInsert,
      completed: true,
    });

    newRoot = newNode;
  } else {
    const result = insertWithSteps(newRoot, valueToInsert, []);

    // Ajouter une étape finale
    if (!steps[steps.length - 1].completed) {
      steps.push({
        root: newRoot,
        activeNodes: [],
        highlightedEdges: [],
        message: `Insertion de la valeur ${valueToInsert} terminée`,
        operation: "insert",
        operationCount: result.operationCount,
        targetValue: valueToInsert,
        completed: true,
      });
    }
  }

  return steps;
}
