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
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, RotateCcw, XCircle } from "lucide-react";
import { useState } from "react";

// Types pour les quiz
type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

// Données des questions du quiz
const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question:
      "Quelle est la complexité temporelle de la recherche linéaire dans le pire des cas ?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    correctAnswer: 2,
    explanation:
      "La recherche linéaire parcourt séquentiellement chaque élément du tableau jusqu'à trouver l'élément recherché ou atteindre la fin du tableau. Dans le pire des cas, l'élément n'est pas présent ou est le dernier élément, ce qui nécessite de parcourir tout le tableau, d'où une complexité de O(n).",
  },
  {
    id: 2,
    question:
      "Quelle condition préalable est nécessaire pour utiliser la recherche binaire ?",
    options: [
      "Le tableau doit être trié",
      "Le tableau doit contenir uniquement des nombres",
      "Le tableau doit avoir une taille qui est une puissance de 2",
      "Aucune condition préalable n'est nécessaire",
    ],
    correctAnswer: 0,
    explanation:
      "La recherche binaire nécessite que le tableau soit trié au préalable. Elle fonctionne en divisant répétitivement l'espace de recherche en deux, ce qui n'est possible que si les éléments sont ordonnés.",
  },
  {
    id: 3,
    question:
      "Quelle est la complexité temporelle de la recherche binaire dans le pire des cas ?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correctAnswer: 1,
    explanation:
      "La recherche binaire divise l'espace de recherche en deux à chaque étape, ce qui donne une complexité logarithmique de O(log n) même dans le pire des cas.",
  },
  {
    id: 4,
    question:
      "Quelle méthode de recherche est généralement la plus efficace pour les tableaux non triés ?",
    options: [
      "Recherche binaire",
      "Recherche linéaire",
      "Recherche par interpolation",
      "Recherche par saut",
    ],
    correctAnswer: 1,
    explanation:
      "Pour les tableaux non triés, la recherche linéaire est généralement la plus efficace car les autres méthodes (binaire, interpolation, saut) nécessitent que le tableau soit trié au préalable.",
  },
  {
    id: 5,
    question: "Quelle est la complexité spatiale de la recherche par hachage ?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    correctAnswer: 2,
    explanation:
      "La recherche par hachage nécessite de construire une table de hachage qui stocke tous les éléments du tableau, ce qui donne une complexité spatiale de O(n).",
  },
  {
    id: 6,
    question:
      "Dans quel cas la recherche par interpolation est-elle plus efficace que la recherche binaire ?",
    options: [
      "Lorsque le tableau est très grand",
      "Lorsque les données sont uniformément distribuées",
      "Lorsque le tableau contient des doublons",
      "Lorsque le tableau n'est pas trié",
    ],
    correctAnswer: 1,
    explanation:
      "La recherche par interpolation est plus efficace que la recherche binaire lorsque les données sont uniformément distribuées, car elle peut estimer plus précisément la position de l'élément recherché, atteignant une complexité de O(log log n) dans ce cas.",
  },
  {
    id: 7,
    question:
      "Quelle est la complexité temporelle moyenne de la recherche par hachage ?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correctAnswer: 0,
    explanation:
      "La recherche par hachage a une complexité temporelle moyenne de O(1) pour les opérations de recherche, ce qui en fait l'une des méthodes les plus rapides. Cependant, cette performance dépend d'une bonne fonction de hachage et peut se dégrader en cas de collisions.",
  },
  {
    id: 8,
    question:
      "Quelle méthode de recherche utilise la formule de position pos = low + ((x - arr[low]) * (high - low) / (arr[high] - arr[low])) ?",
    options: [
      "Recherche linéaire",
      "Recherche binaire",
      "Recherche par interpolation",
      "Recherche par saut",
    ],
    correctAnswer: 2,
    explanation:
      "Cette formule est utilisée dans la recherche par interpolation pour estimer la position probable de l'élément recherché en fonction de sa valeur et de la distribution des valeurs dans le tableau.",
  },
  {
    id: 9,
    question:
      "Quelle méthode de recherche combine les avantages de la recherche linéaire et binaire en sautant par blocs de taille √n ?",
    options: [
      "Recherche par interpolation",
      "Recherche par saut",
      "Recherche par hachage",
      "Recherche exponentielle",
    ],
    correctAnswer: 1,
    explanation:
      "La recherche par saut (Jump Search) combine les avantages de la recherche linéaire et binaire en sautant par blocs de taille √n, puis en effectuant une recherche linéaire dans le bloc pertinent.",
  },
  {
    id: 10,
    question:
      "Quel est l'avantage principal de la recherche par hachage par rapport aux autres méthodes ?",
    options: [
      "Elle fonctionne sur des tableaux non triés",
      "Elle utilise moins de mémoire",
      "Elle a une complexité temporelle moyenne de O(1)",
      "Elle est plus simple à implémenter",
    ],
    correctAnswer: 2,
    explanation:
      "L'avantage principal de la recherche par hachage est sa complexité temporelle moyenne de O(1), ce qui la rend extrêmement rapide pour les recherches fréquentes, bien qu'elle nécessite plus de mémoire et un temps de prétraitement.",
  },
];

export function SearchingQuizzes() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

  // Obtenir la question actuelle
  const currentQuestion = quizQuestions[currentQuestionIndex];

  // Réinitialiser le quiz
  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizCompleted(false);
  };

  // Passer à la question suivante
  const nextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizCompleted(true);
    }
  };

  // Vérifier la réponse
  const checkAnswer = () => {
    if (selectedOption !== null) {
      setIsAnswered(true);
      if (selectedOption === currentQuestion.correctAnswer) {
        setScore(score + 1);
      }
    }
  };

  // Calculer le pourcentage de progression
  const progressPercentage =
    ((currentQuestionIndex + 1) / quizQuestions.length) * 100;

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">
          Quiz sur les Algorithmes de Recherche
        </h2>
        <p className="text-muted-foreground">
          Testez vos connaissances sur les différents algorithmes de recherche.
        </p>
      </div>

      {/* Quiz */}
      {!quizCompleted ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Question {currentQuestionIndex + 1} sur {quizQuestions.length}
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                Score: {score}/{currentQuestionIndex + (isAnswered ? 1 : 0)}
              </div>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </CardHeader>

          <CardContent className="space-y-6">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-medium">
                {currentQuestion.question}
              </h3>

              <RadioGroup
                value={selectedOption?.toString()}
                onValueChange={(value) => setSelectedOption(parseInt(value))}
                className="space-y-3"
                disabled={isAnswered}
              >
                {currentQuestion.options.map((option, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-2 p-3 rounded-md border ${
                      isAnswered
                        ? index === currentQuestion.correctAnswer
                          ? "border-green-500 bg-green-50 dark:bg-green-950/30"
                          : index === selectedOption
                          ? "border-red-500 bg-red-50 dark:bg-red-950/30"
                          : "border-muted"
                        : "border-muted hover:border-primary"
                    }`}
                  >
                    <RadioGroupItem
                      value={index.toString()}
                      id={`option-${index}`}
                      className={
                        isAnswered && index === currentQuestion.correctAnswer
                          ? "text-green-500"
                          : ""
                      }
                    />
                    <Label
                      htmlFor={`option-${index}`}
                      className="flex-1 cursor-pointer"
                    >
                      {option}
                    </Label>
                    {isAnswered && index === currentQuestion.correctAnswer && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {isAnswered &&
                      index === selectedOption &&
                      index !== currentQuestion.correctAnswer && (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                  </div>
                ))}
              </RadioGroup>

              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="bg-muted/50 p-4 rounded-lg"
                >
                  <h4 className="font-medium mb-2">Explication:</h4>
                  <p className="text-muted-foreground">
                    {currentQuestion.explanation}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={resetQuiz}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Recommencer
            </Button>

            {isAnswered ? (
              <Button
                onClick={nextQuestion}
                className="flex items-center gap-2"
              >
                {currentQuestionIndex < quizQuestions.length - 1 ? (
                  <>
                    Question suivante
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  "Terminer le quiz"
                )}
              </Button>
            ) : (
              <Button onClick={checkAnswer} disabled={selectedOption === null}>
                Vérifier
              </Button>
            )}
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Quiz terminé !</CardTitle>
            <CardDescription>
              Vous avez obtenu un score de {score} sur {quizQuestions.length}.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
                <div className="text-2xl font-bold text-primary">
                  {Math.round((score / quizQuestions.length) * 100)}%
                </div>
              </div>

              <h3 className="text-xl font-medium mb-2">
                {score === quizQuestions.length
                  ? "Parfait ! Vous maîtrisez les algorithmes de recherche !"
                  : score >= quizQuestions.length * 0.7
                  ? "Très bien ! Vous avez une bonne compréhension des algorithmes de recherche."
                  : score >= quizQuestions.length * 0.5
                  ? "Pas mal ! Continuez à étudier pour améliorer vos connaissances."
                  : "Continuez à apprendre et réessayez pour améliorer votre score."}
              </h3>

              <p className="text-muted-foreground">
                Vous pouvez recommencer le quiz pour tester à nouveau vos
                connaissances.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center">
            <Button onClick={resetQuiz} className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Recommencer le quiz
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
