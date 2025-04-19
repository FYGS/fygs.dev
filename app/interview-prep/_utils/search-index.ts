// Définition des types pour l'index de recherche
export interface SearchIndexItem {
  title: string;
  description: string;
  href: string;
  category: string;
  subcategory?: string;
  keywords: string[];
  importance: 'essential' | 'high' | 'medium' | 'low';
}

// Index de recherche complet pour tous les sujets
export const searchIndex: SearchIndexItem[] = [
  // Algorithmes & Structures de Données
  {
    title: "Complexité Algorithmique",
    description: "Comprendre et analyser la complexité temporelle et spatiale des algorithmes.",
    href: "/interview-prep/algorithms/complexity",
    category: "Algorithmes",
    subcategory: "Fondamentaux",
    keywords: ["Big O", "notation asymptotique", "analyse de complexité", "optimisation", "performance", "temps d'exécution", "espace mémoire"],
    importance: "essential",
  },
  {
    title: "Structures de Données",
    description: "Les structures de données essentielles et leurs applications.",
    href: "/interview-prep/algorithms/data-structures",
    category: "Algorithmes",
    subcategory: "Fondamentaux",
    keywords: ["array", "tableau", "liste chaînée", "linked list", "hash table", "table de hachage", "arbre", "tree", "graphe", "graph", "pile", "stack", "file", "queue"],
    importance: "essential",
  },
  {
    title: "Algorithmes de Tri",
    description: "Implémentation et analyse des algorithmes de tri classiques.",
    href: "/interview-prep/algorithms/sorting",
    category: "Algorithmes",
    subcategory: "Intermédiaire",
    keywords: ["tri rapide", "quicksort", "tri fusion", "mergesort", "tri par tas", "heapsort", "tri à bulles", "bubble sort", "tri par insertion", "insertion sort"],
    importance: "high",
  },
  {
    title: "Recherche & Parcours",
    description: "Techniques de recherche et parcours dans différentes structures.",
    href: "/interview-prep/algorithms/search",
    category: "Algorithmes",
    subcategory: "Intermédiaire",
    keywords: ["recherche binaire", "binary search", "parcours en largeur", "BFS", "parcours en profondeur", "DFS", "Dijkstra", "A*", "recherche linéaire", "linear search"],
    importance: "high",
  },
  {
    title: "Programmation Dynamique",
    description: "Résolution de problèmes par programmation dynamique.",
    href: "/interview-prep/algorithms/dynamic-programming",
    category: "Algorithmes",
    subcategory: "Avancé",
    keywords: ["mémoïsation", "memoization", "tabulation", "sous-problèmes", "subproblems", "optimisation", "récursion", "recursion"],
    importance: "high",
  },

  // System Design
  {
    title: "Scalabilité & Performance",
    description: "Techniques pour concevoir des systèmes hautement évolutifs et performants.",
    href: "/interview-prep/system-design/scalability",
    category: "System Design",
    subcategory: "Fondamentaux",
    keywords: ["équilibrage de charge", "load balancing", "mise en cache", "caching", "partitionnement", "sharding", "CDN", "réplication", "replication", "haute disponibilité", "high availability"],
    importance: "essential",
  },
  {
    title: "Architecture Distribuée",
    description: "Conception de systèmes distribués robustes et fiables.",
    href: "/interview-prep/system-design/distributed",
    category: "System Design",
    subcategory: "Avancé",
    keywords: ["microservices", "architecture événementielle", "event-driven", "files de messages", "message queues", "service mesh", "consensus", "CAP theorem", "théorème CAP"],
    importance: "high",
  },
  {
    title: "Stockage & Bases de Données",
    description: "Stratégies de stockage et conception de bases de données.",
    href: "/interview-prep/system-design/storage",
    category: "System Design",
    subcategory: "Intermédiaire",
    keywords: ["SQL", "NoSQL", "ACID", "BASE", "partitionnement", "sharding", "réplication", "replication", "indexation", "indexing", "transactions", "consistance", "consistency"],
    importance: "high",
  },
  {
    title: "Études de Cas",
    description: "Analyses détaillées de systèmes réels à grande échelle.",
    href: "/interview-prep/system-design/case-studies",
    category: "System Design",
    subcategory: "Expert",
    keywords: ["raccourcisseur d'URL", "URL shortener", "système de chat", "chat system", "réseau social", "social network", "streaming vidéo", "video streaming", "conception système", "system design"],
    importance: "medium",
  },

  // Frontend Development
  {
    title: "React Fondamentaux",
    description: "Les concepts essentiels de React et son écosystème.",
    href: "/interview-prep/frontend/react-basics",
    category: "Frontend",
    subcategory: "Fondamentaux",
    keywords: ["hooks", "composants", "components", "props", "état", "state", "contexte", "context", "cycle de vie", "lifecycle", "JSX", "virtual DOM", "DOM virtuel"],
    importance: "essential",
  },
  {
    title: "Performance & Optimisation",
    description: "Techniques d'optimisation des applications React.",
    href: "/interview-prep/frontend/performance",
    category: "Frontend",
    subcategory: "Avancé",
    keywords: ["mémoïsation", "memoization", "fractionnement de code", "code splitting", "taille du bundle", "bundle size", "virtualisation", "virtualization", "lazy loading", "chargement différé", "React.memo", "useMemo", "useCallback"],
    importance: "high",
  },
  {
    title: "State Management",
    description: "Gestion avancée de l'état dans les applications React.",
    href: "/interview-prep/frontend/state-management",
    category: "Frontend",
    subcategory: "Intermédiaire",
    keywords: ["Redux", "Zustand", "React Query", "Context API", "Recoil", "MobX", "gestion d'état", "state management", "flux de données", "data flow", "immutabilité", "immutability"],
    importance: "high",
  },
  {
    title: "Component Patterns",
    description: "Patterns de conception avancés pour les composants React.",
    href: "/interview-prep/frontend/component-patterns",
    category: "Frontend",
    subcategory: "Avancé",
    keywords: ["render props", "HOC", "higher-order components", "composants d'ordre supérieur", "custom hooks", "hooks personnalisés", "compound components", "composants composés", "state reducer", "controlled components", "composants contrôlés"],
    importance: "high",
  },
  {
    title: "Accessibility",
    description: "Création d'interfaces accessibles et inclusives.",
    href: "/interview-prep/frontend/accessibility",
    category: "Frontend",
    subcategory: "Intermédiaire",
    keywords: ["a11y", "ARIA", "lecteurs d'écran", "screen readers", "navigation au clavier", "keyboard navigation", "contraste", "contrast", "focus", "sémantique", "semantics", "WCAG", "inclusive design", "conception inclusive"],
    importance: "high",
  },

  // Backend Development
  {
    title: "API Design & REST",
    description: "Conception d'APIs RESTful et bonnes pratiques.",
    href: "/interview-prep/backend/api-design",
    category: "Backend",
    subcategory: "Fondamentaux",
    keywords: ["REST", "GraphQL", "OpenAPI", "Swagger", "versioning", "versionnement", "endpoints", "ressources", "resources", "HTTP methods", "méthodes HTTP", "stateless", "sans état"],
    importance: "essential",
  },
  {
    title: "Bases de Données",
    description: "Conception, optimisation et gestion des bases de données.",
    href: "/interview-prep/backend/databases",
    category: "Backend",
    subcategory: "Intermédiaire",
    keywords: ["SQL", "NoSQL", "indexation", "indexing", "transactions", "normalisation", "normalization", "ORM", "requêtes", "queries", "performance", "optimisation", "optimization"],
    importance: "high",
  },
  {
    title: "Sécurité Backend",
    description: "Sécurisation des applications et protection des données.",
    href: "/interview-prep/backend/security",
    category: "Backend",
    subcategory: "Intermédiaire",
    keywords: ["authentification", "authentication", "autorisation", "authorization", "OWASP", "injection", "XSS", "CSRF", "chiffrement", "encryption", "JWT", "OAuth", "en-têtes de sécurité", "security headers"],
    importance: "high",
  },

  // Architecture & Design Patterns
  {
    title: "Clean Architecture",
    description: "Principes et implémentation de la Clean Architecture.",
    href: "/interview-prep/architecture/clean-architecture",
    category: "Architecture",
    subcategory: "Avancé",
    keywords: ["architecture hexagonale", "hexagonal architecture", "architecture en oignon", "onion architecture", "couches", "layers", "dépendances", "dependencies", "inversion de dépendance", "dependency inversion", "entités", "entities", "cas d'utilisation", "use cases"],
    importance: "high",
  },
  {
    title: "Design Patterns",
    description: "Patterns de conception classiques et modernes.",
    href: "/interview-prep/architecture/design-patterns",
    category: "Architecture",
    subcategory: "Intermédiaire",
    keywords: ["singleton", "factory", "observer", "strategy", "decorator", "adapter", "composite", "command", "proxy", "facade", "GOF", "patterns créationnels", "creational patterns", "patterns structurels", "structural patterns", "patterns comportementaux", "behavioral patterns"],
    importance: "high",
  },
  {
    title: "SOLID Principles",
    description: "Comprendre et appliquer les principes SOLID.",
    href: "/interview-prep/architecture/solid",
    category: "Architecture",
    subcategory: "Fondamentaux",
    keywords: ["responsabilité unique", "single responsibility", "ouvert/fermé", "open/closed", "substitution de Liskov", "Liskov substitution", "ségrégation d'interface", "interface segregation", "inversion de dépendance", "dependency inversion"],
    importance: "essential",
  },
  {
    title: "Domain-Driven Design",
    description: "Conception pilotée par le domaine et modélisation stratégique.",
    href: "/interview-prep/architecture/ddd",
    category: "Architecture",
    subcategory: "Expert",
    keywords: ["DDD", "contexte borné", "bounded context", "langage omniprésent", "ubiquitous language", "agrégats", "aggregates", "entités", "entities", "objets de valeur", "value objects", "événements de domaine", "domain events"],
    importance: "medium",
  },

  // Playground
  {
    title: "Code Playground",
    description: "Environnement interactif de codage avec exécution en temps réel.",
    href: "/interview-prep/playground",
    category: "Outils",
    subcategory: "Pratique",
    keywords: ["éditeur de code", "code editor", "exécution", "execution", "JavaScript", "TypeScript", "React", "HTML", "CSS", "simulation d'entretien", "interview simulation", "exercices", "exercises", "pratique", "practice"],
    importance: "essential",
  },

  // Préparation Stratégique
  {
    title: "Plan de préparation",
    description: "Guide étape par étape pour se préparer aux entretiens techniques.",
    href: "/interview-prep/preparation",
    category: "Préparation",
    subcategory: "Stratégie",
    keywords: ["planification", "planning", "étapes", "steps", "calendrier", "schedule", "préparation", "preparation", "stratégie", "strategy", "organisation", "organization"],
    importance: "essential",
  },
  {
    title: "Mock Interviews",
    description: "Simulations d'entretiens et feedback personnalisé.",
    href: "/interview-prep/preparation/mock-interviews",
    category: "Préparation",
    subcategory: "Pratique",
    keywords: ["simulation", "simulation", "entretien blanc", "mock interview", "feedback", "retour", "pratique", "practice", "questions", "réponses", "answers", "évaluation", "evaluation"],
    importance: "high",
  },
  {
    title: "Gestion du Stress",
    description: "Techniques pour gérer le stress et l'anxiété pendant les entretiens.",
    href: "/interview-prep/preparation/stress-management",
    category: "Préparation",
    subcategory: "Soft Skills",
    keywords: ["stress", "anxiété", "anxiety", "techniques de relaxation", "relaxation techniques", "respiration", "breathing", "mindfulness", "pleine conscience", "préparation mentale", "mental preparation"],
    importance: "medium",
  },

  // Négociation & Carrière
  {
    title: "Négociation Salariale",
    description: "Stratégies et tactiques pour négocier efficacement son salaire.",
    href: "/interview-prep/career/salary-negotiation",
    category: "Carrière",
    subcategory: "Négociation",
    keywords: ["négociation", "negotiation", "salaire", "salary", "compensation", "rémunération", "avantages", "benefits", "contre-offre", "counter offer", "valeur marchande", "market value"],
    importance: "high",
  },
  {
    title: "Progression de Carrière",
    description: "Planification et développement de carrière dans la tech.",
    href: "/interview-prep/career/progression",
    category: "Carrière",
    subcategory: "Développement",
    keywords: ["progression", "advancement", "promotion", "évolution", "growth", "développement", "development", "objectifs", "goals", "mentorat", "mentorship", "leadership"],
    importance: "medium",
  },
];

// Fonction pour obtenir des mots-clés uniques pour l'autocomplétion
export function getUniqueKeywords(): string[] {
  const allKeywords = searchIndex.flatMap(item => item.keywords);
  return [...new Set(allKeywords)];
}

// Fonction pour obtenir toutes les catégories et sous-catégories
export function getCategoriesAndSubcategories(): { categories: string[], subcategories: Record<string, string[]> } {
  const categories = [...new Set(searchIndex.map(item => item.category))];
  
  const subcategories: Record<string, string[]> = {};
  categories.forEach(category => {
    const subs = searchIndex
      .filter(item => item.category === category && item.subcategory)
      .map(item => item.subcategory as string);
    subcategories[category] = [...new Set(subs)];
  });
  
  return { categories, subcategories };
}
