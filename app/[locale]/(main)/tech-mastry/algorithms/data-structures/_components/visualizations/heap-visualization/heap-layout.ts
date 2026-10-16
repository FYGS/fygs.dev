import type { HeapNode } from "./types";

// Fonction pour calculer les coordonnées des nœuds dans le tas
export const calculateNodePositions = (
  nodes: HeapNode[],
  levelWidth = 80,
  levelHeight = 70
): Record<number, { x: number; y: number }> => {
  const positions: Record<number, { x: number; y: number }> = {};

  for (let i = 0; i < nodes.length; i++) {
    // Calculer le niveau du nœud dans l'arbre
    const level = Math.floor(Math.log2(i + 1));

    // Calculer la position horizontale
    const nodesInLevel = Math.pow(2, level);
    const positionInLevel = i - (Math.pow(2, level) - 1);
    const totalWidth = nodesInLevel * levelWidth;
    const startX = -totalWidth / 2 + levelWidth / 2;
    const x = startX + positionInLevel * levelWidth;

    // Calculer la position verticale
    const y = level * levelHeight;

    positions[i] = { x, y };
  }

  return positions;
};
