"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, Clock, Code, Play, RotateCcw, Star, Target } from "lucide-react";
import { CodeEditor } from "../../../algorithms/searching/_components/sections/code-editor/code-editor";
import { DifficultyBadge } from "./difficulty-badge";
import { HintsSection } from "./hints-section";
import { SubmissionResults } from "./submission-results";
import { TestCasesSection } from "./test-cases-section";
import type { Challenge, Hint, SubmissionResult } from "./types";

interface ChallengeDetailProps {
  selectedChallenge: Challenge;
  /** The code the editor starts with: the saved draft, else the starter code */
  initialCode: string;
  /** Changes when the editor has to be rebuilt from `initialCode` (reset) */
  editorKey: number;
  userPoints: number;
  isRunning: boolean;
  isSolved: boolean;
  attempts: number;
  submissionResult: SubmissionResult | null;
  /** The sandbox could not be reached: not an error in the learner's code */
  runnerError: string | null;
  revealedHints: string[];
  onBack: () => void;
  onCodeChange: (code: string) => void;
  resetChallenge: () => void;
  submitCode: () => void;
  runTestCase: (testCaseId: string) => void;
  revealHint: (hint: Hint) => void;
}

export function ChallengeDetail({
  selectedChallenge,
  initialCode,
  editorKey,
  userPoints,
  isRunning,
  isSolved,
  attempts,
  submissionResult,
  runnerError,
  revealedHints,
  onBack,
  onCodeChange,
  resetChallenge,
  submitCode,
  runTestCase,
  revealHint,
}: ChallengeDetailProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Retour aux défis
        </Button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Star className="h-4 w-4 text-yellow-500" aria-hidden="true" />
            <span>Points : {userPoints}</span>
          </div>
          <Button variant="outline" asChild className="flex items-center gap-2">
            <Link
              href={`/tech-mastry/playground?code=${encodeURIComponent(selectedChallenge.starterCode)}&title=${encodeURIComponent(selectedChallenge.title)}`}
            >
              <Code className="h-4 w-4" aria-hidden="true" />
              Playground
            </Link>
          </Button>
          <Button variant="outline" onClick={resetChallenge} className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Réinitialiser
          </Button>
        </div>
      </div>

      <Card className="backdrop-blur-xl bg-background/80 border-border/50">
        <CardHeader>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                {selectedChallenge.title}
                <span className="text-xs">
                  <DifficultyBadge difficulty={selectedChallenge.difficulty} />
                </span>
                {isSolved && (
                  <span className="flex items-center gap-1 text-sm font-normal text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4" aria-hidden="true" />
                    Résolu
                  </span>
                )}
              </CardTitle>
              <CardDescription className="mt-2 flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Target className="h-4 w-4" aria-hidden="true" />
                  <span>{selectedChallenge.category}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  <span>{selectedChallenge.estimatedTime} min</span>
                </span>
              </CardDescription>
            </div>

            <Button
              variant="default"
              size="sm"
              onClick={submitCode}
              disabled={isRunning}
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
            >
              {isRunning ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
                  <span>Exécution...</span>
                </span>
              ) : (
                <>
                  <Play className="h-4 w-4" aria-hidden="true" />
                  Soumettre la solution
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Code className="h-4 w-4 text-primary" aria-hidden="true" />
                Énoncé du problème
              </h3>
              <p className="text-muted-foreground">{selectedChallenge.description}</p>
            </div>

            <div>
              <h3 className="font-medium mb-2">Votre solution</h3>
              <CodeEditor
                key={`${selectedChallenge.id}-${editorKey}`}
                initialCode={initialCode}
                language="javascript"
                title={selectedChallenge.title}
                height="320px"
                onCodeChange={onCodeChange}
                onRun={submitCode}
              />
            </div>

            <HintsSection
              selectedChallenge={selectedChallenge}
              revealedHints={revealedHints}
              revealHint={revealHint}
            />

            {runnerError && (
              <p role="alert" className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
                {runnerError}
              </p>
            )}

            <TestCasesSection
              selectedChallenge={selectedChallenge}
              submissionResult={submissionResult}
              isRunning={isRunning}
              runTestCase={runTestCase}
            />

            {submissionResult && (
              <SubmissionResults
                submissionResult={submissionResult}
                attempts={attempts}
                estimatedTime={selectedChallenge.estimatedTime}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
