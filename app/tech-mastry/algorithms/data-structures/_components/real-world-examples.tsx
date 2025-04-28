"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { useState } from "react";

// Interface pour un exemple concret
interface RealWorldExample {
  id: string;
  title: string;
  category: string;
  description: string;
  useCases: {
    title: string;
    description: string;
  }[];
  codeExample: {
    language: string;
    code: string;
    explanation: string;
  };
  references?: {
    title: string;
    url: string;
  }[];
}

// Données des exemples concrets
const realWorldExamples: RealWorldExample[] = [
  {
    id: "array-1",
    title: "Manipulation d'images",
    category: "arrays",
    description:
      "Les tableaux sont largement utilisés dans le traitement d'images, où chaque pixel est représenté comme un élément d'un tableau 2D ou 3D.",
    useCases: [
      {
        title: "Filtres d'image",
        description:
          "Les filtres comme le flou gaussien ou la détection de contours utilisent des tableaux pour stocker et manipuler les valeurs des pixels.",
      },
      {
        title: "Compression d'images",
        description:
          "Les algorithmes de compression comme JPEG utilisent des tableaux pour stocker les coefficients DCT (Discrete Cosine Transform).",
      },
      {
        title: "Reconnaissance d'objets",
        description:
          "Les algorithmes de vision par ordinateur utilisent des tableaux pour représenter les caractéristiques extraites des images.",
      },
    ],
    codeExample: {
      language: "javascript",
      code: `// Exemple de filtre de niveaux de gris en JavaScript
function grayscaleFilter(imageData) {
  // imageData est un tableau 1D représentant les pixels RGBA
  for (let i = 0; i < imageData.length; i += 4) {
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];

    // Formule standard pour convertir RGB en niveaux de gris
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;

    // Mettre à jour les valeurs RGB avec la valeur de gris
    imageData[i] = gray;     // R
    imageData[i + 1] = gray; // G
    imageData[i + 2] = gray; // B
    // imageData[i + 3] reste inchangé (canal alpha)
  }

  return imageData;
}`,
      explanation:
        "Ce code montre comment implémenter un filtre de niveaux de gris simple en utilisant un tableau pour représenter les données d'une image. Chaque pixel est représenté par 4 valeurs consécutives dans le tableau (rouge, vert, bleu, alpha). Le code parcourt le tableau et applique la formule standard de conversion en niveaux de gris à chaque pixel.",
    },
    references: [
      {
        title: "MDN Web Docs - ImageData",
        url: "https://developer.mozilla.org/fr/docs/Web/API/ImageData",
      },
      {
        title: "Wikipedia - Traitement d'image",
        url: "https://fr.wikipedia.org/wiki/Traitement_d%27image",
      },
    ],
  },
  {
    id: "linked-list-1",
    title: "Historique de navigation",
    category: "linked-lists",
    description:
      "Les listes chaînées sont utilisées dans les navigateurs web pour implémenter l'historique de navigation, permettant de naviguer en avant et en arrière entre les pages visitées.",
    useCases: [
      {
        title: "Navigation avant/arrière",
        description:
          "Les boutons avant et arrière du navigateur utilisent une liste doublement chaînée pour stocker l'historique des pages visitées.",
      },
      {
        title: "Gestion de l'historique",
        description:
          "Lorsque vous visitez une nouvelle page à partir d'une page intermédiaire, toutes les pages 'en avant' sont supprimées de la liste.",
      },
      {
        title: "Fonctionnalité d'annulation",
        description:
          "De nombreuses applications utilisent une structure similaire pour implémenter les fonctionnalités d'annulation/rétablissement.",
      },
    ],
    codeExample: {
      language: "javascript",
      code: `class BrowserHistory {
  constructor(homepage) {
    this.current = {
      url: homepage,
      prev: null,
      next: null
    };
    this.homepage = this.current;
  }

  visit(url) {
    // Créer un nouveau nœud
    const newPage = {
      url: url,
      prev: this.current,
      next: null
    };

    // Mettre à jour les liens
    this.current.next = newPage;

    // Déplacer le pointeur courant
    this.current = newPage;

    // Supprimer toutes les pages "en avant"
    // (déjà fait car nous avons remplacé this.current.next)
  }

  back() {
    if (this.current.prev) {
      this.current = this.current.prev;
      return this.current.url;
    }
    return this.current.url;
  }

  forward() {
    if (this.current.next) {
      this.current = this.current.next;
      return this.current.url;
    }
    return this.current.url;
  }
}

// Utilisation
const history = new BrowserHistory("https://www.example.com");
history.visit("https://www.example.com/page1");
history.visit("https://www.example.com/page2");

console.log(history.back());    // https://www.example.com/page1
console.log(history.back());    // https://www.example.com
console.log(history.forward()); // https://www.example.com/page1`,
      explanation:
        "Ce code implémente une version simplifiée de l'historique de navigation d'un navigateur web en utilisant une liste doublement chaînée. Chaque nœud représente une page web et contient des références aux pages précédente et suivante. Les méthodes 'visit', 'back' et 'forward' permettent de naviguer dans l'historique.",
    },
    references: [
      {
        title: "MDN Web Docs - History API",
        url: "https://developer.mozilla.org/fr/docs/Web/API/History_API",
      },
    ],
  },
  {
    id: "stack-1",
    title: "Validation de syntaxe",
    category: "stacks",
    description:
      "Les piles sont utilisées dans les compilateurs et les interpréteurs pour valider la syntaxe du code, notamment pour vérifier l'équilibrage des parenthèses, accolades et crochets.",
    useCases: [
      {
        title: "Vérification des parenthèses",
        description:
          "Les éditeurs de code utilisent des piles pour vérifier que les parenthèses, accolades et crochets sont correctement équilibrés.",
      },
      {
        title: "Analyse syntaxique",
        description:
          "Les compilateurs utilisent des piles pour analyser la structure syntaxique du code source.",
      },
      {
        title: "Évaluation d'expressions",
        description:
          "Les calculatrices et les interpréteurs utilisent des piles pour évaluer des expressions mathématiques (notation polonaise inverse).",
      },
    ],
    codeExample: {
      language: "javascript",
      code: `function isValidSyntax(code) {
  const stack = [];
  const openingBrackets = "({[";
  const closingBrackets = ")}]";
  const bracketPairs = {
    ")": "(",
    "}": "{",
    "]": "["
  };

  for (let i = 0; i < code.length; i++) {
    const char = code[i];

    // Si c'est une parenthèse ouvrante, la pousser sur la pile
    if (openingBrackets.includes(char)) {
      stack.push(char);
    }
    // Si c'est une parenthèse fermante
    else if (closingBrackets.includes(char)) {
      // Si la pile est vide ou si la parenthèse ne correspond pas
      if (stack.length === 0 || stack.pop() !== bracketPairs[char]) {
        return false;
      }
    }
  }

  // La syntaxe est valide si la pile est vide à la fin
  return stack.length === 0;
}

// Exemples d'utilisation
console.log(isValidSyntax("function() { return [1, 2]; }")); // true
console.log(isValidSyntax("if (x) { y = [1, 2); }")); // false
console.log(isValidSyntax("const obj = { key: 'value' };")); // true`,
      explanation:
        "Ce code utilise une pile pour vérifier que les parenthèses, accolades et crochets dans un code source sont correctement équilibrés. Pour chaque parenthèse ouvrante, on l'empile. Pour chaque parenthèse fermante, on vérifie qu'elle correspond à la dernière parenthèse ouvrante en dépilant celle-ci. Si à la fin la pile est vide, la syntaxe est valide.",
    },
    references: [
      {
        title: "Wikipedia - Pile (informatique)",
        url: "https://fr.wikipedia.org/wiki/Pile_(informatique)",
      },
      {
        title: "GeeksforGeeks - Check for Balanced Parentheses",
        url: "https://www.geeksforgeeks.org/check-for-balanced-parentheses-in-an-expression/",
      },
    ],
  },
  {
    id: "queue-1",
    title: "Gestion des tâches asynchrones",
    category: "queues",
    description:
      "Les files sont utilisées dans les systèmes d'exploitation et les frameworks JavaScript pour gérer les tâches asynchrones et les événements.",
    useCases: [
      {
        title: "Boucle d'événements JavaScript",
        description:
          "JavaScript utilise une file pour gérer les callbacks et les événements dans sa boucle d'événements (event loop).",
      },
      {
        title: "Systèmes de messagerie",
        description:
          "Les systèmes comme RabbitMQ ou Kafka utilisent des files pour stocker et traiter les messages de manière asynchrone.",
      },
      {
        title: "Gestion des requêtes HTTP",
        description:
          "Les serveurs web utilisent des files pour gérer les requêtes entrantes et assurer un traitement équitable.",
      },
    ],
    codeExample: {
      language: "javascript",
      code: `// Implémentation simplifiée d'une file de tâches asynchrones
class TaskQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
  }

  // Ajouter une tâche à la file
  enqueue(task) {
    this.queue.push(task);

    // Démarrer le traitement si ce n'est pas déjà en cours
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  // Traiter les tâches de la file
  async processQueue() {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;

    // Récupérer la première tâche (FIFO)
    const task = this.queue.shift();

    try {
      // Exécuter la tâche
      await task();
    } catch (error) {
      console.error("Erreur lors de l'exécution de la tâche:", error);
    }

    // Continuer avec la tâche suivante
    this.processQueue();
  }
}

// Exemple d'utilisation
const taskQueue = new TaskQueue();

// Ajouter quelques tâches
taskQueue.enqueue(async () => {
  console.log("Tâche 1 démarrée");
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log("Tâche 1 terminée");
});

taskQueue.enqueue(async () => {
  console.log("Tâche 2 démarrée");
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log("Tâche 2 terminée");
});

// Plus tard, ajouter une autre tâche
setTimeout(() => {
  taskQueue.enqueue(async () => {
    console.log("Tâche 3 démarrée");
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log("Tâche 3 terminée");
  });
}, 2000);`,
      explanation:
        "Ce code implémente une file de tâches asynchrones en JavaScript. Les tâches sont ajoutées à la file avec la méthode 'enqueue' et sont traitées dans l'ordre FIFO (premier entré, premier sorti). Chaque tâche est exécutée de manière asynchrone, et la file continue à traiter les tâches jusqu'à ce qu'elle soit vide. Cette approche est similaire à la façon dont JavaScript gère les callbacks dans sa boucle d'événements.",
    },
    references: [
      {
        title: "MDN Web Docs - Concurrence et boucle d'événements",
        url: "https://developer.mozilla.org/fr/docs/Web/JavaScript/EventLoop",
      },
      {
        title: "Jake Archibald: In The Loop",
        url: "https://www.youtube.com/watch?v=cCOL7MC4Pl0",
      },
    ],
  },
  {
    id: "hash-table-1",
    title: "Mise en cache de données",
    category: "hash-tables",
    description:
      "Les tables de hachage sont utilisées pour implémenter des systèmes de cache, permettant un accès rapide aux données fréquemment utilisées.",
    useCases: [
      {
        title: "Caches de base de données",
        description:
          "Les systèmes comme Redis utilisent des tables de hachage pour stocker les résultats de requêtes fréquentes.",
      },
      {
        title: "Caches de navigateur",
        description:
          "Les navigateurs utilisent des tables de hachage pour stocker les ressources web (images, scripts, etc.) afin d'accélérer le chargement des pages.",
      },
      {
        title: "Mémoïsation",
        description:
          "Technique d'optimisation qui utilise des tables de hachage pour stocker les résultats de fonctions coûteuses.",
      },
    ],
    codeExample: {
      language: "javascript",
      code: `// Implémentation d'une fonction de mémoïsation avec une table de hachage
function memoize(fn) {
  const cache = new Map(); // Table de hachage pour stocker les résultats

  return function(...args) {
    // Créer une clé unique basée sur les arguments
    const key = JSON.stringify(args);

    // Vérifier si le résultat est déjà dans le cache
    if (cache.has(key)) {
      console.log("Résultat récupéré du cache");
      return cache.get(key);
    }

    // Calculer le résultat
    console.log("Calcul du résultat");
    const result = fn.apply(this, args);

    // Stocker le résultat dans le cache
    cache.set(key, result);

    return result;
  };
}

// Exemple: Fonction de calcul de la suite de Fibonacci
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Version mémoïsée de la fonction fibonacci
const memoizedFibonacci = memoize(function(n) {
  if (n <= 1) return n;
  return memoizedFibonacci(n - 1) + memoizedFibonacci(n - 2);
});

// Comparaison des performances
console.time("Sans mémoïsation");
fibonacci(35); // Très lent
console.timeEnd("Sans mémoïsation");

console.time("Avec mémoïsation");
memoizedFibonacci(35); // Beaucoup plus rapide
console.timeEnd("Avec mémoïsation");`,
      explanation:
        "Ce code implémente une fonction de mémoïsation qui utilise une table de hachage (Map en JavaScript) pour stocker les résultats de fonctions coûteuses. La fonction 'memoize' prend une fonction en paramètre et retourne une nouvelle fonction qui vérifie d'abord si le résultat pour les arguments donnés est déjà dans le cache. Si c'est le cas, elle retourne le résultat du cache, sinon elle calcule le résultat, le stocke dans le cache et le retourne. L'exemple montre comment cette technique peut considérablement améliorer les performances du calcul de la suite de Fibonacci.",
    },
    references: [
      {
        title: "MDN Web Docs - Map",
        url: "https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Map",
      },
      {
        title: "Wikipedia - Mémoïsation",
        url: "https://fr.wikipedia.org/wiki/M%C3%A9mo%C3%AFsation",
      },
    ],
  },
  {
    id: "binary-tree-1",
    title: "Moteurs de recherche",
    category: "binary-trees",
    description:
      "Les arbres binaires, en particulier les arbres B et B+, sont utilisés dans les moteurs de recherche et les bases de données pour indexer et rechercher efficacement de grandes quantités de données.",
    useCases: [
      {
        title: "Indexation de bases de données",
        description:
          "Les bases de données comme MySQL utilisent des arbres B+ pour créer des index qui accélèrent les requêtes.",
      },
      {
        title: "Recherche de fichiers",
        description:
          "Les systèmes de fichiers utilisent des arbres pour organiser et rechercher rapidement des fichiers.",
      },
      {
        title: "Compression de données",
        description:
          "Les arbres de Huffman, un type d'arbre binaire, sont utilisés pour la compression de données.",
      },
    ],
    codeExample: {
      language: "javascript",
      code: `// Implémentation d'un arbre binaire de recherche simple
class Node {
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

class BinarySearchTree {
  constructor() {
    this.root = null;
  }

  // Insérer une nouvelle paire clé-valeur
  insert(key, value) {
    const newNode = new Node(key, value);

    if (this.root === null) {
      this.root = newNode;
      return;
    }

    const insertNode = (node, newNode) => {
      // Si la clé est inférieure, aller à gauche
      if (newNode.key < node.key) {
        if (node.left === null) {
          node.left = newNode;
        } else {
          insertNode(node.left, newNode);
        }
      }
      // Si la clé est supérieure, aller à droite
      else {
        if (node.right === null) {
          node.right = newNode;
        } else {
          insertNode(node.right, newNode);
        }
      }
    };

    insertNode(this.root, newNode);
  }

  // Rechercher une valeur par sa clé
  search(key) {
    const searchNode = (node, key) => {
      if (node === null) {
        return null;
      }

      if (key === node.key) {
        return node.value;
      }

      if (key < node.key) {
        return searchNode(node.left, key);
      } else {
        return searchNode(node.right, key);
      }
    };

    return searchNode(this.root, key);
  }

  // Parcours en ordre (inorder traversal)
  inOrderTraversal(callback) {
    const traverse = (node, callback) => {
      if (node !== null) {
        traverse(node.left, callback);
        callback(node.key, node.value);
        traverse(node.right, callback);
      }
    };

    traverse(this.root, callback);
  }
}

// Exemple d'utilisation pour un index de recherche simple
const searchIndex = new BinarySearchTree();

// Indexer quelques documents
searchIndex.insert("algorithme", ["doc1.txt", "doc3.txt", "doc5.txt"]);
searchIndex.insert("donnée", ["doc2.txt", "doc3.txt", "doc4.txt"]);
searchIndex.insert("structure", ["doc1.txt", "doc2.txt", "doc5.txt"]);
searchIndex.insert("recherche", ["doc3.txt", "doc4.txt"]);

// Rechercher des documents contenant un mot
console.log("Documents contenant 'algorithme':", searchIndex.search("algorithme"));
console.log("Documents contenant 'structure':", searchIndex.search("structure"));

// Afficher tous les mots indexés en ordre alphabétique
console.log("Tous les mots indexés:");
searchIndex.inOrderTraversal((key, value) => {
  console.log(key + ":", value);
});`,
      explanation:
        "Ce code implémente un arbre binaire de recherche simple en JavaScript. L'arbre est utilisé pour créer un index de recherche qui associe des mots-clés à des documents. La méthode 'insert' ajoute une nouvelle paire clé-valeur à l'arbre, en plaçant les clés plus petites à gauche et les clés plus grandes à droite. La méthode 'search' permet de rechercher une valeur par sa clé en O(log n) en moyenne. La méthode 'inOrderTraversal' parcourt l'arbre en ordre (gauche-racine-droite), ce qui donne les clés dans l'ordre croissant. Cette structure est similaire à celle utilisée par les moteurs de recherche et les bases de données pour indexer et rechercher des données.",
    },
    references: [
      {
        title: "Wikipedia - Arbre binaire de recherche",
        url: "https://fr.wikipedia.org/wiki/Arbre_binaire_de_recherche",
      },
      {
        title: "GeeksforGeeks - Binary Search Tree",
        url: "https://www.geeksforgeeks.org/binary-search-tree-data-structure/",
      },
    ],
  },
];

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
              variant={selectedCategory === "queues" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory("queues")}
            >
              Files
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

        {/* Liste des exemples */}
        <div className="space-y-4">
          {filteredExamples.map((example) => (
            <Collapsible
              key={example.id}
              open={expandedExample === example.id}
              onOpenChange={() => toggleExample(example.id)}
              className="border rounded-lg overflow-hidden"
            >
              <div className="p-4 flex items-center justify-between bg-muted/30 cursor-pointer">
                <div className="flex items-center gap-2">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                      {expandedExample === example.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <h3 className="font-medium">{example.title}</h3>
                </div>
                <Badge variant="outline">{example.category}</Badge>
              </div>

              <CollapsibleContent>
                <div className="p-4 space-y-4 border-t">
                  {/* Description de l'exemple */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Description:</h4>
                    <p className="text-sm text-muted-foreground">
                      {example.description}
                    </p>
                  </div>

                  {/* Cas d'utilisation */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">
                      Cas d&apos;utilisation:
                    </h4>
                    <ul className="space-y-2">
                      {example.useCases.map((useCase, index) => (
                        <li key={index} className="space-y-1">
                          <h5 className="text-sm font-medium">
                            {useCase.title}
                          </h5>
                          <p className="text-sm text-muted-foreground">
                            {useCase.description}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Exemple de code */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Exemple de code:</h4>
                    <div className="bg-muted p-4 rounded-md overflow-x-auto">
                      <pre className="text-xs">
                        <code>{example.codeExample.code}</code>
                      </pre>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {example.codeExample.explanation}
                    </p>
                  </div>

                  {/* Références */}
                  {example.references && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Références:</h4>
                      <ul className="space-y-1">
                        {example.references.map((reference, index) => (
                          <li
                            key={index}
                            className="text-sm flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <a
                              href={reference.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {reference.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
