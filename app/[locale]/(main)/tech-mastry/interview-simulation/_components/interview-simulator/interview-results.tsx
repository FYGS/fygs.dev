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
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  FileText,
  GraduationCap,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Star,
  Target,
  Trophy,
  X,
} from "lucide-react";
import type { InterviewFeedback } from "./types";

interface InterviewResultsProps {
  feedback: InterviewFeedback | null;
  resetInterview: () => void;
}

export function InterviewResults({
  feedback,
  resetInterview,
}: InterviewResultsProps) {
  return (
    <Card className="backdrop-blur-xl bg-background/80 border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <span>Interview Results</span>
          </div>

          <Badge variant="outline">
            Sample score: {feedback?.overallScore}/100
          </Badge>
        </CardTitle>
        <CardDescription>
          Illustrative sample feedback: your answers are not scored automatically. Compare them with the model answers and the recommendations below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-full mb-4">
              <Trophy className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Interview Complete!</h2>
            <p className="text-muted-foreground mt-2">
              Sample score (not computed from your answers):{" "}
              <span className="font-bold text-primary">
                {feedback?.overallScore}/100
              </span>
            </p>
          </div>

          {feedback && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Strengths
                </h3>
                <div className="space-y-3">
                  {feedback.strengths.map((strength, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20"
                    >
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{strength}</span>
                    </div>
                  ))}
                </div>

                <h3 className="font-medium flex items-center gap-2 mt-6">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  Areas for Improvement
                </h3>
                <div className="space-y-3">
                  {feedback.weaknesses.map((weakness, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20"
                    >
                      <X className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span>{weakness}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Performance Breakdown
                </h3>
                <div className="space-y-4">
                  {feedback.performanceBreakdown.map(
                    (category, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">
                            {category.category}
                          </span>
                          <span>
                            {category.score}/{category.maxScore}
                          </span>
                        </div>
                        <Progress
                          value={category.score}
                          max={category.maxScore}
                          className="h-2"
                        />
                      </div>
                    )
                  )}
                </div>

                <h3 className="font-medium flex items-center gap-2 mt-6">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  Recommendations
                </h3>
                <div className="space-y-3">
                  {feedback.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20"
                    >
                      <Star className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={resetInterview}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Start New
            </Button>
            <Button className="gap-2">
              <FileText className="h-4 w-4" />
              Download Report
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
