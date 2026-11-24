"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState } from "react";

// Composant pour afficher une question d'entretien
export function InterviewQuestion({
  title,
  difficulty,
  companies,
  description,
  example,
  approach,
  code,
  timeComplexity,
  spaceComplexity,
  followUp,
}: {
  title: string;
  difficulty: string;
  companies: string[];
  description: string;
  example: string;
  approach: string;
  code: string;
  timeComplexity: string;
  spaceComplexity: string;
  followUp?: string;
}) {
  const [expanded, setExpanded] = useState(false);

  const difficultyColor =
    {
      Facile: "bg-green-500/10 text-green-500",
      Intermédiaire: "bg-yellow-500/10 text-yellow-500",
      Difficile: "bg-red-500/10 text-red-500",
    }[difficulty] || "bg-primary/10 text-primary";

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-base">{title}</CardTitle>
            <div className="flex flex-wrap gap-1">
              {companies.map((company, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {company}
                </Badge>
              ))}
            </div>
          </div>
          <Badge className={`${difficultyColor}`}>{difficulty}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div>
            <div className="text-sm font-medium">Description</div>
            <div className="text-sm text-muted-foreground">{description}</div>
          </div>

          <div>
            <div className="text-sm font-medium">Exemple</div>
            <pre className="text-xs bg-muted p-2 rounded overflow-auto whitespace-pre-wrap" tabIndex={0}>
              {example}
            </pre>
          </div>

          {expanded && (
            <>
              <div>
                <div className="text-sm font-medium">Approche</div>
                <div className="text-sm text-muted-foreground">{approach}</div>
              </div>

              <div>
                <div className="text-sm font-medium">Solution</div>
                <pre className="text-xs bg-muted p-2 rounded overflow-auto" tabIndex={0}>
                  {code}
                </pre>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-sm font-medium">
                    Complexité Temporelle
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {timeComplexity}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Complexité Spatiale</div>
                  <div className="text-sm text-muted-foreground">
                    {spaceComplexity}
                  </div>
                </div>
              </div>

              {followUp && (
                <div>
                  <div className="text-sm font-medium">
                    Question Supplémentaire
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {followUp}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="text-xs"
        >
          {expanded ? "Masquer la solution" : "Voir la solution"}
        </Button>
      </CardContent>
    </Card>
  );
}
