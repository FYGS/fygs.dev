"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Settings } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useClientValue } from "../../../../../_hooks/use-client-value";

import { AlgorithmTabs } from "./algorithm-tabs";
import { PlaybackControls } from "./playback-controls";
import { SettingsPanel } from "./settings-panel";
import { SortingBars } from "./sorting-bars";
import { generateSortingSteps } from "./steps";
import { ProgressBar, StepInfo } from "./step-info";
import type { SortingAlgorithm, SortingStep } from "./types";

const NO_ITEMS: number[] = [];

// Générer un tableau aléatoire
function randomArray(size: number): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 1);
}

export function SortingVisualization() {
  // État pour la configuration
  const [arraySize, setArraySize] = useState(15);
  const [algorithm, setAlgorithm] = useState<SortingAlgorithm>("bubble");
  // Le tableau aléatoire n'existe que côté client (pas de décalage d'hydratation)
  const initialArray = useClientValue(() => randomArray(15));
  const [generatedArray, setArray] = useState<number[] | null>(null);
  const array = generatedArray ?? initialArray ?? NO_ITEMS;
  const [speed, setSpeed] = useState(1.5);
  const [showSettings, setShowSettings] = useState(false);

  // État pour la visualisation
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Référence pour le timer
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Générer un tableau aléatoire (de la taille donnée)
  const generateArray = (size: number = arraySize) => {
    setArray(randomArray(size));

    // Réinitialiser l'index
    setCurrentStepIndex(0);
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Les étapes dérivent de l'algorithme sélectionné et du tableau
  const steps: SortingStep[] = useMemo(
    () => generateSortingSteps(algorithm, array),
    [algorithm, array]
  );

  // Changer d'algorithme revient à la première étape
  const handleAlgorithmChange = (newAlgorithm: SortingAlgorithm) => {
    setAlgorithm(newAlgorithm);
    setCurrentStepIndex(0);
  };

  // Changer la taille génère un nouveau tableau
  const handleArraySizeChange = (size: number) => {
    setArraySize(size);
    generateArray(size);
  };

  // Nettoyer le timer lors du démontage du composant
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // Obtenir l'étape actuelle
  const currentStep = steps[currentStepIndex] || {
    array: array,
    activeIndices: [],
    comparisons: 0,
    swaps: 0,
    message: "Cliquez sur 'Démarrer' pour lancer la visualisation.",
    sortedIndices: [],
  };

  // Contrôles de lecture
  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Visualisation Interactive
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Paramètres</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Sélection d'algorithme */}
          <AlgorithmTabs algorithm={algorithm} onAlgorithmChange={handleAlgorithmChange} />

          {/* Panneau de configuration */}
          <SettingsPanel
            showSettings={showSettings}
            arraySize={arraySize}
            speed={speed}
            onGenerateArray={() => generateArray()}
            onArraySizeChange={handleArraySizeChange}
            onSpeedChange={setSpeed}
          />

          {/* Zone de visualisation */}
          <SortingBars currentStep={currentStep} />

          {/* Contrôles de lecture */}
          <PlaybackControls
            currentStepIndex={currentStepIndex}
            stepCount={steps.length}
            isPlaying={isPlaying}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onPause={handlePause}
            onPlay={handlePlay}
          />

          {/* Barre de progression */}
          <ProgressBar
            currentStepIndex={currentStepIndex}
            stepCount={steps.length}
          />

          {/* Informations sur l'étape actuelle */}
          <StepInfo
            currentStep={currentStep}
            currentStepIndex={currentStepIndex}
          />
        </CardContent>
      </Card>
    </div>
  );
}
