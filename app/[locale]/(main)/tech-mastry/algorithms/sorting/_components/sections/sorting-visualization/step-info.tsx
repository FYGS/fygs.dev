"use client";

import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";

import type { SortingStep } from "./types";

interface ProgressBarProps {
  currentStepIndex: number;
  stepCount: number;
}

// Barre de progression
export function ProgressBar({ currentStepIndex, stepCount }: ProgressBarProps) {
  return (
    <div className="w-full bg-muted rounded-full h-1.5 mt-2 mb-4">
      <div
        className="bg-primary h-1.5 rounded-full transition-all duration-300 ease-out"
        style={{
          width: `${
            ((currentStepIndex + 1) / Math.max(stepCount, 1)) * 100
          }%`,
        }}
      ></div>
    </div>
  );
}

interface StepInfoProps {
  currentStep: SortingStep;
  currentStepIndex: number;
}

// Informations sur l'étape actuelle
export function StepInfo({ currentStep, currentStepIndex }: StepInfoProps) {
  return (
    <motion.div
      className="bg-muted p-4 rounded-lg"
      key={currentStepIndex}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <p className="text-sm font-medium">{currentStep.message}</p>
      <div className="flex items-center justify-between mt-2">
        <Badge variant="outline">
          Comparaisons: {currentStep.comparisons}
        </Badge>
        <Badge variant="outline">Échanges: {currentStep.swaps}</Badge>
      </div>
    </motion.div>
  );
}
