import type { RealWorldExample } from "./types";

// Données des exemples concrets : tables de hachage, arbres binaires
export const hashTreeExamples: RealWorldExample[] = [
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
