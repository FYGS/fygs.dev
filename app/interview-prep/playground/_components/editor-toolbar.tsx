"use client";

import { platformConfig } from "@/app/_config/platform-config";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useTheme } from "../_hooks/use-theme";
import { useEditorStore } from "../_stores/editor-store";

export function EditorToolbar() {
  const { language, setLanguage, resetCode } = useEditorStore();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center space-x-2">
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {platformConfig.features.playground.supportedLanguages.map(
              (lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={toggleTheme}>
          {theme === "light" ? "🌙" : "☀️"}
        </Button>
      </div>
      <Button
        variant="ghost"
        onClick={resetCode}
        className={cn("text-xs", "hover:bg-muted/50")}
      >
        Reset
      </Button>
    </div>
  );
}
