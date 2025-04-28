"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataStructuresComparison } from "./data-structures-comparison";
import { PracticeExercises } from "./practice-exercises";
import { RealWorldExamples } from "./real-world-examples";
import { ArrayVisualization } from "./visualizations/array-visualization";
import { LinkedListVisualization } from "./visualizations/linked-list-visualization";

export function DataStructuresVisualizations() {
  return (
    <div className="space-y-12">
      {/* Visualisations interactives */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Visualisations Interactives</h2>
        <p className="text-muted-foreground">
          Explorez les différentes structures de données à travers ces
          visualisations interactives. Ces outils vous aideront à mieux
          comprendre comment les structures de données fonctionnent et comment
          leurs opérations sont implémentées.
        </p>

        <Tabs defaultValue="arrays" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="arrays">Tableaux</TabsTrigger>
            <TabsTrigger value="linked-lists">Listes Chaînées</TabsTrigger>
          </TabsList>

          <TabsContent value="arrays">
            <ArrayVisualization />
          </TabsContent>

          <TabsContent value="linked-lists">
            <LinkedListVisualization />
          </TabsContent>
        </Tabs>
      </section>

      {/* Comparaison des structures de données */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Comparaison des Structures</h2>
        <p className="text-muted-foreground">
          Comparez les différentes structures de données pour comprendre leurs
          forces et faiblesses. Cet outil vous aidera à choisir la structure la
          plus adaptée à vos besoins spécifiques.
        </p>

        <DataStructuresComparison />
      </section>

      {/* Exemples concrets */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Exemples Concrets</h2>
        <p className="text-muted-foreground">
          Découvrez comment les structures de données sont utilisées dans des
          applications du monde réel. Ces exemples illustrent l&apos;importance
          des structures de données dans le développement de logiciels modernes.
        </p>

        <RealWorldExamples />
      </section>

      {/* Exercices pratiques */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Exercices Pratiques</h2>
        <p className="text-muted-foreground">
          Mettez en pratique vos connaissances avec ces exercices sur les
          structures de données. Chaque exercice est accompagné d&apos;indices
          et d&apos;une solution détaillée pas à pas.
        </p>

        <PracticeExercises />
      </section>
    </div>
  );
}
