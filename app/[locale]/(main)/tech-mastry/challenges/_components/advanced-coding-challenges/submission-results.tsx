"use client";

import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Clock, Terminal, XCircle } from "lucide-react";
import type { SubmissionResult } from "./types";

interface SubmissionResultsProps {
  submissionResult: SubmissionResult;
  /** Submissions of this challenge so far (this one included) */
  attempts: number;
  estimatedTime: number;
}

function Verdict({ result }: { result: SubmissionResult }) {
  if (result.compileError) {
    return (
      <div className="flex items-start gap-2 text-red-600 dark:text-red-400" role="alert">
        <XCircle className="h-5 w-5 mt-0.5 shrink-0" aria-hidden="true" />
        <div>
          <p className="font-medium">Votre code n&apos;a pas pu s&apos;exécuter</p>
          <p className="text-sm font-mono break-all">{result.compileError}</p>
        </div>
      </div>
    );
  }
  if (result.timedOut) {
    return (
      <div className="flex items-start gap-2 text-amber-600 dark:text-amber-400" role="alert">
        <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" aria-hidden="true" />
        <div>
          <p className="font-medium">Délai dépassé</p>
          <p className="text-sm">Une boucle infinie ou une solution trop lente a interrompu l&apos;exécution.</p>
        </div>
      </div>
    );
  }
  return result.passed ? (
    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
      <CheckCircle className="h-5 w-5" aria-hidden="true" />
      <span className="font-medium">Tous les tests réussis !</span>
    </div>
  ) : (
    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
      <XCircle className="h-5 w-5" aria-hidden="true" />
      <span className="font-medium">Certains tests ont échoué</span>
    </div>
  );
}

export function SubmissionResults({ submissionResult, attempts, estimatedTime }: SubmissionResultsProps) {
  const { testCasesPassed, totalTestCases } = submissionResult;
  const accuracy = totalTestCases > 0 ? Math.round((testCasesPassed / totalTestCases) * 100) : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="p-4 rounded-lg border bg-muted/30 space-y-4">
        <Verdict result={submissionResult} />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Cas de test réussis</p>
            <p className="text-lg font-medium">
              {testCasesPassed}/{totalTestCases}
            </p>
            <Progress value={accuracy} className="mt-1 h-2" aria-label="Cas de test réussis" />
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Temps d&apos;exécution</p>
            <p className="text-lg font-medium flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              {submissionResult.executionTime} ms
            </p>
            <p className="text-xs text-muted-foreground">Temps passé dans les tests</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Soumissions</p>
            <p className="text-lg font-medium">{attempts}</p>
            <p className="text-xs text-muted-foreground">Estimé : {estimatedTime} min</p>
          </div>
        </div>
      </div>

      {submissionResult.logs.length > 0 && (
        <div className="rounded-lg border bg-muted/20">
          <p className="flex items-center gap-2 px-4 pt-3 text-sm font-medium">
            <Terminal className="h-4 w-4 text-primary" aria-hidden="true" />
            Console
          </p>
          <pre className="px-4 pb-3 pt-2 text-xs font-mono whitespace-pre-wrap break-all max-h-48 overflow-auto" tabIndex={0}>
            {submissionResult.logs.join("\n")}
          </pre>
        </div>
      )}
    </motion.div>
  );
}
