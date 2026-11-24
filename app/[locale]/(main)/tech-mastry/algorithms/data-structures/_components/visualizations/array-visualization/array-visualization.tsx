"use client";

import { useEffect, useRef, useState } from "react";
import { useClientValue } from "../../../../../_hooks/use-client-value";
import { VisualizationContainer } from "../visualization-container";
import { ArrayCanvas } from "./array-canvas";
import { getArrayStats } from "./array-stats";
import {
  generateInsertAtSteps,
  generateInsertEndSteps,
  generateInsertStartSteps,
} from "./insert-steps";
import { OperationPanel } from "./operation-panel";
import { generateAccessSteps, generateSearchSteps } from "./read-steps";
import {
  generateRemoveAtSteps,
  generateRemoveEndSteps,
  generateRemoveStartSteps,
} from "./remove-steps";
import type { ArrayStep, OperationType } from "./types";

// Générer un tableau aléatoire
function randomArray(): number[] {
  const size = 8;
  return Array.from({ length: size }, () => Math.floor(Math.random() * 100));
}

// Étape initiale d'un tableau
function initialStepFor(array: number[]): ArrayStep {
  return {
    array: [...array],
    activeIndices: [],
    message: "Tableau initial",
    operation: "access",
    operationCount: 0,
  };
}

// Le tableau aléatoire n'existe que côté client : il remplace le rendu vide de
// l'hydratation (pas de décalage entre serveur et client).
export function ArrayVisualization() {
  const initialArray = useClientValue(randomArray);
  return (
    <ArrayVisualizationContent
      key={initialArray ? "ready" : "pending"}
      initialArray={initialArray}
    />
  );
}

function ArrayVisualizationContent({ initialArray }: { initialArray: number[] | null }) {
  // État pour le tableau
  const [array, setArray] = useState<number[]>(initialArray ?? []);

  // État pour les étapes de visualisation
  const [steps, setSteps] = useState<ArrayStep[]>(() =>
    initialArray ? [initialStepFor(initialArray)] : []
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // État pour les contrôles
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  // État pour les entrées utilisateur
  const [value, setValue] = useState<string>("");
  const [index, setIndex] = useState<string>("");
  const [operation, setOperation] = useState<OperationType>("access");

  // Référence pour le timer d'animation
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Générer un tableau aléatoire
  const generateRandomArray = () => {
    const newArray = randomArray();
    setArray(newArray);

    // Réinitialiser les étapes
    setSteps([initialStepFor(newArray)]);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  // Exécuter l'opération sélectionnée
  const executeOperation = () => {
    let newSteps: ArrayStep[] = [];

    switch (operation) {
      case "access":
        const accessIndex = parseInt(index);
        if (!isNaN(accessIndex)) {
          newSteps = generateAccessSteps(array, accessIndex);
        }
        break;
      case "search":
        const searchValue = parseInt(value);
        if (!isNaN(searchValue)) {
          newSteps = generateSearchSteps(array, searchValue);
        }
        break;
      case "insertEnd":
        const insertEndValue = parseInt(value);
        if (!isNaN(insertEndValue)) {
          newSteps = generateInsertEndSteps(array, insertEndValue);
        }
        break;
      case "insertStart":
        const insertStartValue = parseInt(value);
        if (!isNaN(insertStartValue)) {
          newSteps = generateInsertStartSteps(array, insertStartValue);
        }
        break;
      case "insertAt":
        const insertAtValue = parseInt(value);
        const insertAtIndex = parseInt(index);
        if (!isNaN(insertAtValue) && !isNaN(insertAtIndex)) {
          newSteps = generateInsertAtSteps(array, insertAtValue, insertAtIndex);
        }
        break;
      case "removeEnd":
        newSteps = generateRemoveEndSteps(array);
        break;
      case "removeStart":
        newSteps = generateRemoveStartSteps(array);
        break;
      case "removeAt":
        const removeAtIndex = parseInt(index);
        if (!isNaN(removeAtIndex)) {
          newSteps = generateRemoveAtSteps(array, removeAtIndex);
        }
        break;
    }

    if (newSteps.length > 0) {
      setSteps(newSteps);
      setCurrentStepIndex(0);

      // Mettre à jour le tableau si l'opération est terminée
      const lastStep = newSteps[newSteps.length - 1];
      if (lastStep.completed) {
        setArray(lastStep.array);
      }
    }
  };

  // Gérer le changement d'opération
  const handleOperationChange = (value: string) => {
    setOperation(value as OperationType);
    setValue("");
    setIndex("");
  };

  // Contrôles de la visualisation
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

  const handlePause = () => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleStepForward = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleStepBackward = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSpeedChange = (values: number[]) => {
    setSpeed(values[0]);
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
    array: [],
    activeIndices: [],
    message: "",
    operation: "access" as OperationType,
    operationCount: 0,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contrôles d'opération */}
        <OperationPanel
          operation={operation}
          onOperationChange={handleOperationChange}
          value={value}
          onValueChange={setValue}
          index={index}
          onIndexChange={setIndex}
          onExecute={executeOperation}
          onGenerateArray={generateRandomArray}
        />

        {/* Visualisation */}
        <VisualizationContainer
          title="Visualisation de Tableau"
          currentStep={currentStepIndex}
          totalSteps={steps.length - 1}
          isPlaying={isPlaying}
          speed={speed}
          onPlay={handlePlay}
          onPause={handlePause}
          onReset={handleReset}
          onStepForward={handleStepForward}
          onStepBackward={handleStepBackward}
          onSpeedChange={handleSpeedChange}
          message={currentStep.message}
          stats={getArrayStats(currentStep)}
        >
          <ArrayCanvas currentStep={currentStep} />
        </VisualizationContainer>
      </div>
    </div>
  );
}
