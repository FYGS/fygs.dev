import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import { ACHIEVEMENT_ICONS } from "./icons";
import type { ProgressStats } from "./types";

const formatDate = (date: Date) =>
  date.toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });

export function AchievementsTab({ progressData }: { progressData: ProgressStats }) {
  return (
    <TabsContent value="achievements" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {progressData.achievements.map((achievement) => (
          <Card
            key={achievement.id}
            data-unlocked={achievement.isUnlocked}
            className={cn(
              "backdrop-blur-xs border-border/50 shadow-md transition-all",
              achievement.isUnlocked ? "bg-background/80" : "bg-muted/30 opacity-70",
            )}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                {ACHIEVEMENT_ICONS[achievement.icon]}
                {achievement.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/70 mb-2">{achievement.description}</p>
              {achievement.isUnlocked ? (
                <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Débloqué{achievement.unlockedAt ? ` ${formatDate(achievement.unlockedAt)}` : ""}</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Avancement</span>
                    <span>{achievement.progress}%</span>
                  </div>
                  <Progress
                    value={achievement.progress}
                    className="h-1.5"
                    aria-label={`${achievement.title} : avancement`}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </TabsContent>
  );
}
