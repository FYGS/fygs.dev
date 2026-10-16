"use client";

import { motion } from "framer-motion";

import type { LinkedListStep } from "./types";

interface ListCanvasProps {
  currentStep: LinkedListStep;
}

export function ListCanvas({ currentStep }: ListCanvasProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="flex flex-wrap justify-center items-center gap-2">
        {currentStep.nodes.map((node, index) => {
          const isActive = currentStep.activeIndices.includes(index);
          const isLast = index === currentStep.nodes.length - 1;
          const isTarget =
            currentStep.targetIndex === index ||
            (currentStep.found && currentStep.targetValue === node.value);

          // Déterminer les couleurs en fonction de l'opération et de l'état
          let borderColor = "border-gray-300";
          let bgColor = "bg-transparent";
          let textColor = "";
          let arrowColor = "bg-gray-300";
          let arrowBorderColor = "border-l-gray-300";

          if (isActive && isTarget) {
            // Élément actif et cible (trouvé)
            borderColor = "border-green-500";
            bgColor = "bg-green-100";
            textColor = "text-green-700";
            arrowColor = "bg-green-500";
            arrowBorderColor = "border-l-green-500";
          } else if (isActive) {
            // Élément actif (en cours d'examen)
            switch (currentStep.operation) {
              case "access":
                borderColor = "border-blue-500";
                bgColor = "bg-blue-100";
                textColor = "text-blue-700";
                arrowColor = "bg-blue-400";
                arrowBorderColor = "border-l-blue-400";
                break;
              case "search":
                borderColor = "border-amber-500";
                bgColor = "bg-amber-100";
                textColor = "text-amber-700";
                arrowColor = "bg-amber-400";
                arrowBorderColor = "border-l-amber-400";
                break;
              case "insertHead":
              case "insertTail":
              case "insertAt":
                borderColor = "border-emerald-500";
                bgColor = "bg-emerald-100";
                textColor = "text-emerald-700";
                arrowColor = "bg-emerald-400";
                arrowBorderColor = "border-l-emerald-400";
                break;
              case "removeHead":
              case "removeTail":
              case "removeAt":
                borderColor = "border-rose-500";
                bgColor = "bg-rose-100";
                textColor = "text-rose-700";
                arrowColor = "bg-rose-400";
                arrowBorderColor = "border-l-rose-400";
                break;
              default:
                borderColor = "border-primary";
                bgColor = "bg-primary/20";
                textColor = "text-primary";
                arrowColor = "bg-primary";
                arrowBorderColor = "border-l-primary";
            }
          } else if (isTarget && !currentStep.found) {
            // Cible recherchée mais pas encore trouvée
            borderColor = "border-purple-500";
            bgColor = "bg-purple-100/50";
            textColor = "text-purple-700";
          }

          return (
            <div key={node.id} className="flex items-center">
              <motion.div
                className={`w-12 h-12 flex items-center justify-center border-2 rounded-md ${borderColor} ${bgColor}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: isActive ? 1.1 : 1,
                  opacity: 1,
                }}
                transition={{ duration: 0.3 }}
              >
                <span className={`text-sm font-medium ${textColor}`}>
                  {node.value}
                </span>
              </motion.div>

              {!isLast && (
                <motion.div
                  className={`w-6 h-0.5 ${arrowColor} mx-1`}
                  initial={{ width: 0 }}
                  animate={{ width: 24 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <motion.div
                    className={`w-0 h-0 border-t-4 border-r-0 border-b-4 border-l-8 border-t-transparent border-b-transparent ${arrowBorderColor}`}
                    style={{ marginLeft: "16px", marginTop: "-3.5px" }}
                  />
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-[52px] text-sm text-muted-foreground mt-4">
        {currentStep.nodes.map((_, index) => (
          <div key={`index-${index}`} className="w-12 text-center">
            {index}
          </div>
        ))}
      </div>
    </div>
  );
}
