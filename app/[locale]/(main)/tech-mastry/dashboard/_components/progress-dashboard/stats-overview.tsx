import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Award,
  BarChart3,
  Calendar,
  Clock,
  Flame,
  Target,
  Trophy,
} from "lucide-react";
import type { ProgressStats } from "./types";

export function StatsOverview({ progressData }: { progressData: ProgressStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="backdrop-blur-xs bg-background/80 border-border/50 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Challenges Completed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <div className="text-3xl font-bold">
              {progressData.challengesCompleted}
              <span className="text-foreground/70 text-sm font-normal ml-1">
                / {progressData.totalChallenges}
              </span>
            </div>
            <Progress
              value={
                (progressData.challengesCompleted /
                  progressData.totalChallenges) *
                100
              }
              className="h-2 mt-2"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-xs bg-background/80 border-border/50 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            Current Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2">
            <div className="text-3xl font-bold">
              {progressData.streakDays}
            </div>
            <div className="text-foreground/70 mb-1">days</div>
          </div>
          <div className="text-xs text-foreground/60 mt-1 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Last activity: Today
          </div>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-xs bg-background/80 border-border/50 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2">
            <div className="text-3xl font-bold">
              {progressData.achievements.filter((a) => a.isUnlocked).length}
            </div>
            <div className="text-muted-foreground mb-1">
              / {progressData.achievements.length} unlocked
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <Award className="h-3 w-3" />
            Latest:{" "}
            {progressData.achievements.find((a) => a.isUnlocked)?.title}
          </div>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-xs bg-background/80 border-border/50 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            Learning Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2">
            <div className="text-3xl font-bold">42</div>
            <div className="text-muted-foreground mb-1">hours</div>
          </div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <BarChart3 className="h-3 w-3" />
            This week: 8 hours
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
