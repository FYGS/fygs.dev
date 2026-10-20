"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, GraduationCap, LineChart, Rocket, Trophy } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useProgress } from "../../_hooks/use-progress";
import { deriveProgressStats } from "../../_utils/progress-stats";
import { AchievementsTab } from "./progress-dashboard/achievements-tab";
import { LoadingSkeleton } from "./progress-dashboard/loading-skeleton";
import { OverviewTab } from "./progress-dashboard/overview-tab";
import { PathsTab } from "./progress-dashboard/paths-tab";
import { SkillsTab } from "./progress-dashboard/skills-tab";
import { StatsOverview } from "./progress-dashboard/stats-overview";

/**
 * The learner's own progress (kept in this browser, see _hooks/use-progress.ts), measured
 * against the section's real catalog. Until the stored progress has been read the skeleton
 * is shown, so the server render and the first client render agree.
 */
export function ProgressDashboard() {
  const { progress, isLoaded } = useProgress();
  const [now] = useState(() => new Date());
  const progressData = useMemo(() => deriveProgressStats(progress, now), [progress, now]);

  if (!isLoaded) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-8">
      {!progressData.hasActivity && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex flex-col sm:flex-row sm:items-center gap-4 py-5">
            <Rocket className="h-6 w-6 text-primary shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <p className="font-medium">Your dashboard is empty for now</p>
              <p className="text-sm text-muted-foreground">
                Open a topic, take a quiz or solve a challenge: your progress, skills and achievements appear here as
                you go. They are saved in this browser.
              </p>
            </div>
            <Button asChild>
              <Link href="/tech-mastry/algorithms">Start learning</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <StatsOverview progressData={progressData} now={now} />

      {/* Main Dashboard Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-4 md:w-[600px]">
          <TabsTrigger value="overview" className="flex gap-2 items-center">
            <LineChart className="h-4 w-4" aria-hidden="true" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex gap-2 items-center">
            <Brain className="h-4 w-4" aria-hidden="true" />
            <span>Skills</span>
          </TabsTrigger>
          <TabsTrigger value="paths" className="flex gap-2 items-center">
            <GraduationCap className="h-4 w-4" aria-hidden="true" />
            <span>Learning Paths</span>
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex gap-2 items-center">
            <Trophy className="h-4 w-4" aria-hidden="true" />
            <span>Achievements</span>
          </TabsTrigger>
        </TabsList>

        <OverviewTab progressData={progressData} now={now} />

        <SkillsTab progressData={progressData} />

        <PathsTab progressData={progressData} />

        <AchievementsTab progressData={progressData} />
      </Tabs>
    </div>
  );
}
