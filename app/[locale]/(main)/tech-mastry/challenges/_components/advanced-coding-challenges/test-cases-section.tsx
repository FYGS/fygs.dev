"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Target } from "lucide-react";
import type {
  Challenge,
  SubmissionResult,
  TestCase,
  TestCaseResult,
} from "./types";

interface TestCasesSectionProps {
  selectedChallenge: Challenge;
  submissionResult: SubmissionResult | null;
  isSubmitting: boolean;
  runTestCase: (testCaseId: string) => void;
}

export function TestCasesSection({
  selectedChallenge,
  submissionResult,
  isSubmitting,
  runTestCase,
}: TestCasesSectionProps) {
  return (
    <div>
      <h3 className="font-medium mb-2 flex items-center gap-2">
        <Target className="h-4 w-4 text-primary" />
        Test Cases
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {selectedChallenge.testCases.map((testCase: TestCase) => (
          <Card
            key={testCase.id}
            className={cn(
              "border border-border/50",
              submissionResult?.detailedResults.find(
                (r: TestCaseResult) => r.testCaseId === testCase.id,
              )?.passed
                ? "border-green-500/30 bg-green-500/5"
                : submissionResult &&
                    !submissionResult.detailedResults.find(
                      (r: TestCaseResult) => r.testCaseId === testCase.id,
                    )?.passed
                  ? "border-red-500/30 bg-red-500/5"
                  : "",
            )}
          >
            <CardContent className="p-4">
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Input
                  </p>
                  <p className="text-sm font-mono">
                    {testCase.input}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Expected Output
                  </p>
                  <p className="text-sm font-mono">
                    {testCase.expectedOutput}
                  </p>
                </div>
                {submissionResult && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Actual Output
                    </p>
                    <p className="text-sm font-mono">
                      {submissionResult.detailedResults.find(
                        (r: TestCaseResult) =>
                          r.testCaseId === testCase.id,
                      )?.actual || "Not executed"}
                    </p>
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full"
                onClick={() => runTestCase(testCase.id)}
                disabled={isSubmitting}
              >
                Run Test
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
