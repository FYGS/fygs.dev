"use client";

import { useCallback, useRef, useState } from "react";
import { useClientValue } from "../../../../../_hooks/use-client-value";
import { applySearchStep } from "./apply-step";
import {
  binarySearch,
  interpolationSearch,
  jumpSearch,
  linearSearch,
} from "./search-algorithms";
import { SettingsCard } from "./settings-card";
import type { AlgorithmType, ArrayElement } from "./types";
import { VisualizationCard } from "./visualization-card";

const DEFAULT_ARRAY_SIZE = 20;

// Générer un tableau aléatoire
function randomArray(arraySize: number, algorithm: AlgorithmType): ArrayElement[] {
  const newArray: ArrayElement[] = [];
  const min = 1;
  const max = 100;

  for (let i = 0; i < arraySize; i++) {
    newArray.push({
      value: Math.floor(Math.random() * (max - min + 1)) + min,
      state: "default",
    });
  }

  // Trier le tableau si nécessaire
  if (
    algorithm === "binary" ||
    algorithm === "jump" ||
    algorithm === "interpolation"
  ) {
    newArray.sort((a, b) => a.value - b.value);
  }

  return newArray;
}

// Le tableau aléatoire n'existe que côté client : il remplace le rendu vide de
// l'hydratation (pas de décalage entre serveur et client).
export function SearchingVisualization() {
  const initialArray = useClientValue(() => randomArray(DEFAULT_ARRAY_SIZE, "linear"));
  return (
    <SearchingVisualizationContent
      key={initialArray ? "ready" : "pending"}
      initialArray={initialArray}
    />
  );
}

function SearchingVisualizationContent({ initialArray }: { initialArray: ArrayElement[] | null }) {
  // États pour la visualisation
  const [algorithm, setAlgorithm] = useState<AlgorithmType>("linear");
  const [array, setArray] = useState<ArrayElement[]>(initialArray ?? []);
  const [target, setTarget] = useState<number>(42);
  const [speed, setSpeed] = useState<number>(50);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const [arraySize, setArraySize] = useState<number>(DEFAULT_ARRAY_SIZE);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [totalSteps, setTotalSteps] = useState<number>(0);
  const [result, setResult] = useState<string>("");

  // Référence pour l'animation
  const animationRef = useRef<number | null>(null);

  // Générer un tableau aléatoire (pour l'algorithme et la taille donnés)
  const generateArray = (
    newAlgorithm: AlgorithmType = algorithm,
    newSize: number = arraySize
  ) => {
    setArray(randomArray(newSize, newAlgorithm));
    setCurrentStep(0);
    setTotalSteps(0);
    setResult("");
  };

  // Changer l'algorithme génère un nouveau tableau (trié ou non selon l'algorithme)
  const handleAlgorithmChange = (newAlgorithm: AlgorithmType) => {
    setAlgorithm(newAlgorithm);
    generateArray(newAlgorithm, arraySize);
  };

  // Réinitialiser la visualisation
  const resetVisualization = useCallback(() => {
    setIsRunning(false);
    setCurrentStep(0);
    setTotalSteps(0);
    setResult("");

    // Réinitialiser l'état des éléments
    setArray((prev) =>
      prev.map((item) => ({
        ...item,
        state: "default",
      }))
    );
  }, []);

  // Exécuter l'animation
  const runAnimation = useCallback(() => {
    // Annuler toute animation en cours
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // Réinitialiser l'état
    resetVisualization();

    // Déterminer l'algorithme à utiliser
    let searchResult;
    switch (algorithm) {
      case "linear":
        searchResult = linearSearch(array, target);
        break;
      case "binary":
        searchResult = binarySearch(array, target);
        break;
      case "jump":
        searchResult = jumpSearch(array, target);
        break;
      case "interpolation":
        searchResult = interpolationSearch(array, target);
        break;
      default:
        searchResult = linearSearch(array, target); // Par défaut, utiliser la recherche linéaire
    }

    const { steps, found, foundIndex } = searchResult;
    setTotalSteps(steps.length);

    // Fonction pour animer les étapes
    let stepIndex = 0;

    const animate = () => {
      if (stepIndex < steps.length) {
        const step = steps[stepIndex];
        setCurrentStep(stepIndex + 1);

        // Mettre à jour l'état du tableau
        setArray((prev) => applySearchStep(prev, step, algorithm, setResult));

        // Afficher le résultat final à la dernière étape
        if (stepIndex === steps.length - 1) {
          if (found) {
            setResult(`Élément ${target} trouvé à l'index ${foundIndex}.`);
          } else {
            setResult(`Élément ${target} non trouvé dans le tableau.`);
          }
          setIsRunning(false);
        } else {
          // Planifier la prochaine étape
          const delay = 1000 - speed * 9; // Convertir la vitesse en délai (10% = 910ms, 100% = 100ms)
          stepIndex++;
          animationRef.current = window.setTimeout(() => {
            animate();
          }, delay);
        }
      }
    };

    // Démarrer l'animation
    animate();
  }, [algorithm, array, resetVisualization, speed, target]);

  // Démarrer/Arrêter la visualisation
  const toggleVisualization = () => {
    if (isRunning) {
      setIsRunning(false);
      if (animationRef.current) {
        clearTimeout(animationRef.current);
        animationRef.current = null;
      }
    } else {
      setIsRunning(true);
      runAnimation();
    }
  };

  // Changer la taille du tableau
  const handleSizeChange = (newSize: number) => {
    setArraySize(newSize);
    generateArray(algorithm, newSize);
  };

  // Changer la valeur cible
  const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      setTarget(value);
    }
  };

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Visualisation des Algorithmes</h2>
        <p className="text-muted-foreground">
          Observez le fonctionnement des différents algorithmes de recherche en
          temps réel.
        </p>
      </div>

      {/* Contrôles */}
      <SettingsCard
        algorithm={algorithm}
        onAlgorithmChange={handleAlgorithmChange}
        isRunning={isRunning}
        arraySize={arraySize}
        onSizeChange={handleSizeChange}
        target={target}
        onTargetChange={handleTargetChange}
        speed={speed}
        onSpeedChange={setSpeed}
        onToggle={toggleVisualization}
        onReset={resetVisualization}
        onGenerate={() => generateArray()}
      />

      {/* Zone de visualisation */}
      <VisualizationCard
        algorithm={algorithm}
        array={array}
        currentStep={currentStep}
        totalSteps={totalSteps}
        result={result}
      />
    </div>
  );
}
