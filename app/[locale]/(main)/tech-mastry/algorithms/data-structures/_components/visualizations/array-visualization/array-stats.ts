import type { ArrayStep } from "./types";

// Obtenir les statistiques pour l'étape actuelle
export function getArrayStats(currentStep: ArrayStep) {
  const stats: { label: string; value: string | number }[] = [
    { label: "Opérations", value: currentStep.operationCount },
  ];

  // Ajouter des statistiques spécifiques à l'opération
  switch (currentStep.operation) {
    case "access":
      stats.push({ label: "Complexité", value: "O(1)" });
      break;
    case "search":
      stats.push({ label: "Complexité", value: "O(n)" });
      break;
    case "insertEnd":
      stats.push({ label: "Complexité", value: "O(1) amorti" });
      stats.push({
        label: "Note",
        value: "Une réallocation occasionnelle coûte O(n)",
      });
      break;
    case "insertStart":
    case "insertAt":
      stats.push({ label: "Complexité", value: "O(n)" });
      break;
    case "removeEnd":
      stats.push({ label: "Complexité", value: "O(1)" });
      break;
    case "removeStart":
    case "removeAt":
      stats.push({ label: "Complexité", value: "O(n)" });
      break;
  }

  return stats;
}
