"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  XCircle,
  ChevronRight,
  RotateCcw,
  Trophy,
  Brain,
  Target,
  Clock,
} from "lucide-react";
import { useState, useCallback, useEffect } from "react";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
}

interface QuizProps {
  questions: QuizQuestion[];
  onComplete?: (score: number, total: number) => void;
  showCategories?: boolean;
}

export function Quiz({
  questions,
  onComplete,
  showCategories = true,
}: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [startTime] = useState(() => Date.now());
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredQuestions = selectedCategory
    ? questions.filter((q) => q.category === selectedCategory)
    : questions;

  const categories = [...new Set(questions.map((q) => q.category))];

  useEffect(() => {
    if (!isComplete) {
      const interval = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isComplete, startTime]);

  const handleAnswer = useCallback(
    (index: number) => {
      if (isAnswered) return;
      setSelectedAnswer(index);
      setIsAnswered(true);
      const correct = index === filteredQuestions[currentIndex].correctIndex;
      if (correct) setScore((s) => s + 1);
      setAnswers((prev) => [...prev, index]);
    },
    [isAnswered, currentIndex, filteredQuestions],
  );

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= filteredQuestions.length) {
      setIsComplete(true);
      // the last answer is already counted in `score` (handleAnswer)
      onComplete?.(score, filteredQuestions.length);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    }
  }, [currentIndex, filteredQuestions, score, onComplete]);

  const handleReset = useCallback(() => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setIsComplete(false);
    setAnswers([]);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const getScoreColor = (pct: number) => {
    if (pct >= 80) return "text-green-500";
    if (pct >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getDifficultyColor = (d: string) => {
    switch (d) {
      case "easy":
        return "bg-green-500/10 text-green-500";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500";
      case "hard":
        return "bg-red-500/10 text-red-500";
      default:
        return "";
    }
  };

  const getDifficultyLabel = (d: string) => {
    switch (d) {
      case "easy":
        return "Facile";
      case "medium":
        return "Moyen";
      case "hard":
        return "Difficile";
      default:
        return d;
    }
  };

  if (isComplete) {
    const pct = Math.round((score / filteredQuestions.length) * 100);
    return (
      <Card className="p-8 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-br from-primary/20 to-primary/5">
          <Trophy className={cn("w-10 h-10", getScoreColor(pct))} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Quiz Terminé !</h2>
          <p className={cn("text-4xl font-bold", getScoreColor(pct))}>
            {score} / {filteredQuestions.length}
          </p>
          <p className="text-muted-foreground">
            {pct >= 80
              ? "Excellent ! Vous maîtrisez bien ce sujet."
              : pct >= 60
                ? "Bon résultat ! Quelques points à revoir."
                : "Continuez à pratiquer pour améliorer votre score."}
          </p>
        </div>
        <div className="flex justify-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" /> {formatTime(timeElapsed)}
          </span>
          <span className="flex items-center gap-1">
            <Target className="w-4 h-4" /> {pct}% correct
          </span>
        </div>

        {/* Review */}
        <div className="text-left space-y-3 mt-6">
          <h3 className="font-semibold text-sm">Revue des réponses</h3>
          {filteredQuestions.map((q, i) => (
            <div
              key={q.id}
              className={cn(
                "p-3 rounded-lg border text-sm",
                answers[i] === q.correctIndex
                  ? "border-green-500/30 bg-green-500/5"
                  : "border-red-500/30 bg-red-500/5",
              )}
            >
              <div className="flex items-start gap-2">
                {answers[i] === q.correctIndex ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                )}
                <div>
                  <p className="font-medium">{q.question}</p>
                  {answers[i] !== q.correctIndex && (
                    <p className="text-muted-foreground mt-1">
                      Bonne réponse: {q.options[q.correctIndex]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button onClick={handleReset} className="gap-2">
          <RotateCcw className="w-4 h-4" /> Recommencer
        </Button>
      </Card>
    );
  }

  const currentQuestion = filteredQuestions[currentIndex];

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      {showCategories && categories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setSelectedCategory(null);
              handleReset();
            }}
          >
            Toutes ({questions.length})
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectedCategory(cat);
                handleReset();
              }}
            >
              {cat} ({questions.filter((q) => q.category === cat).length})
            </Button>
          ))}
        </div>
      )}

      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Brain className="w-4 h-4" />
          Question {currentIndex + 1} / {filteredQuestions.length}
        </span>
        <span className="flex items-center gap-1">
          <Target className="w-4 h-4" />
          Score: {score}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {formatTime(timeElapsed)}
        </span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 rounded-full"
          style={{
            width: `${((currentIndex + 1) / filteredQuestions.length) * 100}%`,
          }}
        />
      </div>

      {/* Question Card */}
      <Card className="p-6 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
              {getDifficultyLabel(currentQuestion.difficulty)}
            </Badge>
            <Badge variant="outline">{currentQuestion.category}</Badge>
          </div>
          <h2 className="text-lg font-semibold">{currentQuestion.question}</h2>
        </div>

        <div className="space-y-3">
          {currentQuestion.options.map((option, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={isAnswered}
              className={cn(
                "w-full text-left p-4 rounded-lg border transition-all",
                isAnswered
                  ? i === currentQuestion.correctIndex
                    ? "border-green-500 bg-green-500/10"
                    : i === selectedAnswer
                      ? "border-red-500 bg-red-500/10"
                      : "border-border opacity-50"
                  : "border-border hover:border-primary/50 hover:bg-accent cursor-pointer",
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium border shrink-0",
                    isAnswered && i === currentQuestion.correctIndex
                      ? "border-green-500 text-green-500 bg-green-500/10"
                      : isAnswered && i === selectedAnswer
                        ? "border-red-500 text-red-500 bg-red-500/10"
                        : "border-muted-foreground/30",
                  )}
                >
                  {isAnswered && i === currentQuestion.correctIndex ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isAnswered && i === selectedAnswer ? (
                    <XCircle className="w-4 h-4" />
                  ) : (
                    String.fromCharCode(65 + i)
                  )}
                </span>
                <span className="text-sm">{option}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Explanation */}
        {isAnswered && (
          <div
            className={cn(
              "p-4 rounded-lg border",
              selectedAnswer === currentQuestion.correctIndex
                ? "border-green-500/30 bg-green-500/5"
                : "border-red-500/30 bg-red-500/5",
            )}
          >
            <p className="text-sm font-medium mb-1">
              {selectedAnswer === currentQuestion.correctIndex
                ? "Correct !"
                : "Incorrect"}
            </p>
            <p className="text-sm text-muted-foreground">
              {currentQuestion.explanation}
            </p>
          </div>
        )}

        {isAnswered && (
          <div className="flex justify-end">
            <Button onClick={handleNext} className="gap-2">
              {currentIndex + 1 >= filteredQuestions.length
                ? "Voir les résultats"
                : "Suivant"}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
