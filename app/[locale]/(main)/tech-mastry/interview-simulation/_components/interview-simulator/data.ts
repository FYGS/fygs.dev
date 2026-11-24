import type { InterviewFeedback, Question } from "./types";

// Sample interview templates
export const interviewTemplates = [
  {
    id: "full-stack",
    title: "Entretien développeur Full Stack",
    description:
      "Questions techniques, comportementales et de System Design pour les postes full stack",
    categories: ["React", "Node.js", "Base de données", "System Design"],
    duration: 90,
    questions: [
      {
        id: "1",
        type: "technical",
        category: "React",
        difficulty: "medium",
        question:
          "Expliquez la différence entre les composants contrôlés et non contrôlés dans React. Quand utiliseriez-vous chaque approche ?",
        hints: [
          "Pensez à la gestion des formulaires",
          "Réfléchissez aux implications sur la gestion d'état",
          "Pensez à l'accessibilité",
        ],
      },
      {
        id: "2",
        type: "technical",
        category: "Node.js",
        difficulty: "medium",
        question:
          "Comment implémenteriez-vous une limitation de débit (rate limiting) dans une application Node.js ?",
        hints: [
          "Envisagez d'utiliser un middleware",
          "Pensez au stockage des compteurs de requêtes",
          "Comparez stockage en mémoire et stockage persistant",
        ],
      },
      {
        id: "3",
        type: "behavioral",
        category: "Comportemental",
        difficulty: "medium",
        question:
          "Parlez-moi d'une situation où vous avez dû travailler avec un collègue difficile. Comment l'avez-vous gérée ?",
      },
      {
        id: "4",
        type: "system-design",
        category: "System Design",
        difficulty: "hard",
        question:
          "Concevez un service de raccourcissement d'URL comme Bit.ly. Tenez compte de la scalabilité, de la fiabilité et des performances.",
        timeLimit: 30,
      },
      {
        id: "5",
        type: "technical",
        category: "Base de données",
        difficulty: "hard",
        question:
          "Comment optimiseriez-vous une requête SQL lente ? Quels outils et techniques utiliseriez-vous ?",
        hints: [
          "Envisagez des stratégies d'indexation",
          "Examinez le plan d'exécution de la requête",
          "Pensez à la normalisation par rapport à la dénormalisation",
        ],
      },
    ],
  },
  {
    id: "frontend",
    title: "Entretien développeur Frontend",
    description:
      "Questions techniques et comportementales pour les postes frontend",
    categories: ["JavaScript", "React", "CSS", "Performance"],
    duration: 60,
    questions: [
      {
        id: "1",
        type: "technical",
        category: "JavaScript",
        difficulty: "easy",
        question:
          "Quelle est la différence entre == et === en JavaScript ?",
        hints: [
          "Pensez à la coercition de types",
          "Réfléchissez aux conversions implicites",
        ],
      },
      {
        id: "2",
        type: "technical",
        category: "React",
        difficulty: "medium",
        question:
          "Expliquez le processus de réconciliation de React et le fonctionnement du DOM virtuel.",
        hints: [
          "Réfléchissez à la façon dont React compare les éléments",
          "Pensez à l'algorithme Fiber",
          "Comprenez l'algorithme de différenciation (diffing)",
        ],
      },
      {
        id: "3",
        type: "technical",
        category: "CSS",
        difficulty: "medium",
        question:
          "Comment centreriez-vous un élément horizontalement et verticalement en CSS ? Proposez plusieurs approches.",
        hints: [
          "Approche avec Flexbox",
          "Approche avec Grid",
          "Approche avec positionnement absolu",
        ],
      },
      {
        id: "4",
        type: "behavioral",
        category: "Comportemental",
        difficulty: "medium",
        question:
          "Décrivez une situation où vous avez dû apprendre rapidement une nouvelle technologie. Comment vous y êtes-vous pris ?",
      },
      {
        id: "5",
        type: "technical",
        category: "Performance",
        difficulty: "hard",
        question:
          "Comment optimiseriez-vous une application React qui affiche des milliers d'éléments de liste ?",
        hints: [
          "Envisagez la virtualisation",
          "Pensez à la mémoïsation",
          "Envisagez la pagination",
        ],
      },
    ],
  },
  {
    id: "backend",
    title: "Entretien développeur Backend",
    description:
      "Questions techniques et de System Design pour les postes backend",
    categories: ["Conception d'API", "Base de données", "System Design", "Sécurité"],
    duration: 75,
    questions: [
      {
        id: "1",
        type: "technical",
        category: "Conception d'API",
        difficulty: "medium",
        question:
          "Quelles sont les principales différences entre REST et GraphQL ? Quand choisiriez-vous l'un plutôt que l'autre ?",
        hints: [
          "Pensez à la flexibilité",
          "Réfléchissez au sur-chargement et au sous-chargement de données (over-fetching et under-fetching)",
          "Envisagez les stratégies de cache",
        ],
      },
      {
        id: "2",
        type: "technical",
        category: "Base de données",
        difficulty: "hard",
        question:
          "Comment concevriez-vous un schéma de base de données pour une plateforme de réseau social avec des publications, des commentaires et des mentions J'aime ?",
        timeLimit: 20,
      },
      {
        id: "3",
        type: "system-design",
        category: "System Design",
        difficulty: "hard",
        question:
          "Concevez un système de cache distribué pour une application à fort trafic.",
        timeLimit: 25,
      },
      {
        id: "4",
        type: "technical",
        category: "Sécurité",
        difficulty: "medium",
        question:
          "Comment implémenteriez-vous l'authentification et l'autorisation dans une architecture de microservices ?",
        hints: [
          "Envisagez les jetons JWT",
          "Pensez à un service d'authentification centralisé",
          "Envisagez les schémas OAuth",
        ],
      },
    ],
  },
];

export type InterviewTemplate = (typeof interviewTemplates)[0];

// Technical questions
export const technicalQuestions: Question[] = [
  {
    id: "t1",
    type: "technical",
    category: "JavaScript",
    difficulty: "easy",
    question:
      "Quelle est la différence entre var, let et const en JavaScript ?",
    answer:
      "var a une portée de fonction et peut être redéclarée ; let a une portée de bloc, peut être réaffectée mais pas redéclarée dans la même portée ; const a une portée de bloc et ne peut être ni réaffectée ni redéclarée.",
    explanation:
      "Comprendre les déclarations de variables est fondamental pour le développement JavaScript. var a une portée de fonction, est hissée (hoisting) et initialisée à undefined, tandis que let et const ont une portée de bloc et sont hissées mais non initialisées : y accéder avant leur déclaration lève une ReferenceError (zone morte temporelle).",
    hints: [
      "Pensez aux différences de portée",
      "Réfléchissez aux règles de redéclaration",
      "Pensez au comportement du hoisting",
    ],
  },
  {
    id: "t2",
    type: "technical",
    category: "React",
    difficulty: "medium",
    question:
      "Expliquez les méthodes de cycle de vie de React et leurs équivalents modernes avec les hooks.",
    answer:
      "Dans les composants de classe, les méthodes de cycle de vie incluent componentDidMount, componentDidUpdate et componentWillUnmount. Avec les hooks, useEffect remplace ces méthodes en fonction de ses dépendances.",
    explanation:
      "Le développement React moderne repose sur des composants fonctionnels avec des hooks. useEffect peut approcher componentDidMount (tableau de dépendances vide), componentDidUpdate (avec des dépendances ; notez que l'effet s'exécute aussi après le premier rendu) et componentWillUnmount (fonction de nettoyage). La correspondance n'est pas un pour un : il vaut mieux voir les hooks comme une synchronisation avec l'état plutôt que comme des événements de cycle de vie.",
    hints: [
      "Pensez au hook useEffect",
      "Réfléchissez aux tableaux de dépendances",
      "N'oubliez pas la fonction de nettoyage",
    ],
  },
  {
    id: "t3",
    type: "technical",
    category: "Algorithmes",
    difficulty: "hard",
    question:
      "Comment implémenteriez-vous une fonction qui trouve le k-ième plus grand élément d'un tableau non trié ?",
    answer:
      "Utilisez un min-heap de taille k. Parcourez le tableau en ajoutant les éléments au tas. Si la taille du tas dépasse k, retirez le plus petit élément. La racine du tas sera le k-ième plus grand élément.",
    explanation:
      "Cette approche a une complexité temporelle en O(n log k) et une complexité spatiale en O(k), ce qui est plus efficace que le tri complet du tableau (O(n log n)) lorsque k est petit. Quickselect trouve le k-ième élément en O(n) en moyenne (O(n^2) dans le pire cas).",
    hints: [
      "Pensez à utiliser une structure de données de type tas",
      "Réfléchissez à ne conserver que k éléments",
      "N'oubliez pas d'utiliser un min-heap pour le k-ième plus grand",
    ],
  },
];

// Behavioral questions
export const behavioralQuestions: Question[] = [
  {
    id: "b1",
    type: "behavioral",
    category: "Leadership",
    difficulty: "medium",
    question:
      "Parlez-moi d'une situation où vous avez dû diriger une équipe face à un défi technique difficile.",
    explanation:
      "Cette question évalue les compétences de leadership, la capacité à résoudre des problèmes et la communication sous pression.",
    hints: [
      "Utilisez la méthode STAR (Situation, Tâche, Action, Résultat)",
      "Concentrez-vous sur vos actions et contributions personnelles",
      "Chiffrez les résultats lorsque c'est possible",
    ],
  },
  {
    id: "b2",
    type: "behavioral",
    category: "Résolution de conflits",
    difficulty: "medium",
    question:
      "Décrivez une situation où vous n'étiez pas d'accord avec un collègue sur une décision technique. Comment l'avez-vous gérée ?",
    explanation:
      "Cette question évalue la collaboration, la communication et la résolution de conflits en contexte professionnel.",
    hints: [
      "Insistez sur l'écoute et la compréhension des points de vue",
      "Concentrez-vous sur la démarche plutôt que sur qui avait raison",
      "Mettez en avant l'issue positive",
    ],
  },
  {
    id: "b3",
    type: "behavioral",
    category: "Adaptabilité",
    difficulty: "easy",
    question:
      "Donnez un exemple de la façon dont vous avez géré un changement majeur dans les exigences d'un projet.",
    explanation:
      "Cette question teste l'adaptabilité et la résilience dans des environnements changeants.",
    hints: [
      "Montrez comment vous êtes resté calme sous pression",
      "Mettez en avant votre démarche de résolution de problèmes",
      "Concentrez-vous sur les résultats positifs malgré les difficultés",
    ],
  },
];

// System design questions
export const systemDesignQuestions: Question[] = [
  {
    id: "s1",
    type: "system-design",
    category: "Scalabilité",
    difficulty: "hard",
    question:
      "Concevez un système comme Instagram, capable de gérer des millions d'utilisateurs qui téléversent des photos chaque jour.",
    explanation:
      "Cette question teste la compréhension des architectures scalables, des solutions de stockage, du cache et des réseaux de diffusion de contenu (CDN).",
    hints: [
      "Pensez au stockage et à l'optimisation des images",
      "Réfléchissez à la génération et à la distribution du fil d'actualité",
      "Traitez les enjeux de scalabilité et de performance",
    ],
    timeLimit: 30,
    resources: [
      "https://www.freecodecamp.org/news/system-design-for-interviews/",
      "https://github.com/donnemartin/system-design-primer",
    ],
  },
  {
    id: "s2",
    type: "system-design",
    category: "Systèmes distribués",
    difficulty: "hard",
    question:
      "Comment concevriez-vous un système de file de tâches distribuée ?",
    explanation:
      "Cette question évalue la connaissance des systèmes distribués, de la tolérance aux pannes et de l'échange de messages.",
    hints: [
      "Pensez à la priorisation des tâches",
      "Réfléchissez à la gestion des échecs et aux nouvelles tentatives",
      "Traitez la répartition de charge entre les workers",
    ],
    timeLimit: 25,
    resources: [
      "https://www.rabbitmq.com/tutorials/tutorial-one-python.html",
      "https://redis.io/topics/pubsub",
    ],
  },
];

// Generate mock feedback
export const generateMockFeedback = (): InterviewFeedback => ({
  overallScore: 78,
  strengths: [
    "Bonne compréhension des fondamentaux de React",
    "Bonnes compétences de communication",
    "Démarche de résolution de problèmes claire",
  ],
  weaknesses: [
    "Des progrès possibles sur les modèles de scalabilité en System Design",
    "Davantage de pratique nécessaire sur les algorithmes avancés",
  ],
  recommendations: [
    "Révisez les modèles de scalabilité comme la répartition de charge et le cache",
    "Entraînez-vous davantage sur des problèmes de System Design en vous concentrant sur les compromis",
    "Étudiez les techniques d'optimisation de bases de données",
  ],
  performanceBreakdown: [
    { category: "React", score: 85, maxScore: 100 },
    { category: "JavaScript", score: 75, maxScore: 100 },
    { category: "System Design", score: 65, maxScore: 100 },
    { category: "Algorithmes", score: 70, maxScore: 100 },
  ],
});
