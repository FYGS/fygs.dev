import type { BinaryTreeStep, TreeNode } from "./types";

const clone = (node: TreeNode | null): TreeNode | null =>
  node ? (JSON.parse(JSON.stringify(node)) as TreeNode) : null;

function minNode(node: TreeNode): TreeNode {
  let current = node;
  while (current.left) current = current.left;
  return current;
}

/**
 * Suppression pure dans un BST (ne modifie pas l'arbre reçu).
 * Trois cas : feuille, un seul enfant, deux enfants (successeur infixe =
 * plus petite valeur du sous-arbre droit).
 */
export function deleteNode(
  root: TreeNode | null,
  value: number,
): { root: TreeNode | null; deleted: boolean } {
  if (root === null) return { root: null, deleted: false };

  if (value < root.value) {
    const result = deleteNode(root.left, value);
    return {
      root: result.deleted ? { ...root, left: result.root } : root,
      deleted: result.deleted,
    };
  }
  if (value > root.value) {
    const result = deleteNode(root.right, value);
    return {
      root: result.deleted ? { ...root, right: result.root } : root,
      deleted: result.deleted,
    };
  }

  // value === root.value : le noeud à supprimer
  if (root.left === null) return { root: root.right, deleted: true };
  if (root.right === null) return { root: root.left, deleted: true };

  const successor = minNode(root.right);
  const result = deleteNode(root.right, successor.value);
  return {
    root: { ...root, value: successor.value, right: result.root },
    deleted: true,
  };
}

// Générer les étapes pour la suppression d'une valeur
export function generateDeleteSteps(
  currentRoot: TreeNode | null,
  valueToDelete: number,
): BinaryTreeStep[] {
  const steps: BinaryTreeStep[] = [];
  let work = clone(currentRoot);
  let operationCount = 0;

  const push = (
    message: string,
    activeNodes: string[] = [],
    highlightedEdges: { from: string; to: string }[] = [],
    extra: Partial<BinaryTreeStep> = {},
  ) => {
    steps.push({
      root: clone(work),
      activeNodes,
      highlightedEdges,
      message,
      operation: "delete",
      operationCount,
      targetValue: valueToDelete,
      ...extra,
    });
  };

  push(`Suppression de la valeur ${valueToDelete}`);

  if (!work) {
    operationCount++;
    push(
      `L'arbre est vide, la valeur ${valueToDelete} n'a pas été trouvée`,
      [],
      [],
      { found: false, completed: true },
    );
    return steps;
  }

  // 1. Recherche du noeud à supprimer
  let parent: TreeNode | null = null;
  let isLeftChild = false;
  let node = work as TreeNode | null;
  while (node && node.value !== valueToDelete) {
    operationCount++;
    const goLeft: boolean = valueToDelete < node.value;
    push(
      `Comparaison avec ${node.value} : ${valueToDelete} ${goLeft ? "<" : ">"} ${node.value}, on descend à ${goLeft ? "gauche" : "droite"}`,
      [node.id],
      parent ? [{ from: parent.id, to: node.id }] : [],
    );
    parent = node;
    isLeftChild = goLeft;
    node = goLeft ? node.left : node.right;
  }

  if (!node) {
    operationCount++;
    push(
      `Noeud null atteint, la valeur ${valueToDelete} n'est pas dans l'arbre : rien à supprimer`,
      [],
      [],
      { found: false, completed: true },
    );
    return steps;
  }

  operationCount++;
  push(
    `Noeud ${valueToDelete} trouvé`,
    [node.id],
    parent ? [{ from: parent.id, to: node.id }] : [],
    { found: true },
  );

  const replaceInParent = (child: TreeNode | null) => {
    if (!parent) work = child;
    else if (isLeftChild) parent.left = child;
    else parent.right = child;
  };

  if (!node.left && !node.right) {
    // Cas 1 : feuille
    push(`${valueToDelete} est une feuille : on la retire simplement`, [
      node.id,
    ]);
    replaceInParent(null);
    operationCount++;
  } else if (!node.left || !node.right) {
    // Cas 2 : un seul enfant
    const child: TreeNode = (node.left ?? node.right) as TreeNode;
    push(
      `${valueToDelete} n'a qu'un enfant (${child.value}) : il prend sa place`,
      [node.id, child.id],
      [{ from: node.id, to: child.id }],
    );
    replaceInParent(child);
    operationCount++;
  } else {
    // Cas 3 : deux enfants, remplacement par le successeur infixe
    push(
      `${valueToDelete} a deux enfants : on cherche son successeur infixe (plus petite valeur du sous-arbre droit)`,
      [node.id],
    );
    let successorParent: TreeNode = node;
    let successor: TreeNode = node.right;
    operationCount++;
    push(
      `On part du fils droit ${successor.value}`,
      [successor.id],
      [{ from: node.id, to: successor.id }],
    );
    while (successor.left) {
      const next: TreeNode = successor.left;
      operationCount++;
      push(
        `${next.value} est à gauche de ${successor.value} : on continue à descendre à gauche`,
        [next.id],
        [{ from: successor.id, to: next.id }],
      );
      successorParent = successor;
      successor = next;
    }
    push(`Le successeur infixe est ${successor.value} (plus de fils gauche)`, [
      successor.id,
    ]);

    node.value = successor.value;
    operationCount++;
    push(`La valeur ${successor.value} remplace ${valueToDelete}`, [node.id]);

    // Retirer l'ancien noeud successeur (il n'a au plus qu'un fils droit)
    if (successorParent === node) successorParent.right = successor.right;
    else successorParent.left = successor.right;
    operationCount++;
  }

  push(`Suppression de la valeur ${valueToDelete} terminée`, [], [], {
    found: true,
    completed: true,
  });

  return steps;
}
