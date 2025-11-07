"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Lightbulb } from "lucide-react";

interface Question {
  question: string;
  answer: string;
  difficulty?: "easy" | "medium" | "hard";
  tags?: string[];
}

interface InterviewQuestionsProps {
  title?: string;
  questions: Question[];
}

export function InterviewQuestions({
  title = "Questions d'Entretien",
  questions,
}: InterviewQuestionsProps) {
  const [openQuestions, setOpenQuestions] = useState<Record<number, boolean>>(
    {}
  );

  const toggleQuestion = (index: number) => {
    setOpenQuestions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const difficultyColors = {
    easy: "bg-green-900/30 text-green-400",
    medium:
      "bg-yellow-900/30 text-yellow-400",
    hard: "bg-red-900/30 text-red-400",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {questions.map((q, index) => (
          <Collapsible
            key={index}
            open={openQuestions[index]}
            onOpenChange={() => toggleQuestion(index)}
            className="border rounded-md"
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between p-4 h-auto"
              >
                <div className="flex items-start gap-2 text-left">
                  <span className="font-medium">{q.question}</span>
                  {q.difficulty && (
                    <Badge
                      variant="outline"
                      className={difficultyColors[q.difficulty]}
                    >
                      {q.difficulty === "easy"
                        ? "Facile"
                        : q.difficulty === "medium"
                        ? "Moyen"
                        : "Difficile"}
                    </Badge>
                  )}
                </div>
                {openQuestions[index] ? (
                  <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-4 pt-0 text-sm border-t">
              <div className="prose prose-sm max-w-none prose-invert">
                {q.answer}
              </div>

              {q.tags && q.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-4">
                  {q.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </CardContent>
    </Card>
  );
}
