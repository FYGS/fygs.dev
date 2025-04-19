"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Timer, Trophy } from "lucide-react";
import { useState } from "react";

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  timeLimit: number; // in minutes
  tests: Array<{
    input: string;
    expectedOutput: string;
  }>;
}

export function ChallengePanel() {
  const [activeChallenge] = useState<Challenge | null>(null);
  const [timeRemaining] = useState<number>(0);

  return (
    <Card className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-4 border-b">
        <Trophy className="w-4 h-4 text-yellow-500" />
        <h3 className="text-sm font-medium">Coding Challenges</h3>
      </div>

      {activeChallenge ? (
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{activeChallenge.title}</h4>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Timer className="w-4 h-4" />
              {timeRemaining}m
            </span>
          </div>

          <Progress value={75} className="h-2" />

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {activeChallenge.description}
            </p>
            {/* Test cases and validation UI */}
          </div>
        </div>
      ) : (
        <div className="p-4">
          <p className="text-sm text-muted-foreground">
            Select a challenge to begin...
          </p>
          {/* Challenge selection UI */}
        </div>
      )}
    </Card>
  );
}
