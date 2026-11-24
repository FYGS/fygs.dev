"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Clock, Play, Target, Users } from "lucide-react";
import { interviewTemplates, type InterviewTemplate } from "./data";

interface InterviewTemplatesProps {
  selectedTemplate: string | null;
  setSelectedTemplate: (id: string) => void;
  startInterview: (template: InterviewTemplate) => void;
}

export function InterviewTemplates({
  selectedTemplate,
  setSelectedTemplate,
  startInterview,
}: InterviewTemplatesProps) {
  return (
    <Card className="backdrop-blur-xl bg-background/80 border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <span>Modèles d&apos;entretien</span>
        </CardTitle>
        <CardDescription>
          Choisissez parmi des modèles d&apos;entretien prédéfinis pour différents rôles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {interviewTemplates.map((template) => (
            <motion.div
              key={template.id}
              whileHover={{ y: -5 }}
              className={cn(
                "border rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer",
                selectedTemplate === template.id &&
                  "ring-2 ring-primary/50 border-primary/30"
              )}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-medium">{template.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {template.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {template.categories.map((cat, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs"
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{template.duration} min</span>
                </div>
                <Button
                  onClick={() => startInterview(template)}
                  className="gap-2"
                >
                  <Play className="h-4 w-4" />
                  Démarrer
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
