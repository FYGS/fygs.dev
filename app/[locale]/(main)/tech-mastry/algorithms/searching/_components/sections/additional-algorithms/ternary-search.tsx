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
  | "range"
  | "mid1"
  | "mid2";

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

export function TernarySearch() {
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
    mid1?: number;
    mid2?: number;
    left?: number;
    right?: number;
    state: ElementState;
    message?: string;
  };

  // Algorithme de recherche ternaire
  const ternarySearch = () => {
    const steps: SearchStep[] = [];
    const arr = array.map((item) => item.value);
    let left = 0;
    let right = arr.length - 1;

    while (left <= right) {
      // Calculer les deux points de division
      const mid1 = Math.floor(left + (right - left) / 3);
      const mid2 = Math.floor(right - (right - left) / 3);

      steps.push({
        left,
        right,
        mid1,
        mid2,
        state: "range",
        message: `Division du tableau en trois parties: [${left}..${mid1}], [${
          mid1 + 1
        }..${mid2 - 1}], [${mid2}..${right}]`,
      });

      // Vérifier si la cible est égale à l'un des points de division
      if (arr[mid1] === target) {
        steps.push({
          mid1,
          state: "found",
          message: `L'élément ${target} est trouvé à l'index ${mid1}.`,
        });
        return { steps, found: true, foundIndex: mid1 };
      }

      if (arr[mid2] === target) {
        steps.push({
          mid2,
          state: "found",
          message: `L'élément ${target} est trouvé à l'index ${mid2}.`,
        });
        return { steps, found: true, foundIndex: mid2 };
      }

      // Déterminer dans quelle partie continuer la recherche
      if (target < arr[mid1]) {
        // Première partie
        steps.push({
          left,
          right: mid1 - 1,
          state: "range",
          message: `L'élément ${target} est plus petit que ${arr[mid1]}, on cherche dans la première partie.`,
        });
        right = mid1 - 1;
      } else if (target > arr[mid2]) {
        // Troisième partie
        steps.push({
          left: mid2 + 1,
          right,
          state: "range",
          message: `L'élément ${target} est plus grand que ${arr[mid2]}, on cherche dans la troisième partie.`,
        });
        left = mid2 + 1;
      } else {
        // Partie du milieu
        steps.push({
          left: mid1 + 1,
          right: mid2 - 1,
          state: "range",
          message: `L'élément ${target} est entre ${arr[mid1]} et ${arr[mid2]}, on cherche dans la partie du milieu.`,
        });
        left = mid1 + 1;
        right = mid2 - 1;
      }
    }

    // Élément non trouvé
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
    const { steps } = ternarySearch();
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
            // Marquer la plage de recherche
            if (step.left !== undefined && step.right !== undefined) {
              for (let i = step.left; i <= step.right; i++) {
                if (i < newArray.length) {
                  newArray[i].state = "range";
                }
              }
            }

            // Marquer les points de division
            if (step.mid1 !== undefined) {
              newArray[step.mid1].state = "mid1";
            }

            if (step.mid2 !== undefined) {
              newArray[step.mid2].state = "mid2";
            }
          } else if (step.state === "found") {
            // Marquer l'élément trouvé
            if (step.mid1 !== undefined) {
              newArray[step.mid1].state = "found";
            } else if (step.mid2 !== undefined) {
              newArray[step.mid2].state = "found";
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
          <span>Recherche Ternaire</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => resetVisualization()}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription>
          La recherche ternaire divise le tableau en trois parties égales et
          détermine dans quelle partie continuer la recherche.
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
                    : item.state === "mid1"
                    ? "border-blue-500 bg-blue-900/50 text-blue-300"
                    : item.state === "mid2"
                    ? "border-purple-500 bg-purple-900/50 text-purple-300"
                    : item.state === "found"
                    ? "border-green-500 bg-green-900/50 text-green-300"
                    : item.state === "not-found"
                    ? "border-red-500 bg-red-900/50 text-red-300"
                    : "border-amber-500 bg-amber-900/50 text-amber-300"
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
              <span>Premier point (mid1)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm border border-purple-500 bg-purple-900/50"></div>
              <span>Second point (mid2)</span>
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
            Comment fonctionne la recherche ternaire ?
          </h3>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>
              On divise le tableau en trois parties égales en calculant deux
              points de division: mid1 et mid2.
            </li>
            <li>
              On compare la cible avec les valeurs aux points de division.
            </li>
            <li>
              Si la cible est égale à l&apos;une des valeurs aux points de
              division, on a trouvé l&apos;élément.
            </li>
            <li>
              Sinon, on détermine dans quelle partie continuer la recherche:
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>
                  Si target &lt; arr[mid1], on cherche dans la première partie.
                </li>
                <li>
                  Si target &gt; arr[mid2], on cherche dans la troisième partie.
                </li>
                <li>Sinon, on cherche dans la partie du milieu.</li>
              </ul>
            </li>
          </ol>
          <div className="mt-2 text-sm">
            <span className="font-medium">Complexité temporelle:</span>{" "}
            <span className="text-muted-foreground">
              O(log₃ n) = O(log n), la même classe que la recherche binaire.
              Avec 2 comparaisons par itération, elle fait en pratique plus de
              comparaisons (environ 1,26 fois plus) que la recherche binaire.
            </span>
          </div>
          <div className="text-sm">
            <span className="font-medium">Avantages:</span>{" "}
            <span className="text-muted-foreground">
              Moins d&apos;itérations que la recherche binaire, mais plus de
              comparaisons par itération : elle n&apos;est pas plus efficace
              pour chercher dans un tableau trié (son vrai usage est la
              recherche de l&apos;extremum d&apos;une fonction unimodale).
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
