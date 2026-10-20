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
import { quizzes } from "./sorting-quizzes/data";
import { useProgress } from "../../../../_hooks/use-progress";

// Composant pour afficher un quiz
export function SortingQuizzes() {
  const { trackQuizScore } = useProgress();
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
      trackQuizScore(`sorting-${quiz.id}`, score, quiz.questions.length);
    }
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
                <div className="flex items-center justify-center gap-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span>
                    Parfait ! Vous avez répondu correctement à toutes les
                    questions.
                  </span>
                </div>
              ) : score >= quiz.questions.length / 2 ? (
                <div className="flex items-center justify-center gap-2 text-amber-400">
                  <LightbulbIcon className="w-5 h-5" />
                  <span>Bon travail ! Vous pouvez encore vous améliorer.</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-red-400">
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
                              ? "border-green-500 bg-green-900/20"
                              : index === selectedAnswer
                              ? "border-red-500 bg-red-900/20"
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
