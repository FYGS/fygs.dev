"use client";

import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";
import { getStepExplanation } from "./traversal";
import type { TraversalType, VisualizationState } from "./types";

interface ExplanationPanelProps {
  state: VisualizationState;
  traversalType: TraversalType;
  startNode: string;
}

export function ExplanationPanel({
  state,
  traversalType,
  startNode,
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
        state.currentStep < state.nodeSteps.length ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {getStepExplanation(
                traversalType,
                state.currentStep,
                state.nodeSteps.length,
                state.nodeSteps[state.currentStep]
              )}
            </p>

            {traversalType === "dfs" && (
              <p className="text-xs text-muted-foreground">
                Le parcours en profondeur (DFS) explore un chemin aussi loin
                que possible avant de revenir en arrière (backtracking). Il
                utilise une pile (implicite via la récursion) pour garder
                trace des nœuds à visiter.
              </p>
            )}

            {traversalType === "bfs" && (
              <p className="text-xs text-muted-foreground">
                Le parcours en largeur (BFS) explore tous les voisins
                d&apos;un nœud avant de passer aux nœuds du niveau suivant.
                Il utilise une file d&apos;attente et est idéal pour trouver
                le chemin le plus court dans un graphe non pondéré.
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Cliquez sur Play pour démarrer la visualisation du parcours{" "}
            {traversalType === "dfs"
              ? "en profondeur (DFS)"
              : "en largeur (BFS)"}{" "}
            à partir du nœud {startNode}.
          </p>
        )}

        <div className="mt-2">
          <Badge variant="outline" className="text-xs">
            Progression: {state.currentStep + 1}/{state.nodeSteps.length}
          </Badge>
        </div>
      </motion.div>
  );
}
