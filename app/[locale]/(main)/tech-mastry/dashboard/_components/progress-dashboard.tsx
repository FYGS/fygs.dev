"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, GraduationCap, LineChart, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { AchievementsTab } from "./progress-dashboard/achievements-tab";
import { LoadingSkeleton } from "./progress-dashboard/loading-skeleton";
import { mergeProgressData } from "./progress-dashboard/merge-progress";
import { mockProgressData } from "./progress-dashboard/mock-data";
import { OverviewTab } from "./progress-dashboard/overview-tab";
import { PathsTab } from "./progress-dashboard/paths-tab";
import { SkillsTab } from "./progress-dashboard/skills-tab";
import { StatsOverview } from "./progress-dashboard/stats-overview";
import type { ProgressStats } from "./progress-dashboard/types";
import { useProgress } from "../../_hooks/use-progress";

export function ProgressDashboard() {
  const [progressData, setProgressData] = useState<ProgressStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { progress, isLoaded, getStreakDays } = useProgress();

  useEffect(() => {
    // Merge real localStorage progress with mock data
    const fetchData = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Hydrate mock data with real progress from localStorage
      const realStreak = isLoaded
        ? getStreakDays()
        : mockProgressData.streakDays;
      const realChallenges = isLoaded
        ? progress.challengesCompleted.length
        : mockProgressData.challengesCompleted;

      setProgressData(
        mergeProgressData(mockProgressData, {
          streakDays: realStreak,
          challengesCompleted: realChallenges,
        }),
      );
      setIsLoading(false);
    };

    fetchData();
  }, [isLoaded, progress, getStreakDays]);

  if (isLoading || !progressData) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <StatsOverview progressData={progressData} />

      {/* Main Dashboard Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-4 md:w-[600px]">
          <TabsTrigger value="overview" className="flex gap-2 items-center">
            <LineChart className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex gap-2 items-center">
            <Brain className="h-4 w-4" />
            <span>Skills</span>
          </TabsTrigger>
          <TabsTrigger value="paths" className="flex gap-2 items-center">
            <GraduationCap className="h-4 w-4" />
            <span>Learning Paths</span>
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex gap-2 items-center">
            <Trophy className="h-4 w-4" />
            <span>Achievements</span>
          </TabsTrigger>
        </TabsList>

        <OverviewTab progressData={progressData} />

        <SkillsTab progressData={progressData} />

        <PathsTab progressData={progressData} />

        <AchievementsTab progressData={progressData} />
      </Tabs>
    </div>
  );
}
