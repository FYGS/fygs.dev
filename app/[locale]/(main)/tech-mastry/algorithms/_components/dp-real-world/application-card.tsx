"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState } from "react";

// Composant pour afficher une application de la programmation dynamique
export function ApplicationCard({
  title,
  icon,
  description,
  examples,
}: {
  title: string;
  icon: React.ReactNode;
  description: string;
  examples: { name: string; description: string }[];
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10 text-primary">
            {icon}
          </div>
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{description}</p>

        <div className="space-y-2">
          {examples
            .slice(0, expanded ? examples.length : 1)
            .map((example, index) => (
              <div key={index} className="text-sm">
                <div className="font-medium">{example.name}</div>
                <div className="text-muted-foreground">
                  {example.description}
                </div>
              </div>
            ))}
        </div>

        {examples.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-xs"
          >
            {expanded
              ? "Voir moins"
              : `Voir ${examples.length - 1} exemple${
                  examples.length > 2 ? "s" : ""
                } de plus`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
