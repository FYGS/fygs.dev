"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BinarySearch3D } from "./binary-search-3d";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

type AlgorithmType = "binary";

export function Visualization3D() {
  const [activeAlgorithm, setActiveAlgorithm] =
    useState<AlgorithmType>("binary");

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Visualisations 3D</h2>
        <p className="text-muted-foreground">
          Explorez les algorithmes de recherche en trois dimensions pour une
          meilleure compréhension.
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Visualisations interactives</AlertTitle>
        <AlertDescription>
          Ces visualisations 3D vous permettent d&apos;explorer les algorithmes
          de recherche sous un nouvel angle. Utilisez la souris pour faire
          pivoter la vue, la molette pour zoomer, et maintenez le bouton droit
          enfoncé pour déplacer la caméra.
        </AlertDescription>
      </Alert>

      <Tabs
        value={activeAlgorithm}
        onValueChange={(value) => setActiveAlgorithm(value as AlgorithmType)}
        className="w-full"
      >
        <TabsList className="grid grid-cols-1 w-full max-w-md mx-auto">
          <TabsTrigger value="binary">Recherche Binaire en 3D</TabsTrigger>
        </TabsList>

        <TabsContent value="binary" className="mt-6">
          <BinarySearch3D />
        </TabsContent>
      </Tabs>

      <div className="bg-muted/30 p-6 rounded-lg space-y-4">
        <h3 className="text-xl font-medium">Avantages des Visualisations 3D</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="text-lg font-medium">Compréhension Spatiale</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                <span>
                  Les visualisations 3D permettent de mieux comprendre les
                  relations spatiales entre les éléments du tableau.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                <span>
                  La hauteur des cubes représente la valeur des éléments, ce qui
                  facilite la comparaison visuelle.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                <span>
                  La possibilité de faire pivoter la vue permet d&apos;observer
                  l&apos;algorithme sous différents angles.
                </span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-lg font-medium">Applications Pratiques</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                <span>
                  Les visualisations 3D sont utilisées dans de nombreux
                  domaines, comme la visualisation de données scientifiques.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                <span>
                  Elles sont particulièrement utiles pour comprendre des
                  structures de données complexes comme les arbres et les
                  graphes.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                <span>
                  Les jeux vidéo et les simulations utilisent souvent des
                  algorithmes de recherche en 3D pour la navigation et la
                  détection de collisions.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <h4 className="text-lg font-medium mb-3">Perspectives Futures</h4>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              À l&apos;avenir, nous prévoyons d&apos;ajouter d&apos;autres
              visualisations 3D pour les algorithmes de recherche, comme la
              recherche par interpolation et la recherche exponentielle. Nous
              travaillons également sur des visualisations interactives qui
              permettront de modifier les paramètres de l&apos;algorithme en
              temps réel et d&apos;observer les effets sur la performance.
            </p>
            <p>
              Les visualisations 3D peuvent également être étendues à
              d&apos;autres domaines de l&apos;informatique, comme les
              algorithmes de tri, les structures de données avancées et les
              algorithmes de graphes. Ces visualisations aideront à mieux
              comprendre des concepts complexes et à développer une intuition
              pour les algorithmes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
