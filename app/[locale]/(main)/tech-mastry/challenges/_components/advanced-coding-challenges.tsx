"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, FileCode, Trophy } from "lucide-react";
import { AnalyticsCard } from "./advanced-coding-challenges/analytics-card";
import { ChallengeCard } from "./advanced-coding-challenges/challenge-card";
import { ChallengeDetail } from "./advanced-coding-challenges/challenge-detail";
import { challenges as challengeData } from "./advanced-coding-challenges/data";
import { LeaderboardCard } from "./advanced-coding-challenges/leaderboard-card";
import {
  computePerformanceMetrics,
  createMockSubmissionResult,
  createMockTestCaseResult,
} from "./advanced-coding-challenges/lib";
import type {
  Challenge,
  Hint,
  PerformanceMetrics,
  SubmissionResult,
} from "./advanced-coding-challenges/types";

export function AdvancedCodingChallenges() {
  const [activeTab, setActiveTab] = useState("challenges");
  const [challenges] = useState(challengeData);

  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [performanceMetrics, setPerformanceMetrics] =
    useState<PerformanceMetrics | null>(null);
  const [revealedHints, setRevealedHints] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userPoints, setUserPoints] = useState(100);

  // Handle code submission
  const submitCode = async () => {
    if (!selectedChallenge) return;

    setIsSubmitting(true);

    // Simulate code execution
    setTimeout(() => {
      const mockResult = createMockSubmissionResult(selectedChallenge);

      setSubmissionResult(mockResult);
      setIsSubmitting(false);

      // Calculate performance metrics
      setPerformanceMetrics(
        computePerformanceMetrics(mockResult, selectedChallenge)
      );
    }, 1500);
  };

  // Run test cases individually
  const runTestCase = async (testCaseId: string) => {
    if (!selectedChallenge) return;

    setIsSubmitting(true);

    // Simulate test execution
    setTimeout(() => {
      const testCase = selectedChallenge.testCases.find(
        (tc) => tc.id === testCaseId,
      );
      if (!testCase) return;

      const mockResult = createMockTestCaseResult(testCase, testCaseId);

      setSubmissionResult(mockResult);
      setIsSubmitting(false);
    }, 1000);
  }; // Reveal a hint
  const revealHint = (hint: Hint) => {
    if (userPoints >= hint.revealCost) {
      setRevealedHints((prev) => [...prev, hint.id]);
      setUserPoints((prev) => prev - hint.revealCost);
    } else {
      alert(
        `You need ${hint.revealCost} points to reveal this hint. You currently have ${userPoints} points.`,
      );
    }
  };

  // Reset challenge
  const resetChallenge = () => {
    if (selectedChallenge) {
      setSubmissionResult(null);
      setPerformanceMetrics(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Advanced Coding Challenges
        </h1>
        <p className="text-muted-foreground mt-2">
          Practice with real-time feedback, performance metrics, and
          comprehensive test suites
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-sm mx-auto">
          <TabsTrigger value="challenges" className="flex items-center gap-2">
            <FileCode className="h-4 w-4" />
            Challenges
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="challenges" className="space-y-6">
          {!selectedChallenge ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onSelect={setSelectedChallenge}
                />
              ))}
            </div>
          ) : (
            <ChallengeDetail
              selectedChallenge={selectedChallenge}
              userPoints={userPoints}
              isSubmitting={isSubmitting}
              submissionResult={submissionResult}
              performanceMetrics={performanceMetrics}
              revealedHints={revealedHints}
              onBack={() => setSelectedChallenge(null)}
              resetChallenge={resetChallenge}
              submitCode={submitCode}
              runTestCase={runTestCase}
              revealHint={revealHint}
            />
          )}
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <LeaderboardCard />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsCard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
