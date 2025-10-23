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
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle,
  Code2,
  LightbulbIcon,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useState } from "react";

// Types pour les quiz
interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  code?: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
}

// Données des quiz
const quizzes: Quiz[] = [
  {
    id: "basics",
    title: "Notions de base",
    description:
      "Testez vos connaissances sur les concepts fondamentaux des algorithmes de tri",
    questions: [
      {
        id: "q1",
        question:
          "Quelle est la complexité temporelle moyenne du tri à bulles ?",
        options: ["O(n)", "O(n log n)", "O(n²)", "O(n³)"],
        correctAnswer: 2,
        explanation:
          "Le tri à bulles a une complexité temporelle moyenne de O(n²) car il utilise deux boucles imbriquées pour comparer et échanger les éléments adjacents.",
        difficulty: "easy",
      },
      {
        id: "q2",
        question: "Parmi ces algorithmes de tri, lequel est toujours stable ?",
        options: [
          "Tri rapide (Quick Sort)",
          "Tri par sélection (Selection Sort)",
          "Tri fusion (Merge Sort)",
          "Tri par tas (Heap Sort)",
        ],
        correctAnswer: 2,
        explanation:
          "Le tri fusion (Merge Sort) est toujours stable car il préserve l'ordre relatif des éléments égaux. Les autres algorithmes mentionnés ne sont pas stables par défaut.",
        difficulty: "medium",
      },
      {
        id: "q3",
        question:
          "Quel algorithme de tri a la meilleure performance pour un tableau déjà presque trié ?",
        options: [
          "Tri rapide (Quick Sort)",
          "Tri par insertion (Insertion Sort)",
          "Tri fusion (Merge Sort)",
          "Tri par tas (Heap Sort)",
        ],
        correctAnswer: 1,
        explanation:
          "Le tri par insertion a une complexité de O(n) pour un tableau déjà presque trié, ce qui le rend très efficace dans ce cas particulier.",
        difficulty: "medium",
      },
      {
        id: "q4",
        question:
          "Quelle est la complexité spatiale du tri fusion (Merge Sort) ?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
        correctAnswer: 2,
        explanation:
          "Le tri fusion nécessite un espace supplémentaire de O(n) pour stocker les sous-tableaux temporaires lors de la fusion.",
        difficulty: "medium",
      },
      {
        id: "q5",
        question:
          "Quel algorithme de tri est généralement le plus rapide en pratique pour de grands tableaux aléatoires ?",
        options: [
          "Tri à bulles (Bubble Sort)",
          "Tri par insertion (Insertion Sort)",
          "Tri rapide (Quick Sort)",
          "Tri par sélection (Selection Sort)",
        ],
        correctAnswer: 2,
        explanation:
          "Le tri rapide (Quick Sort) est généralement le plus rapide en pratique pour de grands tableaux aléatoires en raison de sa complexité moyenne de O(n log n) et de sa bonne localité de référence.",
        difficulty: "easy",
      },
    ],
  },
  {
    id: "implementation",
    title: "Implémentation",
    description: "Questions sur l'implémentation des algorithmes de tri",
    questions: [
      {
        id: "q1",
        question:
          "Quelle ligne de code est incorrecte dans cette implémentation du tri à bulles ?",
        options: [
          "for (let i = 0; i < arr.length - 1; i++)",
          "for (let j = 0; j < arr.length - i - 1; j++)",
          "if (arr[j] < arr[j + 1])",
          "[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]",
        ],
        correctAnswer: 2,
        explanation:
          "La condition devrait être `if (arr[j] > arr[j + 1])` pour échanger les éléments si l'élément actuel est plus grand que le suivant. Avec la condition `arr[j] < arr[j + 1]`, le tri serait en ordre décroissant.",
        difficulty: "medium",
        code: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] < arr[j + 1]) { // Cette ligne est incorrecte
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
      },
      {
        id: "q2",
        question:
          "Quelle est la valeur du pivot dans l'implémentation standard du tri rapide (Quick Sort) ?",
        options: [
          "Le premier élément du tableau",
          "Le dernier élément du tableau",
          "L'élément du milieu du tableau",
          "La médiane de trois éléments (premier, milieu, dernier)",
        ],
        correctAnswer: 1,
        explanation:
          "Dans l'implémentation standard du tri rapide, le dernier élément du tableau est souvent choisi comme pivot. Cependant, d'autres stratégies de sélection du pivot existent pour améliorer les performances dans certains cas.",
        difficulty: "medium",
        code: `function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    // Partitionner le tableau et obtenir l'indice du pivot
    const pivotIndex = partition(arr, low, high);

    // Trier récursivement les sous-tableaux
    quickSort(arr, low, pivotIndex - 1);
    quickSort(arr, pivotIndex + 1, high);
  }
  return arr;
}

function partition(arr, low, high) {
  // Le pivot est le dernier élément
  const pivot = arr[high];
  let i = low - 1;

  for (let j = low; j < high; j++) {
    if (arr[j] <= pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}`,
      },
      {
        id: "q3",
        question:
          "Quelle est l'optimisation la plus courante pour améliorer le tri par insertion ?",
        options: [
          "Utiliser un tri binaire pour trouver la position d'insertion",
          "Utiliser une liste chaînée au lieu d'un tableau",
          "Combiner avec le tri fusion pour les grands sous-tableaux",
          "Utiliser un tas binaire pour stocker les éléments",
        ],
        correctAnswer: 0,
        explanation:
          "L'utilisation d'une recherche binaire pour trouver la position d'insertion (Binary Insertion Sort) est une optimisation courante qui réduit le nombre de comparaisons de O(n) à O(log n) pour chaque élément, bien que le nombre de déplacements reste le même.",
        difficulty: "hard",
      },
      {
        id: "q4",
        question:
          "Quelle est la principale différence d'implémentation entre le tri fusion récursif et itératif ?",
        options: [
          "Le tri fusion itératif utilise une pile explicite",
          "Le tri fusion récursif ne peut pas trier de grands tableaux",
          "Le tri fusion itératif fusionne les sous-tableaux de bas en haut",
          "Le tri fusion récursif est toujours plus rapide",
        ],
        correctAnswer: 2,
        explanation:
          "Le tri fusion itératif fusionne les sous-tableaux de bas en haut, en commençant par des sous-tableaux de taille 1, puis 2, 4, etc., tandis que le tri fusion récursif divise d'abord le tableau en deux moitiés et fusionne de haut en bas.",
        difficulty: "hard",
      },
      {
        id: "q5",
        question:
          "Quelle technique est utilisée dans Timsort, l'algorithme de tri utilisé par défaut dans Python et Java ?",
        options: [
          "Combinaison de tri rapide et tri par tas",
          "Combinaison de tri fusion et tri par insertion",
          "Combinaison de tri à bulles et tri par sélection",
          "Utilisation exclusive du tri par comptage",
        ],
        correctAnswer: 1,
        explanation:
          "Timsort est un algorithme de tri hybride qui combine le tri fusion et le tri par insertion. Il utilise le tri par insertion pour les petits sous-tableaux et le tri fusion pour fusionner ces sous-tableaux triés.",
        difficulty: "hard",
      },
    ],
  },
  {
    id: "complexity",
    title: "Complexité et performance",
    description:
      "Questions avancées sur la complexité et la performance des algorithmes de tri",
    questions: [
      {
        id: "q1",
        question:
          "Quel algorithme de tri a la meilleure complexité temporelle dans le pire des cas ?",
        options: [
          "Tri rapide (Quick Sort)",
          "Tri fusion (Merge Sort)",
          "Tri par tas (Heap Sort)",
          "Tri par insertion (Insertion Sort)",
        ],
        correctAnswer: 1,
        explanation:
          "Le tri fusion et le tri par tas ont tous deux une complexité temporelle de O(n log n) dans le pire des cas, mais le tri fusion est généralement considéré comme ayant une constante plus petite et une meilleure localité de référence.",
        difficulty: "medium",
      },
      {
        id: "q2",
        question:
          "Pourquoi le tri rapide (Quick Sort) peut-il avoir une complexité de O(n²) dans le pire des cas ?",
        options: [
          "Parce qu'il utilise une approche diviser pour régner",
          "Parce que le pivot choisi peut conduire à des partitions déséquilibrées",
          "Parce qu'il nécessite un espace supplémentaire de O(n)",
          "Parce qu'il n'est pas stable",
        ],
        correctAnswer: 1,
        explanation:
          "Le tri rapide peut dégénérer en O(n²) si le pivot choisi conduit systématiquement à des partitions très déséquilibrées, comme lorsque le tableau est déjà trié et que le pivot est toujours l'élément le plus petit ou le plus grand.",
        difficulty: "medium",
      },
      {
        id: "q3",
        question:
          "Quelle est la complexité spatiale du tri par tas (Heap Sort) ?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        correctAnswer: 0,
        explanation:
          "Le tri par tas a une complexité spatiale de O(1) car il trie le tableau en place sans nécessiter d'espace supplémentaire proportionnel à la taille de l'entrée.",
        difficulty: "easy",
      },
      {
        id: "q4",
        question:
          "Quel algorithme de tri est le plus efficace pour trier un petit nombre d'éléments (moins de 10) ?",
        options: [
          "Tri rapide (Quick Sort)",
          "Tri fusion (Merge Sort)",
          "Tri par insertion (Insertion Sort)",
          "Tri par tas (Heap Sort)",
        ],
        correctAnswer: 2,
        explanation:
          "Le tri par insertion est généralement le plus efficace pour trier un petit nombre d'éléments en raison de sa simplicité, de sa faible constante et de son bon comportement sur de petits tableaux.",
        difficulty: "easy",
      },
      {
        id: "q5",
        question:
          "Quelle est la limite inférieure théorique de la complexité temporelle pour un algorithme de tri basé sur les comparaisons ?",
        options: ["O(n)", "O(n log n)", "O(n²)", "O(2^n)"],
        correctAnswer: 1,
        explanation:
          "La limite inférieure théorique pour tout algorithme de tri basé sur les comparaisons est O(n log n). Cette limite peut être démontrée en utilisant un arbre de décision pour représenter toutes les comparaisons possibles.",
        difficulty: "hard",
      },
    ],
  },
];

// Composant pour afficher un quiz
export function SortingQuizzes() {
  const [activeQuiz, setActiveQuiz] = useState<string>(quizzes[0].id);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  // L'explication est automatiquement affichée lorsque isAnswered est true
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

  // Trouver le quiz actif
  const quiz = quizzes.find((q) => q.id === activeQuiz) || quizzes[0];
  const currentQuestion = quiz.questions[currentQuestionIndex];

  // Réinitialiser le quiz
  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    // L'explication est gérée par isAnswered
    setQuizCompleted(false);
  };

  // Changer de quiz
  const changeQuiz = (quizId: string) => {
    setActiveQuiz(quizId);
    resetQuiz();
  };

  // Vérifier la réponse
  const checkAnswer = () => {
    if (selectedAnswer === null) return;

    setIsAnswered(true);

    if (selectedAnswer === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }
  };

  // Passer à la question suivante
  const nextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      // L'explication est gérée par isAnswered
    } else {
      setQuizCompleted(true);
    }
  };

  // Obtenir la classe de difficulté
  const getDifficultyClass = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "medium":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
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
            <Brain className="w-5 h-5 text-primary" />
            Quiz et Exercices
          </CardTitle>
          <CardDescription>
            Testez vos connaissances sur les algorithmes de tri avec ces quiz
            interactifs
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Sélection du quiz */}
          <Tabs
            value={activeQuiz}
            onValueChange={changeQuiz}
            className="w-full"
          >
            <TabsList className="grid grid-cols-1 md:grid-cols-3 w-full">
              {quizzes.map((q) => (
                <TabsTrigger key={q.id} value={q.id} className="gap-2">
                  {q.id === "basics" ? (
                    <BookOpen className="w-4 h-4" />
                  ) : q.id === "implementation" ? (
                    <Code2 className="w-4 h-4" />
                  ) : (
                    <Brain className="w-4 h-4" />
                  )}
                  <span>{q.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Description du quiz */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">{quiz.description}</p>
          </div>

          {/* Progression du quiz */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>
                Question {currentQuestionIndex + 1} sur {quiz.questions.length}
              </span>
              <span>
                Score: {score}/
                {quizCompleted ? quiz.questions.length : currentQuestionIndex}
              </span>
            </div>
            <Progress
              value={((currentQuestionIndex + 1) / quiz.questions.length) * 100}
              className="h-2"
            />
          </div>

          {/* Quiz terminé */}
          {quizCompleted ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-primary/10 p-6 rounded-lg text-center space-y-4"
            >
              <h3 className="text-xl font-bold">Quiz terminé !</h3>
              <p className="text-lg">
                Votre score: {score}/{quiz.questions.length} (
                {Math.round((score / quiz.questions.length) * 100)}%)
              </p>

              {score === quiz.questions.length ? (
                <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span>
                    Parfait ! Vous avez répondu correctement à toutes les
                    questions.
                  </span>
                </div>
              ) : score >= quiz.questions.length / 2 ? (
                <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400">
                  <LightbulbIcon className="w-5 h-5" />
                  <span>Bon travail ! Vous pouvez encore vous améliorer.</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400">
                  <XCircle className="w-5 h-5" />
                  <span>
                    Continuez à pratiquer pour améliorer vos connaissances.
                  </span>
                </div>
              )}

              <Button onClick={resetQuiz} className="mt-4 gap-2">
                <RefreshCw className="w-4 h-4" />
                Recommencer le quiz
              </Button>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Question */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">
                      {currentQuestion.question}
                    </h3>
                    <Badge
                      className={getDifficultyClass(currentQuestion.difficulty)}
                    >
                      {getDifficultyText(currentQuestion.difficulty)}
                    </Badge>
                  </div>

                  {/* Code (si présent) */}
                  {currentQuestion.code && (
                    <div className="relative">
                      <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto max-h-60">
                        <code>{currentQuestion.code}</code>
                      </pre>
                    </div>
                  )}

                  {/* Options */}
                  <RadioGroup
                    value={selectedAnswer?.toString() || ""}
                    onValueChange={(value) =>
                      setSelectedAnswer(parseInt(value))
                    }
                    className="space-y-3"
                    disabled={isAnswered}
                  >
                    {currentQuestion.options.map((option, index) => (
                      <div
                        key={index}
                        className={`flex items-center space-x-2 p-3 rounded-lg border ${
                          isAnswered
                            ? index === currentQuestion.correctAnswer
                              ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                              : index === selectedAnswer
                              ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                              : "border-transparent"
                            : "border-muted hover:border-muted-foreground/50 cursor-pointer"
                        }`}
                      >
                        <RadioGroupItem
                          value={index.toString()}
                          id={`option-${index}`}
                        />
                        <Label
                          htmlFor={`option-${index}`}
                          className={`grow cursor-pointer ${
                            isAnswered &&
                            index === currentQuestion.correctAnswer
                              ? "font-medium"
                              : ""
                          }`}
                        >
                          {option}
                        </Label>
                        {isAnswered &&
                          (index === currentQuestion.correctAnswer ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : index === selectedAnswer ? (
                            <XCircle className="w-5 h-5 text-red-500" />
                          ) : null)}
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Explication */}
                {isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-muted/30 p-4 rounded-lg space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <LightbulbIcon className="w-5 h-5 text-amber-500" />
                      <h4 className="font-medium">Explication</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {currentQuestion.explanation}
                    </p>
                  </motion.div>
                )}

                {/* Actions */}
                <div className="flex justify-between">
                  {!isAnswered ? (
                    <Button
                      onClick={checkAnswer}
                      disabled={selectedAnswer === null}
                      className="gap-2"
                    >
                      Vérifier
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button onClick={nextQuestion} className="gap-2">
                      {currentQuestionIndex < quiz.questions.length - 1
                        ? "Question suivante"
                        : "Terminer le quiz"}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
