import type { AreaQuizzes } from "./types";

export const backendQuizzes: AreaQuizzes = {
  "/tech-mastry/backend/api-design": [
    {
      id: "backend-api-design-1",
      question:
        "Un client mobile envoie PUT /users/123 avec le profil complet, puis perd la connexion avant de lire la réponse. Pourquoi peut-il rejouer la requête sans risque d'effet double ?",
      options: [
        "PUT est une méthode safe : elle ne modifie jamais l'état du serveur, donc la rejouer ne peut avoir aucune conséquence",
        "PUT est idempotent : appliquer deux fois la même représentation donne le même état final",
        "Le serveur déduplique automatiquement toute requête HTTP identique reçue deux fois",
        "Les proxys HTTP mettent les réponses PUT en cache et évitent le second appel",
      ],
      correctIndex: 1,
      explanation:
        "PUT remplace la ressource par la représentation envoyée : le rejouer aboutit au même état. Il n'est pas safe (il modifie l'état), et HTTP ne déduplique rien tout seul.",
      difficulty: "easy",
    },
    {
      id: "backend-api-design-2",
      question:
        "Un utilisateur correctement authentifié avec le rôle viewer appelle DELETE /users/42, opération réservée aux admins. Quel code de statut est le plus approprié ?",
      options: [
        "400 Bad Request, car la requête ne devrait pas être envoyée",
        "401 Unauthorized, car son rôle est insuffisant",
        "409 Conflict, car l'action entre en conflit avec ses droits",
        "403 Forbidden, car il est identifié mais n'a pas le droit",
      ],
      correctIndex: 3,
      explanation:
        "403 signifie identité connue mais action interdite. 401 est réservé à l'absence ou à l'invalidité des identifiants, et 409 à un conflit avec l'état de la ressource, pas avec les droits.",
      difficulty: "easy",
    },
    {
      id: "backend-api-design-3",
      question:
        "Un écran mobile n'a besoin que du nom d'un utilisateur et du titre de ses posts, alors que l'API REST renvoie de gros objets. On envisage GraphQL. Quel nouveau risque faut-il anticiper côté serveur ?",
      options: [
        "Des requêtes N+1 dans les resolvers et un cache HTTP moins direct, car tout passe par un seul endpoint en POST",
        "La perte du typage des échanges, puisque GraphQL n'impose aucun schéma entre client et serveur",
        "L'impossibilité d'utiliser HTTPS, car GraphQL repose sur un protocole binaire dédié",
        "L'impossibilité pour le client de choisir les champs, qui restent fixés par l'endpoint",
      ],
      correctIndex: 0,
      explanation:
        "GraphQL supprime l'over-fetching, mais chaque champ imbriqué peut déclencher sa propre requête (N+1, à traiter avec du batching) et le cache HTTP classique par URL ne s'applique plus. Il possède au contraire un schéma fortement typé.",
      difficulty: "medium",
    },
    {
      id: "backend-api-design-4",
      question:
        "POST /payments crée un paiement. Après un timeout réseau, l'application mobile rejoue la requête et le client est débité deux fois. Quelle conception corrige le problème à la source ?",
      options: [
        "Remplacer POST par GET, qui est idempotent et peut être rejoué librement",
        "Renvoyer une erreur 500 en cas de doublon pour forcer le client à abandonner",
        "Exiger un header Idempotency-Key, mémoriser le résultat par clé et renvoyer la même réponse au rejeu",
        "Imposer un délai minimal de 30 secondes entre deux requêtes d'un même client et rejeter celles qui arrivent plus tôt",
      ],
      correctIndex: 2,
      explanation:
        "POST n'est pas idempotent par nature : on le rend sûr avec une clé d'idempotence stockée côté serveur. GET ne doit jamais modifier l'état, et un simple délai ne distingue pas un rejeu d'un second paiement légitime.",
      difficulty: "medium",
    },
    {
      id: "backend-api-design-5",
      question:
        "Un service de pricing interne reçoit des milliers d'appels par seconde d'autres services du même cluster, avec un contrat strict et des résultats à streamer. Quel choix est le plus pertinent, et quel est son compromis ?",
      options: [
        "REST/JSON : aucun compromis, c'est toujours le format le plus performant",
        "gRPC : Protobuf binaire sur HTTP/2, contrat typé et streaming, mais navigateur et débogage moins simples",
        "WebSocket : flux bidirectionnel natif, et le load balancing de connexions longues est trivial à mettre en œuvre",
        "GraphQL : un seul endpoint supprime le coût de sérialisation des réponses",
      ],
      correctIndex: 1,
      explanation:
        "gRPC cible les appels entre services : sérialisation compacte, contrat .proto, streaming natif. Son coût est un tooling navigateur limité et des payloads illisibles. Les connexions longues de WebSocket compliquent au contraire le load balancing.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/backend/databases": [
    {
      id: "backend-databases-1",
      question:
        "Pour quel besoin une base relationnelle comme PostgreSQL est-elle mieux adaptée qu'un store clé-valeur comme Redis ?",
      options: [
        "Un compteur atomique de requêtes par adresse IP, avec expiration automatique de la clé après la fenêtre de temps",
        "Un cache de profils utilisateur à très faible latence avec TTL",
        "Des commandes, lignes et paiements liés entre eux, avec transactions ACID, jointures et reporting",
        "Un classement de joueurs mis à jour en temps réel",
      ],
      correctIndex: 2,
      explanation:
        "Les relations entre entités, l'intégrité référentielle et les transactions ACID sont le point fort du relationnel. Les trois autres cas sont précisément ceux pour lesquels Redis est conçu (compteurs, cache, sorted sets).",
      difficulty: "easy",
    },
    {
      id: "backend-databases-2",
      question:
        "Soit un index composite sur orders(status, created_at, user_id). Laquelle de ces requêtes ne peut pas exploiter efficacement cet index ?",
      options: [
        "SELECT * FROM orders WHERE created_at > '2024-01-01'",
        "SELECT * FROM orders WHERE status = 'pending'",
        "SELECT * FROM orders WHERE status = 'pending' AND created_at > '2024-01-01'",
        "SELECT * FROM orders WHERE status = 'pending' ORDER BY created_at",
      ],
      correctIndex: 0,
      explanation:
        "Un index composite se lit à partir de sa première colonne (préfixe gauche). Sans condition sur status, la requête sur created_at seul ne peut pas utiliser l'ordre de l'index, contrairement aux trois autres.",
      difficulty: "easy",
    },
    {
      id: "backend-databases-3",
      question:
        "Ce code est exécuté avec 200 utilisateurs :\nconst users = await prisma.user.findMany();\nfor (const u of users) {\n  await prisma.order.findMany({ where: { userId: u.id } });\n}\nCombien de requêtes sont émises et comment corriger ?",
      options: [
        "200 requêtes ; rien à corriger car Prisma regroupe automatiquement les appels d'une boucle dans une seule requête SQL",
        "201 requêtes ; il suffit d'ajouter un index sur users.id pour tomber à une seule",
        "201 requêtes ; les passer dans un Promise.all les ramène à une seule requête",
        "201 requêtes ; un include (jointure) ou un chargement groupé par IN les ramène à 1 ou 2 requêtes",
      ],
      correctIndex: 3,
      explanation:
        "C'est le problème N+1 : 1 requête pour les utilisateurs plus 200 pour les commandes. Promise.all parallélise mais n'enlève aucune requête, et un index accélère chaque requête sans réduire leur nombre.",
      difficulty: "medium",
    },
    {
      id: "backend-databases-4",
      question:
        "La requête SELECT * FROM posts ORDER BY created_at DESC OFFSET 10000 LIMIT 20 devient très lente sur les pages profondes. Quelle explication et quelle alternative sont correctes ?",
      options: [
        "Le LIMIT est ignoré par l'optimiseur ; il faut ajouter DISTINCT pour le forcer",
        "La base lit puis écarte les 10 000 premières lignes ; un curseur (WHERE created_at < dernier ... LIMIT 20) repart de l'index",
        "Le B-Tree se dégrade avec l'OFFSET ; il faut reconstruire l'index chaque nuit et planifier un VACUUM FULL sur la table après chaque purge",
        "OFFSET verrouille la table ; passer en niveau d'isolation READ COMMITTED règle le problème",
      ],
      correctIndex: 1,
      explanation:
        "Avec OFFSET, la base doit parcourir toutes les lignes sautées ; avec un curseur, elle repart directement de la position dans l'index. Ajoutez l'id comme départage si created_at n'est pas unique.",
      difficulty: "medium",
    },
    {
      id: "backend-databases-5",
      question:
        "Requête fréquente : WHERE user_id = ? AND status = 'pending' ORDER BY created_at DESC. Quel index permet de filtrer et de trier sans tri supplémentaire ?",
      options: [
        "(user_id, status, created_at DESC) : colonnes d'égalité d'abord, puis colonne de tri",
        "(created_at, status, user_id) : la colonne de tri en tête pour que l'index renvoie déjà les lignes triées",
        "(status, created_at, user_id) : status en tête car il filtre le plus de lignes",
        "Un index Hash sur user_id, car l'égalité exacte suffit et c'est en O(1)",
      ],
      correctIndex: 0,
      explanation:
        "Les colonnes testées par égalité se placent en tête, puis celle du tri : l'index renvoie directement les lignes ordonnées. Un index Hash ne gère pas l'ordre, et status (peu de valeurs distinctes) n'est pas un bon préfixe sans user_id.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/backend/security": [
    {
      id: "backend-security-1",
      question:
        "Une API construit sa requête ainsi : `SELECT * FROM users WHERE email = '${email}'`. Quelle correction supprime réellement le risque d'injection SQL ?",
      options: [
        "Doubler les apostrophes de la variable email avant de l'insérer dans la chaîne",
        "Vérifier que email contient bien un @ avant d'exécuter la requête",
        "Chiffrer la requête SQL avant de l'envoyer à la base de données",
        "Utiliser une requête paramétrée : db.query('... WHERE email = $1', [email])",
      ],
      correctIndex: 3,
      explanation:
        "Avec un paramètre, la valeur n'est jamais interprétée comme du SQL. L'échappement manuel et la validation de format laissent des contournements, et le chiffrement du transport ne change pas la structure de la requête.",
      difficulty: "easy",
    },
    {
      id: "backend-security-2",
      question:
        "Quel est le rôle de l'attribut HttpOnly sur un cookie de session ?",
      options: [
        "Le cookie n'est envoyé qu'en HTTPS, jamais en clair",
        "Le JavaScript de la page ne peut pas lire le cookie, ce qui limite son vol via un XSS",
        "Le cookie n'est pas joint aux requêtes provenant d'un autre site, ce qui bloque le CSRF",
        "Le contenu du cookie est chiffré par le navigateur avant stockage",
      ],
      correctIndex: 1,
      explanation:
        "HttpOnly masque le cookie à document.cookie. L'envoi en HTTPS seul relève de Secure, et le filtrage cross-site de SameSite : les trois attributs se complètent.",
      difficulty: "easy",
    },
    {
      id: "backend-security-3",
      question:
        "bank.com authentifie ses utilisateurs par cookie de session, sans SameSite ni jeton. Une page evil.com contient <img src='https://bank.com/transfer?to=x&amount=1000'>. Quelle combinaison corrige le mieux la faille ?",
      options: [
        "Remplacer GET par POST sur le virement, sans autre changement",
        "Vérifier côté serveur que l'en-tête Referer est toujours présent",
        "Action non-GET, cookie SameSite=Lax ou Strict et jeton CSRF vérifié côté serveur",
        "Configurer CORS pour n'autoriser que l'origine bank.com, ce qui empêche le navigateur d'envoyer l'image",
      ],
      correctIndex: 2,
      explanation:
        "Une opération qui modifie l'état ne doit pas passer par GET, et SameSite plus un jeton empêchent l'envoi du cookie ou la validation d'une requête forgée. POST seul reste exploitable par un formulaire caché, et CORS ne bloque ni les images ni les formulaires.",
      difficulty: "medium",
    },
    {
      id: "backend-security-4",
      question:
        "L'équipe sécurité exige de pouvoir déconnecter immédiatement un compte compromis. Quelle approche répond le plus directement à ce besoin ?",
      options: [
        "Une session côté serveur dans Redis : supprimer la clé révoque l'accès aussitôt",
        "Un JWT valable 7 jours : sa signature cryptographique permet de l'annuler à tout moment côté serveur",
        "Un JWT stocké dans le localStorage, que le serveur n'a plus à vérifier",
        "Un changement du secret de signature JWT pour le seul utilisateur compromis",
      ],
      correctIndex: 0,
      explanation:
        "Une session est un état serveur révocable à la demande. Un JWT stateless reste valide jusqu'à son expiration : on ne peut le révoquer qu'avec une liste de blocage ou un access token très court, et le secret est commun à tous les utilisateurs.",
      difficulty: "medium",
    },
    {
      id: "backend-security-5",
      question:
        "Une base de données fuite et expose des hashs de mots de passe. Pourquoi bcrypt ou Argon2 protègent-ils mieux qu'un SHA-256 salé ?",
      options: [
        "SHA-256 produit des empreintes plus courtes, donc plus faciles à inverser mathématiquement",
        "bcrypt est réversible avec la clé du serveur, ce qui permet de récupérer le mot de passe au support en cas d'oubli par un utilisateur, sans passer par une réinitialisation",
        "Ils sont lents par conception et à coût réglable, ce qui freine le brute-force sur GPU ; le sel seul ne bloque que les rainbow tables",
        "SHA-256 est cassé : on sait produire des collisions triviales sur n'importe quel mot de passe",
      ],
      correctIndex: 2,
      explanation:
        "Le danger d'un hash rapide est le nombre de tentatives par seconde, pas une faiblesse de SHA-256 en soi. bcrypt et Argon2 ralentissent chaque essai de façon configurable ; et un bon hash de mot de passe n'est jamais réversible.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/backend/architecture": [
    {
      id: "backend-architecture-1",
      question:
        "Dans une architecture hexagonale, CreateOrderUseCase dépend d'une interface OrderRepository. Qui définit cette interface et qui l'implémente ?",
      options: [
        "Le domaine la définit comme port, et l'infrastructure l'implémente (PrismaOrderRepository)",
        "L'infrastructure la définit et le domaine importe le client Prisma pour s'y conformer, ce qui garantit l'indépendance du domaine",
        "Le contrôleur la définit, car il connaît le format des requêtes HTTP",
        "Aucune interface n'est utile : le use case instancie Prisma directement",
      ],
      correctIndex: 0,
      explanation:
        "C'est l'inversion de dépendance : le centre définit le contrat, la périphérie s'y adapte, ce qui permet de tester le use case sans base. Le domaine ne doit jamais importer l'infrastructure.",
      difficulty: "easy",
    },
    {
      id: "backend-architecture-2",
      question:
        "Un controller MVC de 800 lignes valide les données, calcule des remises, écrit en base et envoie des emails. Quel premier refactoring est le plus pertinent ?",
      options: [
        "Fusionner les controllers voisins pour réduire le nombre de fichiers",
        "Ajouter un cache devant le controller pour réduire sa charge",
        "Extraire la logique métier dans des services ou use cases ; le controller ne garde que le HTTP",
        "Passer directement à CQRS avec Event Sourcing pour découpler complètement les lectures, les écritures et l'historique",
      ],
      correctIndex: 2,
      explanation:
        "Un controller doit parser la requête, déléguer et formater la réponse. Extraire le métier règle le problème du controller obèse à moindre coût, alors que CQRS et Event Sourcing ajoutent une complexité sans rapport avec ce besoin.",
      difficulty: "easy",
    },
    {
      id: "backend-architecture-3",
      question:
        "Avec CQRS, le handler de commande écrit en base puis publie OrderCreated pour alimenter le read model. L'utilisateur est redirigé vers la page de sa commande et obtient parfois un 404. Quelle est la cause la plus probable ?",
      options: [
        "Le command handler n'a pas validé les données avant d'écrire",
        "La cohérence est à terme : le read model n'a pas encore reçu la projection quand la lecture arrive",
        "Il manque un index sur la table order_summaries du modèle de lecture, ce qui fait expirer la requête par timeout",
        "CQRS interdit de lire une donnée juste après l'avoir écrite",
      ],
      correctIndex: 1,
      explanation:
        "Le modèle de lecture est mis à jour de façon asynchrone, donc il peut être en retard. On contourne en renvoyant les données dans la réponse de la commande, ou en attendant la projection, ou en lisant temporairement le modèle d'écriture.",
      difficulty: "medium",
    },
    {
      id: "backend-architecture-4",
      question:
        "Quel bénéfice justifie principalement le coût d'Event Sourcing ?",
      options: [
        "Des requêtes de lecture plus simples et plus rapides, car l'état courant de chaque agrégat est toujours stocké en clair",
        "Un volume de stockage réduit, puisqu'on ne conserve plus l'état courant",
        "Une écriture plus rapide, car on évite toute logique métier à l'enregistrement",
        "Un audit complet et la possibilité de reconstruire l'état ou de créer de nouvelles projections par rejeu",
      ],
      correctIndex: 3,
      explanation:
        "Les événements immuables sont la source de vérité : on peut les rejouer, remonter dans le temps et bâtir de nouvelles vues. En contrepartie le stockage grossit et les lectures passent par des projections.",
      difficulty: "medium",
    },
    {
      id: "backend-architecture-5",
      question:
        "Un événement ItemAdded stocké depuis deux ans doit désormais comporter un champ obligatoire currency. Comment le principe d'Event Sourcing recommande-t-il de procéder ?",
      options: [
        "Exécuter un UPDATE sur tous les anciens événements du store pour y ajouter currency avec une valeur par défaut, en une migration unique",
        "Supprimer les anciens événements et repartir d'un historique propre",
        "Renoncer à ce champ, car un événement stocké ne peut plus jamais évoluer",
        "Garder l'historique immuable, versionner l'événement et convertir les anciennes versions à la lecture (upcasting)",
      ],
      correctIndex: 3,
      explanation:
        "Les événements passés sont des faits : on ne les réécrit pas, on les fait évoluer par versionnage et conversion à la lecture (upcasting). C'est l'une des difficultés d'évolution de schéma citées parmi les inconvénients d'Event Sourcing.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/backend/performance": [
    {
      id: "backend-performance-1",
      question:
        "Dans la stratégie cache-aside, que fait l'application lors d'un cache miss ?",
      options: [
        "Elle renvoie une erreur 404 au client, car la donnée est absente du cache",
        "Elle lit la base, stocke le résultat dans le cache avec un TTL, puis répond",
        "Elle attend que le cache se remplisse seul depuis la base",
        "Elle écrit d'abord dans le cache et laisse un processus flusher vers la base",
      ],
      correctIndex: 1,
      explanation:
        "En cache-aside, c'est l'application qui charge la base et alimente le cache. Le chargement par le cache lui-même est le read-through, et l'écriture différée est le write-behind.",
      difficulty: "easy",
    },
    {
      id: "backend-performance-2",
      question:
        "updateUser met la base à jour mais ne touche pas au cache, dont les entrées ont un TTL d'une heure. Quel symptôme observe-t-on et comment le corriger ?",
      options: [
        "Des lectures périmées jusqu'à une heure ; supprimer ou réécrire la clé après l'écriture en base",
        "Une perte silencieuse des données en base ; il faut ajouter une transaction explicite autour de l'écriture",
        "Un refus des écritures par Redis ; augmenter la mémoire allouée au cache",
        "Aucun symptôme, car le TTL synchronise automatiquement le cache avec la base",
      ],
      correctIndex: 0,
      explanation:
        "Le TTL borne la péremption mais ne la supprime pas : tant que l'entrée vit, les lecteurs voient l'ancienne valeur. L'invalidation à l'écriture (DEL) ou le write-through resynchronise le cache.",
      difficulty: "easy",
    },
    {
      id: "backend-performance-3",
      question:
        "Un service applique write-behind (flush asynchrone du cache vers la base) à la fois pour des compteurs de likes et pour des paiements. Où le risque devient-il inacceptable ?",
      options: [
        "Les deux sont également sûrs, car Redis persiste toujours chaque écriture sur disque avant de répondre au client",
        "Uniquement les likes, car ils génèrent beaucoup plus d'écritures",
        "Les paiements : si le cache tombe avant le flush, des écritures déjà confirmées au client sont perdues",
        "Aucun des deux, le flush asynchrone étant garanti transactionnel",
      ],
      correctIndex: 2,
      explanation:
        "Le write-behind répond avant que la base ait reçu la donnée : en cas de crash du cache, ces écritures disparaissent. Perdre quelques likes est tolérable, pas un paiement ; Redis ne persiste pas forcément chaque écriture.",
      difficulty: "medium",
    },
    {
      id: "backend-performance-4",
      question:
        "Voici un rate limiter :\nconst n = await redis.incr(key);\nif (n === 1) await redis.expire(key, 60);\nQue se passe-t-il si le process plante entre incr et expire ?",
      options: [
        "Redis applique un TTL par défaut à toute clé créée par INCR, donc la clé finit par disparaître quand même",
        "Le compteur repart immédiatement à zéro à la requête suivante",
        "La limite effective est doublée pendant une minute",
        "La clé reste sans TTL : le compteur ne se réinitialise jamais et le client est bloqué durablement",
      ],
      correctIndex: 3,
      explanation:
        "Les deux commandes ne sont pas atomiques : sans EXPIRE, la clé est permanente et, une fois la limite atteinte, le client reste bloqué. On corrige avec un script Lua, MULTI/EXEC ou en posant le TTL de façon atomique à la création.",
      difficulty: "medium",
    },
    {
      id: "backend-performance-5",
      question:
        "Une clé de cache très sollicitée expire et 2 000 requêtes simultanées subissent un miss et frappent la base. Comment appelle-t-on ce phénomène et comment l'atténuer ?",
      options: [
        "Cache stampede ; verrou ou single-flight sur le rechargement, jitter sur le TTL ou rafraîchissement anticipé",
        "Cache poisoning ; chiffrer les valeurs stockées dans Redis et signer chaque entrée avant de l'écrire avec une clé secrète tournante",
        "Problème N+1 ; remplacer les requêtes par une jointure avec include",
        "Cold start ; augmenter la mémoire allouée au serveur Redis",
      ],
      correctIndex: 0,
      explanation:
        "Un seul chargement doit reconstruire la valeur pendant que les autres attendent ou servent l'ancienne, et un TTL aléatoire évite les expirations groupées. Le N+1 concerne les boucles de requêtes, pas l'expiration d'une clé.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/backend/devops": [
    {
      id: "backend-devops-1",
      question:
        "Pourquoi écrire `FROM node:20.11.1-alpine3.19` plutôt que `FROM node:latest` pour une image de production ?",
      options: [
        "Docker interdit désormais le tag latest sur les registres publics",
        "Une version précise produit des images plus volumineuses et donc plus complètes, ce qui évite d'installer des paquets manquants après coup au démarrage",
        "Un tag précis rend le build reproductible ; latest peut changer et fragiliser l'image sans modification de votre code",
        "Le tag latest ne fonctionne qu'avec Docker Compose, pas avec docker build",
      ],
      correctIndex: 2,
      explanation:
        "Latest est un pointeur mutable : deux builds à des dates différentes peuvent donner des images différentes. Épingler la version, voire le digest, rend les déploiements et les rollbacks prévisibles.",
      difficulty: "easy",
    },
    {
      id: "backend-devops-2",
      question:
        "Dans un Dockerfile multi-stage, l'étape finale ne copie que `.next/standalone`, `.next/static` et `public`. Quel est l'intérêt ?",
      options: [
        "Cela accélère l'exécution de l'application grâce à du code compilé plus rapide et à un moteur JavaScript optimisé pour la production",
        "Cela chiffre automatiquement les fichiers copiés dans l'image finale",
        "Cela évite d'avoir à définir un utilisateur non-root dans l'image",
        "L'image ne contient ni sources, ni devDependencies, ni outils de build : plus petite et moins exposée",
      ],
      correctIndex: 3,
      explanation:
        "Seul le résultat du build est embarqué, donc l'image est plus légère et offre moins de binaires à un attaquant. Le multi-stage ne change ni les performances du code, ni la nécessité de passer en utilisateur non-root.",
      difficulty: "easy",
    },
    {
      id: "backend-devops-3",
      question:
        "Un Dockerfile contient :\nCOPY . .\nRUN pnpm install --frozen-lockfile\nQuel problème cela pose-t-il lors des builds répétés ?",
      options: [
        "Toute modification d'un fichier source invalide la couche COPY : les dépendances sont réinstallées à chaque build",
        "Le lockfile n'est pas pris en compte par pnpm install, donc les versions installées varient d'un build à l'autre sans prévenir",
        "L'installation s'exécute avant la copie du code et échoue faute de fichiers",
        "L'image finale ne contient plus le dossier node_modules",
      ],
      correctIndex: 0,
      explanation:
        "Le cache d'une couche dépend de ses entrées : copier tout le code avant l'install l'invalide à chaque commit. Copier d'abord package.json et le lockfile, installer, puis copier le code, garde l'installation en cache.",
      difficulty: "medium",
    },
    {
      id: "backend-devops-4",
      question:
        "Dans un docker-compose, l'application dépend de `db: { condition: service_started }` et plante parfois au démarrage avec connection refused alors que le conteneur db est lancé. Quelle correction est la plus robuste ?",
      options: [
        "Ajouter un sleep 60 au début du CMD de l'application pour laisser à la base le temps de démarrer, puis supprimer le depends_on devenu inutile",
        "Ajouter un healthcheck pg_isready sur db, utiliser service_healthy et prévoir un retry côté application",
        "Publier le port 5432 de la base sur l'hôte pour qu'elle démarre plus vite",
        "Passer la base sur le tag latest, plus rapide à initialiser",
      ],
      correctIndex: 1,
      explanation:
        "service_started signifie seulement que le processus est lancé, pas que PostgreSQL accepte des connexions. Un healthcheck attend la vraie disponibilité, et le retry protège aussi contre les coupures en production ; un sleep fixe est fragile.",
      difficulty: "medium",
    },
    {
      id: "backend-devops-5",
      question:
        "Sur Kubernetes, une liveness probe de l'API interroge /health, qui vérifie aussi la connexion à la base. La base devient indisponible quelques minutes. Que risque-t-il de se passer ?",
      options: [
        "Rien : la liveness probe n'agit que sur l'état de readiness du Service",
        "Les pods sont simplement retirés des endpoints du Service mais restent actifs, ce qui évite toute coupure de trafic pendant l'incident de la base",
        "Kubernetes redémarre tous les pods en boucle sans résoudre la panne, ce qui l'aggrave (tempête de reconnexions)",
        "Le Deployment se met à l'échelle automatiquement sur la base défaillante",
      ],
      correctIndex: 2,
      explanation:
        "Un échec de liveness provoque le redémarrage du conteneur. Une panne de dépendance externe n'est pas réparée par un restart : la liveness doit tester le process seul, et la readiness peut tester les dépendances pour retirer le pod du trafic.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/backend/authentication": [
    {
      id: "backend-authentication-1",
      question:
        "Que peut-on dire du payload d'un JWT signé en HS256 ?",
      options: [
        "Il est chiffré avec le secret du serveur, donc illisible pour le client",
        "Il contient le hash bcrypt du mot de passe de l'utilisateur",
        "Il ne contient qu'un identifiant opaque renvoyant à une session stockée côté serveur, comme le ferait un cookie de session classique",
        "Il est encodé en base64url, donc lisible : la signature garantit l'intégrité, pas la confidentialité",
      ],
      correctIndex: 3,
      explanation:
        "Un JWT signé (JWS) est lisible par quiconque le détient : n'y placez aucune donnée sensible. La signature détecte seulement une modification ; un token opaque, lui, renvoie à une session serveur.",
      difficulty: "easy",
    },
    {
      id: "backend-authentication-2",
      question:
        "Pourquoi combine-t-on un access token de courte durée (15 minutes) avec un refresh token de longue durée (7 jours) ?",
      options: [
        "Pour forcer l'utilisateur à ressaisir son mot de passe toutes les 15 minutes afin de renforcer la sécurité de son compte",
        "Pour rendre inutile la vérification de la signature de l'access token",
        "Pour limiter les dégâts d'un access token volé : le refresh, rare et révocable côté serveur, renouvelle l'accès",
        "Pour stocker l'état de la session dans le token et éviter toute base de données",
      ],
      correctIndex: 2,
      explanation:
        "Un access token transite à chaque requête et s'expose davantage : sa courte durée limite les dégâts d'un vol. Le refresh token, utilisé rarement et contrôlé par le serveur, permet de renouveler ou de révoquer l'accès.",
      difficulty: "easy",
    },
    {
      id: "backend-authentication-3",
      question:
        "Une SPA React implémente le flow Authorization Code et embarque son client_secret dans le bundle JavaScript. Quel est le problème et la correction ?",
      options: [
        "Aucun problème tant que le bundle est minifié, car le secret devient illisible",
        "Le secret est lisible par tout visiteur ; il faut Authorization Code avec PKCE, sans secret côté client",
        "Le secret devrait être envoyé dans l'URL de redirection pour être vérifié par le provider",
        "Le flow Authorization Code est interdit aux SPA ; il faut le flow Implicit",
      ],
      correctIndex: 1,
      explanation:
        "Un client public ne peut pas garder de secret : tout le code livré au navigateur est lisible. PKCE remplace le secret par un code_verifier à usage unique, et le flow Implicit est aujourd'hui déconseillé.",
      difficulty: "medium",
    },
    {
      id: "backend-authentication-4",
      question:
        "Un middleware requirePermission lit req.user.role depuis un JWT. Un utilisateur viewer modifie son token côté client pour y mettre admin. Qu'est-ce qui doit l'arrêter ?",
      options: [
        "La vérification de la signature côté serveur : le token modifié est rejeté",
        "Le chiffrement du payload, qui empêche l'utilisateur de voir son propre rôle",
        "Rien, le rôle présent dans le token fait foi quelle que soit sa provenance",
        "Le rate limiting, qui bloque les tokens modifiés trop souvent",
      ],
      correctIndex: 0,
      explanation:
        "La confiance dans les claims repose entièrement sur la validation de la signature, avec un algorithme imposé côté serveur (pas de alg none). Le rate limiting limite le volume, pas l'intégrité des données.",
      difficulty: "medium",
    },
    {
      id: "backend-authentication-5",
      question:
        "Une API accepte l'access_token OAuth 2.0 d'un provider comme preuve que l'utilisateur est bien Alice. Quel est le défaut de conception ?",
      options: [
        "Aucun défaut : un access token valide prouve toujours l'identité de son porteur",
        "L'access token devrait être remplacé par le code d'autorisation, plus fiable car il est à usage unique et vérifié directement par le provider",
        "Il faudrait uniquement vérifier que le token n'a pas dépassé 15 minutes",
        "OAuth 2.0 gère l'autorisation ; l'identité se prouve avec OpenID Connect (id_token signé, iss, aud, exp, nonce vérifiés)",
      ],
      correctIndex: 3,
      explanation:
        "Un access token est destiné à une API et peut avoir été émis pour une autre application : l'accepter comme identité ouvre la voie à l'usurpation. OpenID Connect ajoute l'id_token qui atteste l'authentification pour votre client.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/backend/messaging": [
    {
      id: "backend-messaging-1",
      question:
        "Trois instances d'un même worker consomment la même file de tâches. Combien d'instances traitent un message donné ?",
      options: [
        "Une seule : les consommateurs se partagent les messages de la file",
        "Les trois, chaque instance recevant une copie de chaque message",
        "Aucune tant que les trois n'ont pas toutes confirmé la réception",
        "Une seule, mais toujours la première instance démarrée",
      ],
      correctIndex: 0,
      explanation:
        "Dans une file, chaque message est livré à un seul consommateur du groupe, ce qui répartit la charge. La diffusion à tous les abonnés est le comportement du publish/subscribe, pas de la file de tâches.",
      difficulty: "easy",
    },
    {
      id: "backend-messaging-2",
      question:
        "Dans quel cas Kafka est-il un meilleur choix que RabbitMQ ?",
      options: [
        "Pour un routage complexe par exchanges avec une latence minimale",
        "Pour un gros flux d'événements à conserver et à rejouer, lu par plusieurs consommateurs",
        "Pour une petite file de tâches simple, où l'on veut un service sans aucune opération à gérer ni cluster à maintenir",
        "Pour un RPC synchrone avec réponse immédiate à chaque requête",
      ],
      correctIndex: 1,
      explanation:
        "Kafka est un journal distribué : rétention configurable, relecture par offset, partitionnement et débit massif. RabbitMQ brille pour le routage flexible et les files de tâches ; Kafka est en revanche plus lourd à opérer.",
      difficulty: "easy",
    },
    {
      id: "backend-messaging-3",
      question:
        "Le broker livre au moins une fois (at-least-once). Le consommateur d'order.created décrémente le stock, et après un redémarrage le même message est livré deux fois. Comment éviter un double décrément ?",
      options: [
        "Désactiver les acquittements pour que le message ne soit jamais renvoyé",
        "Passer tous les flux en at-most-once, quitte à perdre des messages",
        "Ajouter davantage d'instances de consommateurs pour que les doublons soient répartis et absorbés plus vite",
        "Rendre le traitement idempotent : enregistrer l'ID de l'événement traité et ignorer les doublons",
      ],
      correctIndex: 3,
      explanation:
        "Avec at-least-once, les doublons sont normaux : c'est au consommateur de les tolérer, par exemple via une table des événements traités avec clé unique. At-most-once échange les doublons contre des pertes, souvent pire.",
      difficulty: "medium",
    },
    {
      id: "backend-messaging-4",
      question:
        "OrderService fait `await db.order.create(...)` puis `await eventBus.publish('order.created', ...)`. Quel risque cela comporte-t-il, et quelle solution ?",
      options: [
        "Aucun, car deux awaits successifs s'exécutent toujours de façon atomique",
        "L'événement sera publié deux fois ; il suffit d'ajouter un index unique sur la commande",
        "Si le process plante entre les deux, la commande existe sans événement ; l'outbox écrit l'événement dans la même transaction",
        "La publication ralentit la base ; il faut publier avant d'écrire en base pour gagner du temps et réduire la latence perçue par le client sur la requête",
      ],
      correctIndex: 2,
      explanation:
        "Écrire en base et publier sont deux systèmes sans transaction commune (dual write). Avec l'outbox, l'événement est enregistré atomiquement avec la commande puis relayé, en at-least-once. Publier avant d'écrire crée le problème inverse.",
      difficulty: "medium",
    },
    {
      id: "backend-messaging-5",
      question:
        "Les événements d'une même commande doivent être traités dans l'ordre. Le topic Kafka a 12 partitions et la clé des messages est aléatoire. Quel est le problème ?",
      options: [
        "Kafka ne garantit aucun ordre, quelle que soit la configuration",
        "L'ordre n'est garanti que sur l'ensemble du topic, donc 12 partitions n'ont aucun impact, puisque tous les messages du topic sont lus dans l'ordre global d'écriture",
        "L'ordre n'est garanti qu'au sein d'une partition ; utiliser orderId comme clé pour router ses événements ensemble",
        "Il faut passer à un seul consommateur par topic, quel que soit le nombre de partitions",
      ],
      correctIndex: 2,
      explanation:
        "Kafka ordonne par partition, et la clé détermine la partition. Avec une clé aléatoire, deux événements de la même commande peuvent atterrir dans des partitions différentes et être traités dans le désordre.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/backend/testing": [
    {
      id: "backend-testing-1",
      question:
        "Dans le cycle TDD, que fait-on pendant l'étape GREEN ?",
      options: [
        "On améliore la structure du code sans modifier son comportement, tout en gardant les tests au vert",
        "On écrit le minimum de code nécessaire pour faire passer le test qui échoue",
        "On écrit un nouveau test pour couvrir les cas limites oubliés",
        "On supprime les tests devenus redondants pour accélérer la suite",
      ],
      correctIndex: 1,
      explanation:
        "RED écrit un test qui échoue, GREEN le fait passer avec l'implémentation la plus simple, REFACTOR nettoie ensuite sous la protection des tests. Améliorer le code relève de la dernière étape.",
      difficulty: "easy",
    },
    {
      id: "backend-testing-2",
      question:
        "Pourquoi la pyramide des tests recommande-t-elle beaucoup plus de tests unitaires que de tests E2E ?",
      options: [
        "Ils sont rapides, isolés et ciblent la panne ; les E2E sont lents, fragiles et coûteux",
        "Les tests E2E ne détectent aucun bug que les tests unitaires ne trouveraient pas",
        "Les frameworks d'E2E ne peuvent pas être lancés dans un pipeline CI",
        "Les tests unitaires vérifient l'intégration entre les services, ce que les E2E ne font pas, et couvrent donc plus de scénarios réels",
      ],
      correctIndex: 0,
      explanation:
        "Plus on monte dans la pyramide, plus les tests sont lents, instables et difficiles à diagnostiquer. Les E2E restent utiles pour quelques parcours critiques, mais ils ne remplacent pas un socle de tests unitaires.",
      difficulty: "easy",
    },
    {
      id: "backend-testing-3",
      question:
        "Un module affiche 95 % de couverture mais un bug de calcul passe en production. Le test concerné contient `expect(calculateTotal(items)).toBeDefined()`. Que conclure ?",
      options: [
        "La couverture est mal mesurée : il faut passer de la couverture de lignes à celle de fonctions, indicateur plus fiable pour les calculs",
        "Le bug vient forcément d'un autre module non couvert par les tests unitaires",
        "La couverture mesure le code exécuté, pas la qualité des assertions : ce test ne verrait aucune valeur fausse",
        "95 % de couverture garantit l'absence de bug de calcul dans le module",
      ],
      correctIndex: 2,
      explanation:
        "Un test peut exécuter une ligne sans rien vérifier d'utile : toBeDefined passe avec n'importe quel nombre. Une bonne assertion compare la valeur attendue, et la couverture des branches complète celle des lignes.",
      difficulty: "medium",
    },
    {
      id: "backend-testing-4",
      question:
        "Un test d'intégration de POST /api/orders vérifie le code 201, puis relit le produit en base pour contrôler que le stock est passé de 10 à 8. Pourquoi cette seconde vérification est-elle utile ?",
      options: [
        "Parce que le code 201 est toujours inexact et doit être confirmé par une requête SQL, car les frameworks HTTP renvoient 201 avant d'avoir exécuté le handler",
        "Parce que lire la base accélère l'exécution globale de la suite de tests",
        "Parce qu'un test d'intégration ne peut jamais vérifier la réponse HTTP elle-même",
        "Parce que 201 prouve seulement que la réponse est partie ; l'effet attendu (stock décrémenté) n'est visible que dans l'état persisté",
      ],
      correctIndex: 3,
      explanation:
        "Un test d'intégration doit vérifier les effets réels, pas seulement la réponse : un handler peut répondre 201 sans avoir mis à jour le stock. Ce type de défaut échappe aux tests unitaires qui mockent la base.",
      difficulty: "medium",
    },
    {
      id: "backend-testing-5",
      question:
        "Un test d'intégration passe quand on le lance seul mais échoue de temps en temps dans la suite complète. Quelle est la cause la plus probable et la bonne correction ?",
      options: [
        "État partagé entre tests (données, ordre d'exécution) ; isoler chaque test : données uniques, rollback ou nettoyage",
        "Le framework de test est trop lent ; augmenter systématiquement tous les timeouts de la suite et relancer automatiquement les tests en échec jusqu'à ce qu'ils passent",
        "La base de données est réelle ; la remplacer par des mocks dans tous les tests",
        "Le test est trop précis ; supprimer ses assertions pour qu'il cesse d'échouer",
      ],
      correctIndex: 0,
      explanation:
        "Un test qui dépend de l'ordre ou de données laissées par un autre est un test flaky classique. Les timeouts masquent le symptôme, et remplacer la base par des mocks supprime justement ce que le test d'intégration doit vérifier.",
      difficulty: "hard",
    },
  ],
};
