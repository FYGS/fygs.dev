"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, FileCode } from "lucide-react";
import { useProgress } from "../../_hooks/use-progress";
import { AnalyticsCard } from "./advanced-coding-challenges/analytics-card";
import { ChallengeCard } from "./advanced-coding-challenges/challenge-card";
import { ChallengeDetail } from "./advanced-coding-challenges/challenge-detail";
import { challenges } from "./advanced-coding-challenges/data";
import { challengeStats, runChallenge } from "./advanced-coding-challenges/lib";
import type { Challenge, Hint, SubmissionResult } from "./advanced-coding-challenges/types";

const STARTING_POINTS = 100;

export function AdvancedCodingChallenges() {
  const { progress, trackChallengeAttempt } = useProgress();
  const [activeTab, setActiveTab] = useState("challenges");
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  // what the learner typed, per challenge, kept while they browse the others
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [editorKey, setEditorKey] = useState(0);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [runnerError, setRunnerError] = useState<string | null>(null);
  const [revealedHints, setRevealedHints] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [userPoints, setUserPoints] = useState(STARTING_POINTS);

  const codeOf = (challenge: Challenge) => drafts[challenge.id] ?? challenge.starterCode;

  // Runs the learner's code against the tests, all of them (a submission) or one
  const run = async (only?: string[]) => {
    if (!selectedChallenge || isRunning) return;
    const challenge = selectedChallenge;
    setIsRunning(true);
    setRunnerError(null);
    try {
      const result = await runChallenge(challenge, codeOf(challenge), only);
      setSubmissionResult(result);
      if (!only) {
        trackChallengeAttempt(challenge.id, result.testCasesPassed, result.totalTestCases);
        const firstSolve = result.passed && !progress.challengesCompleted.includes(challenge.id);
        if (firstSolve) toast.success(`Défi résolu : ${challenge.title}`);
      }
    } catch (error) {
      setSubmissionResult(null);
      setRunnerError(error instanceof Error ? error.message : "Le moteur d'exécution est indisponible");
    } finally {
      setIsRunning(false);
    }
  };

  const select = (challenge: Challenge | null) => {
    setSelectedChallenge(challenge);
    setSubmissionResult(null);
    setRunnerError(null);
    setRevealedHints([]);
  };

  // Reveal a hint
  const revealHint = (hint: Hint) => {
    if (userPoints >= hint.revealCost) {
      setRevealedHints((prev) => [...prev, hint.id]);
      setUserPoints((prev) => prev - hint.revealCost);
    } else {
      toast.error(`Il vous faut ${hint.revealCost} points pour révéler cet indice. Vous en avez actuellement ${userPoints}.`);
    }
  };

  // Start over from the starter code
  const resetChallenge = () => {
    if (!selectedChallenge) return;
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[selectedChallenge.id];
      return next;
    });
    setEditorKey((key) => key + 1);
    setSubmissionResult(null);
    setRunnerError(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Défis de code avancés</h1>
        <p className="text-muted-foreground mt-2">
          Écrivez votre solution, exécutez-la sur les tests et voyez ce que chacun renvoie
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-xs mx-auto">
          <TabsTrigger value="challenges" className="flex items-center gap-2">
            <FileCode className="h-4 w-4" aria-hidden="true" />
            Défis
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" aria-hidden="true" />
            Votre progression
          </TabsTrigger>
        </TabsList>

        <TabsContent value="challenges" className="space-y-6">
          {!selectedChallenge ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onSelect={select}
                  solved={progress.challengesCompleted.includes(challenge.id)}
                />
              ))}
            </div>
          ) : (
            <ChallengeDetail
              selectedChallenge={selectedChallenge}
              initialCode={codeOf(selectedChallenge)}
              editorKey={editorKey}
              userPoints={userPoints}
              isRunning={isRunning}
              isSolved={progress.challengesCompleted.includes(selectedChallenge.id)}
              attempts={progress.challengeAttempts[selectedChallenge.id]?.attempts ?? 0}
              submissionResult={submissionResult}
              runnerError={runnerError}
              revealedHints={revealedHints}
              onBack={() => select(null)}
              onCodeChange={(code) => setDrafts((prev) => ({ ...prev, [selectedChallenge.id]: code }))}
              resetChallenge={resetChallenge}
              submitCode={() => run()}
              runTestCase={(testCaseId) => run([testCaseId])}
              revealHint={revealHint}
            />
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsCard stats={challengeStats(challenges, progress)} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
