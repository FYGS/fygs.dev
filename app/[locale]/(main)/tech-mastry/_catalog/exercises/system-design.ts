import type { AreaExercises } from "./types";

export const systemDesignExercises: AreaExercises = {
  "/tech-mastry/system-design/distributed": [
    {
      id: "system-design-distributed-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre cette saga où le paiement échoue et la commande doit être annulée.",
      explanation:
        "Chaque service fait une transaction locale puis publie un événement ; l'échec du paiement déclenche une compensation côté Orders, sans transaction distribuée ni base partagée.",
      steps: [
        "Orders crée la commande en statut PENDING et publie OrderCreated",
        "Payments consomme OrderCreated et tente le débit",
        "Payments publie PaymentFailed",
        "Orders consomme PaymentFailed",
        "Orders passe la commande en CANCELLED (compensation)",
      ],
    },
    {
      id: "system-design-distributed-match-1",
      type: "match",
      prompt: "Associez chaque mécanisme au problème de systèmes distribués qu'il traite.",
      explanation:
        "Ces mécanismes se complètent : le circuit breaker et le bulkhead limitent la propagation des pannes, l'idempotence absorbe les doublons, la saga gère la cohérence entre services, le sidecar déporte le trafic hors du code.",
      pairs: [
        { term: "Circuit breaker", definition: "Échoue vite quand une dépendance est en panne" },
        { term: "Bulkhead", definition: "Isole les ressources pour contenir une surcharge" },
        { term: "Idempotence", definition: "Rend un message rejoué sans effet supplémentaire" },
        { term: "Saga", definition: "Enchaîne des transactions locales avec compensations" },
        { term: "Sidecar proxy", definition: "Gère mTLS et retries à côté du service" },
      ],
    },
  ],
  "/tech-mastry/system-design/scalability": [
    {
      id: "system-design-scalability-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre le parcours d'une lecture avec load balancer et cache-aside, en cas de miss.",
      explanation:
        "En cache-aside, c'est l'application qui orchestre : elle lit le cache, va en base au miss, puis remplit le cache avec un TTL pour que les lectures suivantes soient servies sans toucher à la base.",
      steps: [
        "Le load balancer choisit un serveur selon son algorithme",
        "Le serveur cherche la clé dans le cache et obtient un miss",
        "Le serveur lit la donnée en base",
        "Le serveur écrit la valeur dans le cache avec un TTL",
        "Le serveur renvoie la réponse au client",
      ],
    },
    {
      id: "system-design-scalability-classify-1",
      type: "classify",
      prompt: "Indiquez si chaque action relève du scaling vertical ou horizontal.",
      explanation:
        "Le vertical agrandit une machine (limite physique, point unique de panne), l'horizontal multiplie les machines et exige des services sans état ou des données partitionnées.",
      categories: ["Scaling vertical", "Scaling horizontal"],
      items: [
        { text: "Passer une instance de 8 Go à 64 Go de RAM", category: 0 },
        { text: "Remplacer le processeur par un modèle plus rapide", category: 0 },
        { text: "Ajouter 5 instances derrière un load balancer", category: 1 },
        { text: "Ajouter des réplicas en lecture à la base", category: 1 },
        { text: "Répartir les données sur plusieurs shards", category: 1 },
      ],
    },
  ],
  "/tech-mastry/system-design/case-studies": [
    {
      id: "system-design-case-studies-match-1",
      type: "match",
      prompt: "Associez chaque système à la décision de conception clé qui le caractérise.",
      explanation:
        "Chaque système est dominé par une contrainte : lecture massive pour le raccourcisseur, ordre des messages pour le chat, coût du fan-out pour le fil social, volume vidéo pour le streaming.",
      pairs: [
        { term: "URL Shortener", definition: "Codes en base62 et cache LRU pour les redirections" },
        { term: "Chat (WhatsApp)", definition: "Numéros de séquence par conversation pour l'ordre" },
        { term: "Fil social (Twitter)", definition: "Fan-out hybride pour gérer les célébrités" },
        { term: "Streaming vidéo", definition: "Transcodage asynchrone, CDN et débit adaptatif" },
      ],
    },
    {
      id: "system-design-case-studies-fill-1",
      type: "fill",
      prompt: "Complétez cette requête de pagination par curseur d'une timeline, du plus récent au plus ancien.",
      explanation:
        "Avec un tri décroissant, la page suivante contient les éléments d'id inférieur au dernier vu ; le curseur reste stable malgré les insertions, contrairement à un OFFSET qui décale la fenêtre.",
      code: "SELECT * FROM tweets\nWHERE user_id = 42 AND id {{1}} :last_seen_id\nORDER BY id {{2}}\nLIMIT {{3}};",
      blanks: [
        { options: ["<", "=", ">"], answer: 0 },
        { options: ["ASC", "DESC", "RANDOM()"], answer: 1 },
        { options: ["20", "OFFSET 20", "*"], answer: 0 },
      ],
    },
  ],
  "/tech-mastry/system-design/security": [
    {
      id: "system-design-security-classify-1",
      type: "classify",
      prompt: "Rangez chaque mesure dans la couche de défense à laquelle elle appartient.",
      explanation:
        "La defense in depth répartit des contrôles indépendants sur plusieurs couches : réseau en bordure, validation dans l'application, identité à l'authentification, protection des données au repos.",
      categories: ["Réseau", "Application", "Authentification", "Données"],
      items: [
        { text: "WAF devant l'API", category: 0 },
        { text: "Protection DDoS en bordure", category: 0 },
        { text: "Validation des entrées avec Zod", category: 1 },
        { text: "Rate limiting", category: 1 },
        { text: "MFA avec WebAuthn", category: 2 },
        { text: "Hachage Argon2 des mots de passe", category: 2 },
        { text: "Chiffrement AES-256 au repos", category: 3 },
        { text: "Clés gérées dans un KMS", category: 3 },
      ],
    },
    {
      id: "system-design-security-fill-1",
      type: "fill",
      prompt: "Complétez cette gestion de jetons : access token court, refresh token à rotation.",
      explanation:
        "Un JWT ne se révoque pas avant son expiration : on le garde court (minutes) et on laisse un refresh token plus long, remplacé à chaque usage pour détecter un vol.",
      code: "const accessToken = sign(payload, key, { expiresIn: {{1}} });\nconst refreshToken = sign({ sub }, key, { expiresIn: {{2}} });\n// à chaque rafraîchissement : {{3}} l'ancien refresh token",
      blanks: [
        { options: ["15m", "30d", "never"], answer: 0 },
        { options: ["15m", "7d", "0s"], answer: 1 },
        { options: ["réutiliser", "révoquer et remplacer", "ignorer"], answer: 1 },
      ],
    },
  ],
  "/tech-mastry/system-design/monitoring": [
    {
      id: "system-design-monitoring-match-1",
      type: "match",
      prompt: "Associez chaque terme de fiabilité à sa définition.",
      explanation:
        "Le SLI mesure, le SLO fixe l'objectif interne, le SLA engage contractuellement (avec une marge sur le SLO), et le budget d'erreur est ce qu'il reste entre le SLO et 100 %.",
      pairs: [
        { term: "SLI", definition: "Mesure du service, par exemple la latence p99" },
        { term: "SLO", definition: "Objectif interne de qualité sur une période" },
        { term: "SLA", definition: "Engagement contractuel envers le client" },
        { term: "Budget d'erreur", definition: "Indisponibilité tolérée, soit 100 % moins le SLO" },
        { term: "Trace", definition: "Suivi d'une requête à travers plusieurs services" },
      ],
    },
    {
      id: "system-design-monitoring-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre le déroulement d'un incident bien outillé.",
      explanation:
        "On part du symptôme visible par l'utilisateur, puis on affine : métriques pour cadrer, traces pour localiser le service, logs corrélés pour la cause. Le post-mortem sans blâme évite que l'incident se répète.",
      steps: [
        "Une alerte sur le taux d'erreurs dépassant le SLO se déclenche",
        "L'astreinte consulte les métriques pour cerner le symptôme",
        "Les traces localisent le service lent",
        "Les logs corrélés par ID expliquent la cause",
        "Correction puis post-mortem sans blâme",
      ],
    },
  ],
  "/tech-mastry/system-design/whiteboard": [
    {
      id: "system-design-whiteboard-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre les étapes d'un entretien de system design.",
      explanation:
        "On part du besoin et des chiffres avant de dessiner : les exigences et la capacité justifient les choix d'architecture, qu'on approfondit ensuite avant de traiter la montée en charge et les pannes.",
      steps: [
        "Clarifier les exigences",
        "Calculer la capacité (QPS, stockage)",
        "Définir l'API",
        "Dessiner l'architecture haut niveau",
        "Approfondir les composants critiques",
        "Traiter la scalabilité et la résilience",
      ],
    },
    {
      id: "system-design-whiteboard-fill-1",
      type: "fill",
      prompt: "Complétez cette estimation de capacité pour 100 millions d'URLs créées par jour.",
      explanation:
        "Un jour compte 86 400 secondes (pas 3 600) ; avec un ratio lecture/écriture de 10, on obtient 12 000 lectures par seconde, et cinq ans de rétention à 500 octets donnent environ 91 To.",
      code: "QPS écriture = 100_000_000 / {{1}}  // ~1 200\nQPS lecture = 1 200 * {{2}}  // 12 000\nStockage = 100M * 365 * {{3}} ans * 500 o  // ~91 To",
      blanks: [
        { options: ["3600", "86400", "1000000"], answer: 1 },
        { options: ["10", "100", "2"], answer: 0 },
        { options: ["5", "10", "1"], answer: 0 },
      ],
    },
  ],
  "/tech-mastry/system-design/storage": [
    {
      id: "system-design-storage-classify-1",
      type: "classify",
      prompt: "Pendant une partition réseau, indiquez le comportement attendu : système CP ou AP ?",
      explanation:
        "Un système CP préfère refuser ou attendre plutôt que de servir une donnée incohérente (finance, consensus) ; un système AP répond toujours, quitte à renvoyer une valeur périmée (panier, compteurs, DNS).",
      categories: ["CP (cohérence)", "AP (disponibilité)"],
      items: [
        { text: "Registre bancaire qui refuse l'écriture sans quorum", category: 0 },
        { text: "Coordination de leader par consensus (etcd, ZooKeeper)", category: 0 },
        { text: "Panier d'achat qui accepte les écritures des deux côtés", category: 1 },
        { text: "Compteur de likes toléré en retard", category: 1 },
        { text: "Cache DNS qui répond avec une valeur ancienne", category: 1 },
      ],
    },
    {
      id: "system-design-storage-match-1",
      type: "match",
      prompt: "Associez chaque lettre d'ACID à sa garantie.",
      explanation:
        "Ne confondez pas la cohérence ACID (les invariants restent vrais) avec la cohérence du théorème CAP (tous les nœuds voient la même valeur) : ce ne sont pas les mêmes notions.",
      pairs: [
        { term: "Atomicité", definition: "Tout ou rien : la transaction est annulée si une étape échoue" },
        { term: "Cohérence", definition: "Les contraintes restent respectées avant et après" },
        { term: "Isolation", definition: "Les transactions concurrentes n'interfèrent pas" },
        { term: "Durabilité", definition: "Une fois validées, les données survivent à une panne" },
      ],
    },
  ],
};
