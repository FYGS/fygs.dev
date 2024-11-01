"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Keyboard } from "lucide-react";

interface ShortcutProps {
  keys: string[];
  description: string;
}

const Shortcut = ({ keys, description }: ShortcutProps) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm text-muted-foreground">{description}</span>
    <div className="flex items-center gap-1">
      {keys.map((key, index) => (
        <kbd
          key={index}
          className={cn(
            "px-2 py-1 text-xs font-semibold",
            "bg-muted rounded border border-border",
            "inline-flex items-center justify-center min-w-[24px]"
          )}
        >
          {key}
        </kbd>
      ))}
    </div>
  </div>
);

export function KeyboardShortcutsHelp() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-9"
          aria-label="Keyboard shortcuts"
        >
          <Keyboard className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to navigate quickly through the site.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Navigation</h3>
            <div className="space-y-1">
              <Shortcut keys={["g", "h"]} description="Go to Home" />
              <Shortcut keys={["g", "p"]} description="Go to Projects" />
              <Shortcut keys={["g", "r"]} description="Go to Resume" />
              <Shortcut keys={["g", "b"]} description="Go to Blog" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Theme</h3>
            <div className="space-y-1">
              <Shortcut
                keys={["Ctrl", "Shift", "l"]}
                description="Toggle light theme"
              />
              <Shortcut
                keys={["Ctrl", "Shift", "d"]}
                description="Toggle dark theme"
              />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Other</h3>
            <div className="space-y-1">
              <Shortcut keys={["?"]} description="Show this help dialog" />
              <Shortcut keys={["Esc"]} description="Close any dialog" />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
