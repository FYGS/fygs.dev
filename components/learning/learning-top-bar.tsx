"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import Link from "next/link";

interface LearningTopBarProps {
  courseTitle: string;
  courseSlug: string;
  lessonTitle: string;
  progressPercentage: number;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function LearningTopBar({
  courseTitle,
  courseSlug,
  lessonTitle,
  progressPercentage,
  sidebarOpen,
  onToggleSidebar,
}: LearningTopBarProps) {
  return (
    <header className="sticky top-0 z-50 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center gap-3 px-4">
        {/* Sidebar toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="shrink-0"
          aria-label={sidebarOpen ? "Fermer le panneau" : "Ouvrir le panneau"}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeftOpen className="h-5 w-5" />
          )}
        </Button>

        {/* Course info */}
        <div className="flex flex-col min-w-0 flex-1">
          <p className="text-xs text-muted-foreground truncate">
            {courseTitle}
          </p>
          <p className="text-sm font-medium truncate">{lessonTitle}</p>
        </div>

        {/* Progress */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <Progress value={progressPercentage} className="w-32 h-2" />
          <span className="text-xs text-muted-foreground font-medium">
            {progressPercentage}%
          </span>
        </div>

        {/* Exit button */}
        <Button variant="ghost" size="icon" asChild className="shrink-0">
          <Link
            href={`/formations/${courseSlug}`}
            aria-label="Quitter le mode focus"
          >
            <X className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </header>
  );
}
