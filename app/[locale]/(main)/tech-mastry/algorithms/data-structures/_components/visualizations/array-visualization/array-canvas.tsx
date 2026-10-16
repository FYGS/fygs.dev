"use client";

import { motion } from "framer-motion";

import type { ArrayStep } from "./types";

interface ArrayCanvasProps {
  currentStep: ArrayStep;
}

export function ArrayCanvas({ currentStep }: ArrayCanvasProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="flex flex-wrap justify-center gap-1 mb-8">
        {currentStep.array.map((value, index) => {
          const isActive = currentStep.activeIndices.includes(index);
          const isTarget =
            currentStep.targetIndex === index ||
            (currentStep.found && currentStep.targetValue === value);

          // Déterminer les couleurs en fonction de l'opération et de l'état
          let borderColor = "border-gray-300";
          let bgColor = "bg-transparent";
          let textColor = "";

          if (isActive && isTarget) {
            // Élément actif et cible (trouvé)
            borderColor = "border-green-500";
            bgColor = "bg-green-100";
            textColor = "text-green-700";
          } else if (isActive) {
            // Élément actif (en cours d'examen)
            switch (currentStep.operation) {
              case "access":
                borderColor = "border-blue-500";
                bgColor = "bg-blue-100";
                textColor = "text-blue-700";
                break;
              case "search":
                borderColor = "border-amber-500";
                bgColor = "bg-amber-100";
                textColor = "text-amber-700";
                break;
              case "insertEnd":
              case "insertStart":
              case "insertAt":
                borderColor = "border-emerald-500";
                bgColor = "bg-emerald-100";
                textColor = "text-emerald-700";
                break;
              case "removeEnd":
              case "removeStart":
              case "removeAt":
                borderColor = "border-rose-500";
                bgColor = "bg-rose-100";
                textColor = "text-rose-700";
                break;
              default:
                borderColor = "border-primary";
                bgColor = "bg-primary/20";
                textColor = "text-primary";
            }
          } else if (isTarget && !currentStep.found) {
            // Cible recherchée mais pas encore trouvée
            borderColor = "border-purple-500";
            bgColor = "bg-purple-100/50";
            textColor = "text-purple-700";
          }

          return (
            <motion.div
              key={`${index}-${value}`}
              className={`w-12 h-12 flex items-center justify-center border-2 rounded-md ${borderColor} ${bgColor}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: isActive ? 1.1 : 1,
                opacity: 1,
              }}
              transition={{ duration: 0.3 }}
            >
              <span className={`text-sm font-medium ${textColor}`}>
                {value}
              </span>
            </motion.div>
          );
        })}
      </div>

      <div className="flex gap-2 text-sm text-muted-foreground">
        {currentStep.array.map((_, index) => (
          <div key={`index-${index}`} className="w-12 text-center">
            {index}
          </div>
        ))}
      </div>
    </div>
  );
}
