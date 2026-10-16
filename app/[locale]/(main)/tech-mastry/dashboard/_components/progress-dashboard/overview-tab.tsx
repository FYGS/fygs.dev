import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TabsContent } from "@/components/ui/tabs";
import { BookOpen, Brain, Calendar, ListTodo } from "lucide-react";
import { RecentActivities } from "../recent-activities";
import { SkillRadarChart } from "../skill-radar-chart";
import { StreakCalendar } from "../streak-calendar";
import type { ProgressStats } from "./types";

export function OverviewTab({ progressData }: { progressData: ProgressStats }) {
  return (
    <TabsContent value="overview" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skill Radar Chart */}
        <Card className="lg:col-span-2 backdrop-blur-xs bg-background/80 border-border/50 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Skill Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <SkillRadarChart skills={progressData.skillLevels} />
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="backdrop-blur-xs bg-background/80 border-border/50 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <ListTodo className="h-5 w-5 text-primary" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivities activities={progressData.recentActivities} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Streak Calendar */}
        <Card className="backdrop-blur-xs bg-background/80 border-border/50 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Activity Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StreakCalendar streakDays={progressData.streakDays} />
          </CardContent>
        </Card>

        {/* Learning Paths Progress */}
        <Card className="backdrop-blur-xs bg-background/80 border-border/50 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Learning Paths
            </CardTitle>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {progressData.learningPaths.map((path) => (
              <div key={path.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {path.icon}
                    <span className="font-medium">{path.title}</span>
                  </div>
                  <span className="text-sm text-foreground/70">
                    {path.completedModules}/{path.totalModules} modules
                  </span>
                </div>
                <Progress value={path.progress} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
}
