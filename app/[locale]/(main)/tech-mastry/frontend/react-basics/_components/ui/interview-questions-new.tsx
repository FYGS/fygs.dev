"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";

type Question = {
  question: string;
  answer: string;
  difficulty?: "easy" | "medium" | "hard";
  tags?: string[];
};

interface InterviewQuestionsProps {
  title: string;
  questions: Question[];
}

export function InterviewQuestions({ title, questions }: InterviewQuestionsProps) {
  const [openQuestions, setOpenQuestions] = useState<Record<number, boolean>>({});

  const toggleQuestion = (index: number) => {
    setOpenQuestions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-900/30 text-green-400";
      case "medium":
        return "bg-yellow-900/30 text-yellow-400";
      case "hard":
        return "bg-red-900/30 text-red-400";
      default:
        return "bg-gray-800 text-gray-300";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {questions.map((q, index) => (
          <div key={index} className="border rounded-md overflow-hidden">
            <button
              onClick={() => toggleQuestion(index)}
              className="w-full flex justify-between items-start p-4 text-left bg-gray-800 hover:bg-gray-700"
            >
              <div className="flex flex-col items-start gap-2">
                <div className="font-medium">{q.question}</div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {q.difficulty && (
                    <Badge variant="outline" className={getDifficultyColor(q.difficulty)}>
                      {q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)}
                    </Badge>
                  )}
                  {q.tags?.map((tag, tagIndex) => (
                    <Badge key={tagIndex} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              {openQuestions[index] ? (
                <ChevronUp className="h-5 w-5 shrink-0 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 shrink-0 text-gray-500" />
              )}
            </button>
            
            {openQuestions[index] && (
              <div className="p-4 border-t bg-gray-900">
                <div className="text-sm">
                  {q.answer.split(/\d+\)/).map((part, partIndex) => {
                    if (partIndex === 0 && !part.trim().startsWith("1)")) {
                      return <p key={partIndex} className="mb-2">{part}</p>;
                    }
                    
                    if (!part.trim()) return null;
                    
                    return (
                      <div key={partIndex} className="mb-2">
                        <span className="font-medium">{partIndex})</span> {part.trim()}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
