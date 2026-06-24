"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Play,
  Lock,
  ChevronDown,
  ChevronRight,
  FileText,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CourseItem {
  id: string;
  title: string;
  slug: string;
  order: number;
  type: "lesson" | "quiz";
  url: string;
}

interface Module {
  id: string;
  title: string;
  items: CourseItem[];
}

interface ProgressData {
  itemId: string;
  completed: boolean;
  type: "lesson" | "quiz";
}

interface LearningSidebarProps {
  lessons: CourseItem[];
  modules: Module[];
  currentLessonId: string;
  progressData: ProgressData[];
  open: boolean;
}

export function LearningSidebar({
  lessons,
  modules,
  currentLessonId,
  progressData,
  open,
}: LearningSidebarProps) {
  const progressMap = progressData.reduce(
    (acc, p) => {
      acc[p.itemId] = p;
      return acc;
    },
    {} as Record<string, ProgressData>,
  );

  const allItems = [...lessons, ...modules.flatMap((m) => m.items)];

  const currentModuleIndex = modules.findIndex((m) =>
    m.items.some((item) => item.id === currentLessonId),
  );

  const [openModules, setOpenModules] = useState<Record<number, boolean>>(
    currentModuleIndex >= 0 ? { [currentModuleIndex]: true } : { 0: true },
  );

  const toggleModule = (index: number) => {
    setOpenModules((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  let globalIndex = 0;

  return (
    <aside
      className={cn(
        "fixed left-0 top-14 bottom-0 z-40 w-80 border-r bg-background transition-transform duration-300 ease-in-out",
        open ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <ScrollArea className="h-full">
        <div className="p-4 space-y-3">
          {/* Standalone lessons */}
          {lessons.length > 0 && (
            <div className="space-y-1">
              {lessons.map((item) => {
                const node = renderItem(
                  item,
                  globalIndex,
                  progressMap,
                  allItems,
                  currentLessonId,
                );
                globalIndex++;
                return node;
              })}
            </div>
          )}

          {/* Modules */}
          {modules.map((mod, modIdx) => {
            const moduleCompleted = mod.items.every(
              (item) => progressMap[item.id]?.completed,
            );
            const moduleItemCount = mod.items.length;
            const moduleDone = mod.items.filter(
              (item) => progressMap[item.id]?.completed,
            ).length;

            return (
              <Collapsible
                key={mod.id}
                open={openModules[modIdx] ?? false}
                onOpenChange={() => toggleModule(modIdx)}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2.5 rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    {openModules[modIdx] ? (
                      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium truncate">
                      {mod.title}
                    </span>
                  </div>
                  <Badge
                    variant={moduleCompleted ? "default" : "secondary"}
                    className="text-xs shrink-0"
                  >
                    {moduleDone}/{moduleItemCount}
                  </Badge>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 space-y-1 mt-1">
                  {mod.items.map((item) => {
                    const node = renderItem(
                      item,
                      globalIndex,
                      progressMap,
                      allItems,
                      currentLessonId,
                    );
                    globalIndex++;
                    return node;
                  })}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </ScrollArea>
    </aside>
  );
}

function renderItem(
  item: CourseItem,
  globalIndex: number,
  progressMap: Record<string, ProgressData>,
  allItems: CourseItem[],
  currentLessonId: string,
) {
  const isCompleted = progressMap[item.id]?.completed || false;
  const isCurrent = item.id === currentLessonId;
  const isAccessible =
    globalIndex === 0 ||
    progressMap[allItems[globalIndex - 1]?.id]?.completed ||
    false;

  const icon = isCompleted ? (
    <Check className="h-4 w-4 text-green-500 shrink-0" />
  ) : isCurrent ? (
    <Play className="h-4 w-4 text-primary shrink-0" />
  ) : !isAccessible ? (
    <Lock className="h-4 w-4 text-muted-foreground/60 shrink-0" />
  ) : item.type === "quiz" ? (
    <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
  ) : (
    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
  );

  const content = (
    <div
      className={cn(
        "flex items-center gap-2.5 p-2 rounded-md transition-colors text-sm",
        isCurrent && "bg-primary/10 text-primary font-medium",
        !isCurrent && isAccessible && "hover:bg-accent/50",
        !isAccessible && "opacity-50 cursor-not-allowed",
      )}
    >
      {icon}
      <span className="truncate">{item.title}</span>
    </div>
  );

  if (!isAccessible) {
    return (
      <div key={item.id} className="cursor-not-allowed">
        {content}
      </div>
    );
  }

  return (
    <Link key={item.id} href={item.url} className="block">
      {content}
    </Link>
  );
}
