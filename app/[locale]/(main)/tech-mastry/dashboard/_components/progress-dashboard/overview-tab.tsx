import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TabsContent } from "@/components/ui/tabs";
import { BookOpen, Brain, Calendar, ListTodo } from "lucide-react";
import { RecentActivities } from "../recent-activities";
import { SkillRadarChart } from "../skill-radar-chart";
import { StreakCalendar } from "../streak-calendar";
import { PATH_ICONS } from "./icons";
import type { ProgressStats } from "./types";

const CARD = "backdrop-blur-xs bg-background/80 border-border/50 shadow-md";

export function OverviewTab({ progressData, now = new Date() }: { progressData: ProgressStats; now?: Date }) {
  return (
    <TabsContent value="overview" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skill Radar Chart */}
        <Card className={`lg:col-span-2 ${CARD}`}>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" aria-hidden="true" />
              Niveau par compétence
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <SkillRadarChart skills={progressData.skillLevels} />
          </CardContent>
        </Card>

        {/* Activité récente */}
        <Card className={CARD}>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <ListTodo className="h-5 w-5 text-primary" aria-hidden="true" />
              Activité récente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivities activities={progressData.recentActivities} now={now} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Streak Calendar */}
        <Card className={CARD}>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" aria-hidden="true" />
              Régularité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StreakCalendar
              streakDays={progressData.streakDays}
              activityByDay={progressData.activityByDay}
              today={now}
            />
          </CardContent>
        </Card>

        {/* Learning Paths Progress */}
        <Card className={CARD}>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" aria-hidden="true" />
              Avancement par domaine
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {progressData.learningPaths.map((path) => (
              <div key={path.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {PATH_ICONS[path.icon]}
                    <span className="font-medium">{path.title}</span>
                  </div>
                  <span className="text-sm text-foreground/70">
                    {path.completedModules}/{path.totalModules} sujets
                  </span>
                </div>
                <Progress value={path.progress} className="h-2" aria-label={`${path.title} : avancement`} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
}
