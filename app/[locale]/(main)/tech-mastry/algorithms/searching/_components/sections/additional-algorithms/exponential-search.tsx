"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import { Info, Pause, Play, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// Types pour la visualisation
type ElementState =
  | "default"
  | "current"
  | "found"
  | "not-found"
  | "searching"
  | "range";

type ArrayElement = {
  value: number;
  state: ElementState;
};

function createSortedArray(size: number): ArrayElement[] {
  const newArray: ArrayElement[] = [];
  for (let i = 0; i < size; i++) {
    newArray.push({
      value: i * 2 + 1, // Valeurs impaires pour un tableau trié
      state: "default",
    });
  }
  return newArray;
}

export function ExponentialSearch() {
  // État pour le tableau et la cible
  const arraySize = 15; // Taille fixe pour simplifier
  const [array, setArray] = useState<ArrayElement[]>(() => createSortedArray(arraySize));
  const [target, setTarget] = useState<number>(15);

  // État pour l'animation
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(50);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [totalSteps, setTotalSteps] = useState<number>(0);
  const [result, setResult] = useState<string>("");

  // Référence pour l'animation
  const animationRef = useRef<number | null>(null);

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

    // Annuler toute animation en cours
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  // Générer un tableau trié
  const generateArray = useCallback(() => {
    const newArray = createSortedArray(arraySize);
    setArray(newArray);
    resetVisualization();
  }, [arraySize, resetVisualization]);

  // Type pour les étapes de l'algorithme
  type SearchStep = {
    index?: number;
    bound?: number;
    left?: number;
    right?: number;
    mid?: number;
    state:
      | "default"
      | "current"
      | "found"
      | "not-found"
      | "searching"
      | "range";
    message?: string;
  };

  // Algorithme de recherche exponentielle
  const exponentialSearch = () => {
    const steps: SearchStep[] = [];
    const arr = array.map((item) => item.value);
    const n = arr.length;

    // Si le premier élément est la cible
    if (arr[0] === target) {
      steps.push({
        index: 0,
        state: "found",
        message: `L'élément ${target} est trouvé à l'index 0.`,
      });
      return { steps, found: true, foundIndex: 0 };
    }

    // Trouver la plage pour la recherche binaire
    let i = 1;
    while (i < n && arr[i] <= target) {
      steps.push({
        bound: i,
        state: "range",
        message: `Vérification de la borne exponentielle: ${i}`,
      });
      i *= 2;
    }

    // Ajouter une étape pour montrer la plage finale
    const left = i / 2;
    const right = Math.min(i, n - 1);
    steps.push({
      left,
      right,
      state: "range",
      message: `Plage trouvée pour la recherche binaire: [${left}, ${right}]`,
    });

    // Recherche binaire dans la plage trouvée
    return binarySearch(arr, target, left, right, steps);
  };

  // Recherche binaire (utilisée par la recherche exponentielle)
  const binarySearch = (
    arr: number[],
    target: number,
    left: number,
    right: number,
    steps: SearchStep[]
  ) => {
    let l = Math.floor(left);
    let r = Math.floor(right);

    while (l <= r) {
      const mid = Math.floor((l + r) / 2);

      steps.push({
        left: l,
        right: r,
        mid,
        state: "searching",
        message: `Recherche binaire: comparaison de ${arr[mid]} avec ${target}`,
      });

      if (arr[mid] === target) {
        steps.push({
          left: l,
          right: r,
          mid,
          state: "found",
          message: `L'élément ${target} est trouvé à l'index ${mid}.`,
        });
        return { steps, found: true, foundIndex: mid };
      }

      if (arr[mid] < target) {
        l = mid + 1;
        steps.push({
          left: l,
          right: r,
          state: "range",
          message: `L'élément ${arr[mid]} est plus petit que ${target}, on cherche à droite.`,
        });
      } else {
        r = mid - 1;
        steps.push({
          left: l,
          right: r,
          state: "range",
          message: `L'élément ${arr[mid]} est plus grand que ${target}, on cherche à gauche.`,
        });
      }
    }

    steps.push({
      state: "not-found",
      message: `L'élément ${target} n'est pas trouvé dans le tableau.`,
    });

    return { steps, found: false, foundIndex: -1 };
  };

  // Exécuter l'animation
  const runAnimation = () => {
    // Annuler toute animation en cours
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // Réinitialiser l'état
    resetVisualization();

    // Obtenir les étapes de l'algorithme
    const { steps } = exponentialSearch();
    setTotalSteps(steps.length);

    // Fonction pour animer les étapes
    let stepIndex = 0;

    const animate = () => {
      if (stepIndex < steps.length) {
        const step = steps[stepIndex];
        setCurrentStep(stepIndex + 1);
        setResult(step.message || "");

        // Mettre à jour l'état du tableau
        setArray((prev) => {
          const newArray = [...prev].map((item) => ({
            ...item,
            state: "default" as ElementState,
          }));

          if (step.state === "range") {
            // Marquer la plage pour la recherche binaire
            if (step.left !== undefined && step.right !== undefined) {
              for (let i = step.left; i <= step.right; i++) {
                if (i < newArray.length) {
                  newArray[i].state = "range";
                }
              }
            } else if (step.bound !== undefined) {
              // Marquer la borne exponentielle
              for (let i = 0; i <= step.bound && i < newArray.length; i++) {
                newArray[i].state = "range";
              }
            }
          } else if (step.state === "searching") {
            // Marquer l'élément en cours de comparaison
            if (step.mid !== undefined) {
              newArray[step.mid].state = "current";
            }

            // Marquer la plage de recherche
            if (step.left !== undefined && step.right !== undefined) {
              for (let i = step.left; i <= step.right; i++) {
                if (i !== step.mid && i < newArray.length) {
                  newArray[i].state = "range";
                }
              }
            }
          } else if (step.state === "found") {
            // Marquer l'élément trouvé
            if (step.mid !== undefined) {
              newArray[step.mid].state = "found";
            } else if (step.index !== undefined) {
              newArray[step.index].state = "found";
            }
          } else if (step.state === "not-found") {
            // Marquer tous les éléments comme non trouvés
            newArray.forEach((item) => {
              item.state = "not-found";
            });
          }

          return newArray;
        });

        // Planifier la prochaine étape
        stepIndex++;
        const delay = 1000 - speed * 10; // Convertir la vitesse en délai
        setTimeout(() => {
          animationRef.current = requestAnimationFrame(animate);
        }, delay);
      } else {
        // Animation terminée
        setIsRunning(false);
      }
    };

    // Démarrer l'animation
    setIsRunning(true);
    animationRef.current = requestAnimationFrame(animate);
  };

  // Mettre en pause ou reprendre l'animation
  const toggleAnimation = () => {
    setIsRunning(!isRunning);
    if (!isRunning) {
      runAnimation();
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };

  // Nettoyer l'animation lors du démontage
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Recherche Exponentielle</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => resetVisualization()}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription>
          La recherche exponentielle trouve d&apos;abord une plage où
          l&apos;élément pourrait se trouver, puis utilise la recherche binaire
          dans cette plage.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Contrôles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="target">Élément à rechercher</Label>
            <div className="flex items-center gap-2">
              <Input
                id="target"
                type="number"
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
                className="w-24"
                min={1}
                max={100}
              />
              <Button onClick={toggleAnimation}>
                {isRunning ? (
                  <Pause className="mr-2 h-4 w-4" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                {isRunning ? "Pause" : "Démarrer"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="speed">Vitesse</Label>
              <span className="text-sm text-muted-foreground">{speed}%</span>
            </div>
            <Slider
              id="speed"
              min={10}
              max={100}
              step={10}
              value={[speed]}
              onValueChange={(value) => setSpeed(value[0])}
            />
          </div>
        </div>

        {/* Visualisation */}
        <div className="border rounded-md p-4 bg-muted/30">
          <div className="flex flex-wrap gap-2 justify-center">
            {array.map((item, index) => (
              <motion.div
                key={index}
                className={`flex items-center justify-center w-10 h-10 rounded-md border text-sm font-medium ${
                  item.state === "default"
                    ? "bg-background border-border"
                    : item.state === "current"
                    ? "border-blue-500 bg-blue-900/50 text-blue-300"
                    : item.state === "found"
                    ? "border-green-500 bg-green-900/50 text-green-300"
                    : item.state === "not-found"
                    ? "bg-red-900/50 border-red-500 text-red-300"
                    : item.state === "range"
                    ? "bg-amber-900/50 border-amber-500 text-amber-300"
                    : "bg-purple-900/50 border-purple-500 text-purple-300"
                }`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
              >
                {item.value}
              </motion.div>
            ))}
          </div>

          {/* Légende */}
          <div className="mt-4 flex flex-wrap gap-3 justify-center text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-background border border-border"></div>
              <span>Non visité</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm border border-amber-500 bg-amber-900/50"></div>
              <span>Plage de recherche</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm border border-blue-500 bg-blue-900/50"></div>
              <span>Élément courant</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm border border-green-500 bg-green-900/50"></div>
              <span>Trouvé</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm border border-red-500 bg-red-900/50"></div>
              <span>Non trouvé</span>
            </div>
          </div>
        </div>

        {/* Résultat et progression */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span>
                {result || "Cliquez sur Démarrer pour lancer la visualisation"}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Étape {currentStep}/{totalSteps}
            </div>
          </div>
          <div className="h-1 w-full bg-muted overflow-hidden rounded-full">
            <div
              className="h-full bg-primary"
              style={{
                width: totalSteps
                  ? `${(currentStep / totalSteps) * 100}%`
                  : "0%",
              }}
            ></div>
          </div>
        </div>

        {/* Explication */}
        <div className="bg-muted/30 p-4 rounded-md space-y-2">
          <h3 className="font-medium">
            Comment fonctionne la recherche exponentielle ?
          </h3>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>
              On commence par vérifier si le premier élément est la cible.
            </li>
            <li>
              On trouve une plage où l&apos;élément pourrait se trouver en
              doublant un index i (1, 2, 4, 8, 16, ...) jusqu&apos;à ce que
              arr[i] dépasse la cible.
            </li>
            <li>
              On effectue ensuite une recherche binaire dans la plage [i/2,
              min(i, n-1)].
            </li>
          </ol>
          <div className="mt-2 text-sm">
            <span className="font-medium">Complexité temporelle:</span>{" "}
            <span className="text-muted-foreground">
              O(log i) où i est la position de l&apos;élément recherché.
            </span>
          </div>
          <div className="text-sm">
            <span className="font-medium">Avantages:</span>{" "}
            <span className="text-muted-foreground">
              Plus efficace que la recherche binaire lorsque l&apos;élément
              recherché est proche du début du tableau.
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => generateArray()}>
          Générer un nouveau tableau
        </Button>
        <Button
          variant="outline"
          onClick={() => setTarget(Math.floor(Math.random() * (arraySize * 2)))}
        >
          Cible aléatoire
        </Button>
      </CardFooter>
    </Card>
  );
}
