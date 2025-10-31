"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Settings } from "lucide-react";
import { LanguageSelect } from "./language-select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SHORTCUTS } from "../_hooks/use-shortcuts";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EditorOptions } from "./editor-options";
import { ThemeToggle } from "./theme-toggle";

export function SettingsPanel() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-muted/50">
          <Settings className="w-4 h-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] bg-background/95 backdrop-blur-sm">
        <SheetHeader>
          <SheetTitle>Editor Settings</SheetTitle>
        </SheetHeader>
        <Tabs defaultValue="general" className="mt-4">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="shortcuts">Shortcuts</TabsTrigger>
          </TabsList>
          <ScrollArea className="h-[60vh] mt-4 pr-4">
            <TabsContent value="general">
              <ThemeToggle />
              <LanguageSelect />
            </TabsContent>
            <TabsContent value="editor">
              <div className="space-y-4">
                <EditorOptions />
              </div>
            </TabsContent>
            <TabsContent value="shortcuts">
              <div className="space-y-2">
                {Object.entries(SHORTCUTS).map(
                  ([key, { description, key: shortcutKey, mod }]) => (
                    <div
                      key={key}
                      className="flex justify-between items-center py-2"
                    >
                      <span>{description}</span>
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">
                        {mod ? "⌘/" : ""}
                        {shortcutKey}
                      </kbd>
                    </div>
                  )
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
