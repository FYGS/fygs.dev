"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  Check,
  CheckCircle,
  Code2,
  Copy,
  LightbulbIcon,
  Play,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PrismAsyncLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

// Types pour les exercices
interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  starterCode: string;
  solution: string;
  testCases: {
    input: number[];
    expected: number[];
  }[];
  hints: string[];
}

// Données des exercices
const exercises: Exercise[] = [
  {
    id: "bubble-sort",
    title: "Implémentation du Tri à Bulles",
    description:
      "Implémentez l'algorithme de tri à bulles pour trier un tableau de nombres en ordre croissant.",
    difficulty: "easy",
    starterCode: `function bubbleSort(arr) {
  // Votre code ici

  return arr;
}`,
    solution: `function bubbleSort(arr) {
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;

    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // Échanger les éléments
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }

    // Si aucun échange n'a été fait dans cette passe, le tableau est trié
    if (!swapped) break;
  }

  return arr;
}`,
    testCases: [
      {
        input: [5, 3, 8, 4, 2],
        expected: [2, 3, 4, 5, 8],
      },
      {
        input: [1, 2, 3, 4, 5],
        expected: [1, 2, 3, 4, 5],
      },
      {
        input: [5, 4, 3, 2, 1],
        expected: [1, 2, 3, 4, 5],
      },
    ],
    hints: [
      "Utilisez deux boucles imbriquées pour comparer les éléments adjacents.",
      "Échangez les éléments si l'élément actuel est plus grand que le suivant.",
      "Optimisez en arrêtant l'algorithme si aucun échange n'a été fait dans une passe.",
    ],
  },
  {
    id: "insertion-sort",
    title: "Implémentation du Tri par Insertion",
    description:
      "Implémentez l'algorithme de tri par insertion pour trier un tableau de nombres en ordre croissant.",
    difficulty: "medium",
    starterCode: `function insertionSort(arr) {
  // Votre code ici

  return arr;
}`,
    solution: `function insertionSort(arr) {
  const n = arr.length;

  for (let i = 1; i < n; i++) {
    // Élément à insérer dans la partie triée
    let key = arr[i];

    // Déplacer les éléments de arr[0..i-1] qui sont plus grands que key
    // vers une position en avant de leur position actuelle
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }

    // Placer key à sa position correcte
    arr[j + 1] = key;
  }

  return arr;
}`,
    testCases: [
      {
        input: [5, 3, 8, 4, 2],
        expected: [2, 3, 4, 5, 8],
      },
      {
        input: [1, 2, 3, 4, 5],
        expected: [1, 2, 3, 4, 5],
      },
      {
        input: [5, 4, 3, 2, 1],
        expected: [1, 2, 3, 4, 5],
      },
    ],
    hints: [
      "Commencez avec le deuxième élément (indice 1) car le premier élément est considéré comme déjà trié.",
      "Pour chaque élément, comparez-le avec les éléments précédents et déplacez-les vers la droite si nécessaire.",
      "Insérez l'élément à sa position correcte dans la partie triée du tableau.",
    ],
  },
  {
    id: "merge-sort",
    title: "Implémentation du Tri Fusion",
    description:
      "Implémentez l'algorithme de tri fusion pour trier un tableau de nombres en ordre croissant.",
    difficulty: "hard",
    starterCode: `function mergeSort(arr) {
  // Votre code ici

  return arr;
}

// Vous pouvez définir des fonctions auxiliaires si nécessaire`,
    solution: `function mergeSort(arr) {
  // Cas de base : un tableau de 0 ou 1 élément est déjà trié
  if (arr.length <= 1) {
    return arr;
  }

  // Diviser le tableau en deux moitiés
  const mid = Math.floor(arr.length / 2);
  const left = arr.slice(0, mid);
  const right = arr.slice(mid);

  // Trier récursivement les deux moitiés
  const sortedLeft = mergeSort(left);
  const sortedRight = mergeSort(right);

  // Fusionner les deux moitiés triées
  return merge(sortedLeft, sortedRight);
}

function merge(left, right) {
  let result = [];
  let leftIndex = 0;
  let rightIndex = 0;

  // Comparer les éléments des deux tableaux et les ajouter au résultat dans l'ordre
  while (leftIndex < left.length && rightIndex < right.length) {
    if (left[leftIndex] <= right[rightIndex]) {
      result.push(left[leftIndex]);
      leftIndex++;
    } else {
      result.push(right[rightIndex]);
      rightIndex++;
    }
  }

  // Ajouter les éléments restants
  return result.concat(left.slice(leftIndex)).concat(right.slice(rightIndex));
}`,
    testCases: [
      {
        input: [5, 3, 8, 4, 2],
        expected: [2, 3, 4, 5, 8],
      },
      {
        input: [1, 2, 3, 4, 5],
        expected: [1, 2, 3, 4, 5],
      },
      {
        input: [5, 4, 3, 2, 1],
        expected: [1, 2, 3, 4, 5],
      },
    ],
    hints: [
      "Utilisez l'approche 'diviser pour régner' : divisez le tableau en deux, triez chaque moitié, puis fusionnez-les.",
      "Créez une fonction auxiliaire pour fusionner deux tableaux triés.",
      "Le cas de base est un tableau de 0 ou 1 élément, qui est déjà trié.",
    ],
  },
];

export function SortingExercises() {
  const [selectedExercise, setSelectedExercise] = useState<string>(
    exercises[0].id
  );
  const [code, setCode] = useState<string>("");
  const [results, setResults] = useState<
    { passed: boolean; message: string }[]
  >([]);
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [showHints, setShowHints] = useState<boolean>(false);
  const [currentHint, setCurrentHint] = useState<number>(0);
  const [copiedSolution, setCopiedSolution] = useState<boolean>(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Trouver l'exercice sélectionné
  const exercise =
    exercises.find((ex) => ex.id === selectedExercise) || exercises[0];

  // Initialiser le code lorsque l'exercice change
  useEffect(() => {
    setCode(exercise.starterCode);
    setResults([]);
    setShowSolution(false);
    setShowHints(false);
    setCurrentHint(0);
  }, [selectedExercise, exercise.starterCode]);

  // Exécuter le code
  const runCode = () => {
    try {
      // Créer une fonction à partir du code
      const userFunction = new Function(`
        ${code}
        return {
          ${exercise.id.replace(/-/g, "")}: ${exercise.id.replace(/-/g, "")}
        };
      `)();

      // Vérifier si la fonction existe
      const sortFunction = userFunction[exercise.id.replace(/-/g, "")];
      if (typeof sortFunction !== "function") {
        setResults([
          {
            passed: false,
            message: `La fonction ${exercise.id.replace(
              /-/g,
              ""
            )} n'a pas été définie correctement.`,
          },
        ]);
        return;
      }

      // Exécuter les tests
      const testResults = exercise.testCases.map((testCase, index) => {
        const input = [...testCase.input]; // Copie pour éviter les modifications
        const result = sortFunction([...input]); // Copie pour éviter les modifications
        const expected = testCase.expected;

        // Vérifier si le résultat est correct
        const passed = JSON.stringify(result) === JSON.stringify(expected);

        return {
          passed,
          message: passed
            ? `Test ${index + 1} réussi : [${input}] => [${result}]`
            : `Test ${
                index + 1
              } échoué : [${input}] => [${result}] (attendu : [${expected}])`,
        };
      });

      setResults(testResults);
    } catch (error) {
      setResults([
        {
          passed: false,
          message: `Erreur : ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ]);
    }
  };

  // Réinitialiser le code
  const resetCode = () => {
    setCode(exercise.starterCode);
    setResults([]);
  };

  // Afficher l'indice suivant
  const showNextHint = () => {
    if (currentHint < exercise.hints.length - 1) {
      setCurrentHint(currentHint + 1);
    }
  };

  // Copier la solution
  const copySolution = () => {
    navigator.clipboard.writeText(exercise.solution);
    setCopiedSolution(true);
    setTimeout(() => setCopiedSolution(false), 2000);
  };

  // Obtenir la classe de difficulté
  const getDifficultyClass = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-900/30 text-green-400";
      case "medium":
        return "bg-amber-900/30 text-amber-400";
      case "hard":
        return "bg-red-900/30 text-red-400";
      default:
        return "";
    }
  };

  // Obtenir le texte de difficulté
  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "Facile";
      case "medium":
        return "Moyen";
      case "hard":
        return "Difficile";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <Code2 className="w-5 h-5 text-primary" />
            Exercices Pratiques
          </CardTitle>
          <CardDescription>
            Mettez en pratique vos connaissances en implémentant des algorithmes
            de tri
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Sélection de l'exercice */}
          <Tabs
            value={selectedExercise}
            onValueChange={setSelectedExercise}
            className="w-full"
          >
            <TabsList className="grid grid-cols-1 md:grid-cols-3 w-full">
              {exercises.map((ex) => (
                <TabsTrigger key={ex.id} value={ex.id} className="gap-2">
                  <Code2 className="w-4 h-4" />
                  <span>{ex.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Description de l'exercice */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">{exercise.title}</h3>
            <Badge className={getDifficultyClass(exercise.difficulty)}>
              {getDifficultyText(exercise.difficulty)}
            </Badge>
          </div>

          <div className="bg-muted/30 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              {exercise.description}
            </p>
          </div>

          {/* Éditeur de code */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Votre code</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetCode}
                  className="h-8 gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="text-xs">Réinitialiser</span>
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={runCode}
                  className="h-8 gap-1"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span className="text-xs">Exécuter</span>
                </Button>
              </div>
            </div>

            <div className="relative border rounded-lg overflow-hidden">
              <textarea
                ref={editorRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-80 p-4 font-mono text-sm bg-muted/30 focus:outline-hidden resize-none"
                spellCheck="false"
              />
            </div>
          </div>

          {/* Résultats des tests */}
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <h3 className="text-sm font-medium">Résultats des tests</h3>
              <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-2 p-2 rounded-lg ${
                      result.passed
                        ? "bg-green-900/20"
                        : "bg-red-900/20"
                    }`}
                  >
                    {result.passed ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                    )}
                    <span className="text-sm">{result.message}</span>
                  </div>
                ))}

                {results.every((r) => r.passed) && (
                  <div className="flex items-center justify-center gap-2 mt-4 p-2 bg-green-900/20 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-green-300">
                      Tous les tests ont réussi ! Excellent travail !
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Indices */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Indices</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHints(!showHints)}
                className="h-8"
              >
                {showHints ? "Masquer les indices" : "Afficher les indices"}
              </Button>
            </div>

            {showHints && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-muted/30 p-4 rounded-lg space-y-4"
              >
                {exercise.hints.slice(0, currentHint + 1).map((hint, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <LightbulbIcon className="w-5 h-5 text-amber-500 mt-0.5" />
                    <p className="text-sm text-muted-foreground">{hint}</p>
                  </div>
                ))}

                {currentHint < exercise.hints.length - 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={showNextHint}
                    className="mt-2"
                  >
                    Indice suivant
                  </Button>
                )}
              </motion.div>
            )}
          </div>

          {/* Solution */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Solution</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSolution(!showSolution)}
                className="h-8"
              >
                {showSolution ? "Masquer la solution" : "Afficher la solution"}
              </Button>
            </div>

            {showSolution && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="relative"
              >
                <div className="absolute top-2 right-2 z-10">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copySolution}
                    className="h-7 w-7 p-0"
                  >
                    {copiedSolution ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <SyntaxHighlighter
                  language="javascript"
                  style={vscDarkPlus}
                  className="rounded-lg text-sm"
                  showLineNumbers
                >
                  {exercise.solution}
                </SyntaxHighlighter>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
