"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCallback, useEffect, useRef, useState } from "react";
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

export function SortingAlgorithmsVisualization() {
  const [arraySize, setArraySize] = useState(15);
  const [array, setArray] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<"bubble" | "merge" | "quick">(
    "bubble"
  );
  const [steps, setSteps] = useState<SortingStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.5);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Générer un tableau aléatoire
  const generateArray = useCallback(() => {
    const newArray = Array.from(
      { length: arraySize },
      () => Math.floor(Math.random() * 100) + 1
    );
    setArray(newArray);
  }, [arraySize]);

  // Générer les étapes en fonction de l'onglet actif
  const generateSteps = useCallback(
    () => generateSortingSteps(activeTab, array),
    [activeTab, array]
  );

  // Réinitialiser la visualisation
  const handleReset = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsPlaying(false);
    const newSteps = generateSteps();
    setSteps(newSteps);
    setCurrentStepIndex(0);
  }, [generateSteps]);

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

  // Initialiser le tableau et les étapes au chargement
  useEffect(() => {
    generateArray();
  }, [generateArray]);

  // Mettre à jour les étapes lorsque le tableau ou l'onglet actif change
  useEffect(() => {
    handleReset();
  }, [array, activeTab, handleReset]);

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
        <AlgorithmTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <SizeControl
              arraySize={arraySize}
              onArraySizeChange={setArraySize}
              onGenerate={generateArray}
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
