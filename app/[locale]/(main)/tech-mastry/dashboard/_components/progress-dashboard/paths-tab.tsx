import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Brain, Code2, GraduationCap } from "lucide-react";
import { LearningPathCard } from "../learning-path-card";
import type { ProgressStats } from "./types";

export function PathsTab({ progressData }: { progressData: ProgressStats }) {
  return (
    <TabsContent value="paths" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {progressData.learningPaths.map((path) => (
          <LearningPathCard key={path.id} path={path} />
        ))}
      </div>

      <Card className="backdrop-blur-xs bg-background/80 border-border/50 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Recommended Learning Paths
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
            <div className="mt-0.5">
              <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-500">
                <Brain className="h-4 w-4" />
              </div>
            </div>
            <div>
              <h4 className="font-medium">System Design Mastery</h4>
              <p className="text-sm text-foreground/70">
                Based on your skill assessment, focusing on system design
                would be beneficial for your career growth.
              </p>
              <Button
                variant="link"
                className="p-0 h-auto text-primary text-sm mt-1"
              >
                Start this path
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
            <div className="mt-0.5">
              <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
                <Code2 className="h-4 w-4" />
              </div>
            </div>
            <div>
              <h4 className="font-medium">Advanced Data Structures</h4>
              <p className="text-sm text-foreground/70">
                Enhance your understanding of complex data structures to
                solve challenging problems more efficiently.
              </p>
              <Button
                variant="link"
                className="p-0 h-auto text-primary text-sm mt-1"
              >
                Start this path
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
