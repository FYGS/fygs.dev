import type { SortingStep } from "./types";

export interface BarStyle {
  bgColor: string;
  borderColor: string;
  textColor: string;
  glow: string;
}

// Déterminer la couleur de la barre
export function getBarStyle(currentStep: SortingStep, index: number): BarStyle {
  let bgColor = "bg-slate-300";
  let borderColor = "border-slate-400";
  let textColor = "text-slate-700";
  let glow = "";

  // Vérifier si l'indice fait partie d'un sous-tableau
  if (currentStep.subArrays) {
    for (const subArray of currentStep.subArrays) {
      if (index >= subArray.start && index <= subArray.end) {
        switch (subArray.color) {
          case "blue":
            bgColor = "bg-blue-300";
            borderColor = "border-blue-400";
            break;
          case "green":
            bgColor = "bg-green-300";
            borderColor = "border-green-400";
            break;
          case "purple":
            bgColor = "bg-purple-300";
            borderColor = "border-purple-400";
            break;
          case "orange":
            bgColor = "bg-orange-300";
            borderColor = "border-orange-400";
            break;
          case "red":
            bgColor = "bg-red-300";
            borderColor = "border-red-400";
            break;
        }
      }
    }
  }

  // Éléments actifs (en cours de comparaison ou d'échange)
  if (currentStep.activeIndices.includes(index)) {
    if (currentStep.activeIndices.length === 2) {
      // Si deux éléments sont actifs, les différencier
      if (index === currentStep.activeIndices[0]) {
        bgColor = "bg-blue-500";
        borderColor = "border-blue-600";
        textColor = "text-white font-medium";
        glow = "shadow-md shadow-blue-300/50";
      } else {
        bgColor = "bg-purple-500";
        borderColor = "border-purple-600";
        textColor = "text-white font-medium";
        glow = "shadow-md shadow-purple-300/50";
      }
    } else {
      // Un seul élément actif
      bgColor = "bg-primary";
      borderColor = "border-primary-600";
      textColor = "text-white font-medium";
      glow = "shadow-md shadow-primary/50";
    }
  }
  // Éléments triés
  else if (currentStep.sortedIndices?.includes(index)) {
    bgColor = "bg-green-400";
    borderColor = "border-green-500";
    textColor = "text-green-900 font-medium";
  }

  // Pivot pour le tri rapide
  if (currentStep.pivotIndex === index) {
    bgColor = "bg-amber-500";
    borderColor = "border-amber-600";
    textColor = "text-white font-bold";
    glow = "shadow-md shadow-amber-300/50";
  }

  return { bgColor, borderColor, textColor, glow };
}
