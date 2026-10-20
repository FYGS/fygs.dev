import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Brain, Target } from "lucide-react";
import Link from "next/link";
import { skillLabel } from "./icons";
import type { ProgressStats, SkillKey } from "./types";

/** Where to go to improve a skill */
const SKILL_LINKS: Record<SkillKey, string> = {
  algorithms: "/tech-mastry/algorithms",
  dataStructures: "/tech-mastry/data-structures",
  systemDesign: "/tech-mastry/system-design",
  frontend: "/tech-mastry/frontend",
  backend: "/tech-mastry/backend",
  problemSolving: "/tech-mastry/challenges",
  communication: "/tech-mastry/preparation",
};

const tone = (level: number) => (level < 40 ? "red" : level < 70 ? "yellow" : "green");

export function SkillsTab({ progressData }: { progressData: ProgressStats }) {
  const skills = Object.entries(progressData.skillLevels) as [SkillKey, number][];

  return (
    <TabsContent value="skills" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="backdrop-blur-xs bg-background/80 border-border/50 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" aria-hidden="true" />
              Skill Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {skills.map(([skill, level]) => (
              <div key={skill} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="capitalize">{skillLabel(skill)}</span>
                  <span className="text-sm font-medium">{level}%</span>
                </div>
                <Progress
                  value={level}
                  aria-label={`${skillLabel(skill)} level`}
                  className={cn(
                    "h-2",
                    tone(level) === "red" && "bg-red-500/20",
                    tone(level) === "yellow" && "bg-yellow-500/20",
                    tone(level) === "green" && "bg-green-500/20",
                  )}
                  indicatorClassName={cn(
                    tone(level) === "red" && "bg-red-500",
                    tone(level) === "yellow" && "bg-yellow-500",
                    tone(level) === "green" && "bg-green-500",
                  )}
                />
              </div>
            ))}
            <p className="text-xs text-muted-foreground pt-2">
              Each level is the share of the topics you opened in that area. Problem solving also counts your
              challenges and your quiz scores.
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xs bg-background/80 border-border/50 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" aria-hidden="true" />
              Recommended Focus Areas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[...skills]
              .sort(([, a], [, b]) => a - b)
              .slice(0, 3)
              .map(([skill, level]) => (
                <div key={skill} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="mt-0.5">
                    <div
                      className={cn(
                        "p-1.5 rounded-md",
                        tone(level) === "red" && "bg-red-500/10 text-red-500",
                        tone(level) === "yellow" && "bg-yellow-500/10 text-yellow-500",
                        tone(level) === "green" && "bg-green-500/10 text-green-500",
                      )}
                    >
                      <Brain className="h-4 w-4" aria-hidden="true" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium capitalize">{skillLabel(skill)}</h4>
                    <p className="text-sm text-foreground/70">
                      {level < 40
                        ? "Needs significant improvement. Focus on fundamentals."
                        : level < 70
                          ? "Good progress, but more practice needed."
                          : "Strong skills. Consider advanced topics."}
                    </p>
                    <Button asChild variant="link" className="p-0 h-auto text-primary text-sm mt-1">
                      <Link href={SKILL_LINKS[skill]}>View recommended resources</Link>
                    </Button>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
}
