import type { HeapStep } from "./types";

// Obtenir les statistiques pour l'étape actuelle
export function getHeapStats(currentStep: HeapStep) {
  const stats: { label: string; value: string | number }[] = [
    { label: "Opérations", value: currentStep.operationCount },
    {
      label: "Type",
      value: currentStep.heapType === "max" ? "Tas maximum" : "Tas minimum",
    },
  ];

  // Ajouter des statistiques spécifiques à l'opération
  switch (currentStep.operation) {
    case "insert":
      stats.push({ label: "Complexité", value: "O(log n)" });
      break;
    case "extractMax":
      stats.push({ label: "Complexité", value: "O(log n)" });
      break;
    case "heapify":
      stats.push({ label: "Complexité", value: "O(n)" });
      break;
    case "clear":
      stats.push({ label: "Complexité", value: "O(1)" });
      break;
  }

  return stats;
}
