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
      stats.push({ label: "Complexité", value: "O(n)" });
      stats.push({
        label: "Note",
        value: "Liste simplement chaînée sans pointeur tail ; O(1) avec un pointeur tail",
      });
      break;
    case "removeTail":
      stats.push({ label: "Complexité", value: "O(n)" });
      stats.push({
        label: "Note",
        value:
          "Singly : il faut atteindre l'avant-dernier noeud, même avec un pointeur tail ; O(1) en liste doublement chaînée avec tail",
      });
      break;
    case "insertAt":
    case "removeAt":
      stats.push({ label: "Complexité", value: "O(n)" });
      stats.push({
        label: "Note",
        value: "O(n) pour atteindre la position ; le rechaînage seul est O(1) une fois le noeud connu",
      });
      break;
  }

  return stats;
}
