"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Code, LightbulbIcon } from "lucide-react";
import { useState } from "react";
import { exercises } from "./practice-exercises/data";

// Composant d'exercices pratiques
export function PracticeExercises() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [showSolution, setShowSolution] = useState<Record<string, boolean>>({});
  const [showHints, setShowHints] = useState<Record<string, boolean>>({});

  // Filtrer les exercices par catégorie
  const filteredExercises =
    selectedCategory === "all"
      ? exercises
      : exercises.filter((ex) => ex.category === selectedCategory);

  // Basculer l'affichage de la solution
  const toggleSolution = (id: string) => {
    setShowSolution((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Basculer l'affichage des indices
  const toggleHints = (id: string) => {
    setShowHints((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Basculer l'expansion d'un exercice
  const toggleExercise = (id: string) => {
    setExpandedExercise(expandedExercise === id ? null : id);
    // Réinitialiser l'affichage de la solution et des indices
    if (expandedExercise !== id) {
      setShowSolution((prev) => ({ ...prev, [id]: false }));
      setShowHints((prev) => ({ ...prev, [id]: false }));
    }
  };

  // Obtenir la couleur de badge en fonction de la difficulté
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500 hover:bg-green-600";
      case "medium":
        return "bg-amber-500 hover:bg-amber-600";
      case "hard":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-slate-500 hover:bg-slate-600";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exercices Pratiques</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filtres par catégorie */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Filtrer par catégorie:</h3>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedCategory === "all" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory("all")}
            >
              Tous
            </Badge>
            <Badge
              variant={selectedCategory === "arrays" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory("arrays")}
            >
              Tableaux
            </Badge>
            <Badge
              variant={
                selectedCategory === "linked-lists" ? "default" : "outline"
              }
              className="cursor-pointer"
              onClick={() => setSelectedCategory("linked-lists")}
            >
              Listes Chaînées
            </Badge>
            <Badge
              variant={selectedCategory === "stacks" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory("stacks")}
            >
              Piles
            </Badge>
            <Badge
              variant={
                selectedCategory === "hash-tables" ? "default" : "outline"
              }
              className="cursor-pointer"
              onClick={() => setSelectedCategory("hash-tables")}
            >
              Tables de Hachage
            </Badge>
            <Badge
              variant={
                selectedCategory === "binary-trees" ? "default" : "outline"
              }
              className="cursor-pointer"
              onClick={() => setSelectedCategory("binary-trees")}
            >
              Arbres Binaires
            </Badge>
          </div>
        </div>

        {/* Liste des exercices */}
        <div className="space-y-4">
          {filteredExercises.map((exercise) => (
            <Collapsible
              key={exercise.id}
              open={expandedExercise === exercise.id}
              onOpenChange={() => toggleExercise(exercise.id)}
              className="border rounded-lg overflow-hidden"
            >
              <div className="p-4 flex items-center justify-between bg-muted/30 cursor-pointer">
                <div className="flex items-center gap-2">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                      {expandedExercise === exercise.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <h3 className="font-medium">{exercise.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getDifficultyColor(exercise.difficulty)}>
                    {exercise.difficulty}
                  </Badge>
                  <Badge variant="outline">{exercise.category}</Badge>
                </div>
              </div>

              <CollapsibleContent>
                <div className="p-4 space-y-4 border-t">
                  {/* Description de l'exercice */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Description:</h4>
                    <p className="text-sm text-muted-foreground">
                      {exercise.description}
                    </p>
                  </div>

                  {/* Indices */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Indices:</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleHints(exercise.id);
                        }}
                        className="h-8 px-2 text-xs"
                      >
                        {showHints[exercise.id] ? "Masquer" : "Afficher"}
                        <LightbulbIcon className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                    {showHints[exercise.id] && (
                      <ul className="space-y-1 pl-5 list-disc text-sm text-muted-foreground">
                        {exercise.hints.map((hint, index) => (
                          <li key={index}>{hint}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Solution */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Solution:</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSolution(exercise.id);
                        }}
                        className="h-8 px-2 text-xs"
                      >
                        {showSolution[exercise.id] ? "Masquer" : "Afficher"}
                        <Code className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                    {showSolution[exercise.id] && (
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          {exercise.solution.explanation}
                        </p>

                        <div className="bg-muted p-4 rounded-md overflow-x-auto">
                          <pre className="text-xs">
                            <code>{exercise.solution.code}</code>
                          </pre>
                        </div>

                        <div className="space-y-4">
                          <h5 className="text-sm font-medium">
                            Étapes détaillées:
                          </h5>
                          <div className="space-y-3">
                            {exercise.solution.steps.map((step) => (
                              <div key={step.step} className="space-y-2">
                                <div className="flex items-start gap-2">
                                  <Badge variant="outline" className="mt-0.5">
                                    {step.step}
                                  </Badge>
                                  <p className="text-sm">{step.description}</p>
                                </div>
                                {step.code && (
                                  <div className="bg-muted/50 p-3 rounded-md overflow-x-auto ml-7">
                                    <pre className="text-xs">
                                      <code>{step.code}</code>
                                    </pre>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
