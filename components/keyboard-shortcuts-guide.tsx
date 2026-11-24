"use client";

import { Moon, Sun } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface KeyboardShortcutsGuideProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsGuide({
  open,
  onOpenChange,
}: KeyboardShortcutsGuideProps) {
  const shortcuts = {
    Theme: [
      {
        keys: ["Ctrl", "Shift", "L"],
        description: "Switch to Light theme",
        icon: Sun,
      },
      {
        keys: ["Ctrl", "Shift", "D"],
        description: "Switch to Dark theme",
        icon: Moon,
      },
    ],
    Navigation: [
      { keys: ["G", "H"], description: "Go to Home" },
      { keys: ["G", "P"], description: "Go to Projects" },
      { keys: ["G", "R"], description: "Go to Resume" },
      { keys: ["G", "B"], description: "Go to Blog" },
    ],
    Other: [
      { keys: ["?"], description: "Show this help dialog" },
      { keys: ["Esc"], description: "Close any dialog" },
    ],
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>⌨️ Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            All available keyboard shortcuts and commands
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {Object.entries(shortcuts).map(([category, items]) => (
            <div key={category}>
              <h3 className="mb-3 font-semibold text-sm">{category}</h3>
              <div className="space-y-2">
                {items.map((shortcut, idx) => {
                  const IconComponent = "icon" in shortcut ? shortcut.icon : null;
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-md border border-border p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {IconComponent && (
                          <IconComponent className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-sm text-foreground">
                          {shortcut.description}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, i) => (
                          <span key={i}>
                            <Badge
                              variant="outline"
                              className="font-mono text-xs"
                            >
                              {key}
                            </Badge>
                            {i < shortcut.keys.length - 1 && (
                              <span className="mx-1 text-xs text-muted-foreground">
                                +
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
          💡 Tip: Press <Badge variant="outline" className="mx-1 font-mono text-xs">?</Badge> anytime to open this guide
        </div>
      </DialogContent>
    </Dialog>
  );
}
