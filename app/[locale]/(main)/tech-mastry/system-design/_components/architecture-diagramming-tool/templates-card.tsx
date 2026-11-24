"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { LayoutDashboard } from "lucide-react";
import { templates } from "./data";
import type { SystemDesignTemplate } from "./types";

interface TemplatesCardProps {
  applyTemplate: (template: SystemDesignTemplate) => void;
}

export function TemplatesCard({ applyTemplate }: TemplatesCardProps) {
  return (
  <Card className="backdrop-blur-xl bg-background/80 border-border/50">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <LayoutDashboard className="h-5 w-5 text-primary" />
        <span>Modèles de conception système</span>
      </CardTitle>
      <CardDescription>
        Partez de modèles prêts à l&apos;emploi pour les architectures courantes
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <motion.div
            key={template.id}
            whileHover={{ y: -5 }}
            className="border rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer"
            onClick={() => applyTemplate(template)}
          >
            <div className="aspect-video bg-muted/30 rounded-md border border-border/50 mb-3 flex items-center justify-center">
              <LayoutDashboard className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium">{template.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {template.description}
            </p>
            <Button variant="outline" size="sm" className="mt-3 w-full">
              Utiliser le modèle
            </Button>
          </motion.div>
        ))}
      </div>
    </CardContent>
  </Card>
  );
}
