"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckCircle, Target, XCircle } from "lucide-react";
import { visibleTest } from "./lib";
import type { Challenge, SubmissionResult, TestCase, TestCaseResult } from "./types";

interface TestCasesSectionProps {
  selectedChallenge: Challenge;
  submissionResult: SubmissionResult | null;
  isRunning: boolean;
  runTestCase: (testCaseId: string) => void;
}

export function TestCasesSection({
  selectedChallenge,
  submissionResult,
  isRunning,
  runTestCase,
}: TestCasesSectionProps) {
  return (
    <div>
      <h3 className="font-medium mb-2 flex items-center gap-2">
        <Target className="h-4 w-4 text-primary" aria-hidden="true" />
        Test Cases
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {selectedChallenge.testCases.map((testCase: TestCase, index: number) => {
          const result: TestCaseResult | undefined = submissionResult?.detailedResults.find(
            (candidate) => candidate.testCaseId === testCase.id,
          );
          const shown = visibleTest(testCase);
          return (
            <Card
              key={testCase.id}
              data-testid={`test-case-${testCase.id}`}
              className={cn(
                "border border-border/50",
                result?.passed === true && "border-green-500/30 bg-green-500/5",
                result?.passed === false && "border-red-500/30 bg-red-500/5",
              )}
            >
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Test {index + 1}</span>
                    {result && (
                      <span
                        className={cn(
                          "flex items-center gap-1 font-medium",
                          result.passed ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
                        )}
                      >
                        {result.passed ? (
                          <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                        {result.passed ? "Passed" : "Failed"}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Input</p>
                    <p className="text-sm font-mono break-all">{shown.input}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Expected Output</p>
                    <p className="text-sm font-mono break-all">{shown.expectedOutput}</p>
                  </div>
                  {result && !testCase.isHidden && (
                    <div>
                      <p className="text-xs text-muted-foreground">{result.error ? "Error" : "Actual Output"}</p>
                      <p className="text-sm font-mono break-all">{result.error ?? result.actual}</p>
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => runTestCase(testCase.id)}
                  disabled={isRunning}
                  aria-label={`Run test ${index + 1}`}
                >
                  Run Test
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
