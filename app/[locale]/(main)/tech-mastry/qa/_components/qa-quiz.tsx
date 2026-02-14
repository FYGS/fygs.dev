"use client";

import { Quiz, type QuizQuestion } from "../../_components/quiz";

const quizQuestions: QuizQuestion[] = [
  // Algorithmes & Structures de Données
  {
    id: "algo-1",
    question: "Quelle est la complexité temporelle moyenne du QuickSort ?",
    options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
    correctIndex: 1,
    explanation:
      "QuickSort a une complexité moyenne de O(n log n) grâce à la division du tableau en deux sous-parties à chaque étape. Le pire cas est O(n²) quand le pivot est toujours le plus petit ou le plus grand élément.",
    difficulty: "easy",
    category: "Algorithmes",
  },
  {
    id: "algo-2",
    question:
      "Quelle structure de données utilise le principe LIFO (Last In, First Out) ?",
    options: ["File (Queue)", "Pile (Stack)", "Liste chaînée", "Arbre binaire"],
    correctIndex: 1,
    explanation:
      "La pile (stack) suit le principe LIFO : le dernier élément ajouté est le premier retiré. Elle est utilisée pour la gestion des appels de fonction, l'évaluation d'expressions, et le parcours en profondeur (DFS).",
    difficulty: "easy",
    category: "Algorithmes",
  },
  {
    id: "algo-3",
    question:
      "Quel algorithme est optimal pour trouver le plus court chemin dans un graphe pondéré sans poids négatifs ?",
    options: ["BFS", "DFS", "Dijkstra", "Bellman-Ford"],
    correctIndex: 2,
    explanation:
      "L'algorithme de Dijkstra est optimal pour les graphes avec des poids positifs (complexité O((V+E) log V) avec un min-heap). Bellman-Ford gère les poids négatifs mais est plus lent O(VE). BFS est pour les graphes non pondérés.",
    difficulty: "medium",
    category: "Algorithmes",
  },
  {
    id: "algo-4",
    question:
      "Quelle est la complexité de recherche dans un arbre binaire de recherche équilibré ?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correctIndex: 1,
    explanation:
      "Dans un BST équilibré (comme AVL ou Red-Black), la hauteur est O(log n), donc la recherche est aussi O(log n). Un BST non équilibré peut dégénérer en O(n) dans le pire cas.",
    difficulty: "easy",
    category: "Algorithmes",
  },
  {
    id: "algo-5",
    question:
      "Quelle technique de programmation dynamique résout le problème du sac à dos (Knapsack) ?",
    options: [
      "Greedy",
      "Diviser pour régner",
      "Tabulation bottom-up",
      "Recherche exhaustive",
    ],
    correctIndex: 2,
    explanation:
      "Le problème du sac à dos 0/1 se résout par programmation dynamique avec tabulation bottom-up, construisant une table dp[i][w] où i est l'item considéré et w la capacité restante. La complexité est O(nW) où n est le nombre d'items et W la capacité.",
    difficulty: "hard",
    category: "Algorithmes",
  },

  // Conception Système
  {
    id: "sys-1",
    question:
      "Quel pattern architectural permet de séparer les opérations de lecture et d'écriture ?",
    options: ["MVC", "CQRS", "Microservices", "Monolithe"],
    correctIndex: 1,
    explanation:
      "CQRS (Command Query Responsibility Segregation) sépare les modèles de lecture et d'écriture, permettant d'optimiser chaque côté indépendamment. C'est souvent combiné avec Event Sourcing pour un historique complet des changements.",
    difficulty: "medium",
    category: "System Design",
  },
  {
    id: "sys-2",
    question:
      "Quel théorème stipule qu'un système distribué ne peut garantir que 2 des 3 propriétés : Cohérence, Disponibilité, Tolérance aux partitions ?",
    options: ["ACID", "BASE", "CAP", "SOLID"],
    correctIndex: 2,
    explanation:
      "Le théorème CAP (Brewer, 2000) affirme qu'en cas de partition réseau, il faut choisir entre cohérence (C) et disponibilité (A). Les systèmes CP (ex: HBase) sacrifient la disponibilité, les systèmes AP (ex: Cassandra) sacrifient la cohérence stricte.",
    difficulty: "medium",
    category: "System Design",
  },
  {
    id: "sys-3",
    question:
      "Quelle stratégie de cache est la plus adaptée quand les lectures sont beaucoup plus fréquentes que les écritures ?",
    options: [
      "Write-Through",
      "Write-Behind",
      "Cache-Aside (Lazy Loading)",
      "Write-Around",
    ],
    correctIndex: 2,
    explanation:
      "Cache-Aside est idéal pour les workloads read-heavy : on charge les données dans le cache uniquement à la demande (cache miss). Write-Through écrit simultanément dans le cache et la DB, ce qui est meilleur quand les données lues sont souvent les mêmes que celles récemment écrites.",
    difficulty: "hard",
    category: "System Design",
  },
  {
    id: "sys-4",
    question: "Quel outil est le plus adapté pour du rate limiting distribué ?",
    options: ["PostgreSQL", "Redis", "MongoDB", "Elasticsearch"],
    correctIndex: 1,
    explanation:
      "Redis est idéal pour le rate limiting grâce à ses opérations atomiques, son TTL natif et sa latence ultra-faible (sous la milliseconde). Les algorithmes classiques sont Token Bucket, Sliding Window et Fixed Window.",
    difficulty: "medium",
    category: "System Design",
  },

  // Base de Données
  {
    id: "db-1",
    question:
      "Que signifie l'isolation dans le contexte ACID des bases de données ?",
    options: [
      "Les données sont sauvegardées sur disque",
      "Les transactions concurrentes n'interfèrent pas entre elles",
      "Une transaction est tout ou rien",
      "La base reste dans un état cohérent",
    ],
    correctIndex: 1,
    explanation:
      "L'Isolation garantit que les transactions concurrentes s'exécutent comme si elles étaient séquentielles. Les niveaux d'isolation (Read Uncommitted, Read Committed, Repeatable Read, Serializable) offrent différents compromis entre performance et cohérence.",
    difficulty: "easy",
    category: "Base de Données",
  },
  {
    id: "db-2",
    question:
      "Quel type d'index est le plus performant pour des requêtes de plage (range queries) ?",
    options: ["Hash Index", "B-Tree Index", "Bitmap Index", "Full-Text Index"],
    correctIndex: 1,
    explanation:
      "Les B-Tree maintiennent les données triées et permettent des recherches par plage efficaces O(log n + k). Les Hash Index sont O(1) pour l'égalité mais ne supportent pas les comparaisons d'ordre (<, >, BETWEEN).",
    difficulty: "medium",
    category: "Base de Données",
  },
  {
    id: "db-3",
    question: "Quelle forme normale élimine les dépendances transitives ?",
    options: ["1NF", "2NF", "3NF", "BCNF"],
    correctIndex: 2,
    explanation:
      "La 3NF élimine les dépendances transitives : chaque attribut non-clé dépend directement de la clé primaire, pas d'un autre attribut non-clé. Exemple : une table Commande(id, client_id, ville_client) viole la 3NF car ville_client dépend de client_id.",
    difficulty: "medium",
    category: "Base de Données",
  },

  // Sécurité
  {
    id: "sec-1",
    question:
      "Quelle attaque consiste à injecter du code malveillant qui s'exécute dans le navigateur d'un autre utilisateur ?",
    options: ["SQL Injection", "CSRF", "XSS", "Man-in-the-Middle"],
    correctIndex: 2,
    explanation:
      "Le Cross-Site Scripting (XSS) injecte du JavaScript malveillant qui s'exécute dans le navigateur de la victime. Prévention : échapper les sorties (output encoding), Content-Security-Policy, validation des entrées, et utiliser des frameworks comme React qui échappent par défaut.",
    difficulty: "easy",
    category: "Sécurité",
  },
  {
    id: "sec-2",
    question:
      "Quel mécanisme empêche les requêtes cross-origin non autorisées dans un navigateur ?",
    options: ["CSP", "CORS", "HSTS", "X-Frame-Options"],
    correctIndex: 1,
    explanation:
      "CORS (Cross-Origin Resource Sharing) permet au serveur de spécifier quelles origines peuvent accéder à ses ressources via les headers Access-Control-Allow-Origin. Les requêtes preflight (OPTIONS) vérifient les permissions avant la requête réelle.",
    difficulty: "easy",
    category: "Sécurité",
  },
  {
    id: "sec-3",
    question:
      "Quel est l'avantage principal de JWT par rapport aux sessions côté serveur ?",
    options: [
      "Plus sécurisé",
      "Révocation instantanée",
      "Stateless — pas besoin de stockage serveur",
      "Taille plus petite",
    ],
    correctIndex: 2,
    explanation:
      "JWT est stateless : le serveur n'a pas besoin de stocker les sessions. Chaque token contient les informations nécessaires et est vérifiable via signature. L'inconvénient est l'impossibilité de révoquer un token avant son expiration sans stratégie complémentaire (blacklist, rotation).",
    difficulty: "medium",
    category: "Sécurité",
  },

  // DevOps
  {
    id: "devops-1",
    question:
      "Quelle stratégie de déploiement permet de tester une nouvelle version sur un petit pourcentage d'utilisateurs ?",
    options: ["Blue/Green", "Rolling Update", "Canary", "Recreate"],
    correctIndex: 2,
    explanation:
      "Le déploiement Canary envoie progressivement le trafic vers la nouvelle version (ex: 5% → 25% → 50% → 100%) en surveillant les métriques. Si des problèmes sont détectés, le rollback est rapide. Blue/Green bascule tout le trafic d'un coup.",
    difficulty: "medium",
    category: "DevOps",
  },
  {
    id: "devops-2",
    question:
      "Quel outil est le standard de facto pour l'orchestration de conteneurs en production ?",
    options: ["Docker Compose", "Kubernetes", "Docker Swarm", "Vagrant"],
    correctIndex: 1,
    explanation:
      "Kubernetes (K8s) est le standard pour l'orchestration de conteneurs : auto-scaling, self-healing, rolling updates, service discovery, et load balancing. Docker Compose est pour le développement local, Docker Swarm est plus simple mais moins adopté.",
    difficulty: "easy",
    category: "DevOps",
  },

  // Frontend
  {
    id: "front-1",
    question:
      "Quel hook React est utilisé pour optimiser les calculs coûteux en évitant les recalculs inutiles ?",
    options: ["useEffect", "useMemo", "useRef", "useReducer"],
    correctIndex: 1,
    explanation:
      "useMemo mémorise le résultat d'un calcul et ne le recalcule que si les dépendances changent. useCallback fait la même chose pour les fonctions. useEffect est pour les effets de bord, useRef pour les références mutables.",
    difficulty: "easy",
    category: "Frontend",
  },
  {
    id: "front-2",
    question:
      "Quelle est la différence principale entre SSR et SSG dans Next.js ?",
    options: [
      "SSR est plus rapide",
      "SSG génère les pages au build, SSR à chaque requête",
      "SSG ne supporte pas TypeScript",
      "SSR ne peut pas utiliser de base de données",
    ],
    correctIndex: 1,
    explanation:
      "SSG (Static Site Generation) pré-génère les pages HTML au moment du build, idéal pour le contenu statique. SSR (Server-Side Rendering) génère la page à chaque requête, nécessaire pour du contenu dynamique. Next.js 13+ avec App Router utilise les React Server Components par défaut.",
    difficulty: "medium",
    category: "Frontend",
  },
  {
    id: "front-3",
    question:
      "Quel pattern React permet de partager de la logique entre composants sans héritage ?",
    options: [
      "HOC (Higher-Order Component)",
      "Render Props",
      "Custom Hooks",
      "Toutes ces réponses",
    ],
    correctIndex: 3,
    explanation:
      "Les trois patterns permettent la réutilisation de logique : HOC wrappent un composant, Render Props passent la logique via une prop fonction, et les Custom Hooks (recommandés depuis React 16.8) extraient la logique d'état dans des fonctions réutilisables.",
    difficulty: "medium",
    category: "Frontend",
  },
];

export function QAQuiz() {
  return (
    <div className="max-w-3xl mx-auto">
      <Quiz questions={quizQuestions} showCategories={true} />
    </div>
  );
}
