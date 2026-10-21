"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export function DPComparison() {
  const [activeTab, setActiveTab] = useState("comparison");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mémoïsation vs Tabulation</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="comparison">Comparaison</TabsTrigger>
            <TabsTrigger value="memoization">Mémoïsation</TabsTrigger>
            <TabsTrigger value="tabulation">Tabulation</TabsTrigger>
          </TabsList>

          <TabsContent value="comparison" className="space-y-6 pt-4">
            <Table>
              <TableCaption>
                Comparaison des approches de programmation dynamique
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Caractéristique</TableHead>
                  <TableHead>Mémoïsation (Top-Down)</TableHead>
                  <TableHead>Tabulation (Bottom-Up)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Direction</TableCell>
                  <TableCell>
                    Résout le problème de haut en bas (du problème principal aux
                    sous-problèmes)
                  </TableCell>
                  <TableCell>
                    Résout le problème de bas en haut (des sous-problèmes au
                    problème principal)
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Approche</TableCell>
                  <TableCell>
                    Récursive avec mémorisation des résultats
                  </TableCell>
                  <TableCell>
                    Itérative avec construction d&apos;une table
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    Calcul des sous-problèmes
                  </TableCell>
                  <TableCell>
                    Ne calcule que les sous-problèmes nécessaires
                  </TableCell>
                  <TableCell>
                    Calcule tous les sous-problèmes, même ceux non nécessaires
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    Pile d&apos;appels
                  </TableCell>
                  <TableCell>
                    Utilise la pile d&apos;appels (risque de dépassement pour
                    les grands problèmes)
                  </TableCell>
                  <TableCell>
                    N&apos;utilise pas la pile d&apos;appels (pas de risque de
                    dépassement)
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    Facilité d&apos;implémentation
                  </TableCell>
                  <TableCell>
                    Souvent plus intuitive et proche de la définition récursive
                    du problème
                  </TableCell>
                  <TableCell>
                    Peut être plus complexe à conceptualiser, mais généralement
                    plus efficace
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    Utilisation de la mémoire
                  </TableCell>
                  <TableCell>
                    Peut être plus efficace si tous les sous-problèmes ne sont
                    pas nécessaires
                  </TableCell>
                  <TableCell>
                    Utilise généralement plus de mémoire car tous les
                    sous-problèmes sont calculés
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Performance</TableCell>
                  <TableCell>
                    Overhead de la récursion, mais peut être plus rapide si peu
                    de sous-problèmes sont nécessaires
                  </TableCell>
                  <TableCell>
                    Généralement plus rapide en raison de l&apos;absence
                    d&apos;overhead de récursion
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    Quand utiliser la mémoïsation ?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Badge variant="outline">Problèmes complexes</Badge>
                    <span>
                      Lorsque la définition récursive du problème est plus
                      intuitive
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline">Sous-problèmes limités</Badge>
                    <span>
                      Quand tous les sous-problèmes ne sont pas nécessaires à la
                      solution
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline">Prototypage rapide</Badge>
                    <span>
                      Pour implémenter rapidement une solution fonctionnelle
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline">Problèmes d&apos;état</Badge>
                    <span>
                      Quand l&apos;état du problème est complexe ou
                      multidimensionnel
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    Quand utiliser la tabulation ?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Badge variant="outline">Grands problèmes</Badge>
                    <span>
                      Pour éviter les dépassements de pile avec de grandes
                      entrées
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline">Optimisation</Badge>
                    <span>
                      Quand la performance est critique et que tous les
                      sous-problèmes sont nécessaires
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline">Ordre spécifique</Badge>
                    <span>
                      Quand les sous-problèmes doivent être résolus dans un
                      ordre spécifique
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline">Optimisation mémoire</Badge>
                    <span>
                      Quand vous pouvez optimiser l&apos;utilisation de la
                      mémoire (ex: n&apos;utiliser que les 2 dernières lignes)
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="memoization" className="space-y-6 pt-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Mémoïsation (Top-Down)</h3>
              <p>
                La mémoïsation est une technique d&apos;optimisation qui
                consiste à stocker les résultats des appels de fonction coûteux
                et à retourner le résultat mis en cache lorsque les mêmes
                entrées se reproduisent.
              </p>

              <div className="bg-muted p-4 rounded-md">
                <h4 className="text-sm font-semibold mb-2">
                  Exemple : Fibonacci avec mémoïsation
                </h4>
                <pre className="text-sm overflow-auto p-2 bg-background rounded" tabIndex={0}>
                  {`function fibonacci(n, memo = {}) {
  // Cas de base
  if (n <= 1) return n;

  // Vérifier si le résultat est déjà dans le mémo
  if (memo[n] !== undefined) return memo[n];

  // Calculer et stocker le résultat
  memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo);
  return memo[n];
}`}
                </pre>
              </div>

              <h4 className="text-base font-semibold mt-6">
                Avantages de la mémoïsation
              </h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  <span className="font-medium">Calcul à la demande</span> : Ne
                  calcule que les sous-problèmes nécessaires à la résolution du
                  problème principal.
                </li>
                <li>
                  <span className="font-medium">Intuitivité</span> : Suit
                  naturellement la définition récursive du problème, ce qui peut
                  rendre le code plus lisible.
                </li>
                <li>
                  <span className="font-medium">Flexibilité</span> : Adapté aux
                  problèmes où l&apos;espace d&apos;état est grand mais où seule
                  une petite partie est réellement explorée.
                </li>
                <li>
                  <span className="font-medium">
                    Facilité d&apos;implémentation
                  </span>{" "}
                  : Souvent plus facile à implémenter en partant d&apos;une
                  solution récursive.
                </li>
              </ul>

              <h4 className="text-base font-semibold mt-6">
                Inconvénients de la mémoïsation
              </h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  <span className="font-medium">Overhead de récursion</span> :
                  Les appels récursifs ajoutent un overhead qui peut affecter
                  les performances.
                </li>
                <li>
                  <span className="font-medium">
                    Risque de dépassement de pile
                  </span>{" "}
                  : Pour les problèmes de grande taille, peut causer un
                  dépassement de la pile d&apos;appels.
                </li>
                <li>
                  <span className="font-medium">Gestion de la mémoire</span> :
                  Peut être moins prévisible en termes d&apos;utilisation de la
                  mémoire.
                </li>
              </ul>

              <div className="bg-muted p-4 rounded-md mt-6">
                <h4 className="text-sm font-semibold mb-2">
                  Modèle général de mémoïsation
                </h4>
                <pre className="text-sm overflow-auto p-2 bg-background rounded" tabIndex={0}>
                  {`function solveProblem(params, memo = {}) {
  // Créer une clé unique basée sur les paramètres
  const key = createKey(params);

  // Vérifier si le résultat est déjà dans le mémo
  if (key in memo) return memo[key];

  // Cas de base
  if (isBaseCase(params)) return solveBaseCase(params);

  // Résoudre récursivement et stocker le résultat
  memo[key] = combineResults(
    solveProblem(reducedParams1, memo),
    solveProblem(reducedParams2, memo),
    ...
  );

  return memo[key];
}`}
                </pre>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tabulation" className="space-y-6 pt-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Tabulation (Bottom-Up)</h3>
              <p>
                La tabulation est une approche ascendante qui résout
                d&apos;abord les plus petits sous-problèmes, puis utilise leurs
                solutions pour construire les solutions des problèmes plus
                grands, généralement en remplissant un tableau.
              </p>

              <div className="bg-muted p-4 rounded-md">
                <h4 className="text-sm font-semibold mb-2">
                  Exemple : Fibonacci avec tabulation
                </h4>
                <pre className="text-sm overflow-auto p-2 bg-background rounded" tabIndex={0}>
                  {`function fibonacci(n) {
  // Cas spéciaux
  if (n <= 1) return n;

  // Initialiser la table
  const dp = new Array(n + 1);
  dp[0] = 0;
  dp[1] = 1;

  // Remplir la table de bas en haut
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }

  return dp[n];
}`}
                </pre>
              </div>

              <h4 className="text-base font-semibold mt-6">
                Avantages de la tabulation
              </h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  <span className="font-medium">Efficacité</span> : Généralement
                  plus efficace car il n&apos;y a pas d&apos;overhead de
                  récursion.
                </li>
                <li>
                  <span className="font-medium">
                    Pas de dépassement de pile
                  </span>{" "}
                  : Utilise une approche itérative, évitant les problèmes de
                  dépassement de pile.
                </li>
                <li>
                  <span className="font-medium">
                    Utilisation prévisible de la mémoire
                  </span>{" "}
                  : La taille de la table est connue à l&apos;avance.
                </li>
                <li>
                  <span className="font-medium">
                    Optimisation de la mémoire
                  </span>{" "}
                  : Permet souvent d&apos;optimiser l&apos;utilisation de la
                  mémoire (par exemple, en ne gardant que les dernières
                  valeurs).
                </li>
              </ul>

              <h4 className="text-base font-semibold mt-6">
                Inconvénients de la tabulation
              </h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  <span className="font-medium">
                    Calcul de tous les sous-problèmes
                  </span>{" "}
                  : Calcule tous les sous-problèmes, même ceux qui ne sont pas
                  nécessaires.
                </li>
                <li>
                  <span className="font-medium">Complexité conceptuelle</span> :
                  Peut être plus difficile à conceptualiser pour certains
                  problèmes.
                </li>
                <li>
                  <span className="font-medium">Initialisation</span> :
                  Nécessite une initialisation correcte de la table, ce qui peut
                  être complexe pour certains problèmes.
                </li>
              </ul>

              <div className="bg-muted p-4 rounded-md mt-6">
                <h4 className="text-sm font-semibold mb-2">
                  Modèle général de tabulation
                </h4>
                <pre className="text-sm overflow-auto p-2 bg-background rounded" tabIndex={0}>
                  {`function solveProblem(params) {
  // Déterminer la taille de la table
  const dp = initializeTable(params);

  // Initialiser les cas de base
  initializeBaseCases(dp);

  // Remplir la table dans un ordre spécifique
  for (let i = /* début */; i <= /* fin */; i++) {
    for (let j = /* début */; j <= /* fin */; j++) {
      // Calculer dp[i][j] en fonction des valeurs précédentes
      dp[i][j] = combineResults(dp[i-1][j], dp[i][j-1], ...);
    }
  }

  // Retourner le résultat final
  return dp[finalState];
}`}
                </pre>
              </div>

              <h4 className="text-base font-semibold mt-6">
                Optimisation de la mémoire
              </h4>
              <p>
                Dans de nombreux problèmes de programmation dynamique, nous
                n&apos;avons pas besoin de stocker toute la table. Par exemple,
                pour Fibonacci, nous n&apos;avons besoin que des deux dernières
                valeurs :
              </p>

              <div className="bg-muted p-4 rounded-md mt-2">
                <pre className="text-sm overflow-auto p-2 bg-background rounded" tabIndex={0}>
                  {`function fibonacciOptimized(n) {
  if (n <= 1) return n;

  let prev = 0;
  let curr = 1;

  for (let i = 2; i <= n; i++) {
    const next = prev + curr;
    prev = curr;
    curr = next;
  }

  return curr;
}`}
                </pre>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
