"use client";

import Link from "next/link";
import { Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLearning } from "./learning-context";
import { useCurrentItem } from "./use-current-item";

interface LearningTopBarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function LearningTopBar({ sidebarOpen, onToggleSidebar }: LearningTopBarProps) {
  const { courseTitle, courseSlug, progress, mode } = useLearning();
  const item = useCurrentItem();

  return (
    <header className="sticky top-0 z-50 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center gap-3 px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="shrink-0"
          aria-label={sidebarOpen ? "Masquer le plan de la formation" : "Afficher le plan de la formation"}
          aria-expanded={sidebarOpen}
          aria-controls="learning-sidebar"
        >
          {sidebarOpen ? (
            <PanelLeftClose className="hidden h-5 w-5 md:block" aria-hidden />
          ) : (
            <PanelLeftOpen className="hidden h-5 w-5 md:block" aria-hidden />
          )}
          <Menu className="h-5 w-5 md:hidden" aria-hidden />
        </Button>

        <div className="flex min-w-0 flex-1 flex-col">
          <Link href={`/learn/${courseSlug}`} className="truncate text-xs text-muted-foreground hover:underline">
            {courseTitle}
          </Link>
          <p className="truncate text-sm font-medium">{item?.title ?? "Vue d’ensemble"}</p>
        </div>

        {mode !== "preview" && (
          <div className="hidden shrink-0 items-center gap-3 sm:flex">
            <Progress value={progress.percent} aria-label="Progression dans la formation" className="h-2 w-32" />
            <span className="text-xs font-medium text-muted-foreground">{progress.percent}%</span>
          </div>
        )}

        <Button variant="ghost" size="icon" asChild className="shrink-0">
          <Link href={`/formations/${courseSlug}`} aria-label="Quitter et revenir à la page de la formation">
            <X className="h-5 w-5" aria-hidden />
          </Link>
        </Button>
      </div>
    </header>
  );
}
