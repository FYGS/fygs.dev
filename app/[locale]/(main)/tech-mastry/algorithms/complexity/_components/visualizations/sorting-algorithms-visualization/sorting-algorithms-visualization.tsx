"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useMemo, useRef, useState } from "react";
import { useClientValue } from "../../../../../_hooks/use-client-value";
import { AlgorithmTabs } from "./algorithm-tabs";
import { PlaybackControls, SizeControl } from "./controls";
import {
  CharacteristicsPanel,
  ComplexityPanel,
  StepInfoPanel,
} from "./info-panels";
import { SortingBars } from "./sorting-bars";
import { generateSortingSteps } from "./steps";
import type { SortingStep } from "./types";

const NO_ITEMS: number[] = [];

// Générer un tableau aléatoire
function randomArray(size: number): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 1);
}

export function SortingAlgorithmsVisualization() {
  const [arraySize, setArraySize] = useState(15);
  // Le tableau aléatoire n'existe que côté client (pas de décalage d'hydratation)
  const initialArray = useClientValue(() => randomArray(15));
  const [generatedArray, setArray] = useState<number[] | null>(null);
  const array = generatedArray ?? initialArray ?? NO_ITEMS;
  const [activeTab, setActiveTab] = useState<"bubble" | "merge" | "quick">(
    "bubble"
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.5);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Les étapes dérivent du tableau et de l'onglet actif
  const steps: SortingStep[] = useMemo(
    () => generateSortingSteps(activeTab, array),
    [activeTab, array]
  );

  // Réinitialiser la visualisation
  const handleReset = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  // Un nouveau tableau (ou une nouvelle taille) réinitialise la visualisation
  const generateArray = (size = arraySize) => {
    setArray(randomArray(size));
    handleReset();
  };

  const handleArraySizeChange = (size: number) => {
    setArraySize(size);
    generateArray(size);
  };

  const handleTabChange = (tab: "bubble" | "merge" | "quick") => {
    setActiveTab(tab);
    handleReset();
  };

  // Passer à l'étape suivante
  const handleStepForward = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      setIsPlaying(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Revenir à l'étape précédente
  const handleStepBackward = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  // Démarrer la lecture automatique
  const handlePlay = () => {
    setIsPlaying(true);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setCurrentStepIndex((prevIndex) => {
        if (prevIndex < steps.length - 1) {
          return prevIndex + 1;
        } else {
          setIsPlaying(false);
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return prevIndex;
        }
      });
    }, 1000 / speed);
  };

  // Mettre en pause la lecture automatique
  const handlePause = () => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Nettoyer le timer lors du démontage du composant
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Obtenir l'étape actuelle
  const currentStep = steps[currentStepIndex] || {
    type: activeTab,
    array: [],
    activeIndices: [],
    comparisons: 0,
    swaps: 0,
    message: "",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visualisation des Algorithmes de Tri</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <AlgorithmTabs activeTab={activeTab} onTabChange={handleTabChange} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <SizeControl
              arraySize={arraySize}
              onArraySizeChange={handleArraySizeChange}
              onGenerate={() => generateArray()}
            />

            <PlaybackControls
              currentStepIndex={currentStepIndex}
              stepCount={steps.length}
              isPlaying={isPlaying}
              speed={speed}
              onSpeedChange={setSpeed}
              onStepBackward={handleStepBackward}
              onStepForward={handleStepForward}
              onPlay={handlePlay}
              onPause={handlePause}
            />

            <StepInfoPanel
              currentStep={currentStep}
              currentStepIndex={currentStepIndex}
              stepCount={steps.length}
            />

            <ComplexityPanel activeTab={activeTab} />
          </div>

          <div className="space-y-4">
            <SortingBars
              currentStep={currentStep}
              activeTab={activeTab}
              arrayLength={array.length}
              currentStepIndex={currentStepIndex}
            />

            <CharacteristicsPanel activeTab={activeTab} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
