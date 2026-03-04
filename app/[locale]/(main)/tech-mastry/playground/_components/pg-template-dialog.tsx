"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Code2, FileCode, Globe, Layers, Server, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import type { PlaygroundTemplate } from "../_types";
import {
  getTemplatesByCategory,
  playgroundTemplates,
} from "../_config/playground-templates";
import { usePlaygroundStore } from "../_stores/playground-store";

const categoryIcons: Record<string, React.ReactNode> = {
  language: <Code2 className="h-4 w-4" />,
  framework: <Layers className="h-4 w-4" />,
  web: <Globe className="h-4 w-4" />,
  algorithm: <Sparkles className="h-4 w-4" />,
  fullstack: <Server className="h-4 w-4" />,
};

const categoryLabels: Record<string, string> = {
  language: "Languages",
  framework: "Frameworks",
  web: "Web",
  algorithm: "Algorithms",
  fullstack: "Full-Stack",
};

export function PgTemplateDialog() {
  const [open, setOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<PlaygroundTemplate | null>(null);
  const loadTemplate = usePlaygroundStore((s) => s.loadTemplate);

  // Listen for open event
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("pg-open-templates", handler);
    return () => window.removeEventListener("pg-open-templates", handler);
  }, []);

  const categories = Array.from(
    new Set(playgroundTemplates.map((t) => t.category))
  );

  const handleLoad = (template: PlaygroundTemplate) => {
    loadTemplate(template);
    setOpen(false);
    setSelectedTemplate(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl overflow-hidden bg-[#1e1e1e] p-0 text-white border-border/30">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-lg flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-400" />
            Project Templates
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose a template to get started quickly.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="all" className="px-6 pb-6">
          <TabsList className="bg-muted/20 mb-4">
            <TabsTrigger value="all" className="text-xs">
              All
            </TabsTrigger>
            {categories.map((cat) => (
              <TabsTrigger key={cat} value={cat} className="text-xs gap-1.5">
                {categoryIcons[cat]}
                {categoryLabels[cat] ?? cat}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* All templates view */}
          <TabsContent value="all">
            <TemplateGrid
              templates={playgroundTemplates}
              selected={selectedTemplate}
              onSelect={setSelectedTemplate}
              onLoad={handleLoad}
            />
          </TabsContent>

          {/* Category views */}
          {categories.map((cat) => (
            <TabsContent key={cat} value={cat}>
              <TemplateGrid
                templates={getTemplatesByCategory(cat)}
                selected={selectedTemplate}
                onSelect={setSelectedTemplate}
                onLoad={handleLoad}
              />
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function TemplateGrid({
  templates,
  selected,
  onSelect,
  onLoad,
}: {
  templates: PlaygroundTemplate[];
  selected: PlaygroundTemplate | null;
  onSelect: (t: PlaygroundTemplate) => void;
  onLoad: (t: PlaygroundTemplate) => void;
}) {
  return (
    <ScrollArea className="h-[400px] pr-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {templates.map((tmpl) => {
          const isSelected = selected?.id === tmpl.id;
          return (
            <div
              key={tmpl.id}
              className={cn(
                "group relative cursor-pointer rounded-lg border p-4",
                "transition-all duration-200",
                isSelected
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-border/20 bg-muted/5 hover:border-border/40 hover:bg-muted/10"
              )}
              onClick={() => onSelect(tmpl)}
              onDoubleClick={() => onLoad(tmpl)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <FileCode className="h-4 w-4 text-blue-400 shrink-0" />
                    <h3 className="text-sm font-semibold truncate">
                      {tmpl.name}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {tmpl.description}
                  </p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge
                      variant="outline"
                      className="text-[10px] border-border/20"
                    >
                      {tmpl.files.length} file{tmpl.files.length > 1 ? "s" : ""}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-[10px] border-border/20 capitalize"
                    >
                      {tmpl.category}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Load button appears on selection */}
              {isSelected && (
                <Button
                  size="sm"
                  className="absolute bottom-3 right-3 h-7 text-xs bg-blue-600 hover:bg-blue-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLoad(tmpl);
                  }}
                >
                  Load
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
