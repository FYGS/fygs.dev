"use client";

import { useShortcutsGuide } from "@/providers/shortcuts-guide-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ShortcutsToolbar() {
  const { openGuide } = useShortcutsGuide();

  return (
    <div className="fixed bottom-4 right-4 z-[70] rounded-full border bg-background/90 p-1 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80 flex items-center gap-1">
      <ThemeToggle />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={openGuide}
            className="h-9 w-9"
          >
            <span className="text-lg">?</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="font-mono text-xs">
          Shift + ?
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
