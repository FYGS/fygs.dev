import type { RealWorldExample } from "./types";

// Données des exemples concrets : tableaux, listes chaînées, piles, files
export const linearExamples: RealWorldExample[] = [
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
          "Les systèmes comme RabbitMQ (files de messages) ou Kafka (journal ordonné consommé comme une file) stockent et traitent les messages de manière asynchrone.",
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
];
