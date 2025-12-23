"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  XCircle,
  RotateCcw,
  Target,
  ArrowLeft,
  ArrowRight,
  List,
} from "lucide-react";
import { submitQuizResult } from "@/app/actions/quiz-actions";
import { useQuizCompletion } from "@/hooks/use-quiz-completion";
import { toast } from "sonner";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  order: number;
}

interface QuizInfo {
  id: string;
  title: string;
  moduleId: number;
  questionCount: number;
}

interface QuizStudentProps {
  quiz: {
    id: string;
    title: string;
    questions: QuizQuestion[];
  };
  allQuizzes?: QuizInfo[];
  courseSlug: string;
  courseId: string;
  currentQuizId: string;
  previousLessonSlug?: string | null;
}

export function QuizStudent({
  quiz,
  allQuizzes = [],
  courseSlug,
  courseId,
  currentQuizId,
  previousLessonSlug,
}: QuizStudentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<
    { questionId: string; selectedOption: number; isCorrect: boolean }[]
  >([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { checkCertificate } = useQuizCompletion();

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;

  const handleAnswerSelection = (optionIndex: number) => {
    if (hasAnswered) return;
    setSelectedOption(optionIndex);
    const isCorrect = optionIndex === currentQuestion?.correct;
    setUserAnswers((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        selectedOption: optionIndex,
        isCorrect,
      },
    ]);
    setHasAnswered(true);
    setShowExplanation(true);
    if (isCorrect) setScore((prev) => prev + 1);
  };

  const nextQuestion = async () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setHasAnswered(false);
      setShowExplanation(false);
    } else {
      setQuizCompleted(true);
      // Submit quiz result to database
      await handleQuizCompletion();
    }
  };

  const handleQuizCompletion = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const percentage = getScorePercentage();
      const result = await submitQuizResult({
        quizId: quiz.id,
        courseId,
        score,
        total: totalQuestions,
        percentage,
      });

      if (result.success) {
        toast.success("Résultat enregistré avec succès!");
        // Check if certificate was earned
        await checkCertificate(courseId);
      } else {
        toast.error(result.error || "Erreur lors de l'enregistrement");
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error("Erreur lors de l'enregistrement du résultat");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setSelectedOption(null);
    setHasAnswered(false);
    setShowExplanation(false);
    setQuizCompleted(false);
    setScore(0);
  };

  const getScorePercentage = () => {
    return totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  };

  const getScoreColor = () => {
    const percentage = getScorePercentage();
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreMessage = () => {
    const percentage = getScorePercentage();
    if (percentage >= 80) return "Excellent! Vous maîtrisez ce module! 🎉";
    if (percentage >= 60)
      return "Bon travail! Revoyez les concepts manqués. 👍";
    return "Continuez à étudier! Revoyez le contenu du module. 📚";
  };

  if (!quiz || !quiz.questions.length) return null;

  // Find current quiz position and navigation options
  const currentQuizIndex = allQuizzes.findIndex((q) => q.id === currentQuizId);
  const previousQuiz =
    currentQuizIndex > 0 ? allQuizzes[currentQuizIndex - 1] : null;
  const nextQuiz =
    currentQuizIndex < allQuizzes.length - 1
      ? allQuizzes[currentQuizIndex + 1]
      : null;

  return (
    <div className="space-y-6">
      {/* Return to Lessons Button */}
      {previousLessonSlug && (
        <div className="flex justify-center">
          <Link href={`/formations/${courseSlug}/lessons/${previousLessonSlug}`}>
            <Button
              variant="outline"
              className="flex items-center gap-2 border-primary/50 hover:border-primary hover:bg-primary/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux leçons
            </Button>
          </Link>
        </div>
      )}

      {/* Quiz Navigation Header */}
      {allQuizzes.length > 1 && (
        <Card className="border border-slate-700 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <List className="h-4 w-4 text-white" />
                </div>
                <span className="text-slate-100">
                  Navigation des Quiz
                </span>
              </div>
              <Badge
                variant="secondary"
                className="bg-slate-800 text-slate-300"
              >
                {currentQuizIndex + 1} / {allQuizzes.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              {previousQuiz ? (
                <Link
                  href={`/formations/${courseSlug}/quizzes/${previousQuiz.id}`}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {previousQuiz.title}
                  </Button>
                </Link>
              ) : (
                <div></div>
              )}

              <div className="text-center">
                <p className="text-sm text-slate-400">
                  Quiz Actuel
                </p>
                <p className="font-semibold text-slate-100">
                  {quiz.title}
                </p>
              </div>

              {nextQuiz ? (
                <Link href={`/formations/${courseSlug}/quizzes/${nextQuiz.id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {nextQuiz.title}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <div></div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Quiz Card */}
      <Card className="border border-slate-700 shadow-sm">
        <CardHeader className="border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
          <CardTitle className="flex items-center justify-between text-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Target className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl">Quiz : {quiz.title}</span>
            </div>
            <Badge
              variant="secondary"
              className="bg-emerald-900 text-emerald-200 border-emerald-700"
            >
              {quiz.questions.length} question
              {quiz.questions.length > 1 ? "s" : ""}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {!quizCompleted ? (
            <>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Progression
                  </span>
                  <span className="text-sm font-medium">
                    {Math.round(
                      ((currentQuestionIndex + (hasAnswered ? 1 : 0)) /
                        totalQuestions) *
                        100
                    )}
                    %
                  </span>
                </div>
                <Progress
                  value={
                    ((currentQuestionIndex + (hasAnswered ? 1 : 0)) /
                      totalQuestions) *
                    100
                  }
                  className="h-2"
                />
              </div>
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">
                    {currentQuestion.question}
                  </h3>
                  <div className="space-y-4">
                    {currentQuestion.options.map((option, index) => {
                      let buttonClass =
                        "w-full text-left p-6 border-2 rounded-xl transition-all duration-300 group relative overflow-hidden ";
                      if (hasAnswered) {
                        if (index === currentQuestion.correct) {
                          buttonClass +=
                            "border-emerald-400 bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-900 shadow-lg shadow-emerald-100/50";
                        } else if (
                          index === selectedOption &&
                          index !== currentQuestion.correct
                        ) {
                          buttonClass +=
                            "border-red-400 bg-gradient-to-br from-red-50 to-red-100 text-red-900 shadow-lg shadow-red-100/50";
                        } else {
                          buttonClass +=
                            "border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 text-slate-600";
                        }
                      } else {
                        if (selectedOption === index) {
                          buttonClass +=
                            "border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-900 shadow-lg shadow-blue-100/50 scale-[1.02]";
                        } else {
                          buttonClass +=
                            "border-slate-200 bg-gradient-to-br from-white to-slate-50 text-slate-700 hover:border-blue-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:text-blue-800 hover:shadow-md hover:scale-[1.01]";
                        }
                      }
                      return (
                        <Button
                          key={index}
                          variant="outline"
                          className={buttonClass}
                          onClick={() => handleAnswerSelection(index)}
                          disabled={hasAnswered}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-4">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                                  hasAnswered &&
                                  index === currentQuestion.correct
                                    ? "bg-emerald-500 text-white"
                                    : hasAnswered &&
                                      index === selectedOption &&
                                      index !== currentQuestion.correct
                                    ? "bg-red-500 text-white"
                                    : selectedOption === index && !hasAnswered
                                    ? "bg-blue-500 text-white"
                                    : "bg-slate-200 text-slate-600 group-hover:bg-blue-200 group-hover:text-blue-700"
                                }`}
                              >
                                {String.fromCharCode(65 + index)}
                              </div>
                              <span className="font-medium leading-relaxed">
                                {option}
                              </span>
                            </div>
                            {hasAnswered && (
                              <span className="ml-2 transition-transform duration-300">
                                {index === currentQuestion.correct ? (
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                                    <span className="text-sm font-semibold text-emerald-700">
                                      Correct
                                    </span>
                                  </div>
                                ) : index === selectedOption ? (
                                  <div className="flex items-center gap-2">
                                    <XCircle className="h-6 w-6 text-red-600" />
                                    <span className="text-sm font-semibold text-red-700">
                                      Incorrect
                                    </span>
                                  </div>
                                ) : null}
                              </span>
                            )}
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </div>
                {showExplanation && (
                  <div
                    className={`p-4 rounded-lg border-l-4 ${
                      selectedOption === currentQuestion.correct
                        ? "border-green-500 bg-green-50"
                        : "border-yellow-500 bg-yellow-50"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className={`p-1 rounded-full ${
                          selectedOption === currentQuestion.correct
                            ? "bg-green-100"
                            : "bg-yellow-100"
                        }`}
                      >
                        {selectedOption === currentQuestion.correct ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-yellow-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium mb-1">
                          {selectedOption === currentQuestion.correct
                            ? "Correct!"
                            : "Incorrect"}
                        </p>
                        <p className="text-sm text-gray-700">
                          {currentQuestion.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {hasAnswered && (
                  <div className="flex justify-between items-center pt-4">
                    <div className="text-sm text-muted-foreground">
                      Score: {score} / {currentQuestionIndex + 1}
                    </div>
                    <Button onClick={nextQuestion}>
                      {currentQuestionIndex < totalQuestions - 1
                        ? "Question suivante"
                        : "Terminer le quiz"}
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-8">
              {/* Results Summary */}
              <div className="text-center space-y-6 p-8 bg-gradient-to-br from-emerald-950 to-teal-950 rounded-xl border border-emerald-800">
                <div className="space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <div className={`text-5xl font-bold ${getScoreColor()}`}>
                    {score} / {totalQuestions}
                  </div>
                  <div className={`text-3xl font-semibold ${getScoreColor()}`}>
                    {getScorePercentage()}%
                  </div>
                  <p className="text-lg text-slate-300 max-w-md mx-auto">
                    {getScoreMessage()}
                  </p>
                </div>

                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={resetQuiz}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reprendre le quiz
                  </Button>
                  {nextQuiz && (
                    <Link
                      href={`/formations/${courseSlug}/quizzes/${nextQuiz.id}`}
                    >
                      <Button className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                        Quiz suivant
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              {/* Detailed Results */}
              <Card className="border border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-slate-100">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                      <List className="h-4 w-4 text-slate-400" />
                    </div>
                    Correction détaillée
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {quiz.questions.map((question, index) => {
                    const userAnswer = userAnswers.find(
                      (a) => a.questionId === question.id
                    );
                    return (
                      <div
                        key={question.id}
                        className="border border-slate-600 rounded-lg p-4 bg-slate-800/50"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="text-sm font-semibold text-slate-100">
                                Question {index + 1}
                              </span>
                              {userAnswer?.isCorrect ? (
                                <CheckCircle className="h-5 w-5 text-emerald-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-500" />
                              )}
                            </div>
                            <p className="text-slate-200 mb-3 font-medium">
                              {question.question}
                            </p>
                            <div className="space-y-2">
                              <div className="text-sm">
                                <span className="text-slate-400">
                                  Votre réponse:{" "}
                                </span>
                                <span
                                  className={
                                    userAnswer?.isCorrect
                                      ? "text-emerald-600 font-medium"
                                      : "text-red-500 font-medium"
                                  }
                                >
                                  {
                                    question.options[
                                      userAnswer?.selectedOption ?? 0
                                    ]
                                  }
                                </span>
                              </div>
                              {!userAnswer?.isCorrect && (
                                <div className="text-sm">
                                  <span className="text-slate-400">
                                    Réponse correcte:{" "}
                                  </span>
                                  <span className="text-emerald-600 font-medium">
                                    {question.options[question.correct]}
                                  </span>
                                </div>
                              )}
                              {question.explanation && (
                                <div className="mt-3 p-3 bg-blue-950 border border-blue-800 rounded-lg">
                                  <p className="text-sm text-blue-200">
                                    <span className="font-semibold">
                                      Explication:{" "}
                                    </span>
                                    {question.explanation}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
