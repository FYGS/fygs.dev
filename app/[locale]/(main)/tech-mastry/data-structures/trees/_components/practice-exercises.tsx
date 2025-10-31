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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Code2,
  GitMerge,
  Lightbulb,
  Network,
} from "lucide-react";
import { useState } from "react";

// Exercise type
interface Exercise {
  id: string;
  title: string;
  difficulty: "Facile" | "Intermédiaire" | "Difficile";
  category: "Arbres" | "Graphes" | "Mixte";
  description: string;
  hints: string[];
  solution: string;
  explanation: string;
}

// Sample exercises
const exercises: Exercise[] = [
  {
    id: "binary-tree-max-depth",
    title: "Profondeur Maximale d'un Arbre Binaire",
    difficulty: "Facile",
    category: "Arbres",
    description: `
Écrivez une fonction qui calcule la profondeur maximale d'un arbre binaire.

La profondeur maximale est le nombre de nœuds sur le chemin le plus long de la racine jusqu'à une feuille.

Exemple:

    3
   / \\
  9  20
    /  \\
   15   7

La profondeur maximale est 3.
    `,
    hints: [
      "Pensez à une approche récursive",
      "La profondeur maximale est le maximum entre la profondeur du sous-arbre gauche et celle du sous-arbre droit, plus 1 (pour la racine)",
      "N'oubliez pas de gérer le cas où un nœud est null",
    ],
    solution: `
function maxDepth(root) {
  // Cas de base: si le nœud est null, la profondeur est 0
  if (root === null) {
    return 0;
  }

  // Calculer la profondeur maximale des sous-arbres gauche et droit
  const leftDepth = maxDepth(root.left);
  const rightDepth = maxDepth(root.right);

  // La profondeur maximale est le maximum des deux plus 1 (pour le nœud actuel)
  return Math.max(leftDepth, rightDepth) + 1;
}
    `,
    explanation: `
Cette solution utilise une approche récursive pour calculer la profondeur maximale d'un arbre binaire:

1. Si l'arbre est vide (root === null), la profondeur est 0.
2. Sinon, nous calculons récursivement la profondeur maximale des sous-arbres gauche et droit.
3. La profondeur maximale de l'arbre est le maximum des profondeurs des sous-arbres, plus 1 pour compter le nœud racine.

La complexité temporelle est O(n) où n est le nombre de nœuds dans l'arbre, car nous visitons chaque nœud exactement une fois.
La complexité spatiale est O(h) où h est la hauteur de l'arbre, due à la pile d'appels récursifs.
    `,
  },
  {
    id: "validate-bst",
    title: "Valider un Arbre Binaire de Recherche",
    difficulty: "Intermédiaire",
    category: "Arbres",
    description: `
Écrivez une fonction qui vérifie si un arbre binaire est un arbre binaire de recherche (BST) valide.

Un BST valide est défini comme suit:
- Le sous-arbre gauche d'un nœud contient uniquement des nœuds avec des valeurs inférieures à la valeur du nœud.
- Le sous-arbre droit d'un nœud contient uniquement des nœuds avec des valeurs supérieures à la valeur du nœud.
- Les sous-arbres gauche et droit doivent également être des BST valides.

Exemple:

    2
   / \\
  1   3
est un BST valide.


    5
   / \\
  1   4
     / \\
    3   6
n'est pas un BST valide car 4 est dans le sous-arbre droit de 5 mais contient 3 qui est inférieur à 5.
    `,
    hints: [
      "Utilisez une approche récursive avec des limites min et max",
      "Pour chaque nœud, vérifiez que sa valeur est dans les limites appropriées",
      "Mettez à jour les limites lorsque vous descendez dans l'arbre",
    ],
    solution: `
function isValidBST(root) {
  // Fonction auxiliaire pour vérifier si un sous-arbre est un BST valide
  function isValid(node, min, max) {
    // Un arbre vide est un BST valide
    if (node === null) {
      return true;
    }

    // Vérifier si la valeur du nœud est dans les limites
    if ((min !== null && node.val <= min) || (max !== null && node.val >= max)) {
      return false;
    }

    // Vérifier récursivement les sous-arbres
    return isValid(node.left, min, node.val) && isValid(node.right, node.val, max);
  }

  // Appeler la fonction auxiliaire avec les limites initiales
  return isValid(root, null, null);
}
    `,
    explanation: `
Cette solution utilise une approche récursive avec des limites pour vérifier si un arbre binaire est un BST valide:

1. Nous définissons une fonction auxiliaire \`isValid\` qui prend un nœud et les limites min et max pour les valeurs valides.
2. Si le nœud est null, il s'agit d'un BST valide (cas de base).
3. Si la valeur du nœud est hors des limites, l'arbre n'est pas un BST valide.
4. Nous vérifions récursivement le sous-arbre gauche avec la limite supérieure mise à jour (la valeur du nœud actuel).
5. Nous vérifions récursivement le sous-arbre droit avec la limite inférieure mise à jour (la valeur du nœud actuel).
6. L'arbre est un BST valide si les deux sous-arbres sont valides.

La complexité temporelle est O(n) où n est le nombre de nœuds dans l'arbre.
La complexité spatiale est O(h) où h est la hauteur de l'arbre.
    `,
  },
  {
    id: "bfs-shortest-path",
    title: "Plus Court Chemin dans un Graphe Non Pondéré",
    difficulty: "Intermédiaire",
    category: "Graphes",
    description: `
Écrivez une fonction qui trouve le plus court chemin entre deux nœuds dans un graphe non pondéré.

Vous recevrez:
- Un graphe représenté par une liste d'adjacence
- Un nœud de départ
- Un nœud d'arrivée

Votre fonction doit retourner la longueur du plus court chemin entre les deux nœuds.
Si aucun chemin n'existe, retournez -1.

Exemple:

graph = {
  0: [1, 2],
  1: [0, 2, 3],
  2: [0, 1, 3, 4],
  3: [1, 2, 4],
  4: [2, 3]
}
start = 0
end = 4

Le plus court chemin est 0 -> 2 -> 4, donc la réponse est 2.
    `,
    hints: [
      "Utilisez un parcours en largeur (BFS) pour trouver le plus court chemin",
      "Gardez une trace des nœuds visités pour éviter les cycles",
      "Utilisez une file d'attente pour stocker les nœuds à visiter avec leur distance depuis le départ",
    ],
    solution: `
function shortestPath(graph, start, end) {
  // Si le départ et l'arrivée sont identiques
  if (start === end) {
    return 0;
  }

  // File d'attente pour BFS, stockant [nœud, distance]
  const queue = [[start, 0]];
  // Ensemble des nœuds visités
  const visited = new Set([start]);

  while (queue.length > 0) {
    const [node, distance] = queue.shift();

    // Parcourir tous les voisins
    for (const neighbor of graph[node]) {
      // Si nous avons atteint la destination
      if (neighbor === end) {
        return distance + 1;
      }

      // Si le voisin n'a pas été visité
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([neighbor, distance + 1]);
      }
    }
  }

  // Aucun chemin trouvé
  return -1;
}
    `,
    explanation: `
Cette solution utilise un parcours en largeur (BFS) pour trouver le plus court chemin dans un graphe non pondéré:

1. Si le nœud de départ est le même que le nœud d'arrivée, la distance est 0.
2. Nous utilisons une file d'attente pour stocker les nœuds à visiter avec leur distance depuis le départ.
3. Nous utilisons un ensemble pour garder trace des nœuds déjà visités afin d'éviter les cycles.
4. Pour chaque nœud, nous explorons tous ses voisins:
   - Si un voisin est le nœud d'arrivée, nous retournons la distance actuelle + 1.
   - Sinon, si le voisin n'a pas été visité, nous l'ajoutons à la file d'attente avec une distance incrémentée.
5. Si la file d'attente est vide et que nous n'avons pas trouvé le nœud d'arrivée, aucun chemin n'existe.

La complexité temporelle est O(V + E) où V est le nombre de sommets et E le nombre d'arêtes.
La complexité spatiale est O(V) pour stocker les nœuds visités et la file d'attente.
    `,
  },
  {
    id: "detect-cycle",
    title: "Détecter un Cycle dans un Graphe",
    difficulty: "Difficile",
    category: "Graphes",
    description: `
Écrivez une fonction qui détecte s'il existe un cycle dans un graphe non orienté.

Vous recevrez un graphe représenté par une liste d'adjacence.

Exemple:

graph = {
  0: [1, 2],
  1: [0, 2],
  2: [0, 1, 3],
  3: [2]
}

Ce graphe contient un cycle (0 -> 1 -> 2 -> 0), donc la fonction doit retourner true.
    `,
    hints: [
      "Utilisez un parcours en profondeur (DFS) ou en largeur (BFS)",
      "Gardez une trace des nœuds visités",
      "Pour chaque nœud, vérifiez si vous rencontrez un nœud déjà visité qui n'est pas le parent direct",
    ],
    solution: `
function hasCycle(graph) {
  const visited = new Set();

  // Fonction DFS pour détecter un cycle
  function dfs(node, parent) {
    visited.add(node);

    for (const neighbor of graph[node]) {
      // Ne pas revenir au parent direct
      if (neighbor === parent) {
        continue;
      }

      // Si le voisin a déjà été visité, un cycle existe
      if (visited.has(neighbor)) {
        return true;
      }

      // Continuer DFS à partir du voisin
      if (dfs(neighbor, node)) {
        return true;
      }
    }

    return false;
  }

  // Vérifier chaque composante connexe
  for (const node in graph) {
    if (!visited.has(parseInt(node))) {
      if (dfs(parseInt(node), -1)) {
        return true;
      }
    }
  }

  return false;
}
    `,
    explanation: `
Cette solution utilise un parcours en profondeur (DFS) pour détecter un cycle dans un graphe non orienté:

1. Nous utilisons un ensemble pour garder trace des nœuds visités.
2. Pour chaque nœud non visité (pour gérer les graphes non connexes), nous démarrons un DFS.
3. Dans le DFS, nous marquons le nœud actuel comme visité et explorons ses voisins:
   - Nous ignorons le parent direct pour éviter de considérer l'arête bidirectionnelle comme un cycle.
   - Si nous rencontrons un nœud déjà visité qui n'est pas le parent, un cycle existe.
   - Sinon, nous continuons le DFS à partir du voisin.
4. Si aucun cycle n'est trouvé après avoir exploré toutes les composantes connexes, nous retournons false.

La complexité temporelle est O(V + E) où V est le nombre de sommets et E le nombre d'arêtes.
La complexité spatiale est O(V) pour stocker les nœuds visités et la pile d'appels récursifs.
    `,
  },
  {
    id: "lca",
    title: "Plus Petit Ancêtre Commun",
    difficulty: "Difficile",
    category: "Arbres",
    description: `
Écrivez une fonction qui trouve le plus petit ancêtre commun (LCA) de deux nœuds dans un arbre binaire.

Le plus petit ancêtre commun est défini comme le nœud le plus bas dans l'arbre qui a les deux nœuds p et q comme descendants.

Exemple:

      3
     / \\
    5   1
   / \\ / \\
  6  2 0  8
    / \\
   7   4

Le LCA de 5 et 1 est 3.
Le LCA de 5 et 4 est 5.
    `,
    hints: [
      "Utilisez une approche récursive",
      "Si le nœud actuel est l'un des nœuds recherchés, c'est un ancêtre commun potentiel",
      "Si les deux nœuds sont trouvés dans des sous-arbres différents, le nœud actuel est leur LCA",
    ],
    solution: `
function lowestCommonAncestor(root, p, q) {
  // Cas de base: si le nœud est null ou l'un des nœuds recherchés
  if (root === null || root === p || root === q) {
    return root;
  }

  // Rechercher dans les sous-arbres gauche et droit
  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);

  // Si les deux nœuds sont trouvés dans des sous-arbres différents,
  // le nœud actuel est leur LCA
  if (left !== null && right !== null) {
    return root;
  }

  // Sinon, retourner le nœud non-null (s'il existe)
  return left !== null ? left : right;
}
    `,
    explanation: `
Cette solution utilise une approche récursive pour trouver le plus petit ancêtre commun (LCA) de deux nœuds:

1. Si le nœud actuel est null ou l'un des nœuds recherchés, nous le retournons.
2. Nous recherchons récursivement dans les sous-arbres gauche et droit.
3. Si les deux sous-arbres retournent un nœud non-null, cela signifie que p et q sont dans des sous-arbres différents, et le nœud actuel est leur LCA.
4. Sinon, nous retournons le résultat non-null (s'il existe), ce qui signifie que p et q sont dans le même sous-arbre.

La complexité temporelle est O(n) où n est le nombre de nœuds dans l'arbre.
La complexité spatiale est O(h) où h est la hauteur de l'arbre, due à la pile d'appels récursifs.
    `,
  },
];

export function PracticeExercises() {
  const [activeTab, setActiveTab] = useState("all");
  const [openExercises, setOpenExercises] = useState<Record<string, boolean>>(
    {}
  );

  // Toggle exercise open/closed state
  const toggleExercise = (id: string) => {
    setOpenExercises((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Filter exercises based on active tab
  const filteredExercises = exercises.filter((exercise) => {
    if (activeTab === "all") return true;
    if (activeTab === "trees") return exercise.category === "Arbres";
    if (activeTab === "graphs") return exercise.category === "Graphes";
    if (activeTab === "easy") return exercise.difficulty === "Facile";
    if (activeTab === "medium") return exercise.difficulty === "Intermédiaire";
    if (activeTab === "hard") return exercise.difficulty === "Difficile";
    return true;
  });

  // Get badge color based on difficulty
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Facile":
        return "bg-green-500/10 text-green-500";
      case "Intermédiaire":
        return "bg-yellow-500/10 text-yellow-500";
      case "Difficile":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-blue-500/10 text-blue-500";
    }
  };

  // Get icon based on category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Arbres":
        return <GitMerge className="h-4 w-4" />;
      case "Graphes":
        return <Network className="h-4 w-4" />;
      case "Mixte":
        return <Brain className="h-4 w-4" />;
      default:
        return <Code2 className="h-4 w-4" />;
    }
  };

  return (
    <Card className="border border-border/50 shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Code2 className="h-5 w-5 text-primary" />
          Exercices Pratiques
        </CardTitle>
        <CardDescription>
          Mettez en pratique vos connaissances avec ces exercices
          d&apos;entretien courants sur les arbres et graphes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filter tabs */}
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-6">
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="trees" className="flex items-center gap-1">
              <GitMerge className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Arbres</span>
            </TabsTrigger>
            <TabsTrigger value="graphs" className="flex items-center gap-1">
              <Network className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Graphes</span>
            </TabsTrigger>
            <TabsTrigger value="easy" className="text-green-500">
              Facile
            </TabsTrigger>
            <TabsTrigger value="medium" className="text-yellow-500">
              Moyen
            </TabsTrigger>
            <TabsTrigger value="hard" className="text-red-500">
              Difficile
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Exercises list */}
        <div className="space-y-4">
          {filteredExercises.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun exercice ne correspond aux filtres sélectionnés.
            </div>
          ) : (
            filteredExercises.map((exercise) => (
              <Collapsible
                key={exercise.id}
                open={openExercises[exercise.id]}
                onOpenChange={() => toggleExercise(exercise.id)}
                className="border rounded-lg overflow-hidden"
              >
                <CollapsibleTrigger asChild>
                  <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                        {getCategoryIcon(exercise.category)}
                      </div>
                      <div>
                        <h3 className="font-medium">{exercise.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="secondary"
                            className={getDifficultyColor(exercise.difficulty)}
                          >
                            {exercise.difficulty}
                          </Badge>
                          <Badge variant="outline">{exercise.category}</Badge>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      {openExercises[exercise.id] ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 pt-0 space-y-4 border-t">
                    {/* Problem description */}
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Code2 className="h-4 w-4 text-primary" />
                        Description du problème
                      </h4>
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <pre className="whitespace-pre-wrap">
                          {exercise.description}
                        </pre>
                      </div>
                    </div>

                    {/* Hints */}
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                        Indices
                      </h4>
                      <ul className="space-y-1">
                        {exercise.hints.map((hint, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-sm"
                          >
                            <span className="text-yellow-500 mt-0.5">•</span>
                            <span>{hint}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Solution */}
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Solution
                      </h4>
                      <div className="relative">
                        <pre className="p-4 rounded-lg bg-muted font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                          <code>{exercise.solution}</code>
                        </pre>
                      </div>
                    </div>

                    {/* Explanation */}
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-primary" />
                        Explication
                      </h4>
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <pre className="whitespace-pre-wrap">
                          {exercise.explanation}
                        </pre>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
