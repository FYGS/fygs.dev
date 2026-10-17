import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { CheckCircle2, Trophy } from "lucide-react";
import { useState } from "react";
import type { ProgressStats } from "./types";

export function AchievementsTab({ progressData }: { progressData: ProgressStats }) {
  const [now] = useState(() => Date.now());
  return (
    <TabsContent value="achievements" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {progressData.achievements.map((achievement) => (
          <Card
            key={achievement.id}
            className={cn(
              "backdrop-blur-xs border-border/50 shadow-md transition-all",
              achievement.isUnlocked
                ? "bg-background/80"
                : "bg-muted/30 opacity-70",
            )}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                {achievement.icon}
                {achievement.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/70 mb-2">
                {achievement.description}
              </p>
              {achievement.isUnlocked ? (
                <div className="flex items-center gap-2 text-xs text-green-500">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>
                    Unlocked {achievement.unlockedAt?.toLocaleDateString()}
                  </span>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{achievement.progress}%</span>
                  </div>
                  <Progress
                    value={achievement.progress}
                    className="h-1.5"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="backdrop-blur-xs bg-background/80 border-border/50 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Achievement Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted" />
            <div className="space-y-8 relative">
              <div className="relative pl-10">
                <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </div>
                <h4 className="font-medium">First Steps</h4>
                <p className="text-sm text-muted-foreground">
                  Complete your first coding challenge
                </p>
                <div className="text-xs text-green-500 mt-1">
                  Completed on{" "}
                  {new Date(
                    now - 1000 * 60 * 60 * 24 * 30,
                  ).toLocaleDateString()}
                </div>
              </div>

              <div className="relative pl-10">
                <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </div>
                <h4 className="font-medium">Consistent Learner</h4>
                <p className="text-sm text-muted-foreground">
                  Maintain a 7-day learning streak
                </p>
                <div className="text-xs text-green-500 mt-1">
                  Completed on {new Date().toLocaleDateString()}
                </div>
              </div>

              <div className="relative pl-10">
                <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <div className="h-4 w-4 text-muted-foreground">3</div>
                </div>
                <h4 className="font-medium">Algorithm Expert</h4>
                <p className="text-sm text-muted-foreground">
                  Complete all algorithm challenges
                </p>
                <div className="mt-1">
                  <Progress value={65} className="h-1.5 max-w-[200px]" />
                  <div className="text-xs text-muted-foreground mt-1">
                    65% complete
                  </div>
                </div>
              </div>

              <div className="relative pl-10">
                <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <div className="h-4 w-4 text-muted-foreground">4</div>
                </div>
                <h4 className="font-medium">Team Player</h4>
                <p className="text-sm text-muted-foreground">
                  Participate in 5 collaborative coding sessions
                </p>
                <div className="mt-1">
                  <Progress value={40} className="h-1.5 max-w-[200px]" />
                  <div className="text-xs text-muted-foreground mt-1">
                    40% complete (2/5 sessions)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
