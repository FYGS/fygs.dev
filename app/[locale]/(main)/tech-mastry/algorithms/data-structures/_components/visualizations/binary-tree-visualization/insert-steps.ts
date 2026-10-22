import type { BinaryTreeStep, TreeNode } from "./types";

const clone = (node: TreeNode | null): TreeNode | null =>
  node ? (JSON.parse(JSON.stringify(node)) as TreeNode) : null;

// Générer les étapes pour l'insertion d'une valeur.
// Chaque étape reçoit son propre instantané de l'arbre (aucune référence
// partagée) : une étape antérieure montre l'arbre tel qu'il était à ce moment.
export function generateInsertSteps(
  currentRoot: TreeNode | null,
  valueToInsert: number,
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
      operation: "insert",
      operationCount,
      targetValue: valueToInsert,
      ...extra,
    });
  };

  push(`Insertion de la valeur ${valueToInsert}`);

  const makeNode = (): TreeNode => ({
    id: `node-${valueToInsert}-${Date.now()}`,
    value: valueToInsert,
    left: null,
    right: null,
  });

  if (work === null) {
    const root = makeNode();
    work = root;
    operationCount = 1;
    push(
      `Création du noeud racine avec la valeur ${valueToInsert}`,
      [root.id],
      [],
      { completed: true },
    );
    return steps;
  }

  let parent: TreeNode | null = null;
  let current: TreeNode = work;

  for (;;) {
    operationCount++;
    const edge = parent ? [{ from: parent.id, to: current.id }] : [];
    push(`Comparaison avec le noeud ${current.value}`, [current.id], edge);

    if (valueToInsert === current.value) {
      operationCount++;
      push(
        `La valeur ${valueToInsert} existe déjà dans l'arbre`,
        [current.id],
        edge,
        { found: true, completed: true },
      );
      return steps;
    }

    const goLeft = valueToInsert < current.value;
    operationCount++;
    push(
      goLeft
        ? `${valueToInsert} < ${current.value}, on va insérer à gauche`
        : `${valueToInsert} > ${current.value}, on va insérer à droite`,
      [current.id],
      edge,
    );

    const next: TreeNode | null = goLeft ? current.left : current.right;
    if (next === null) {
      const created = makeNode();
      if (goLeft) current.left = created;
      else current.right = created;
      operationCount++;
      push(
        `Création d'un nouveau noeud avec la valeur ${valueToInsert}`,
        [created.id],
        [{ from: current.id, to: created.id }],
      );
      break;
    }
    parent = current;
    current = next;
  }

  push(`Insertion de la valeur ${valueToInsert} terminée`, [], [], {
    completed: true,
  });
  return steps;
}
