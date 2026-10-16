"use client";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

import type { SortingStep, SortingTab } from "./types";

interface StepInfoPanelProps {
  currentStep: SortingStep;
  currentStepIndex: number;
  stepCount: number;
}

export function StepInfoPanel({
  currentStep,
  currentStepIndex,
  stepCount,
}: StepInfoPanelProps) {
  return (
    <div className="bg-muted p-4 rounded-lg">
      <ScrollArea className="h-[80px]">
        <p className="text-sm font-medium">{currentStep.message}</p>
        <div className="flex items-center justify-between mt-2">
          <Badge variant="outline">
            Comparaisons: {currentStep.comparisons}
          </Badge>
          <Badge variant="outline">Échanges: {currentStep.swaps}</Badge>
        </div>
      </ScrollArea>

      {/* Indicateur de progression */}
      <div className="mt-3">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Étape {currentStepIndex + 1}</span>
          <span>Total: {stepCount} étapes</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2.5">
          <div
            className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${
                        ((currentStepIndex + 1) / stepCount) * 100
                      }%`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}

interface TabPanelProps {
  activeTab: SortingTab;
}

export function ComplexityPanel({ activeTab }: TabPanelProps) {
  return (
    <div className="bg-muted p-4 rounded-lg">
      <h3 className="text-sm font-medium mb-2">Complexité</h3>
      <ScrollArea className="h-[120px]">
        <div className="space-y-2 text-sm pr-4">
          <p>
            <span className="font-medium">Temporelle (pire cas):</span>{" "}
            {activeTab === "bubble"
              ? "O(n²) - Chaque élément doit être comparé avec tous les autres."
              : activeTab === "merge"
              ? "O(n log n) - Division et fusion récursives."
              : "O(n²) - Quand le pivot est toujours le plus petit ou le plus grand élément."}
          </p>
          <p>
            <span className="font-medium">Temporelle (moyenne):</span>{" "}
            {activeTab === "bubble"
              ? "O(n²) - Même dans le cas moyen."
              : activeTab === "merge"
              ? "O(n log n) - Stable dans tous les cas."
              : "O(n log n) - Quand les pivots divisent le tableau de manière équilibrée."}
          </p>
          <p>
            <span className="font-medium">Spatiale:</span>{" "}
            {activeTab === "bubble"
              ? "O(1) - Utilise une quantité constante de mémoire."
              : activeTab === "merge"
              ? "O(n) - Nécessite de l'espace supplémentaire pour les tableaux temporaires."
              : "O(log n) - Pour la pile d'appels récursifs."}
          </p>
        </div>
      </ScrollArea>
    </div>
  );
}

export function CharacteristicsPanel({ activeTab }: TabPanelProps) {
  return (
    <div className="bg-muted p-4 rounded-lg">
      <h3 className="text-sm font-medium mb-2">Caractéristiques</h3>
      <ScrollArea className="h-[120px]">
        <div className="space-y-2 text-sm pr-4">
          <p>
            <span className="font-medium">Stabilité:</span>{" "}
            {activeTab === "bubble"
              ? "Stable - Préserve l'ordre relatif des éléments égaux."
              : activeTab === "merge"
              ? "Stable - Préserve l'ordre relatif des éléments égaux."
              : "Non stable - Peut modifier l'ordre relatif des éléments égaux."}
          </p>
          <p>
            <span className="font-medium">In-place:</span>{" "}
            {activeTab === "bubble"
              ? "Oui - Ne nécessite pas de mémoire supplémentaire."
              : activeTab === "merge"
              ? "Non - Nécessite O(n) d'espace supplémentaire."
              : "Oui (version classique) - Nécessite O(log n) pour la pile d'appels."}
          </p>
          <p>
            <span className="font-medium">Adaptatif:</span>{" "}
            {activeTab === "bubble"
              ? "Oui - Peut terminer plus tôt si le tableau est presque trié."
              : activeTab === "merge"
              ? "Non - Effectue toujours le même nombre d'opérations."
              : "Non - Mais peut être optimisé pour être adaptatif."}
          </p>
        </div>
      </ScrollArea>
    </div>
  );
}
