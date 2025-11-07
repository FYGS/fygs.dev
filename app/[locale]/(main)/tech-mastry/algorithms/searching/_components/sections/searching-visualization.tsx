"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Pause, Play, RotateCcw, Search, Settings } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// Types pour la visualisation
type AlgorithmType = "linear" | "binary" | "jump" | "interpolation";
type ElementState = "default" | "current" | "found" | "not-found" | "searching";

type ArrayElement = {
  value: number;
  state: ElementState;
};

// Types pour les étapes d'animation
type LinearSearchStep = {
  index: number;
  state: "found" | "searching" | "not-found";
};

type BinarySearchStep = {
  left: number;
  right: number;
  mid: number;
  state: "found" | "searching" | "not-found";
};

type JumpSearchStep = {
  prev?: number;
  current?: number;
  index?: number;
  state?: "found" | "searching" | "not-found";
  blockSearch?: boolean;
  message?: string;
};

type InterpolationSearchStep = {
  low?: number;
  high?: number;
  pos?: number;
  state?: "found" | "searching" | "not-found";
  formula?: string;
};

export function SearchingVisualization() {
  // États pour la visualisation
  const [algorithm, setAlgorithm] = useState<AlgorithmType>("linear");
  const [array, setArray] = useState<ArrayElement[]>([]);
  const [target, setTarget] = useState<number>(42);
  const [speed, setSpeed] = useState<number>(50);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const [arraySize, setArraySize] = useState<number>(20);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [totalSteps, setTotalSteps] = useState<number>(0);
  const [result, setResult] = useState<string>("");

  // Référence pour l'animation
  const animationRef = useRef<number | null>(null);

  // Générer un tableau aléatoire
  const generateArray = useCallback(() => {
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

    setArray(newArray);
    setCurrentStep(0);
    setTotalSteps(0);
    setResult("");
  }, [algorithm, arraySize]);

  // Initialiser le tableau
  useEffect(() => {
    generateArray();
  }, [generateArray, algorithm]);

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

  // Implémentation de la recherche linéaire
  const linearSearch = useCallback(() => {
    const steps = [];
    let found = false;
    let foundIndex = -1;

    // Créer les étapes de la recherche linéaire
    for (let i = 0; i < array.length; i++) {
      steps.push({
        index: i,
        state: array[i].value === target ? "found" : "searching",
      });

      if (array[i].value === target) {
        found = true;
        foundIndex = i;
        break;
      }
    }

    // Si l'élément n'est pas trouvé, marquer tous les éléments comme non trouvés
    if (!found) {
      steps.push({
        index: -1,
        state: "not-found",
      });
    }

    return { steps, found, foundIndex };
  }, [array, target]);

  // Implémentation de la recherche binaire
  const binarySearch = useCallback(() => {
    const steps = [];
    let left = 0;
    let right = array.length - 1;
    let found = false;
    let foundIndex = -1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);

      // Ajouter l'étape actuelle
      steps.push({
        left,
        right,
        mid,
        state: array[mid].value === target ? "found" : "searching",
      });

      if (array[mid].value === target) {
        found = true;
        foundIndex = mid;
        break;
      }

      if (array[mid].value < target) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    // Si l'élément n'est pas trouvé
    if (!found) {
      steps.push({
        left,
        right,
        mid: -1,
        state: "not-found",
      });
    }

    return { steps, found, foundIndex };
  }, [array, target]);

  // Implémentation de la recherche par saut
  const jumpSearch = useCallback(() => {
    const steps = [];
    let found = false;
    let foundIndex = -1;

    const n = array.length;
    const step = Math.floor(Math.sqrt(n));

    // Étape 1: Trouver le bloc
    let prev = 0;
    let current = Math.min(step, n) - 1;

    // Ajouter l'étape initiale
    steps.push({
      prev,
      current,
      state: "searching",
      blockSearch: true,
    });

    while (array[current].value < target) {
      prev = current + 1;
      current = Math.min(current + step, n - 1);

      // Ajouter l'étape de saut
      steps.push({
        prev,
        current,
        state: "searching",
        blockSearch: true,
      });

      // Si nous avons atteint la fin du tableau
      if (prev >= n) {
        steps.push({
          state: "not-found",
          blockSearch: false,
        });
        return { steps, found, foundIndex };
      }
    }

    // Étape 2: Recherche linéaire dans le bloc
    steps.push({
      message: "Bloc trouvé, début de la recherche linéaire",
      prev,
      current,
      blockSearch: false,
    });

    for (let i = prev; i <= current; i++) {
      // Ajouter l'étape de recherche linéaire
      steps.push({
        index: i,
        state: array[i].value === target ? "found" : "searching",
        blockSearch: false,
      });

      if (array[i].value === target) {
        found = true;
        foundIndex = i;
        break;
      }

      if (array[i].value > target) {
        break;
      }
    }

    // Si l'élément n'est pas trouvé
    if (!found) {
      steps.push({
        state: "not-found",
        blockSearch: false,
      });
    }

    return { steps, found, foundIndex };
  }, [array, target]);

  // Implémentation de la recherche par interpolation
  const interpolationSearch = useCallback(() => {
    const steps = [];
    let found = false;
    let foundIndex = -1;

    let low = 0;
    let high = array.length - 1;

    while (
      low <= high &&
      target >= array[low].value &&
      target <= array[high].value
    ) {
      // Calculer la position estimée
      let pos;
      if (low === high) {
        pos = low;
      } else {
        pos =
          low +
          Math.floor(
            ((high - low) * (target - array[low].value)) /
              (array[high].value - array[low].value)
          );
      }

      // Ajouter l'étape actuelle
      steps.push({
        low,
        high,
        pos,
        state: array[pos].value === target ? "found" : "searching",
        formula: `pos = ${low} + floor((${high} - ${low}) * (${target} - ${array[low].value}) / (${array[high].value} - ${array[low].value}))`,
      });

      if (array[pos].value === target) {
        found = true;
        foundIndex = pos;
        break;
      }

      if (array[pos].value < target) {
        low = pos + 1;
      } else {
        high = pos - 1;
      }
    }

    // Si l'élément n'est pas trouvé
    if (!found) {
      steps.push({
        state: "not-found",
      });
    }

    return { steps, found, foundIndex };
  }, [array, target]);

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
        searchResult = linearSearch();
        break;
      case "binary":
        searchResult = binarySearch();
        break;
      case "jump":
        searchResult = jumpSearch();
        break;
      case "interpolation":
        searchResult = interpolationSearch();
        break;
      default:
        searchResult = linearSearch(); // Par défaut, utiliser la recherche linéaire
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
        setArray((prev) => {
          const newArray = [...prev].map((item) => ({
            ...item,
            state: "default" as ElementState,
          }));

          if (algorithm === "linear") {
            // Pour la recherche linéaire
            const linearStep = step as LinearSearchStep;
            if (linearStep.index >= 0) {
              newArray[linearStep.index].state = linearStep.state;

              // Marquer les éléments déjà visités
              for (let i = 0; i < linearStep.index; i++) {
                newArray[i].state = "searching";
              }
            } else if (linearStep.state === "not-found") {
              // Tous les éléments ont été vérifiés mais non trouvés
              newArray.forEach((item) => {
                item.state = "not-found";
              });
            }
          } else if (algorithm === "binary") {
            // Pour la recherche binaire
            const binaryStep = step as BinarySearchStep;
            if (binaryStep.mid >= 0) {
              newArray[binaryStep.mid].state = binaryStep.state;

              // Marquer la plage de recherche actuelle
              for (let i = binaryStep.left; i <= binaryStep.right; i++) {
                if (i !== binaryStep.mid) {
                  newArray[i].state = "current";
                }
              }
            } else if (binaryStep.state === "not-found") {
              // Élément non trouvé
              newArray.forEach((item) => {
                item.state = "not-found";
              });
            }
          } else if (algorithm === "jump") {
            // Pour la recherche par saut
            const jumpStep = step as JumpSearchStep;
            if (jumpStep.blockSearch) {
              // Phase de recherche par blocs
              if (
                jumpStep.prev !== undefined &&
                jumpStep.current !== undefined
              ) {
                for (
                  let i = jumpStep.prev;
                  i <= jumpStep.current && i < newArray.length;
                  i++
                ) {
                  newArray[i].state = "current";
                }

                if (jumpStep.current < newArray.length) {
                  newArray[jumpStep.current].state = "searching";
                }

                // Marquer les blocs précédents comme visités
                for (let i = 0; i < jumpStep.prev; i++) {
                  newArray[i].state = "searching";
                }
              }
            } else if (jumpStep.index !== undefined && jumpStep.index >= 0) {
              // Phase de recherche linéaire dans le bloc
              if (jumpStep.state) {
                newArray[jumpStep.index].state = jumpStep.state;
              }

              // Marquer les éléments déjà visités dans le bloc
              if (jumpStep.prev !== undefined) {
                for (let i = jumpStep.prev; i < jumpStep.index; i++) {
                  newArray[i].state = "searching";
                }
              }
            } else if (jumpStep.state === "not-found") {
              // Élément non trouvé
              newArray.forEach((item) => {
                item.state = "not-found";
              });
            }
          } else if (algorithm === "interpolation") {
            // Pour la recherche par interpolation
            const interpolationStep = step as InterpolationSearchStep;
            if (
              interpolationStep.pos !== undefined &&
              interpolationStep.pos >= 0
            ) {
              if (interpolationStep.state) {
                newArray[interpolationStep.pos].state = interpolationStep.state;
              }

              // Marquer la plage de recherche actuelle
              if (
                interpolationStep.low !== undefined &&
                interpolationStep.high !== undefined
              ) {
                for (
                  let i = interpolationStep.low;
                  i <= interpolationStep.high;
                  i++
                ) {
                  if (i !== interpolationStep.pos) {
                    newArray[i].state = "current";
                  }
                }
              }

              // Afficher la formule d'interpolation
              if (interpolationStep.formula) {
                setResult(`Formule: ${interpolationStep.formula}`);
              }
            } else if (interpolationStep.state === "not-found") {
              // Élément non trouvé
              newArray.forEach((item) => {
                item.state = "not-found";
              });
            }
          }

          return newArray;
        });

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
  }, [
    algorithm,
    linearSearch,
    binarySearch,
    jumpSearch,
    interpolationSearch,
    resetVisualization,
    speed,
    target,
  ]);

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
    generateArray();
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
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Paramètres</CardTitle>
          <CardDescription>
            Configurez les paramètres de la visualisation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Sélection de l'algorithme */}
            <div className="space-y-2">
              <Label htmlFor="algorithm">Algorithme</Label>
              <Select
                value={algorithm}
                onValueChange={(value) => setAlgorithm(value as AlgorithmType)}
                disabled={isRunning}
              >
                <SelectTrigger id="algorithm">
                  <SelectValue placeholder="Choisir un algorithme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linear">Recherche Linéaire</SelectItem>
                  <SelectItem value="binary">Recherche Binaire</SelectItem>
                  <SelectItem value="jump">Recherche par Saut</SelectItem>
                  <SelectItem value="interpolation">
                    Recherche par Interpolation
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Taille du tableau */}
            <div className="space-y-2">
              <Label htmlFor="array-size">Taille du tableau: {arraySize}</Label>
              <Slider
                id="array-size"
                min={5}
                max={50}
                step={5}
                value={[arraySize]}
                onValueChange={(value) => handleSizeChange(value[0])}
                disabled={isRunning}
              />
            </div>

            {/* Valeur cible */}
            <div className="space-y-2">
              <Label htmlFor="target-value">Valeur recherchée</Label>
              <Input
                id="target-value"
                type="number"
                min={1}
                max={100}
                value={target}
                onChange={handleTargetChange}
                disabled={isRunning}
              />
            </div>

            {/* Vitesse */}
            <div className="space-y-2">
              <Label htmlFor="speed">Vitesse: {speed}%</Label>
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

          {/* Boutons de contrôle */}
          <div className="flex flex-wrap gap-4 mt-6">
            <Button
              onClick={toggleVisualization}
              className="flex items-center gap-2"
              variant={isRunning ? "destructive" : "default"}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Démarrer
                </>
              )}
            </Button>

            <Button
              onClick={resetVisualization}
              variant="outline"
              className="flex items-center gap-2"
              disabled={isRunning}
            >
              <RotateCcw className="w-4 h-4" />
              Réinitialiser
            </Button>

            <Button
              onClick={generateArray}
              variant="outline"
              className="flex items-center gap-2"
              disabled={isRunning}
            >
              <Settings className="w-4 h-4" />
              Nouveau tableau
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Zone de visualisation */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" />
                Visualisation
              </CardTitle>
              <CardDescription>
                {algorithm === "linear" && "Parcours séquentiel du tableau"}
                {algorithm === "binary" &&
                  "Division répétitive de l'espace de recherche"}
                {algorithm === "jump" &&
                  "Sauts par blocs puis recherche linéaire"}
                {algorithm === "interpolation" &&
                  "Estimation de la position par interpolation"}
              </CardDescription>
            </div>

            {/* Indicateur de progression */}
            {totalSteps > 0 && (
              <div className="text-sm text-muted-foreground">
                Étape {currentStep} / {totalSteps}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pb-8">
          {/* Affichage du tableau */}
          <div className="flex flex-wrap gap-2 justify-center py-8">
            {array.map((item, index) => (
              <div
                key={index}
                className={`
                  w-12 h-12 flex items-center justify-center rounded-md border text-sm font-medium transition-all duration-300
                  ${
                    item.state === "default"
                      ? "bg-muted border-muted-foreground/20"
                      : ""
                  }
                  ${
                    item.state === "current"
                      ? "bg-amber-900/30 border-amber-500 text-amber-300"
                      : ""
                  }
                  ${
                    item.state === "searching"
                      ? "bg-blue-900/30 border-blue-500 text-blue-300"
                      : ""
                  }
                  ${
                    item.state === "found"
                      ? "bg-green-900/30 border-green-500 text-green-300"
                      : ""
                  }
                  ${
                    item.state === "not-found"
                      ? "bg-red-900/30 border-red-500 text-red-300"
                      : ""
                  }
                `}
              >
                {item.value}
              </div>
            ))}
          </div>

          {/* Résultat de la recherche */}
          {result && (
            <div
              className={`text-center p-4 rounded-md mt-4 ${
                result.includes("trouvé")
                  ? "bg-green-900/30 text-green-300"
                  : "bg-red-900/30 text-red-300"
              }`}
            >
              {result}
            </div>
          )}

          {/* Légende */}
          <div className="flex flex-wrap gap-4 justify-center mt-8">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-muted border border-muted-foreground/20 rounded"></div>
              <span className="text-sm text-muted-foreground">Non visité</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-900/30 border border-blue-500 rounded"></div>
              <span className="text-sm text-muted-foreground">
                En cours d&apos;examen
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-amber-900/30 border border-amber-500 rounded"></div>
              <span className="text-sm text-muted-foreground">
                Position actuelle
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-900/30 border border-green-500 rounded"></div>
              <span className="text-sm text-muted-foreground">
                Élément trouvé
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-900/30 border border-red-500 rounded"></div>
              <span className="text-sm text-muted-foreground">
                Élément non trouvé
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
