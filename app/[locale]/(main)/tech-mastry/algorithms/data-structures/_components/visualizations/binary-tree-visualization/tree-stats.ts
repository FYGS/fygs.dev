import type { BinaryTreeStep } from "./types";

// Obtenir les statistiques pour l'étape actuelle
export function getTreeStats(currentStep: BinaryTreeStep) {
  const stats: { label: string; value: string | number }[] = [
    { label: "Opérations", value: currentStep.operationCount },
  ];

  // Ajouter des statistiques spécifiques à l'opération
  switch (currentStep.operation) {
    case "insert":
    case "search":
    case "delete":
      stats.push({ label: "Complexité", value: "O(log n)*" });
      stats.push({
        label: "Note",
        value: "O(n) dans le pire cas (arbre déséquilibré)",
      });
      break;
    case "traverse":
      stats.push({ label: "Complexité", value: "O(n)" });
      stats.push({
        label: "Type",
        value: currentStep.traversalType || "inorder",
      });
      break;
    case "clear":
      stats.push({ label: "Complexité", value: "O(1)" });
      break;
  }

  return stats;
}
