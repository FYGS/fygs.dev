"use client";

import { ScrollArea } from "@/components/ui/scroll-area";

import type { SortingStep, SortingTab } from "./types";

interface SortingBarsProps {
  currentStep: SortingStep;
  activeTab: SortingTab;
  arrayLength: number;
  currentStepIndex: number;
}

export function SortingBars({
  currentStep,
  activeTab,
  arrayLength,
  currentStepIndex,
}: SortingBarsProps) {
  // Calculer la hauteur maximale pour la visualisation
  const maxValue = Math.max(
    ...(currentStep.array.length > 0 ? currentStep.array : [1])
  );

  return (
    <ScrollArea className="h-[400px] border rounded-lg p-4">
      <div className="flex items-end justify-around h-[350px] gap-2">
        {currentStep.array.map((value, index) => {
          // Déterminer la couleur de la barre avec une palette plus riche
          let bgColor = "bg-slate-300";
          let borderColor = "border-slate-400";
          let textColor = "text-slate-700";
          let glow = "";

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
          // Élément pivot (pour le tri rapide)
          else if (currentStep.pivotIndex === index) {
            bgColor = "bg-yellow-500";
            borderColor = "border-yellow-600";
            textColor = "text-white font-medium";
            glow = "shadow-md shadow-yellow-300/50";
          }
          // Éléments dans un sous-tableau (pour le tri fusion)
          else if (
            currentStep.subArrays?.some(
              (subArray) =>
                index >= subArray.start && index <= subArray.end
            )
          ) {
            const subArray = currentStep.subArrays.find(
              (subArray) =>
                index >= subArray.start && index <= subArray.end
            );

            if (subArray?.color === "bg-blue-500/20") {
              bgColor = "bg-blue-400";
              borderColor = "border-blue-500";
              textColor = "text-blue-900";
            } else if (subArray?.color === "bg-green-500/20") {
              bgColor = "bg-green-400";
              borderColor = "border-green-500";
              textColor = "text-green-900";
            } else if (subArray?.color === "bg-purple-500/20") {
              bgColor = "bg-purple-400";
              borderColor = "border-purple-500";
              textColor = "text-purple-900";
            } else {
              bgColor = subArray?.color || bgColor;
            }
          }
          // Éléments triés (pour le tri à bulles)
          else if (
            activeTab === "bubble" &&
            index >= arrayLength - currentStepIndex / 2
          ) {
            bgColor = "bg-green-400";
            borderColor = "border-green-500";
            textColor = "text-green-900";
          }

          // Calculer la hauteur de la barre
          const height = (value / maxValue) * 100;

          return (
            <div key={index} className="flex flex-col items-center">
              <div
                className={`w-8 ${bgColor} ${glow} border ${borderColor} rounded-t transition-all duration-500 ease-in-out transform hover:scale-110`}
                style={{ height: `${height}%` }}
                title={`Valeur: ${value}${
                          currentStep.activeIndices.includes(index)
                            ? " (En cours de traitement)"
                            : currentStep.pivotIndex === index
                            ? " (Pivot)"
                            : ""
                        }`}
              ></div>
              <span className={`text-xs mt-1 ${textColor}`}>
                {value}
              </span>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
