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
import { motion } from "framer-motion";
import { MessageSquare, type LucideIcon } from "lucide-react";
import type { Question } from "./types";

interface QuestionListCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  questions: Question[];
  actionLabel: string;
  showTimeLimit?: boolean;
}

export function QuestionListCard({
  icon: Icon,
  title,
  description,
  questions,
  actionLabel,
  showTimeLimit = false,
}: QuestionListCardProps) {
  return (
    <Card className="backdrop-blur-xl bg-background/80 border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          <span>{title}</span>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {questions.map((question) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="p-4 border rounded-lg hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{question.question}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{question.category}</Badge>
                    <Badge
                      variant={
                        question.difficulty === "easy"
                          ? "default"
                          : question.difficulty === "medium"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {question.difficulty}
                    </Badge>
                  </div>
                  {showTimeLimit && question.timeLimit && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Time limit: {question.timeLimit} minutes
                    </p>
                  )}
                </div>
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {actionLabel}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
