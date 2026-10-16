import type { LinkedListStep } from "./types";

// Obtenir les statistiques pour l'étape actuelle
export function getListStats(currentStep: LinkedListStep) {
  const stats: { label: string; value: string | number }[] = [
    { label: "Opérations", value: currentStep.operationCount },
  ];

  // Ajouter des statistiques spécifiques à l'opération
  switch (currentStep.operation) {
    case "access":
    case "search":
      stats.push({ label: "Complexité", value: "O(n)" });
      break;
    case "insertHead":
    case "removeHead":
      stats.push({ label: "Complexité", value: "O(1)" });
      break;
    case "insertTail":
    case "removeTail":
      stats.push({ label: "Complexité", value: "O(n)" });
      break;
    case "insertAt":
    case "removeAt":
      stats.push({ label: "Complexité", value: "O(n)" });
      break;
  }

  return stats;
}
