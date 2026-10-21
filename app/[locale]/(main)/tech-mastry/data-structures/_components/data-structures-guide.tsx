import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Code2, Lightbulb, AlertCircle } from "lucide-react";

const dataStructures = [
  {
    name: "Tableaux (Arrays)",
    complexity: {
      access: "O(1)",
      search: "O(n)",
      insertion: "O(n)",
      deletion: "O(n)",
    },
    code: `// Déclaration et initialisation
const array = [1, 2, 3, 4, 5];

// Accès
const element = array[2]; // O(1)

// Insertion à la fin
array.push(6); // O(1) amorti

// Insertion au début
array.unshift(0); // O(n)

// Suppression
array.splice(2, 1); // O(n)`,
    description: "Structure de données linéaire stockant des éléments dans des emplacements contigus en mémoire.",
    useCases: [
      "Accès direct aux éléments",
      "Stockage séquentiel",
      "Manipulation de données fixes",
    ],
    pros: ["Accès rapide", "Simple à utiliser", "Efficace en mémoire"],
    cons: ["Taille fixe (arrays statiques)", "Insertions/suppressions coûteuses", "Réallocation nécessaire pour grandir"],
  },
  {
    name: "Listes Chaînées",
    complexity: {
      access: "O(n)",
      search: "O(n)",
      insertion: "O(1)",
      deletion: "O(1)",
    },
    code: `class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
  }

  // Insertion au début O(1)
  prepend(data) {
    const newNode = new Node(data);
    newNode.next = this.head;
    this.head = newNode;
  }

  // Suppression au début O(1)
  deleteFirst() {
    if (this.head) {
      this.head = this.head.next;
    }
  }

  // Recherche O(n)
  find(data) {
    let current = this.head;
    while (current) {
      if (current.data === data) return current;
      current = current.next;
    }
    return null;
  }
}`,
    description: "Collection d'éléments où chaque élément pointe vers le suivant, formant une séquence.",
    useCases: [
      "Insertions/suppressions fréquentes",
      "Taille dynamique",
      "Implémentation de piles/files",
    ],
    pros: ["Insertions/suppressions efficaces", "Taille dynamique", "Pas de réallocation"],
    cons: ["Accès séquentiel", "Plus de mémoire utilisée", "Pas d'accès direct"],
  },
  {
    name: "Arbres Binaires de Recherche",
    complexity: {
      access: "O(log n)",
      search: "O(log n)",
      insertion: "O(log n)",
      deletion: "O(log n)",
    },
    code: `class TreeNode {
  constructor(data) {
    this.data = data;
    this.left = null;
    this.right = null;
  }
}

class BinarySearchTree {
  constructor() {
    this.root = null;
  }

  insert(data) {
    const newNode = new TreeNode(data);
    if (!this.root) {
      this.root = newNode;
      return;
    }

    let current = this.root;
    while (true) {
      if (data < current.data) {
        if (!current.left) {
          current.left = newNode;
          break;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = newNode;
          break;
        }
        current = current.right;
      }
    }
  }

  search(data) {
    let current = this.root;
    while (current) {
      if (data === current.data) return current;
      if (data < current.data) current = current.left;
      else current = current.right;
    }
    return null;
  }
}`,
    description: "Structure hiérarchique où chaque nœud a au plus deux enfants, avec une propriété d'ordre.",
    useCases: [
      "Recherche efficace",
      "Maintien de données triées",
      "Implémentation de dictionnaires",
    ],
    pros: ["Recherche efficace", "Maintient l'ordre", "Équilibré: performances garanties"],
    cons: ["Complexité d'implémentation", "Peut devenir déséquilibré", "Overhead mémoire"],
  },
  {
    name: "Tables de Hachage",
    complexity: {
      access: "O(1)*",
      search: "O(1)*",
      insertion: "O(1)*",
      deletion: "O(1)*",
    },
    code: `class HashTable {
  constructor(size = 53) {
    this.keyMap = new Array(size);
  }

  _hash(key) {
    let total = 0;
    const PRIME = 31;
    for (let i = 0; i < Math.min(key.length, 100); i++) {
      const char = key[i];
      const value = char.charCodeAt(0) - 96;
      total = (total * PRIME + value) % this.keyMap.length;
    }
    return total;
  }

  set(key, value) {
    const index = this._hash(key);
    if (!this.keyMap[index]) {
      this.keyMap[index] = [];
    }
    this.keyMap[index].push([key, value]);
  }

  get(key) {
    const index = this._hash(key);
    if (this.keyMap[index]) {
      for (let i = 0; i < this.keyMap[index].length; i++) {
        if (this.keyMap[index][i][0] === key) {
          return this.keyMap[index][i][1];
        }
      }
    }
    return undefined;
  }
}`,
    description: "Structure associant des clés à des valeurs via une fonction de hachage.",
    useCases: [
      "Recherche rapide par clé",
      "Cache de données",
      "Comptage de fréquences",
    ],
    pros: ["Accès très rapide", "Flexible pour les clés", "Efficace pour grands ensembles"],
    cons: ["Collisions possibles", "Distribution non uniforme", "Utilisation mémoire"],
  },
];

const optimizationTips = [
  {
    title: "Choix de la Structure",
    tips: [
      "Accès fréquent → Tableau/HashTable",
      "Insertions fréquentes → Liste chaînée",
      "Données ordonnées → Arbre binaire",
      "Associations clé-valeur → Table de hachage",
    ],
  },
  {
    title: "Considérations Pratiques",
    tips: [
      "Évaluer les patterns d'accès",
      "Considérer la taille des données",
      "Analyser les besoins en mémoire",
      "Prévoir la scalabilité",
    ],
  },
];

const commonQuestions = [
  {
    question: "Array vs LinkedList ?",
    answer: "Array pour accès rapide et données fixes, LinkedList pour insertions/suppressions fréquentes et taille dynamique.",
  },
  {
    question: "Quand utiliser un BST ?",
    answer: "Pour maintenir des données triées avec recherche, insertion et suppression efficaces en O(log n).",
  },
  {
    question: "Comment gérer les collisions dans une HashTable ?",
    answer: "Par chaînage (linked lists) ou adressage ouvert (probing). Le chaînage est plus simple mais utilise plus de mémoire.",
  },
];

export function DataStructuresGuide() {
  return (
    <div className="space-y-12">
      {/* Introduction */}
      <div className="prose prose-invert max-w-none">
        <h1 className="text-4xl font-bold mb-4 flex items-center gap-3 text-foreground">
          <Database className="w-10 h-10 text-primary" />
          Structures de Données
        </h1>
        <p className="text-lg text-muted-foreground">
          Les structures de données sont fondamentales en programmation, chacune
          offrant des compromis différents en termes de performance et
          d&apos;utilisation. Comprendre leurs caractéristiques est essentiel
          pour les entretiens techniques.
        </p>
      </div>

      {/* Structures */}
      <div className="space-y-8">
        {dataStructures.map((structure) => (
          <Card key={structure.name} className="p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {structure.name}
                </h2>
                <p className="text-muted-foreground mt-1">
                  {structure.description}
                </p>
              </div>

              {/* Complexité */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold mb-2">Complexité</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Accès:
                      </span>
                      <code className="font-mono">
                        {structure.complexity.access}
                      </code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Recherche:
                      </span>
                      <code className="font-mono">
                        {structure.complexity.search}
                      </code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Insertion:
                      </span>
                      <code className="font-mono">
                        {structure.complexity.insertion}
                      </code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Suppression:
                      </span>
                      <code className="font-mono">
                        {structure.complexity.deletion}
                      </code>
                    </div>
                  </div>
                </div>
              </div>

              {/* Implémentation */}
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Code2 className="w-4 h-4" />
                  Implémentation
                </h3>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto" tabIndex={0}>
                  <code>{structure.code}</code>
                </pre>
              </div>

              {/* Cas d'utilisation */}
              <div>
                <h3 className="font-semibold mb-2">Cas d&apos;utilisation</h3>
                <div className="flex flex-wrap gap-2">
                  {structure.useCases.map((useCase, index) => (
                    <Badge key={index} variant="outline">
                      {useCase}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Pros & Cons */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Badge className="bg-green-500/10 text-green-500 mb-2">
                    Avantages
                  </Badge>
                  <ul className="space-y-1">
                    {structure.pros.map((pro, index) => (
                      <li
                        key={index}
                        className="text-muted-foreground text-sm flex items-start gap-2"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <Badge className="bg-red-500/10 text-red-500 mb-2">
                    Inconvénients
                  </Badge>
                  <ul className="space-y-1">
                    {structure.cons.map((con, index) => (
                      <li
                        key={index}
                        className="text-muted-foreground text-sm flex items-start gap-2"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Conseils d'Optimisation */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Lightbulb className="w-6 h-6" />
          Conseils d&apos;Optimisation
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {optimizationTips.map((section) => (
            <Card key={section.title} className="p-6">
              <div className="space-y-4">
                <h3 className="font-semibold">{section.title}</h3>
                <ul className="space-y-2">
                  {section.tips.map((tip, index) => (
                    <li
                      key={index}
                      className="text-muted-foreground text-sm flex items-start gap-2"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Questions Fréquentes */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <AlertCircle className="w-6 h-6" />
          Questions Fréquentes
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {commonQuestions.map((qa) => (
            <Card key={qa.question} className="p-6">
              <div className="space-y-4">
                <h3 className="font-semibold">{qa.question}</h3>
                <p className="text-muted-foreground text-sm">{qa.answer}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
