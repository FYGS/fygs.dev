"use client";

import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";
import { getStepExplanation } from "./traversal";
import type { TraversalType, VisualizationState } from "./types";

interface ExplanationPanelProps {
  state: VisualizationState;
  traversalType: TraversalType;
}

export function ExplanationPanel({
  state,
  traversalType,
}: ExplanationPanelProps) {
  return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-4 rounded-lg bg-muted/50 border"
      >
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="h-4 w-4 text-yellow-500" />
          <h4 className="font-medium">Explication</h4>
        </div>

        {state.currentStep >= 0 &&
        state.currentStep < state.traversalSteps.length ? (
          <p className="text-sm text-muted-foreground">
            {getStepExplanation(
              traversalType,
              state.currentStep,
              state.traversalSteps.length,
              state.traversalSteps[state.currentStep]
            )}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Cliquez sur Play pour démarrer la visualisation du parcours{" "}
            {traversalType === "inorder" &&
              "inordre (gauche → racine → droite)"}
            {traversalType === "preorder" &&
              "préordre (racine → gauche → droite)"}
            {traversalType === "postorder" &&
              "postordre (gauche → droite → racine)"}
            {traversalType === "levelorder" && "par niveau"}
          </p>
        )}

        <div className="mt-2">
          <Badge variant="outline" className="text-xs">
            Progression: {state.currentStep + 1}/
            {state.traversalSteps.length}
          </Badge>
        </div>
      </motion.div>
  );
}
