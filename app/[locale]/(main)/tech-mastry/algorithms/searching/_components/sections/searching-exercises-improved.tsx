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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, CheckCircle, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { CodeEditor } from "./code-editor/code-editor";
import { CodeRunner } from "./code-editor/code-runner";

// Types pour les exercices
type ExerciseType = "linear" | "binary" | "jump" | "interpolation" | "hash";

// Données des exercices
export const exercises = [
  {
    id: "linear",
    title: "Recherche Linéaire",
    description:
      "Implémentez une fonction de recherche linéaire qui trouve l'index d'un élément dans un tableau.",
    task: "Écrivez une fonction `linearSearch(arr, target)` qui retourne l'index de `target` dans `arr`, ou -1 s'il n'est pas trouvé.",
    template: `function linearSearch(arr, target) {
  // Votre code ici
}

// Exemples d'utilisation
console.log(linearSearch([1, 3, 5, 7, 9], 5)); // Devrait retourner 2
console.log(linearSearch([1, 3, 5, 7, 9], 6)); // Devrait retourner -1`,
    solution: `function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      return i;
    }
  }
  return -1;
}

// Exemples d'utilisation
console.log(linearSearch([1, 3, 5, 7, 9], 5)); // Retourne 2
console.log(linearSearch([1, 3, 5, 7, 9], 6)); // Retourne -1`,
    explanation:
      "La recherche linéaire parcourt séquentiellement chaque élément du tableau jusqu'à trouver l'élément recherché ou atteindre la fin du tableau. Si l'élément est trouvé, la fonction retourne son index, sinon elle retourne -1.",
    testCases: [
      {
        name: "Trouver un élément présent",
        test: (fn: (...args: unknown[]) => unknown) =>
          fn([1, 3, 5, 7, 9], 5) === 2,
        expectedOutput: "2",
      },
      {
        name: "Élément non présent",
        test: (fn: (...args: unknown[]) => unknown) =>
          fn([1, 3, 5, 7, 9], 6) === -1,
        expectedOutput: "-1",
      },
      {
        name: "Premier élément",
        test: (fn: (...args: unknown[]) => unknown) =>
          fn([1, 3, 5, 7, 9], 1) === 0,
        expectedOutput: "0",
      },
      {
        name: "Dernier élément",
        test: (fn: (...args: unknown[]) => unknown) =>
          fn([1, 3, 5, 7, 9], 9) === 4,
        expectedOutput: "4",
      },
      {
        name: "Tableau vide",
        test: (fn: (...args: unknown[]) => unknown) => fn([], 5) === -1,
        expectedOutput: "-1",
      },
    ],
  },
  {
    id: "binary",
    title: "Recherche Binaire",
    description:
      "Implémentez une fonction de recherche binaire qui trouve l'index d'un élément dans un tableau trié.",
    task: "Écrivez une fonction `binarySearch(arr, target)` qui retourne l'index de `target` dans le tableau trié `arr`, ou -1 s'il n'est pas trouvé.",
    template: `function binarySearch(arr, target) {
  // Votre code ici
}

// Exemples d'utilisation
console.log(binarySearch([1, 3, 5, 7, 9], 5)); // Devrait retourner 2
console.log(binarySearch([1, 3, 5, 7, 9], 6)); // Devrait retourner -1`,
    solution: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (arr[mid] === target) {
      return mid;
    }

    if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return -1;
}

// Exemples d'utilisation
console.log(binarySearch([1, 3, 5, 7, 9], 5)); // Retourne 2
console.log(binarySearch([1, 3, 5, 7, 9], 6)); // Retourne -1`,
    explanation:
      "La recherche binaire divise répétitivement l'espace de recherche en deux. Elle compare l'élément du milieu avec la cible, puis continue la recherche dans la moitié gauche ou droite selon que la cible est inférieure ou supérieure à l'élément du milieu. Cette approche a une complexité de O(log n).",
    testCases: [
      {
        name: "Trouver un élément présent",
        test: (fn: (...args: unknown[]) => unknown) =>
          fn([1, 3, 5, 7, 9], 5) === 2,
        expectedOutput: "2",
      },
      {
        name: "Élément non présent",
        test: (fn: (...args: unknown[]) => unknown) =>
          fn([1, 3, 5, 7, 9], 6) === -1,
        expectedOutput: "-1",
      },
      {
        name: "Premier élément",
        test: (fn: (...args: unknown[]) => unknown) =>
          fn([1, 3, 5, 7, 9], 1) === 0,
        expectedOutput: "0",
      },
      {
        name: "Dernier élément",
        test: (fn: (...args: unknown[]) => unknown) =>
          fn([1, 3, 5, 7, 9], 9) === 4,
        expectedOutput: "4",
      },
      {
        name: "Tableau vide",
        test: (fn: (...args: unknown[]) => unknown) => fn([], 5) === -1,
        expectedOutput: "-1",
      },
      {
        name: "Grand tableau",
        test: (fn: (...args: unknown[]) => unknown) => {
          const arr = Array.from({ length: 1000 }, (_, i) => i * 2);
          return fn(arr, 500) === 250;
        },
        expectedOutput: "250",
      },
    ],
  },
  {
    id: "jump",
    title: "Recherche par Saut",
    description:
      "Implémentez une fonction de recherche par saut qui trouve l'index d'un élément dans un tableau trié.",
    task: "Écrivez une fonction `jumpSearch(arr, target)` qui retourne l'index de `target` dans le tableau trié `arr`, ou -1 s'il n'est pas trouvé.",
    template: `function jumpSearch(arr, target) {
  // Votre code ici
}

// Exemples d'utilisation
console.log(jumpSearch([1, 3, 5, 7, 9, 11, 13, 15, 17, 19], 13)); // Devrait retourner 6
console.log(jumpSearch([1, 3, 5, 7, 9, 11, 13, 15, 17, 19], 4));  // Devrait retourner -1`,
    solution: `function jumpSearch(arr, target) {
  const n = arr.length;
  let step = Math.floor(Math.sqrt(n));

  // Trouver le bloc
  let prev = 0;
  while (arr[Math.min(step, n) - 1] < target) {
    prev = step;
    step += Math.floor(Math.sqrt(n));
    if (prev >= n) return -1;
  }

  // Recherche linéaire dans le bloc
  while (arr[prev] < target) {
    prev++;
    if (prev === Math.min(step, n)) return -1;
  }

  if (arr[prev] === target) return prev;
  return -1;
}

// Exemples d'utilisation
console.log(jumpSearch([1, 3, 5, 7, 9, 11, 13, 15, 17, 19], 13)); // Retourne 6
console.log(jumpSearch([1, 3, 5, 7, 9, 11, 13, 15, 17, 19], 4));  // Retourne -1`,
    explanation:
      "La recherche par saut combine les avantages de la recherche linéaire et binaire. Elle saute par blocs de taille √n, puis effectue une recherche linéaire dans le bloc pertinent. Cette approche a une complexité de O(√n), ce qui est meilleur que la recherche linéaire mais moins efficace que la recherche binaire.",
    testCases: [
      {
        name: "Trouver un élément présent",
        test: (fn: (...args: unknown[]) => unknown) =>
          fn([1, 3, 5, 7, 9, 11, 13, 15, 17, 19], 13) === 6,
        expectedOutput: "6",
      },
      {
        name: "Élément non présent",
        test: (fn: (...args: unknown[]) => unknown) =>
          fn([1, 3, 5, 7, 9, 11, 13, 15, 17, 19], 4) === -1,
        expectedOutput: "-1",
      },
      {
        name: "Premier élément",
        test: (fn: (...args: unknown[]) => unknown) =>
          fn([1, 3, 5, 7, 9, 11, 13, 15, 17, 19], 1) === 0,
        expectedOutput: "0",
      },
      {
        name: "Dernier élément",
        test: (fn: (...args: unknown[]) => unknown) =>
          fn([1, 3, 5, 7, 9, 11, 13, 15, 17, 19], 19) === 9,
        expectedOutput: "9",
      },
      {
        name: "Tableau vide",
        test: (fn: (...args: unknown[]) => unknown) => fn([], 5) === -1,
        expectedOutput: "-1",
      },
    ],
  },
  {
    id: "interpolation",
    title: "Recherche par Interpolation",
    description:
      "Implémentez une fonction de recherche par interpolation qui trouve l'index d'un élément dans un tableau trié.",
    task: "Écrivez une fonction `interpolationSearch(arr, target)` qui retourne l'index de `target` dans le tableau trié `arr`, ou -1 s'il n'est pas trouvé.",
    template: `function interpolationSearch(arr, target) {
  // Votre code ici
}

// Exemples d'utilisation
console.log(interpolationSearch([1, 3, 5, 7, 9, 11, 13, 15, 17, 19], 13)); // Devrait retourner 6
console.log(interpolationSearch([1, 3, 5, 7, 9, 11, 13, 15, 17, 19], 4));  // Devrait retourner -1`,
    solution: `function interpolationSearch(arr, target) {
  let low = 0;
  let high = arr.length - 1;

  while (low <= high && target >= arr[low] && target <= arr[high]) {
    if (low === high) {
      return arr[low] === target ? low : -1;
    }

    // Calculer la position estimée
    const pos = low + Math.floor(
      ((high - low) * (target - arr[low])) /
      (arr[high] - arr[low])
    );

    if (arr[pos] === target) return pos;

    if (arr[pos] < target) {
      low = pos + 1;
    } else {
      high = pos - 1;
    }
  }

  return -1;
}

// Exemples d'utilisation
console.log(interpolationSearch([1, 3, 5, 7, 9, 11, 13, 15, 17, 19], 13)); // Retourne 6
console.log(interpolationSearch([1, 3, 5, 7, 9, 11, 13, 15, 17, 19], 4));  // Retourne -1`,
    explanation:
      "La recherche par interpolation améliore la recherche binaire en estimant la position probable de l'élément recherché en fonction de sa valeur et de la distribution des valeurs dans le tableau. Pour des données uniformément distribuées, elle peut atteindre une complexité de O(log log n), mais peut se dégrader à O(n) dans le pire des cas.",
    testCases: [
      {
        name: "Trouver un élément présent",
        test: (fn: (...args: unknown[]) => unknown) =>
          fn([1, 3, 5, 7, 9, 11, 13, 15, 17, 19], 13) === 6,
        expectedOutput: "6",
      },
      {
        name: "Élément non présent",
        test: (fn: (...args: unknown[]) => unknown) =>
          fn([1, 3, 5, 7, 9, 11, 13, 15, 17, 19], 4) === -1,
        expectedOutput: "-1",
      },
      {
        name: "Premier élément",
        test: (fn: (...args: unknown[]) => unknown) =>
          fn([1, 3, 5, 7, 9, 11, 13, 15, 17, 19], 1) === 0,
        expectedOutput: "0",
      },
      {
        name: "Dernier élément",
        test: (fn: (...args: unknown[]) => unknown) =>
          fn([1, 3, 5, 7, 9, 11, 13, 15, 17, 19], 19) === 9,
        expectedOutput: "9",
      },
      {
        name: "Tableau vide",
        test: (fn: (...args: unknown[]) => unknown) => fn([], 5) === -1,
        expectedOutput: "-1",
      },
      {
        name: "Données uniformément distribuées",
        test: (fn: (...args: unknown[]) => unknown) => {
          const arr = Array.from({ length: 100 }, (_, i) => i * 2);
          return fn(arr, 50) === 25;
        },
        expectedOutput: "25",
      },
    ],
  },
  {
    id: "hash",
    title: "Recherche par Hachage",
    description:
      "Implémentez une fonction de recherche par hachage qui trouve l'index d'un élément dans un tableau.",
    task: "Écrivez une fonction `hashSearch(arr, target)` qui retourne l'index de `target` dans `arr`, ou -1 s'il n'est pas trouvé, en utilisant une table de hachage.",
    template: `function hashSearch(arr, target) {
  // Votre code ici
}

// Exemples d'utilisation
console.log(hashSearch([10, 20, 15, 5, 25], 15)); // Devrait retourner 2
console.log(hashSearch([10, 20, 15, 5, 25], 8));  // Devrait retourner -1`,
    solution: `function hashSearch(arr, target) {
  const hashMap = new Map();

  // Construction de la table de hachage
  for (let i = 0; i < arr.length; i++) {
    hashMap.set(arr[i], i);
  }

  // Recherche dans la table de hachage
  return hashMap.has(target) ? hashMap.get(target) : -1;
}

// Exemples d'utilisation
console.log(hashSearch([10, 20, 15, 5, 25], 15)); // Retourne 2
console.log(hashSearch([10, 20, 15, 5, 25], 8));  // Retourne -1`,
    explanation:
      "La recherche par hachage utilise une table de hachage pour stocker les éléments et leurs indices. La recherche se fait ensuite en temps constant O(1) en moyenne. Cette approche est très efficace pour les recherches fréquentes, mais nécessite plus de mémoire et un temps de prétraitement pour construire la table de hachage.",
    testCases: [
      {
        name: "Trouver un élément présent",
        test: (fn: (...args: unknown[]) => unknown) =>
          fn([10, 20, 15, 5, 25], 15) === 2,
        expectedOutput: "2",
      },
      {
        name: "Élément non présent",
        test: (fn: (...args: unknown[]) => unknown) =>
          fn([10, 20, 15, 5, 25], 8) === -1,
        expectedOutput: "-1",
      },
      {
        name: "Premier élément",
        test: (fn: (...args: unknown[]) => unknown) =>
          fn([10, 20, 15, 5, 25], 10) === 0,
        expectedOutput: "0",
      },
      {
        name: "Dernier élément",
        test: (fn: (...args: unknown[]) => unknown) =>
          fn([10, 20, 15, 5, 25], 25) === 4,
        expectedOutput: "4",
      },
      {
        name: "Tableau vide",
        test: (fn: (...args: unknown[]) => unknown) => fn([], 5) === -1,
        expectedOutput: "-1",
      },
      {
        name: "Tableau avec doublons",
        test: (fn: (...args: unknown[]) => unknown) => {
          // La fonction devrait retourner l'index de la première occurrence
          const result = fn([10, 20, 10, 5, 25], 10);
          return result === 0 || result === 2;
        },
        expectedOutput: "0 ou 2",
      },
    ],
  },
];

export function SearchingExercisesImproved() {
  const [activeExercise, setActiveExercise] = useState<ExerciseType>("linear");

  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  // Trouver l'exercice actif
  const currentExercise =
    exercises.find((ex) => ex.id === activeExercise) || exercises[0];

  // Réinitialiser le code lorsque l'exercice change
  const handleExerciseChange = (value: string) => {
    setActiveExercise(value as ExerciseType);
    setShowSolution(false);
    setShowExplanation(false);
  };

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Exercices Pratiques</h2>
        <p className="text-muted-foreground">
          Mettez en pratique vos connaissances en implémentant différents
          algorithmes de recherche.
        </p>
      </div>

      {/* Sélection de l'exercice */}
      <Tabs
        value={activeExercise}
        onValueChange={handleExerciseChange}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
          {exercises.map((ex) => (
            <TabsTrigger key={ex.id} value={ex.id}>
              {ex.title.split(" ")[1] || ex.title}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Exercice actif */}
      <Card>
        <CardHeader>
          <CardTitle>{currentExercise.title}</CardTitle>
          <CardDescription>{currentExercise.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Tâche:</h3>
            <p className="text-muted-foreground">{currentExercise.task}</p>
          </div>

          <CodeRunner
            initialCode={currentExercise.template}
            language="javascript"
            title={`Exercice: ${currentExercise.title}`}
            functionName={currentExercise.id + "Search"}
            testCases={currentExercise.testCases}
            height="300px"
          />
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowSolution(!showSolution)}
              className="flex items-center gap-2"
            >
              {showSolution ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  Masquer la solution
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Voir la solution
                </>
              )}
            </Button>
            <Button
              variant={showExplanation ? "default" : "outline"}
              onClick={() => setShowExplanation(!showExplanation)}
              className="flex items-center gap-2"
            >
              {showExplanation ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Masquer l&apos;explication
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  Explication
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Solution */}
      {showSolution && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Solution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CodeEditor
              initialCode={currentExercise.solution}
              language="javascript"
              height="300px"
              readOnly={true}
            />
          </CardContent>
        </Card>
      )}

      {/* Explication */}
      {showExplanation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-primary" />
              Explication
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {currentExercise.explanation}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
