"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState } from "react";

// Composant pour afficher une étude de cas
export function CaseStudy({
  title,
  industry,
  problem,
  solution,
  results,
  dpConcepts,
}: {
  title: string;
  industry: string;
  problem: string;
  solution: string;
  results: string;
  dpConcepts: string[];
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base">{title}</CardTitle>
          <Badge variant="outline">{industry}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div>
            <div className="text-sm font-medium">Problème</div>
            <div className="text-sm text-muted-foreground">{problem}</div>
          </div>

          {expanded && (
            <>
              <div>
                <div className="text-sm font-medium">Solution</div>
                <div className="text-sm text-muted-foreground">{solution}</div>
              </div>

              <div>
                <div className="text-sm font-medium">Résultats</div>
                <div className="text-sm text-muted-foreground">{results}</div>
              </div>

              <div>
                <div className="text-sm font-medium">
                  Concepts de Programmation Dynamique
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {dpConcepts.map((concept, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {concept}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="text-xs"
        >
          {expanded ? "Voir moins" : "Voir les détails"}
        </Button>
      </CardContent>
    </Card>
  );
}
