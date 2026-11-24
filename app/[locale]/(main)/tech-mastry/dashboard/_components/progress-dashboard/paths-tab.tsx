import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { GraduationCap } from "lucide-react";
import Link from "next/link";
import { LearningPathCard } from "../learning-path-card";
import { PATH_ICONS } from "./icons";
import type { ProgressStats } from "./types";

export function PathsTab({ progressData }: { progressData: ProgressStats }) {
  // The paths you have not finished, the least advanced first: that is where a new effort pays most
  const recommended = progressData.learningPaths
    .filter((path) => path.progress < 100)
    .sort((a, b) => a.progress - b.progress)
    .slice(0, 2);

  return (
    <TabsContent value="paths" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {progressData.learningPaths.map((path) => (
          <LearningPathCard key={path.id} path={{ ...path, icon: PATH_ICONS[path.icon] }} />
        ))}
      </div>

      {recommended.length > 0 && (
        <Card className="backdrop-blur-xs bg-background/80 border-border/50 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" aria-hidden="true" />
              Par où continuer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommended.map((path) => (
              <div key={path.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <div className="mt-0.5">
                  <div className="p-1.5 rounded-md bg-primary/10 text-primary">{PATH_ICONS[path.icon]}</div>
                </div>
                <div>
                  <h4 className="font-medium">{path.title}</h4>
                  <p className="text-sm text-foreground/70">
                    {path.completedModules === 0
                      ? `Pas encore commencé. ${path.description}.`
                      : `Il reste ${path.totalModules - path.completedModules} sujet${path.totalModules - path.completedModules > 1 ? "s" : ""} (environ ${path.minutesLeft} min).`}
                  </p>
                  <Button asChild variant="link" className="p-0 h-auto text-primary text-sm mt-1">
                    <Link href={path.href}>{path.completedModules === 0 ? "Commencer ce domaine" : "Continuer ce domaine"}</Link>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </TabsContent>
  );
}
