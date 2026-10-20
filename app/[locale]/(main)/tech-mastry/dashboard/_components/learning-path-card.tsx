"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface LearningPath {
  id: string;
  title: string;
  description: string;
  progress: number;
  totalModules: number;
  completedModules: number;
  icon: React.ReactNode;
  /** Where "Continue" leads */
  href: string;
}

interface LearningPathCardProps {
  path: LearningPath;
}

export function LearningPathCard({ path }: LearningPathCardProps) {
  const isCompleted = path.progress === 100;

  return (
    <Card className="backdrop-blur-xs bg-background/80 border-border/50 shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-primary/10 to-primary/5 rounded-bl-full -z-10" />
      
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          {path.icon}
          {path.title}
          {isCompleted && (
            <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{path.description}</p>
        
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Progress</span>
            <span>{path.progress}%</span>
          </div>
          <Progress value={path.progress} className="h-2" aria-label={`${path.title} progress`} />
          <div className="text-xs text-muted-foreground">
            {path.completedModules} of {path.totalModules} modules completed
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button asChild className="w-full gap-2">
          <Link href={path.href}>
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            {path.completedModules === 0 ? "Start Learning" : isCompleted ? "Review Path" : "Continue Learning"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
