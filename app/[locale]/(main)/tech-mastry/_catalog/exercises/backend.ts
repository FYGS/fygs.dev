import type { AreaExercises } from "./types";

export const backendExercises: AreaExercises = {
  "/tech-mastry/backend/api-design": [
    {
      id: "backend-api-design-match-1",
      type: "match",
      prompt: "Associez chaque code de statut HTTP à la situation qu'il décrit.",
      pairs: [
        { term: "201", definition: "Ressource créée avec succès par un POST" },
        { term: "204", definition: "Succès sans contenu à renvoyer, typique d'un DELETE" },
        { term: "401", definition: "Appelant non authentifié ou identifiants invalides" },
        { term: "403", definition: "Appelant identifié mais action interdite" },
        { term: "409", definition: "Conflit avec l'état de la ressource (doublon, version)" },
        { term: "429", definition: "Limite de débit dépassée" },
      ],
      explanation:
        "401 et 403 se confondent souvent : 401 concerne l'identité, 403 les droits. 409 signale un conflit d'état, et 429 accompagne le rate limiting.",
    },
    {
      id: "backend-api-design-classify-1",
      type: "classify",
      prompt: "Classez ces appels selon qu'on peut les rejouer sans changer le résultat final (idempotents) ou non.",
      categories: ["Idempotent", "Non idempotent"],
      items: [
        { text: "PUT /users/123 avec le profil complet", category: 0 },
        { text: "DELETE /users/123", category: 0 },
        { text: "GET /users/123", category: 0 },
        { text: "POST /orders qui crée une commande", category: 1 },
        { text: "PATCH /counter avec { increment: 1 }", category: 1 },
        { text: "POST /payments sans Idempotency-Key", category: 1 },
      ],
      explanation:
        "PUT, DELETE et GET aboutissent au même état quand on les répète. Un POST de création ou une opération relative (+1) produit un nouvel effet à chaque appel, d'où l'intérêt d'une clé d'idempotence.",
    },
    {
      id: "backend-api-design-fill-1",
      type: "fill",
      prompt: "Complétez la requête qui remplace entièrement le profil d'un utilisateur, authentifié par un JWT.",
      code: "{{1}} /api/users/123 HTTP/1.1\nContent-Type: {{2}}\nAuthorization: {{3}} eyJhbGciOiJIUzI1NiIs...\n\n{ \"name\": \"Alice\", \"email\": \"alice@test.com\" }",
      blanks: [
        { options: ["PUT", "PATCH", "POST"], answer: 0 },
        { options: ["text/plain", "text/html", "application/json"], answer: 2 },
        { options: ["Basic", "Bearer", "Digest"], answer: 1 },
      ],
      explanation:
        "PUT remplace la ressource en entier (PATCH ne la modifie que partiellement). Le corps est du JSON, et un JWT se transmet avec le schéma Bearer.",
    },
  ],
  "/tech-mastry/backend/databases": [
    {
      id: "backend-databases-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre la démarche pour corriger une requête lente avec un index.",
      steps: [
        "Repérer la requête lente grâce aux logs ou à l'APM",
        "Lancer EXPLAIN ANALYZE sur cette requête",
        "Identifier le scan séquentiel et les colonnes filtrées ou triées",
        "Créer l'index adapté, colonnes d'égalité d'abord",
        "Relancer EXPLAIN ANALYZE pour confirmer l'usage de l'index",
      ],
      explanation:
        "On mesure avant d'agir et après : ajouter un index sans lire le plan d'exécution peut ne rien changer, voire alourdir les écritures pour rien.",
    },
    {
      id: "backend-databases-classify-1",
      type: "classify",
      prompt: "Rangez chaque besoin dans le type de base le mieux adapté.",
      categories: ["Relationnelle (SQL)", "Document", "Clé-valeur", "Graphe"],
      items: [
        { text: "Commandes, lignes et paiements avec transactions ACID", category: 0 },
        { text: "Reporting avec jointures et agrégats", category: 0 },
        { text: "Catalogue aux attributs très variables, lu par document entier", category: 1 },
        { text: "Cache de sessions avec expiration automatique (TTL)", category: 2 },
        { text: "Compteur de requêtes par IP pour le rate limiting", category: 2 },
        { text: "Suggestions d'amis d'amis dans un réseau social", category: 3 },
      ],
      explanation:
        "Chaque famille répond à un mode d'accès : relations et ACID pour SQL, documents autonomes, accès par clé avec TTL, et traversée de relations pour le graphe.",
    },
    {
      id: "backend-databases-fill-1",
      type: "fill",
      prompt: "Complétez la pagination par curseur pour obtenir la page suivante des posts, les plus récents d'abord.",
      code: "SELECT id, title FROM posts\nWHERE created_at {{1}} $last_cursor\nORDER BY created_at {{2}}\nLIMIT {{3}};",
      blanks: [
        { options: ["<", ">", "="], answer: 0 },
        { options: ["ASC", "DESC", "RANDOM()"], answer: 1 },
        { options: ["20", "OFFSET 20", "*"], answer: 0 },
      ],
      explanation:
        "Avec un tri décroissant, la page suivante contient les lignes plus anciennes que le curseur (<). Le curseur évite le OFFSET, qui oblige la base à parcourir puis jeter toutes les lignes sautées.",
    },
  ],
  "/tech-mastry/backend/security": [
    {
      id: "backend-security-match-1",
      type: "match",
      prompt: "Associez chaque menace à la défense qui la traite en priorité.",
      pairs: [
        { term: "Injection SQL", definition: "Requêtes paramétrées ou ORM" },
        { term: "XSS", definition: "Encodage de la sortie, sanitization et CSP" },
        { term: "CSRF", definition: "Cookie SameSite et jeton anti-CSRF" },
        { term: "Fuite de la table des utilisateurs", definition: "Hash lent et salé (bcrypt, Argon2)" },
        { term: "Brute-force sur le login", definition: "Rate limiting et journalisation des échecs" },
        { term: "Clé d'API commitée dans le dépôt", definition: "Variables d'environnement ou vault" },
      ],
      explanation:
        "Chaque défense cible un mécanisme précis : séparer code et données contre l'injection, empêcher l'exécution de scripts contre le XSS, refuser les requêtes cross-site contre le CSRF.",
    },
    {
      id: "backend-security-fill-1",
      type: "fill",
      prompt: "Complétez l'en-tête de cookie de session : illisible par JavaScript, envoyé en HTTPS seulement, jamais sur une requête cross-site.",
      code: "Set-Cookie: sid=abc123; {{1}}; {{2}}; SameSite={{3}}; Path=/",
      blanks: [
        { options: ["Expires=0", "HttpOnly", "Public"], answer: 1 },
        { options: ["Open", "Shared", "Secure"], answer: 2 },
        { options: ["None", "Strict", "Any"], answer: 1 },
      ],
      explanation:
        "HttpOnly masque le cookie au JavaScript, Secure impose HTTPS et SameSite=Strict bloque l'envoi cross-site. SameSite=None au contraire autorise l'envoi cross-site.",
    },
    {
      id: "backend-security-classify-1",
      type: "classify",
      prompt: "Classez ces extraits de code selon qu'ils sont vulnérables ou sûrs.",
      categories: ["Vulnérable", "Sûr"],
      items: [
        { text: "db.query('SELECT * FROM users WHERE id = ' + userId)", category: 0 },
        { text: "db.query('SELECT * FROM users WHERE id = $1', [userId])", category: 1 },
        { text: "res.send(`<h1>Résultats pour ${req.query.q}</h1>`)", category: 0 },
        { text: "<div>{userContent}</div> dans un composant React", category: 1 },
        { text: "<div dangerouslySetInnerHTML={{ __html: userContent }} />", category: 0 },
        { text: "<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />", category: 1 },
      ],
      explanation:
        "Concaténer une entrée dans du SQL ou du HTML la fait interpréter comme du code. Les paramètres, l'échappement automatique de React et une sanitization sérieuse maintiennent la séparation entre code et données.",
    },
  ],
  "/tech-mastry/backend/architecture": [
    {
      id: "backend-architecture-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre le parcours d'une requête de création de commande dans une architecture en couches.",
      steps: [
        "Présentation : le contrôleur reçoit la requête et valide l'entrée",
        "Application : le use case orchestre la création",
        "Domaine : l'entité Order applique ses règles métier",
        "Infrastructure : le repository enregistre la commande en base",
        "Présentation : le contrôleur renvoie la réponse HTTP 201",
      ],
      explanation:
        "Les appels descendent vers le domaine et la persistance, puis la réponse remonte. Le contrôleur ne contient pas de règle métier et le domaine ignore HTTP comme la base.",
    },
    {
      id: "backend-architecture-match-1",
      type: "match",
      prompt: "Associez chaque notion à sa définition.",
      pairs: [
        { term: "Port", definition: "Interface définie par le domaine pour dialoguer avec l'extérieur" },
        { term: "Adaptateur", definition: "Implémentation d'un port côté infrastructure (ex. PrismaOrderRepository)" },
        { term: "Command", definition: "Intention d'écriture qui modifie l'état" },
        { term: "Query", definition: "Lecture qui ne modifie pas l'état" },
        { term: "Event store", definition: "Journal append-only des événements, source de vérité" },
        { term: "Projection", definition: "Vue de lecture reconstruite à partir des événements" },
      ],
      explanation:
        "Port et adaptateur relèvent de l'architecture hexagonale ; Command et Query de CQRS ; event store et projection d'Event Sourcing. Ces patterns se combinent mais restent distincts.",
    },
    {
      id: "backend-architecture-classify-1",
      type: "classify",
      prompt: "Dans une architecture CQRS, rangez chaque responsabilité côté écriture ou côté lecture.",
      categories: ["Côté écriture (Command)", "Côté lecture (Query)"],
      items: [
        { text: "Valider les règles métier avant d'enregistrer", category: 0 },
        { text: "Publier l'événement OrderCreated", category: 0 },
        { text: "Modifier l'état d'une commande", category: 0 },
        { text: "Lire une vue dénormalisée order_summaries", category: 1 },
        { text: "Renvoyer un résumé sans rien modifier", category: 1 },
        { text: "Monter en charge avec des réplicas de lecture", category: 1 },
      ],
      explanation:
        "Le modèle d'écriture protège les invariants et émet des événements ; le modèle de lecture, souvent dénormalisé, est optimisé pour répondre vite et se met à l'échelle séparément.",
    },
  ],
  "/tech-mastry/backend/performance": [
    {
      id: "backend-performance-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre le déroulé d'une lecture en cache-aside lors d'un cache miss.",
      steps: [
        "Lire la clé user:123 dans Redis (GET)",
        "Constater l'absence de la clé (cache miss)",
        "Interroger la base de données",
        "Stocker le résultat dans Redis avec un TTL",
        "Renvoyer la donnée au client",
      ],
      explanation:
        "L'application orchestre tout : cache d'abord, base ensuite, puis alimentation du cache. Sans TTL ni invalidation, l'entrée risquerait de rester périmée.",
    },
    {
      id: "backend-performance-fill-1",
      type: "fill",
      prompt: "Complétez ce rate limiter Redis à fenêtre fixe.",
      code: "const limit = 100;\nconst n = await redis.{{1}}(key);\nif (n === 1) await redis.{{2}}(key, 60);\nif (n > {{3}}) throw new TooManyRequestsError();",
      blanks: [
        { options: ["get", "incr", "set"], answer: 1 },
        { options: ["expire", "del", "persist"], answer: 0 },
        { options: ["n", "key", "limit"], answer: 2 },
      ],
      explanation:
        "INCR compte atomiquement, EXPIRE ferme la fenêtre de 60 secondes à la première requête, et on rejette au-delà de la limite. Un simple GET puis SET ne serait pas atomique.",
    },
    {
      id: "backend-performance-match-1",
      type: "match",
      prompt: "Associez chaque stratégie de cache à son comportement.",
      pairs: [
        { term: "Cache-aside", definition: "L'application charge la base puis remplit le cache en cas de miss" },
        { term: "Read-through", definition: "Le cache lui-même charge la base en cas de miss" },
        { term: "Write-through", definition: "Écriture simultanée dans le cache et la base, lectures fraîches" },
        { term: "Write-behind", definition: "Écriture dans le cache puis flush asynchrone, risque de perte" },
      ],
      explanation:
        "Cache-aside et read-through diffèrent par qui charge la donnée ; write-through et write-behind par le moment d'écriture en base, au prix de la cohérence ou de la durabilité.",
    },
  ],
  "/tech-mastry/backend/devops": [
    {
      id: "backend-devops-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre les étapes d'un pipeline CI/CD pour le backend.",
      steps: [
        "Un push sur la branche déclenche le pipeline",
        "Build de l'application et vérification des types",
        "Exécution des tests unitaires et d'intégration",
        "Déploiement en staging puis kubectl rollout status",
        "Déploiement en production avec rollback si les health checks échouent",
      ],
      explanation:
        "On ne déploie que ce qui est construit et testé, et la production ne reçoit qu'une version déjà validée en staging, avec un rollback prévu.",
    },
    {
      id: "backend-devops-fill-1",
      type: "fill",
      prompt: "Complétez ce Dockerfile multi-stage : dépendances en cache, image finale minimale, utilisateur non-root.",
      code: "FROM node:24-alpine AS builder\nWORKDIR /app\nCOPY {{1}} ./\nRUN pnpm install --frozen-lockfile\nCOPY . .\nRUN pnpm build\n\nFROM node:24-alpine AS runner\nRUN addgroup --system app && adduser --system --ingroup app app\nCOPY --from={{2}} /app/.next/standalone ./\nUSER {{3}}",
      blanks: [
        { options: ["package.json pnpm-lock.yaml", ".", "node_modules"], answer: 0 },
        { options: ["runner", "builder", "app"], answer: 1 },
        { options: ["root", "app", "node_modules"], answer: 1 },
      ],
      explanation:
        "Copier d'abord le manifeste et le lockfile garde l'installation en cache. L'image finale reprend le résultat de l'étape builder et tourne sous l'utilisateur app créé juste avant, jamais en root.",
    },
    {
      id: "backend-devops-classify-1",
      type: "classify",
      prompt: "Rangez chaque élément de la checklist production-ready dans sa catégorie.",
      categories: ["Infrastructure", "Sécurité", "Observabilité", "Résilience"],
      items: [
        { text: "Terraform pour décrire l'infrastructure", category: 0 },
        { text: "Auto-scaling sur CPU et mémoire", category: 0 },
        { text: "Secrets dans un vault", category: 1 },
        { text: "WAF et network policies", category: 1 },
        { text: "Logs centralisés et dashboards Prometheus", category: 2 },
        { text: "Tracing distribué avec Jaeger", category: 2 },
        { text: "Sauvegardes testées et plan de reprise (RTO/RPO)", category: 3 },
        { text: "Readiness probes et circuit breaker", category: 3 },
      ],
      explanation:
        "La checklist couvre quatre axes complémentaires : décrire et dimensionner l'infrastructure, la protéger, la rendre observable et lui faire survivre aux pannes.",
    },
  ],
  "/tech-mastry/backend/authentication": [
    {
      id: "backend-authentication-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre le flow OAuth 2.0 Authorization Code.",
      steps: [
        "L'application redirige l'utilisateur vers /authorize du serveur d'autorisation",
        "L'utilisateur s'authentifie et donne son consentement",
        "Le serveur redirige vers l'application avec un code temporaire",
        "L'application échange le code contre des tokens via POST /token",
        "L'application appelle l'API avec l'access token",
      ],
      explanation:
        "Le code transite par le navigateur mais ne vaut rien seul : l'échange contre les tokens se fait directement entre l'application et le serveur d'autorisation.",
    },
    {
      id: "backend-authentication-classify-1",
      type: "classify",
      prompt: "Classez chaque contrôle : authentification (qui êtes-vous ?) ou autorisation (que pouvez-vous faire ?).",
      categories: ["Authentification", "Autorisation"],
      items: [
        { text: "bcrypt.compare(password, user.passwordHash)", category: 0 },
        { text: "Valider la signature et l'expiration d'un JWT", category: 0 },
        { text: "Demander un code TOTP en second facteur", category: 0 },
        { text: "Renvoyer 403 quand un viewer tente un DELETE", category: 1 },
        { text: "Vérifier que ROLE_PERMISSIONS[role] contient write", category: 1 },
        { text: "Contrôler la présence du scope read:email", category: 1 },
      ],
      explanation:
        "L'authentification établit l'identité, l'autorisation décide des droits de cette identité. Un utilisateur parfaitement authentifié peut très bien être refusé, d'où le 403.",
    },
    {
      id: "backend-authentication-fill-1",
      type: "fill",
      prompt: "Complétez le flow Authorization Code avec PKCE d'une application sans client_secret.",
      code: "# 1) redirection vers le serveur d'autorisation\nGET /authorize?response_type={{1}}&code_challenge=<hash>&code_challenge_method={{2}}\n\n# 2) échange du code contre les tokens\nPOST /token\ngrant_type=authorization_code&code=<code>&{{3}}=<secret aléatoire d'origine>",
      blanks: [
        { options: ["token", "code", "id_token"], answer: 1 },
        { options: ["S256", "MD5", "RS256"], answer: 0 },
        { options: ["client_secret", "code_verifier", "refresh_token"], answer: 1 },
      ],
      explanation:
        "On demande un code, on envoie le hash SHA-256 (S256) du secret aléatoire, puis on prouve la possession de ce secret avec code_verifier. Aucun client_secret n'est nécessaire.",
    },
  ],
  "/tech-mastry/backend/messaging": [
    {
      id: "backend-messaging-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre le fonctionnement de l'outbox pattern.",
      steps: [
        "Ouvrir une transaction en base",
        "Écrire la commande dans la table orders",
        "Dans la même transaction, écrire l'événement dans la table outbox",
        "Valider la transaction (commit)",
        "Un relais lit l'outbox et publie l'événement sur le broker",
      ],
      explanation:
        "Commande et événement sont enregistrés atomiquement, donc on ne perd jamais l'un sans l'autre. La publication vient après, en at-least-once, ce qui impose des consommateurs idempotents.",
    },
    {
      id: "backend-messaging-match-1",
      type: "match",
      prompt: "Associez chaque broker à sa caractéristique principale.",
      pairs: [
        { term: "Kafka", definition: "Journal partitionné, conservé et rejouable, ordonné par partition" },
        { term: "RabbitMQ", definition: "Routage flexible par exchanges, protocole AMQP" },
        { term: "Redis Streams", definition: "Streaming en mémoire à très faible latence avec consumer groups" },
        { term: "AWS SQS", definition: "File managée sans serveur à opérer" },
      ],
      explanation:
        "Kafka privilégie le débit et le rejeu, RabbitMQ le routage, Redis Streams la latence (limitée par la RAM) et SQS la simplicité d'exploitation au prix d'un lien avec AWS.",
    },
    {
      id: "backend-messaging-classify-1",
      type: "classify",
      prompt: "Rangez chaque situation selon qu'elle relève d'une file de tâches ou du publish/subscribe.",
      categories: ["File de tâches (un seul consommateur)", "Pub/Sub (tous les abonnés)"],
      items: [
        { text: "Générer des miniatures réparties sur 5 workers", category: 0 },
        { text: "Envoyer un email traité par un seul worker parmi N", category: 0 },
        { text: "Facturer une commande une seule fois", category: 0 },
        { text: "order.created reçu par les services Email, Stock et Analytics", category: 1 },
        { text: "Prévenir plusieurs services d'un user.registered", category: 1 },
        { text: "Diffuser order.canceled à tous les services intéressés", category: 1 },
      ],
      explanation:
        "Dans une file, les consommateurs se partagent les messages ; en pub/sub, chaque abonné reçoit sa copie de l'événement. Le choix dépend de qui doit réagir.",
    },
  ],
  "/tech-mastry/backend/testing": [
    {
      id: "backend-testing-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre un cycle de TDD.",
      steps: [
        "Écrire un test qui décrit le comportement attendu",
        "Le lancer et constater qu'il échoue (RED)",
        "Écrire le minimum de code pour le faire passer (GREEN)",
        "Relancer les tests et vérifier qu'ils passent tous",
        "Refactorer le code en gardant les tests verts",
      ],
      explanation:
        "Voir le test échouer prouve qu'il peut détecter un défaut. Le refactoring vient en dernier, sous la protection des tests, jamais avant qu'ils soient verts.",
    },
    {
      id: "backend-testing-classify-1",
      type: "classify",
      prompt: "Classez chaque test selon son niveau dans la pyramide.",
      categories: ["Unitaire", "Intégration", "E2E"],
      items: [
        { text: "calculateTotal([]) renvoie 0", category: 0 },
        { text: "validateEmail('invalid') renvoie false", category: 0 },
        { text: "POST /api/orders via Supertest puis vérification du stock en base", category: 1 },
        { text: "Route d'API testée avec une base de test réelle", category: 1 },
        { text: "Playwright : connexion, panier, paiement dans un navigateur", category: 2 },
        { text: "Parcours complet jusqu'à l'affichage de Commande confirmée", category: 2 },
      ],
      explanation:
        "L'unitaire isole une fonction, l'intégration fait collaborer plusieurs composants réels (API et base), l'E2E pilote l'application comme un utilisateur. Plus on monte, plus c'est lent et fragile.",
    },
    {
      id: "backend-testing-fill-1",
      type: "fill",
      prompt: "Complétez ce test d'intégration : création d'une commande de 2 articles sur un produit dont le stock initial est 10.",
      code: "test('crée une commande', async () => {\n  const res = await request(app).{{1}}('/api/orders').send({ productId, quantity: 2 });\n  expect(res.status).{{2}}(201);\n  const p = await db.product.findUnique({ where: { id: productId } });\n  expect(p.stock).{{3}}(8);\n});",
      blanks: [
        { options: ["get", "post", "delete"], answer: 1 },
        { options: ["toBe", "toBeNull", "toThrow"], answer: 0 },
        { options: ["toBeDefined", "toBe", "toBeTruthy"], answer: 1 },
      ],
      explanation:
        "La création passe par POST et renvoie 201. Pour le stock, il faut comparer à la valeur exacte attendue (toBe(8)) : toBeDefined ou toBeTruthy passeraient avec n'importe quel stock non nul.",
    },
  ],
};
