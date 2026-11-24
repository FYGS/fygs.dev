"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { runInSandbox } from "@/app/_lib/code-sandbox";
import { CodeEditor } from "./code-editor";

interface TestCase {
  name: string;
  test: (fn: (...args: unknown[]) => unknown) => boolean;
  expectedOutput?: string;
}

interface CodeRunnerProps {
  initialCode: string;
  language?: string;
  title?: string;
  functionName: string;
  testCases: TestCase[];
  height?: string;
}

export function CodeRunner({
  initialCode,
  language = "javascript",
  title = "Exercice",
  functionName,
  testCases,
  height = "300px",
}: CodeRunnerProps) {
  const [testResults, setTestResults] = useState<
    Array<{
      name: string;
      passed: boolean;
      error?: string;
      expectedOutput?: string;
    }>
  >([]);

  const runTests = async (code: string) => {
    setTestResults([]);

    try {
      // The tests are small arrow functions, `(fn) => fn([1, 3], 3) === 1`: their source is
      // handed to the sandbox, which calls them with the learner's function.
      const outcome = await runInSandbox({
        code,
        entry: functionName,
        tests: testCases.map((testCase, index) => ({
          id: String(index),
          check: testCase.test.toString(),
          expected: testCase.expectedOutput,
        })),
      });

      if (outcome.compileError) {
        setTestResults([{ name: "Erreur de compilation", passed: false, error: outcome.compileError }]);
        return;
      }

      setTestResults(
        testCases.map((testCase, index) => {
          const result = outcome.results.find((r) => r.id === String(index));
          return {
            name: testCase.name,
            passed: result?.passed ?? false,
            expectedOutput: testCase.expectedOutput,
            error: result?.error,
          };
        }),
      );
    } catch (error) {
      setTestResults([
        {
          name: "Moteur d'exécution",
          passed: false,
          error: error instanceof Error ? error.message : String(error),
        },
      ]);
    }
  };

  return (
    <div className="space-y-4">
      <CodeEditor
        initialCode={initialCode}
        language={language}
        title={title}
        height={height}
        onRun={runTests}
      />

      {testResults.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">
              Résultats des Tests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {testResults.map((result, index) => (
              <Alert
                key={index}
                variant={result.passed ? "default" : "destructive"}
                className={
                  result.passed
                    ? "border-green-800 bg-green-950/30"
                    : ""
                }
              >
                <div className="flex items-start">
                  {result.passed ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <AlertTitle
                        className={
                          result.passed
                            ? "text-green-300"
                            : ""
                        }
                      >
                        {result.name}
                      </AlertTitle>
                      <Badge
                        variant={result.passed ? "outline" : "destructive"}
                      >
                        {result.passed ? "Réussi" : "Échoué"}
                      </Badge>
                    </div>
                    {result.error && (
                      <AlertDescription className="mt-2 font-mono text-xs">
                        <div className="flex items-start">
                          <AlertCircle className="h-4 w-4 mr-1 mt-0.5 shrink-0" />
                          <div>{result.error}</div>
                        </div>
                      </AlertDescription>
                    )}
                    {result.expectedOutput && !result.passed && (
                      <AlertDescription className="mt-2 font-mono text-xs">
                        <div>Sortie attendue: {result.expectedOutput}</div>
                      </AlertDescription>
                    )}
                  </div>
                </div>
              </Alert>
            ))}

            <div className="flex items-center justify-between pt-2">
              <div className="text-sm text-muted-foreground">
                {testResults.filter((r) => r.passed).length} sur{" "}
                {testResults.length} tests réussis
              </div>
              {testResults.every((r) => r.passed) && (
                <div className="flex items-center text-green-500 text-sm font-medium">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Tous les tests sont passés !
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
