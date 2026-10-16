"use client";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { CheckCircle, Clock, Star, Target, Trophy, XCircle, Zap } from "lucide-react";
import type {
  Challenge,
  PerformanceMetrics,
  SubmissionResult,
} from "./types";

interface SubmissionResultsProps {
  selectedChallenge: Challenge;
  submissionResult: SubmissionResult;
  performanceMetrics: PerformanceMetrics | null;
}

export function SubmissionResults({
  selectedChallenge,
  submissionResult,
  performanceMetrics,
}: SubmissionResultsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="p-4 rounded-lg border bg-muted/30">
        <div className="flex items-center gap-2 mb-3">
          {submissionResult.passed ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-medium text-green-500">
                All Tests Passed!
              </span>
            </>
          ) : (
            <>
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="font-medium text-red-500">
                Some Tests Failed
              </span>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Test Cases Passed
            </p>
            <p className="text-lg font-medium">
              {submissionResult.testCasesPassed}/
              {submissionResult.totalTestCases}
            </p>
            <Progress
              value={
                (submissionResult.testCasesPassed /
                  submissionResult.totalTestCases) *
                100
              }
              className="mt-1 h-2"
            />
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Execution Time
            </p>
            <p className="text-lg font-medium">
              {submissionResult.executionTime}ms
            </p>
            <div className="text-xs text-muted-foreground">
              Memory: {submissionResult.memoryUsed}MB
            </div>
          </div>
        </div>
      </div>

      {performanceMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">
                Accuracy
              </span>
            </div>
            <p className="text-2xl font-bold">
              {performanceMetrics.accuracy}%
            </p>
            <div className="w-full bg-muted rounded-full h-1.5 mt-2">
              <div
                className="h-1.5 rounded-full bg-blue-500"
                style={{
                  width: `${performanceMetrics.accuracy}%`,
                }}
              ></div>
            </div>
          </div>

          <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">
                Efficiency
              </span>
            </div>
            <p className="text-2xl font-bold">
              {performanceMetrics.efficiency}%
            </p>
            <div className="w-full bg-muted rounded-full h-1.5 mt-2">
              <div
                className="h-1.5 rounded-full bg-green-500"
                style={{
                  width: `${performanceMetrics.efficiency}%`,
                }}
              ></div>
            </div>
          </div>

          <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">
                Time Taken
              </span>
            </div>
            <p className="text-2xl font-bold">
              {performanceMetrics.timeTaken}m
            </p>
            <div className="text-xs text-muted-foreground">
              vs {selectedChallenge.estimatedTime}m est.
            </div>
          </div>

          <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium">
                Rating
              </span>
            </div>
            <p className="text-2xl font-bold">
              {performanceMetrics.rating}
            </p>
            <div className="flex items-center gap-1 mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3 w-3",
                    i <
                      Math.floor(
                        performanceMetrics.rating / 20,
                      )
                      ? "text-amber-500 fill-amber-500"
                      : "text-muted-foreground",
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
