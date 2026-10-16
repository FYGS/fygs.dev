"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Clock, Code, Play, RotateCcw, Star, Target } from "lucide-react";
import { DifficultyBadge } from "./difficulty-badge";
import { HintsSection } from "./hints-section";
import { SubmissionResults } from "./submission-results";
import { TestCasesSection } from "./test-cases-section";
import type {
  Challenge,
  Hint,
  PerformanceMetrics,
  SubmissionResult,
} from "./types";

interface ChallengeDetailProps {
  selectedChallenge: Challenge;
  userPoints: number;
  isSubmitting: boolean;
  submissionResult: SubmissionResult | null;
  performanceMetrics: PerformanceMetrics | null;
  revealedHints: string[];
  onBack: () => void;
  resetChallenge: () => void;
  submitCode: () => void;
  runTestCase: (testCaseId: string) => void;
  revealHint: (hint: Hint) => void;
}

export function ChallengeDetail({
  selectedChallenge,
  userPoints,
  isSubmitting,
  submissionResult,
  performanceMetrics,
  revealedHints,
  onBack,
  resetChallenge,
  submitCode,
  runTestCase,
  revealHint,
}: ChallengeDetailProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Challenges
        </Button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Star className="h-4 w-4 text-yellow-500" />
            <span>Points: {userPoints}</span>
          </div>
          <Button
            variant="outline"
            asChild
            className="flex items-center gap-2"
          >
            <Link
              href={`/tech-mastry/playground?code=${encodeURIComponent(selectedChallenge.starterCode)}&title=${encodeURIComponent(selectedChallenge.title)}`}
            >
              <Code className="h-4 w-4" />
              Playground
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={resetChallenge}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      <Card className="backdrop-blur-xl bg-background/80 border-border/50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                {selectedChallenge.title}
                <span className="text-xs">
                  <DifficultyBadge difficulty={selectedChallenge.difficulty} />
                </span>
              </CardTitle>
              <CardDescription className="mt-2 flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  <span>{selectedChallenge.category}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{selectedChallenge.estimatedTime} min</span>
                </div>
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={submitCode}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <span>Running...</span>
                  </div>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Submit Solution
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Code className="h-4 w-4 text-primary" />
                Problem Statement
              </h3>
              <p className="text-muted-foreground">
                {selectedChallenge.description}
              </p>
            </div>

          <HintsSection
            selectedChallenge={selectedChallenge}
            revealedHints={revealedHints}
            revealHint={revealHint}
          />

          <TestCasesSection
            selectedChallenge={selectedChallenge}
            submissionResult={submissionResult}
            isSubmitting={isSubmitting}
            runTestCase={runTestCase}
          />

          {submissionResult && (
            <SubmissionResults
              selectedChallenge={selectedChallenge}
              submissionResult={submissionResult}
              performanceMetrics={performanceMetrics}
            />
          )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
