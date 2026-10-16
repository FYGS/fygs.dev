"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { CategoryFilter } from "./real-world-examples/category-filter";
import { realWorldExamples } from "./real-world-examples/data";
import { ExampleItem } from "./real-world-examples/example-item";

// Composant d'exemples concrets
export function RealWorldExamples() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedExample, setExpandedExample] = useState<string | null>(null);

  // Filtrer les exemples par catégorie
  const filteredExamples =
    selectedCategory === "all"
      ? realWorldExamples
      : realWorldExamples.filter((ex) => ex.category === selectedCategory);

  // Basculer l'expansion d'un exemple
  const toggleExample = (id: string) => {
    setExpandedExample(expandedExample === id ? null : id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exemples Concrets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filtres par catégorie */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        {/* Liste des exemples */}
        <div className="space-y-4">
          {filteredExamples.map((example) => (
            <ExampleItem
              key={example.id}
              example={example}
              isExpanded={expandedExample === example.id}
              onToggle={() => toggleExample(example.id)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
