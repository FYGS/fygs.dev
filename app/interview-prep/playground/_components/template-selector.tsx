"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Code, FileCode, Layers, Server, Sparkles } from "lucide-react";
import { useState } from "react";
import { useEditorStore } from "../_stores/editor-store";
import { Template, templates } from "../_templates";

// Define template categories
type TemplateCategory = "language" | "frontend" | "backend" | "fullstack";

// Group templates by category
const templatesByCategory: Record<TemplateCategory, Template[]> = {
  language: [
    templates.javascript,
    templates.typescript,
    templates.html,
    templates.css,
  ],
  frontend: [
    templates.react,
    // Add more frontend templates as they're created
  ],
  backend: [
    // Add backend templates as they're created
  ],
  fullstack: [
    // Add fullstack templates as they're created
  ],
};

export function TemplateSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [activeCategory, setActiveCategory] =
    useState<TemplateCategory>("language");
  const { toast } = useToast();

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
  };

  const handleApplyTemplate = () => {
    if (selectedTemplate) {
      // Load all template files
      const templateFiles = selectedTemplate.files.map((file) => ({
        name: file.name,
        content: file.content,
        language: file.language,
      }));

      // Find the main file (first file or index file)
      const mainFile =
        templateFiles.find(
          (file) =>
            file.name.startsWith("index.") ||
            file.name === selectedTemplate.files[0].name
        )?.name || templateFiles[0].name;

      // Use the loadTemplate function from the store
      useEditorStore.getState().loadTemplate(templateFiles, mainFile);

      // Show success toast
      toast({
        title: "Template Applied",
        description: `${selectedTemplate.name} template has been loaded.`,
        duration: 3000,
      });

      setIsOpen(false);
      setSelectedTemplate(null);
    }
  };

  const getCategoryIcon = (category: TemplateCategory) => {
    switch (category) {
      case "language":
        return <Code className="w-4 h-4" />;
      case "frontend":
        return <Layers className="w-4 h-4" />;
      case "backend":
        return <Server className="w-4 h-4" />;
      case "fullstack":
        return <Sparkles className="w-4 h-4" />;
      default:
        return <FileCode className="w-4 h-4" />;
    }
  };

  const getCategoryLabel = (category: TemplateCategory) => {
    switch (category) {
      case "language":
        return "Languages";
      case "frontend":
        return "Frontend";
      case "backend":
        return "Backend";
      case "fullstack":
        return "Fullstack";
      default:
        return category;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileCode className="w-4 h-4" />
          <span>Templates</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">Choose a Template</DialogTitle>
          <DialogDescription>
            Select a starter template for your project
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeCategory}
          onValueChange={(value) =>
            setActiveCategory(value as TemplateCategory)
          }
          className="flex-1 flex flex-col overflow-hidden mt-4"
        >
          <TabsList className="grid grid-cols-4">
            {Object.keys(templatesByCategory).map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="flex items-center gap-2"
              >
                {getCategoryIcon(category as TemplateCategory)}
                {getCategoryLabel(category as TemplateCategory)}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(templatesByCategory).map(
            ([category, categoryTemplates]) => (
              <TabsContent
                key={category}
                value={category}
                className="flex-1 overflow-auto p-1"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
                  {categoryTemplates.map((template) => {
                    // Check if template is TypeScript or React (not fully functional yet)
                    const isDisabled =
                      template.name === "TypeScript" ||
                      template.name === "React";

                    return (
                      <motion.div
                        key={template.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`
                          border rounded-lg p-4 transition-all
                          ${
                            selectedTemplate?.name === template.name
                              ? "border-primary bg-primary/5"
                              : isDisabled
                              ? "opacity-50 cursor-not-allowed border-muted"
                              : "hover:border-primary/50 hover:bg-muted/50 cursor-pointer"
                          }
                        `}
                        onClick={() =>
                          !isDisabled && handleSelectTemplate(template)
                        }
                        title={
                          isDisabled
                            ? "This template is coming soon stay tuned."
                            : ""
                        }
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-medium">
                            {template.name}
                          </h3>
                          <div className="flex gap-2">
                            {isDisabled && (
                              <div className="px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded text-xs">
                                Coming Soon
                              </div>
                            )}
                            <div className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                              {template.files[0].language}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          {template.name} starter template
                          {isDisabled && (
                            <span className="block mt-1 text-yellow-500">
                              This template will be available soon.
                            </span>
                          )}
                        </p>
                        <div className="text-xs text-muted-foreground">
                          {template.files.length} file
                          {template.files.length !== 1 ? "s" : ""}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </TabsContent>
            )
          )}
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleApplyTemplate} disabled={!selectedTemplate}>
            Apply Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
