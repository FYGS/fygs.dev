"use client";

import { motion } from "framer-motion";

import { getBarStyle } from "./bar-style";
import type { SortingStep } from "./types";

interface SortingBarsProps {
  currentStep: SortingStep;
}

export function SortingBars({ currentStep }: SortingBarsProps) {
  // Calculer la hauteur maximale pour la visualisation
  const maxValue = Math.max(
    ...(currentStep.array.length > 0 ? currentStep.array : [1])
  );

  return (
    <div className="h-[400px] border rounded-lg p-4 bg-muted/30 relative">
      <div className="flex items-end justify-around h-[350px] gap-1">
        {currentStep.array.map((value, index) => {
          const { bgColor, borderColor, textColor, glow } = getBarStyle(
            currentStep,
            index
          );

          // Calculer la hauteur de la barre
          const height = (value / maxValue) * 100;

          return (
            <motion.div
              key={index}
              className="flex flex-col items-center"
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: 1,
                transition: {
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  duration: 0.5,
                },
              }}
            >
              <motion.div
                className={`w-8 ${bgColor} ${glow} border ${borderColor} rounded-t`}
                style={{ height: `${height}%` }}
                title={`Valeur: ${value}${
                  currentStep.activeIndices.includes(index)
                    ? " (En cours de traitement)"
                    : ""
                }`}
                whileHover={{ scale: 1.1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                animate={{
                  backgroundColor: currentStep.activeIndices.includes(
                    index
                  )
                    ? "var(--primary)"
                    : currentStep.sortedIndices?.includes(index)
                    ? "var(--green-400)"
                    : "var(--slate-300)",
                  y: currentStep.activeIndices.includes(index) ? -5 : 0,
                  transition: { duration: 0.3 },
                }}
              ></motion.div>
              <motion.span
                className={`text-xs mt-1 ${textColor}`}
                animate={{
                  scale: currentStep.activeIndices.includes(index)
                    ? 1.2
                    : 1,
                  fontWeight: currentStep.activeIndices.includes(index)
                    ? 700
                    : 400,
                  transition: { duration: 0.3 },
                }}
              >
                {value}
              </motion.span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
