"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  AlertCircle,
  BarChart,
  Code2,
  GitBranch,
  GitMerge,
  Lightbulb,
  Network,
} from "lucide-react";
import { useState } from "react";
import { BinaryTreeVisualization } from "./binary-tree-visualization";
import { GraphVisualization } from "./graph-visualization";
import { PracticeExercises } from "./practice-exercises";

// Code examples
const binaryTreeCode = `class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

class BinaryTree {
  constructor() {
    this.root = null;
  }

  // Parcours inordre (gauche → racine → droite)
  inorderTraversal(node = this.root, result = []) {
    if (node !== null) {
      this.inorderTraversal(node.left, result);
      result.push(node.value);
      this.inorderTraversal(node.right, result);
    }
    return result;
  }

  // Parcours préordre (racine → gauche → droite)
  preorderTraversal(node = this.root, result = []) {
    if (node !== null) {
      result.push(node.value);
      this.preorderTraversal(node.left, result);
      this.preorderTraversal(node.right, result);
    }
    return result;
  }

  // Parcours postordre (gauche → droite → racine)
  postorderTraversal(node = this.root, result = []) {
    if (node !== null) {
      this.postorderTraversal(node.left, result);
      this.postorderTraversal(node.right, result);
      result.push(node.value);
    }
    return result;
  }

  // Parcours par niveau
  levelOrderTraversal() {
    const result = [];
    if (!this.root) return result;

    const queue = [this.root];

    while (queue.length > 0) {
      const node = queue.shift();
      result.push(node.value);

      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }

    return result;
  }
}`;

const bstCode = `class BinarySearchTree {
  constructor() {
    this.root = null;
  }

  // Insérer une valeur
  insert(value) {
    const newNode = new TreeNode(value);

    if (this.root === null) {
      this.root = newNode;
      return this;
    }

    let current = this.root;

    while (true) {
      if (value === current.value) return undefined;

      if (value < current.value) {
        if (current.left === null) {
          current.left = newNode;
          return this;
        }
        current = current.left;
      } else {
        if (current.right === null) {
          current.right = newNode;
          return this;
        }
        current = current.right;
      }
    }
  }

  // Rechercher une valeur
  find(value) {
    if (this.root === null) return false;

    let current = this.root;
    let found = false;

    while (current && !found) {
      if (value < current.value) {
        current = current.left;
      } else if (value > current.value) {
        current = current.right;
      } else {
        found = true;
      }
    }

    if (!found) return false;
    return current;
  }
}`;

const avlCode = `class AVLNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.height = 1;
  }
}

class AVLTree {
  constructor() {
    this.root = null;
  }

  // Obtenir la hauteur d'un nœud
  height(node) {
    if (node === null) return 0;
    return node.height;
  }

  // Obtenir le facteur d'équilibre
  getBalanceFactor(node) {
    if (node === null) return 0;
    return this.height(node.left) - this.height(node.right);
  }

  // Rotation droite
  rightRotate(y) {
    const x = y.left;
    const T2 = x.right;

    // Effectuer la rotation
    x.right = y;
    y.left = T2;

    // Mettre à jour les hauteurs
    y.height = Math.max(this.height(y.left), this.height(y.right)) + 1;
    x.height = Math.max(this.height(x.left), this.height(x.right)) + 1;

    // Retourner la nouvelle racine
    return x;
  }

  // Rotation gauche
  leftRotate(x) {
    const y = x.right;
    const T2 = y.left;

    // Effectuer la rotation
    y.left = x;
    x.right = T2;

    // Mettre à jour les hauteurs
    x.height = Math.max(this.height(x.left), this.height(x.right)) + 1;
    y.height = Math.max(this.height(y.left), this.height(y.right)) + 1;

    // Retourner la nouvelle racine
    return y;
  }

  // Insérer un nœud
  insert(value) {
    this.root = this._insert(this.root, value);
    return this;
  }

  _insert(node, value) {
    // Insertion BST standard
    if (node === null) return new AVLNode(value);

    if (value < node.value)
      node.left = this._insert(node.left, value);
    else if (value > node.value)
      node.right = this._insert(node.right, value);
    else
      return node; // Les doublons ne sont pas autorisés

    // Mettre à jour la hauteur
    node.height = Math.max(this.height(node.left), this.height(node.right)) + 1;

    // Obtenir le facteur d'équilibre
    const balance = this.getBalanceFactor(node);

    // Cas de déséquilibre

    // Gauche Gauche
    if (balance > 1 && value < node.left.value)
      return this.rightRotate(node);

    // Droite Droite
    if (balance < -1 && value > node.right.value)
      return this.leftRotate(node);

    // Gauche Droite
    if (balance > 1 && value > node.left.value) {
      node.left = this.leftRotate(node.left);
      return this.rightRotate(node);
    }

    // Droite Gauche
    if (balance < -1 && value < node.right.value) {
      node.right = this.rightRotate(node.right);
      return this.leftRotate(node);
    }

    return node;
  }
}`;

const graphCode = `class Graph {
  constructor() {
    this.adjacencyList = {};
  }

  // Ajouter un sommet
  addVertex(vertex) {
    if (!this.adjacencyList[vertex]) {
      this.adjacencyList[vertex] = [];
    }
  }

  // Ajouter une arête (non orientée)
  addEdge(vertex1, vertex2) {
    this.adjacencyList[vertex1].push(vertex2);
    this.adjacencyList[vertex2].push(vertex1);
  }

  // Supprimer une arête
  removeEdge(vertex1, vertex2) {
    this.adjacencyList[vertex1] = this.adjacencyList[vertex1].filter(
      v => v !== vertex2
    );
    this.adjacencyList[vertex2] = this.adjacencyList[vertex2].filter(
      v => v !== vertex1
    );
  }

  // Supprimer un sommet
  removeVertex(vertex) {
    while (this.adjacencyList[vertex].length) {
      const adjacentVertex = this.adjacencyList[vertex].pop();
      this.removeEdge(vertex, adjacentVertex);
    }
    delete this.adjacencyList[vertex];
  }

  // Parcours en profondeur (DFS) récursif
  depthFirstRecursive(start) {
    const result = [];
    const visited = {};
    const adjacencyList = this.adjacencyList;

    (function dfs(vertex) {
      if (!vertex) return null;
      visited[vertex] = true;
      result.push(vertex);

      adjacencyList[vertex].forEach(neighbor => {
        if (!visited[neighbor]) {
          return dfs(neighbor);
        }
      });
    })(start);

    return result;
  }

  // Parcours en largeur (BFS)
  breadthFirst(start) {
    const queue = [start];
    const result = [];
    const visited = {};
    visited[start] = true;

    while (queue.length) {
      const currentVertex = queue.shift();
      result.push(currentVertex);

      this.adjacencyList[currentVertex].forEach(neighbor => {
        if (!visited[neighbor]) {
          visited[neighbor] = true;
          queue.push(neighbor);
        }
      });
    }

    return result;
  }
}`;

// Tree types with descriptions
const treeTypes = [
  {
    id: "binary",
    title: "Arbres Binaires",
    description:
      "Un arbre binaire est une structure de données hiérarchique où chaque nœud a au plus deux enfants, généralement désignés comme enfant gauche et enfant droit.",
    icon: GitBranch,
    complexity: {
      access: "O(h)",
      search: "O(h)",
      insertion: "O(h)",
      deletion: "O(h)",
    },
    advantages: [
      "Structure hiérarchique naturelle",
      "Opérations efficaces (si équilibré)",
      "Facile à parcourir récursivement",
    ],
    disadvantages: [
      "Peut devenir déséquilibré",
      "Hauteur peut augmenter linéairement",
      "Utilisation inefficace de la mémoire",
    ],
    applications: [
      "Expressions arithmétiques",
      "Algorithmes de compression",
      "Jeux (arbres de décision)",
    ],
    code: binaryTreeCode,
  },
  {
    id: "bst",
    title: "Arbres Binaires de Recherche",
    description:
      "Un arbre binaire de recherche (BST) est un arbre binaire où pour chaque nœud, toutes les valeurs dans le sous-arbre gauche sont inférieures à la valeur du nœud, et toutes les valeurs dans le sous-arbre droit sont supérieures.",
    icon: BarChart,
    complexity: {
      access: "O(log n)*",
      search: "O(log n)*",
      insertion: "O(log n)*",
      deletion: "O(log n)*",
    },
    advantages: [
      "Recherche efficace",
      "Insertion et suppression efficaces",
      "Maintient les données triées",
    ],
    disadvantages: [
      "Peut devenir déséquilibré",
      "Performances dégradées dans le pire cas",
      "Nécessite des opérations de rééquilibrage",
    ],
    applications: [
      "Bases de données indexées",
      "Implémentations de dictionnaires",
      "Algorithmes de recherche",
    ],
    code: bstCode,
  },
  {
    id: "balanced",
    title: "Arbres Équilibrés",
    description:
      "Les arbres équilibrés (AVL, Rouge-Noir) sont des arbres binaires de recherche qui maintiennent automatiquement leur équilibre pour garantir des opérations en O(log n).",
    icon: GitMerge,
    complexity: {
      access: "O(log n)",
      search: "O(log n)",
      insertion: "O(log n)",
      deletion: "O(log n)",
    },
    advantages: [
      "Garantie de performances O(log n)",
      "Auto-équilibrage",
      "Efficace pour les grandes quantités de données",
    ],
    disadvantages: [
      "Implémentation complexe",
      "Surcoût pour maintenir l'équilibre",
      "Opérations plus coûteuses que les BST simples",
    ],
    applications: [
      "Bases de données",
      "Systèmes de fichiers",
      "Implémentations de collections",
    ],
    code: avlCode,
  },
  {
    id: "graphs",
    title: "Graphes",
    description:
      "Un graphe est une structure de données non linéaire composée de sommets (nœuds) et d'arêtes qui relient ces sommets. Les graphes peuvent être orientés ou non orientés, pondérés ou non pondérés.",
    icon: Network,
    complexity: {
      access: "O(1)",
      search: "O(V+E)",
      insertion: "O(1)",
      deletion: "O(V)",
    },
    advantages: [
      "Modélisation flexible des relations",
      "Représentation naturelle de nombreux problèmes",
      "Nombreux algorithmes bien établis",
    ],
    disadvantages: [
      "Consommation mémoire importante",
      "Complexité d'implémentation",
      "Algorithmes parfois coûteux",
    ],
    applications: [
      "Réseaux sociaux",
      "Systèmes de navigation",
      "Réseaux de télécommunication",
      "Analyse de dépendances",
    ],
    code: graphCode,
  },
];

// Interview questions
const interviewQuestions = [
  {
    question:
      "Quelle est la différence entre un parcours en profondeur (DFS) et un parcours en largeur (BFS) ?",
    answer:
      "Le parcours en profondeur (DFS) explore un chemin aussi loin que possible avant de revenir en arrière (backtracking) et d'explorer d'autres chemins. Il utilise généralement une pile ou la récursion. Le parcours en largeur (BFS) explore tous les voisins d'un nœud avant de passer aux nœuds du niveau suivant. Il utilise une file d'attente et est idéal pour trouver le chemin le plus court dans un graphe non pondéré.",
  },
  {
    question:
      "Comment vérifier si un arbre binaire est un arbre binaire de recherche valide ?",
    answer:
      "Pour vérifier si un arbre binaire est un BST valide, on peut utiliser un parcours inordre et vérifier que les valeurs sont strictement croissantes. Alternativement, on peut utiliser une approche récursive en vérifiant pour chaque nœud que toutes les valeurs dans le sous-arbre gauche sont inférieures à la valeur du nœud et toutes les valeurs dans le sous-arbre droit sont supérieures.",
  },
  {
    question:
      "Qu'est-ce qu'un arbre AVL et comment maintient-il son équilibre ?",
    answer:
      "Un arbre AVL est un arbre binaire de recherche auto-équilibré où la différence de hauteur entre les sous-arbres gauche et droit de chaque nœud ne dépasse pas 1. Après chaque insertion ou suppression, l'arbre vérifie le facteur d'équilibre de chaque nœud et effectue des rotations (gauche, droite, gauche-droite, droite-gauche) si nécessaire pour maintenir l'équilibre.",
  },
  {
    question:
      "Comment implémenter un algorithme de détection de cycle dans un graphe ?",
    answer:
      "Pour détecter un cycle dans un graphe non orienté, on peut utiliser un parcours DFS ou BFS en gardant trace des nœuds visités. Si on rencontre un nœud déjà visité qui n'est pas le parent direct du nœud actuel, alors un cycle existe. Pour un graphe orienté, on peut utiliser l'algorithme de détection de cycle de Tarjan ou maintenir deux ensembles : les nœuds en cours de visite et les nœuds complètement visités.",
  },
  {
    question:
      "Quelle est la complexité temporelle et spatiale d'un parcours en largeur dans un graphe ?",
    answer:
      "La complexité temporelle d'un parcours en largeur (BFS) est O(V + E), où V est le nombre de sommets et E le nombre d'arêtes, car chaque sommet et chaque arête sont visités une fois. La complexité spatiale est O(V) pour stocker la file d'attente et l'ensemble des nœuds visités.",
  },
];

export function TreesGuide() {
  const [activeTab, setActiveTab] = useState("binary");

  return (
    <div className="space-y-10">
      {/* Introduction */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="prose prose-slate dark:prose-invert max-w-none"
      >
        <h2 className="text-3xl font-bold mb-4">
          Introduction aux Arbres et Graphes
        </h2>
        <p className="text-lg text-muted-foreground">
          Les arbres et les graphes sont des structures de données non linéaires
          fondamentales en informatique, utilisées pour représenter des
          relations hiérarchiques et des connexions entre objets. Ces structures
          sont essentielles pour résoudre de nombreux problèmes complexes et
          sont fréquemment abordées lors des entretiens techniques.
        </p>
      </motion.div>

      {/* Interactive Visualizations */}
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <BinaryTreeVisualization />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <GraphVisualization />
        </motion.div>
      </div>

      {/* Tree Types Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Tabs
          defaultValue="binary"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-6">
            {treeTypes.map((type) => (
              <TabsTrigger
                key={type.id}
                value={type.id}
                className="flex items-center gap-2"
              >
                <type.icon className="h-4 w-4" />
                <span className="hidden md:inline">{type.title}</span>
                <span className="md:hidden">
                  {type.id === "binary"
                    ? "Bin"
                    : type.id === "bst"
                    ? "BST"
                    : type.id === "balanced"
                    ? "Éq."
                    : "Graph"}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {treeTypes.map((type) => (
            <TabsContent key={type.id} value={type.id} className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl flex items-center gap-2">
                        <type.icon className="h-5 w-5 text-primary" />
                        {type.title}
                      </CardTitle>
                      <CardDescription className="mt-2 text-base">
                        {type.description}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs px-3 py-1">
                      {type.id === "binary"
                        ? "Fondamental"
                        : type.id === "bst"
                        ? "Intermédiaire"
                        : type.id === "balanced"
                        ? "Avancé"
                        : "Avancé"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Complexity Table */}
                  <div>
                    <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                      <BarChart className="h-4 w-4 text-primary" />
                      Complexité
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card className="p-3 bg-muted/30">
                        <p className="text-xs text-muted-foreground mb-1">
                          Accès
                        </p>
                        <p className="font-mono font-medium">
                          {type.complexity.access}
                        </p>
                      </Card>
                      <Card className="p-3 bg-muted/30">
                        <p className="text-xs text-muted-foreground mb-1">
                          Recherche
                        </p>
                        <p className="font-mono font-medium">
                          {type.complexity.search}
                        </p>
                      </Card>
                      <Card className="p-3 bg-muted/30">
                        <p className="text-xs text-muted-foreground mb-1">
                          Insertion
                        </p>
                        <p className="font-mono font-medium">
                          {type.complexity.insertion}
                        </p>
                      </Card>
                      <Card className="p-3 bg-muted/30">
                        <p className="text-xs text-muted-foreground mb-1">
                          Suppression
                        </p>
                        <p className="font-mono font-medium">
                          {type.complexity.deletion}
                        </p>
                      </Card>
                    </div>
                    {type.id === "bst" && (
                      <p className="text-xs text-muted-foreground mt-2">
                        * Dans le cas moyen pour un arbre équilibré. Peut
                        dégénérer à O(n) dans le pire cas.
                      </p>
                    )}
                  </div>

                  {/* Advantages and Disadvantages */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-green-500" />
                        Avantages
                      </h3>
                      <ul className="space-y-2">
                        {type.advantages.map((adv, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-sm"
                          >
                            <span className="text-green-500 mt-0.5">•</span>
                            <span>{adv}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        Inconvénients
                      </h3>
                      <ul className="space-y-2">
                        {type.disadvantages.map((disadv, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-sm"
                          >
                            <span className="text-red-500 mt-0.5">•</span>
                            <span>{disadv}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Applications */}
                  <div>
                    <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                      <Code2 className="h-4 w-4 text-primary" />
                      Applications
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {type.applications.map((app, index) => (
                        <Badge key={index} variant="secondary">
                          {app}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Code Example */}
                  <div>
                    <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                      <Code2 className="h-4 w-4 text-primary" />
                      Implémentation
                    </h3>
                    <div className="relative">
                      <pre className="p-4 rounded-lg bg-muted font-mono text-sm overflow-x-auto">
                        <code>{type.code}</code>
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>

      {/* Interview Questions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Questions d&apos;Entretien Courantes
            </CardTitle>
            <CardDescription>
              Préparez-vous aux questions fréquemment posées sur les arbres et
              graphes lors des entretiens techniques.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {interviewQuestions.map((q, index) => (
                <div key={index} className="space-y-2">
                  <h3 className="font-medium text-lg">{q.question}</h3>
                  <p className="text-muted-foreground text-sm">{q.answer}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Practice Exercises */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <PracticeExercises />
      </motion.div>

      {/* Resources and Further Reading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <BookIcon className="h-5 w-5 text-primary" />
              Ressources et Lectures Complémentaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm">
                <span className="text-primary mt-0.5">•</span>
                <span>
                  <strong>Introduction to Algorithms</strong> par Cormen,
                  Leiserson, Rivest et Stein - Chapitres sur les arbres et
                  graphes
                </span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <span className="text-primary mt-0.5">•</span>
                <span>
                  <strong>Algorithms, 4th Edition</strong> par Robert Sedgewick
                  et Kevin Wayne
                </span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <span className="text-primary mt-0.5">•</span>
                <span>
                  <strong>Visualgo</strong> - Visualisations interactives
                  d&apos;algorithmes et structures de données
                </span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <span className="text-primary mt-0.5">•</span>
                <span>
                  <strong>LeetCode</strong> - Collection de problèmes sur les
                  arbres et graphes pour s&apos;entraîner
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// Book icon component
function BookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}
