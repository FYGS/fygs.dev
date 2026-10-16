import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { BarChart3, Brain, Target } from "lucide-react";
import type { ProgressStats } from "./types";

export function SkillsTab({ progressData }: { progressData: ProgressStats }) {
  return (
    <TabsContent value="skills" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="backdrop-blur-xs bg-background/80 border-border/50 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Skill Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(progressData.skillLevels).map(
              ([skill, level]) => (
                <div key={skill} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="capitalize">
                      {skill.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <span className="text-sm font-medium">{level}%</span>
                  </div>
                  <Progress
                    value={level}
                    className={cn(
                      "h-2",
                      level < 40
                        ? "bg-red-500/20"
                        : level < 70
                          ? "bg-yellow-500/20"
                          : "bg-green-500/20",
                    )}
                    indicatorClassName={cn(
                      level < 40
                        ? "bg-red-500"
                        : level < 70
                          ? "bg-yellow-500"
                          : "bg-green-500",
                    )}
                  />
                </div>
              ),
            )}
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xs bg-background/80 border-border/50 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Recommended Focus Areas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(progressData.skillLevels)
              .sort(([, a], [, b]) => a - b)
              .slice(0, 3)
              .map(([skill, level]) => (
                <div
                  key={skill}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                >
                  <div className="mt-0.5">
                    <div
                      className={cn(
                        "p-1.5 rounded-md",
                        level < 40
                          ? "bg-red-500/10 text-red-500"
                          : level < 70
                            ? "bg-yellow-500/10 text-yellow-500"
                            : "bg-green-500/10 text-green-500",
                      )}
                    >
                      <Brain className="h-4 w-4" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium capitalize">
                      {skill.replace(/([A-Z])/g, " $1").trim()}
                    </h4>
                    <p className="text-sm text-foreground/70">
                      {level < 40
                        ? "Needs significant improvement. Focus on fundamentals."
                        : level < 70
                          ? "Good progress, but more practice needed."
                          : "Strong skills. Consider advanced topics."}
                    </p>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-primary text-sm mt-1"
                    >
                      View recommended resources
                    </Button>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>

      <Card className="backdrop-blur-xs bg-background/80 border-border/50 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Skill Progress Over Time
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="text-foreground/60">
            Skill progress chart will be displayed here
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
