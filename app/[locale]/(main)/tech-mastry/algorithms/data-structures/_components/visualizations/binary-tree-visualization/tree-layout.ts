import type { TreeNode } from "./types";

// Fonction pour calculer les coordonnées des nœuds dans l'arbre
export const calculateNodePositions = (
  node: TreeNode | null,
  level = 0,
  position = 0,
  positions: Record<string, { x: number; y: number }> = {},
  levelWidths: Record<number, number> = {},
  nodeSpacing = 60,
  levelHeight = 80
) => {
  if (!node) return positions;

  // Mettre à jour le nombre de nœuds à ce niveau
  levelWidths[level] = (levelWidths[level] || 0) + 1;

  // Calculer les positions des enfants d'abord
  calculateNodePositions(
    node.left,
    level + 1,
    position * 2,
    positions,
    levelWidths,
    nodeSpacing,
    levelHeight
  );
  calculateNodePositions(
    node.right,
    level + 1,
    position * 2 + 1,
    positions,
    levelWidths,
    nodeSpacing,
    levelHeight
  );

  // Calculer la position horizontale en fonction du niveau et de la position
  const horizontalSpacing = nodeSpacing * Math.pow(2, Math.max(0, 4 - level));
  const x = position * horizontalSpacing;
  const y = level * levelHeight;

  positions[node.id] = { x, y };

  return positions;
};
