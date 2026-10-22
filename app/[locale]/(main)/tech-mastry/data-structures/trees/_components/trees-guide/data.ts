import {
  BarChart,
  GitBranch,
  GitMerge,
  Network,
} from "lucide-react";
import {
  avlCode,
  binaryTreeCode,
  bstCode,
  graphCode,
} from "./code-samples";
import type { InterviewQuestion, TreeType } from "./types";

// Tree types with descriptions
export const treeTypes: TreeType[] = [
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
      access: "O(deg(v))",
      search: "O(V+E)",
      insertion: "O(1) amorti",
      deletion: "O(V+E)",
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
export const interviewQuestions: InterviewQuestion[] = [
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
      "Pour détecter un cycle dans un graphe non orienté, on peut utiliser un parcours DFS ou BFS en gardant trace des nœuds visités. Si on rencontre un nœud déjà visité qui n'est pas le parent direct du nœud actuel, alors un cycle existe. Pour un graphe orienté, on peut utiliser un DFS avec deux ensembles (ou trois couleurs) : les nœuds en cours de visite et les nœuds complètement visités ; rencontrer un nœud « en cours » révèle un cycle. Un tri topologique (algorithme de Kahn) permet aussi de le détecter.",
  },
  {
    question:
      "Quelle est la complexité temporelle et spatiale d'un parcours en largeur dans un graphe ?",
    answer:
      "La complexité temporelle d'un parcours en largeur (BFS) est O(V + E), où V est le nombre de sommets et E le nombre d'arêtes, car chaque sommet et chaque arête sont visités une fois. La complexité spatiale est O(V) pour stocker la file d'attente et l'ensemble des nœuds visités.",
  },
];
