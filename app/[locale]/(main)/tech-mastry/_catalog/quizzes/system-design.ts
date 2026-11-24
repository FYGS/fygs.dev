import type { AreaQuizzes } from "./types";

export const systemDesignQuizzes: AreaQuizzes = {
  "/tech-mastry/system-design/distributed": [
    {
      id: "system-design-distributed-1",
      question:
        "Une équipe de 4 développeurs maintient un monolithe qui fonctionne bien et veut passer à 20 microservices. Quel risque est le plus réaliste ?",
      options: [
        "Le code devient impossible à tester unitairement",
        "Le langage de programmation doit être unique partout",
        "Les microservices ne peuvent pas utiliser de base de données propre",
        "Une complexité d'exploitation que l'équipe ne peut pas porter",
      ],
      correctIndex: 3,
      explanation:
        "Les microservices apportent des appels réseau, de la cohérence distribuée, du déploiement et de la supervision multipliés par le nombre de services. Les bénéfices (autonomie des équipes) n'existent que si l'organisation s'y prête. Les trois autres affirmations sont fausses.",
      difficulty: "easy",
    },
    {
      id: "system-design-distributed-2",
      question:
        "Que fait un service mesh (Istio, Linkerd) par rapport à des bibliothèques de résilience intégrées à chaque service ?",
      options: [
        "Il remplace les bases de données par un cache distribué",
        "Il décharge mTLS, retries et métriques à des proxies sidecar",
        "Il impose un langage unique à tous les services du cluster Kubernetes",
        "Il transforme les appels REST en messages asynchrones",
      ],
      correctIndex: 1,
      explanation:
        "Le mesh place un proxy à côté de chaque service pour gérer le trafic (mTLS, retries, timeouts, télémétrie) hors du code applicatif, quel que soit le langage. Il ne change ni le protocole ni le stockage.",
      difficulty: "easy",
    },
    {
      id: "system-design-distributed-3",
      question:
        "Un consommateur de file lit un message « OrderPaid », envoie un email puis plante avant d'acquitter. Le broker (livraison at-least-once) renvoie le message. Que doit garantir le consommateur ?",
      options: [
        "Qu'il n'y a jamais de crash entre le traitement et l'acquittement",
        "Que le broker passe en exactly-once pour toutes les files",
        "Qu'un second traitement du même message soit sans effet",
        "Que les messages sont traités par un seul consommateur global",
      ],
      correctIndex: 2,
      explanation:
        "En at-least-once, les doublons sont inévitables : on les neutralise avec une clé d'idempotence (ex. l'ID de l'événement stocké). Supposer qu'on peut éviter tout crash ou compter sur un exactly-once universel est une illusion.",
      difficulty: "medium",
    },
    {
      id: "system-design-distributed-4",
      question:
        "Les services Orders et Payments ont chacun leur base. Une commande doit être confirmée seulement si le paiement réussit, sinon annulée. Quelle approche convient le mieux ?",
      options: [
        "Une base unique partagée par les deux services",
        "Une saga avec des actions de compensation en cas d'échec",
        "Un appel synchrone sans gestion d'erreur côté Orders",
        "Un commit à deux phases entre tous les services en production",
      ],
      correctIndex: 1,
      explanation:
        "Une saga enchaîne des transactions locales et déclenche des compensations (annuler la commande) si une étape échoue, en acceptant une cohérence à terme. La base partagée détruit l'autonomie des services, et le 2PC bloque et passe mal à l'échelle.",
      difficulty: "medium",
    },
    {
      id: "system-design-distributed-5",
      question:
        "Le service A appelle B, qui appelle C de façon synchrone. C devient très lent et, en quelques minutes, A et B sont saturés alors qu'ils sont sains. Quelle mesure traite le mieux la cause ?",
      options: [
        "Augmenter le nombre de tentatives automatiques vers C",
        "Des timeouts, un circuit breaker et un bulkhead autour de C",
        "Doubler la taille des machines de A et de B",
        "Passer tous les logs en niveau DEBUG pour comprendre",
      ],
      correctIndex: 1,
      explanation:
        "Sans timeout, les threads de A et B restent bloqués sur C et la panne se propage en cascade. Le circuit breaker échoue vite et le bulkhead isole les ressources ; multiplier les retries aggrave au contraire la surcharge (retry storm).",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/system-design/scalability": [
    {
      id: "system-design-scalability-1",
      question:
        "Pour absorber 10 fois plus de trafic en ajoutant des instances derrière un load balancer, quelle propriété de l'application est indispensable ?",
      options: [
        "Qu'elle tourne sur un seul serveur très puissant, avec beaucoup de RAM",
        "Qu'elle soit sans état local, les sessions étant externalisées",
        "Qu'elle n'utilise jamais de base de données",
        "Qu'elle soit écrite en un langage compilé uniquement",
      ],
      correctIndex: 1,
      explanation:
        "Le scaling horizontal fonctionne si n'importe quelle instance peut traiter n'importe quelle requête : l'état (sessions, fichiers) vit dans un store partagé comme Redis. Le scaling vertical, lui, se limite au plus gros serveur disponible.",
      difficulty: "easy",
    },
    {
      id: "system-design-scalability-2",
      question:
        "Une API reçoit des requêtes très hétérogènes (20 ms à 5 s). Avec le round-robin, certains serveurs s'empilent de requêtes longues. Quel algorithme corrige le mieux cela ?",
      options: [
        "Les mêmes serveurs en round-robin avec un timeout plus long côté client",
        "Un ordre aléatoire sur la liste des serveurs",
        "IP Hash, pour fixer chaque client sur un serveur",
        "Least Connections, qui privilégie le serveur le moins chargé",
      ],
      correctIndex: 3,
      explanation:
        "Le round-robin répartit en nombre de requêtes, pas en charge réelle : il est correct seulement si les requêtes sont homogènes. Least Connections tient compte du travail en cours ; IP Hash cherche l'affinité, pas l'équilibrage.",
      difficulty: "easy",
    },
    {
      id: "system-design-scalability-3",
      question:
        "Pour garder un client sur le même serveur, on choisit IP Hash. Quel inconvénient doit-on anticiper ?",
      options: [
        "Beaucoup de clients derrière une même IP chargent un seul serveur",
        "Il est impossible d'utiliser HTTPS avec cet algorithme de répartition",
        "Les requêtes sont envoyées au serveur le plus lent",
        "Il oblige à répliquer toute la base sur chaque serveur",
      ],
      correctIndex: 0,
      explanation:
        "Un NAT d'entreprise ou un proxy concentre des milliers d'utilisateurs sur une adresse, d'où un déséquilibre ; de plus, ajouter ou retirer un serveur redistribue le hachage. Cela n'a pas de lien avec le chiffrement ni avec la réplication.",
      difficulty: "medium",
    },
    {
      id: "system-design-scalability-4",
      question:
        "Un site lit 50 fois plus qu'il n'écrit et tolère quelques secondes de données périmées. Avec le motif cache-aside, quel comportement est correct ?",
      options: [
        "À l'écriture, ne jamais toucher à la base",
        "Au miss, renvoyer une erreur sans lire la base",
        "Au miss, lire la base puis remplir le cache avec un TTL",
        "Au miss, vider tout le cache pour repartir d'un état propre",
      ],
      correctIndex: 2,
      explanation:
        "Dans cache-aside, l'application consulte le cache, va en base au miss et alimente le cache ; le TTL borne la péremption et l'écriture invalide ou met à jour l'entrée. Vider tout le cache provoquerait une avalanche de lectures en base.",
      difficulty: "medium",
    },
    {
      id: "system-design-scalability-5",
      question:
        "Une clé de cache très populaire expire à midi pile et la base reçoit soudain des milliers de requêtes identiques. Quelle parade traite directement ce cache stampede ?",
      options: [
        "Augmenter la capacité mémoire du cache de 50 % pour éviter les évictions",
        "Passer la politique d'éviction de LRU à FIFO",
        "Désactiver le cache pour les clés populaires",
        "Un verrou ou coalescing sur le miss, plus un TTL avec jitter",
      ],
      correctIndex: 3,
      explanation:
        "Seule une requête doit recalculer la valeur (verrou, request coalescing) et les expirations doivent être décalées (jitter) ou rafraîchies à l'avance. L'espace mémoire ou la politique d'éviction n'empêchent pas l'expiration simultanée d'une clé.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/system-design/case-studies": [
    {
      id: "system-design-case-studies-1",
      question:
        "Un raccourcisseur d'URL a un ratio lecture/écriture élevé (hypothèse : 10:1) et exige des redirections sous 10 ms. Quelle combinaison est la plus pertinente ?",
      options: [
        "Un cache en mémoire et des réplicas en lecture",
        "Une base unique avec des index sur chaque colonne",
        "Un partitionnement par date de création des liens",
        "Une file de messages entre le client et la redirection",
      ],
      correctIndex: 0,
      explanation:
        "Charge dominée par la lecture, avec des URLs populaires qui se répètent : un cache (LRU) et des réplicas en lecture absorbent la charge. Une file de messages ajouterait de la latence à un chemin qui doit rester synchrone.",
      difficulty: "easy",
    },
    {
      id: "system-design-case-studies-2",
      question:
        "Un code court de 7 caractères en base62 (a-z, A-Z, 0-9) permet environ combien d'identifiants distincts ?",
      options: [
        "Environ 3,5 milliards (3,5 × 10^9)",
        "Environ 56 milliards (5,6 × 10^10)",
        "Environ 3,5 mille milliards (3,5 × 10^12)",
        "Environ 434, soit 62 fois 7",
      ],
      correctIndex: 2,
      explanation:
        "62^7 ≈ 3,5 × 10^12. Même à 100 millions de liens par jour, cela couvre une centaine d'années ; 56 milliards correspondrait à 62^6, et 62 × 7 n'a aucun sens combinatoire.",
      difficulty: "easy",
    },
    {
      id: "system-design-case-studies-3",
      question:
        "Dans un fil social, une célébrité a 50 millions de followers. Pourquoi un fan-out on write pur lui est-il mal adapté ?",
      options: [
        "Chaque tweet écrit 50 millions de timelines, trop coûteux",
        "Les timelines ne peuvent pas être stockées dans Redis",
        "Les followers ne verraient jamais ses tweets",
        "Le graphe de followers devient impossible à interroger",
      ],
      correctIndex: 0,
      explanation:
        "Le fan-out on write pré-calcule la timeline de chaque follower : très bon en lecture, mais une écriture déclenche 50 millions d'insertions. L'approche hybride garde le fan-out on write pour la majorité et fusionne les tweets des célébrités à la lecture.",
      difficulty: "medium",
    },
    {
      id: "system-design-case-studies-4",
      question:
        "Dans un chat, pourquoi ordonner les messages d'une conversation avec un numéro de séquence plutôt qu'avec l'horloge des appareils ?",
      options: [
        "Les numéros de séquence sont plus courts à afficher",
        "Les horloges sont toujours synchronisées à la microseconde près",
        "Les horodatages ne peuvent pas être stockés dans Cassandra",
        "Les horloges dérivent, donc l'ordre pourrait être incohérent",
      ],
      correctIndex: 3,
      explanation:
        "Les horloges de différents appareils et serveurs ne sont pas synchronisées de façon fiable ; un compteur croissant par conversation donne un ordre total sans dépendre du temps. Le stockage de l'horodatage n'est pas le problème.",
      difficulty: "medium",
    },
    {
      id: "system-design-case-studies-5",
      question:
        "Une timeline reçoit de nouveaux éléments en continu. Avec une pagination par offset (page=2, limit=20), que risque l'utilisateur et que choisir ?",
      options: [
        "Des doublons ou des trous ; une pagination par curseur",
        "Rien du tout ; l'offset est stable quel que soit l'ajout",
        "Une erreur 500 ; il faut charger toute la liste au client",
        "Une latence plus faible ; l'offset est optimal à grande échelle",
      ],
      correctIndex: 0,
      explanation:
        "Si des éléments sont insérés en tête entre deux requêtes, l'offset décale la fenêtre et répète ou saute des éléments ; de plus il oblige la base à parcourir les lignes ignorées. Un curseur (dernier ID ou date vue) reste stable et efficace.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/system-design/security": [
    {
      id: "system-design-security-1",
      question:
        "Que signifie concrètement la « defense in depth » dans l'architecture d'un système ?",
      options: [
        "Un pare-feu très puissant placé à l'entrée",
        "Un chiffrement fort sur la seule base de données",
        "Des contrôles indépendants à chaque couche du système",
        "Un audit de sécurité annuel par un prestataire externe",
      ],
      correctIndex: 2,
      explanation:
        "On empile réseau (TLS, WAF), application (validation), authentification, autorisation et données pour qu'une faille isolée n'ouvre pas tout le système. Un unique périmètre fort reste un point de défaillance unique.",
      difficulty: "easy",
    },
    {
      id: "system-design-security-2",
      question:
        "Comment stocker les mots de passe des utilisateurs ?",
      options: [
        "Chiffrés en AES-256, avec la clé dans le code",
        "Hachés en SHA-256 sans sel, pour la rapidité",
        "En clair dans une table accessible seulement à l'API",
        "Hachés avec Argon2 ou bcrypt, lents et salés",
      ],
      correctIndex: 3,
      explanation:
        "Un hash lent et salé rend le brute force coûteux et empêche les attaques par rainbow table. Un chiffrement réversible permet de retrouver tous les mots de passe si la clé fuit, et SHA-256 est trop rapide à attaquer par force brute.",
      difficulty: "easy",
    },
    {
      id: "system-design-security-3",
      question:
        "Règle métier : « un médecin ne peut consulter que les dossiers de ses patients, et seulement pendant sa garde ». Quel modèle d'autorisation la traduit le plus naturellement ?",
      options: [
        "RBAC avec un rôle « médecin » unique",
        "ABAC, fondé sur les attributs et le contexte",
        "Une liste blanche d'adresses IP par service",
        "L'authentification multifacteur à la connexion",
      ],
      correctIndex: 1,
      explanation:
        "La décision dépend de la relation médecin-patient et de l'heure : ce sont des attributs, donc ABAC. Un rôle statique ne sait pas exprimer cela, et le MFA vérifie l'identité, pas ce qui est autorisé.",
      difficulty: "medium",
    },
    {
      id: "system-design-security-4",
      question:
        "Un JWT d'accès valable 30 jours est volé. Pourquoi est-ce problématique, et quelle conception limite le risque ?",
      options: [
        "Il reste valide ; access token court et refresh avec rotation",
        "Il est modifiable par le voleur ; il suffit d'allonger la clé",
        "Il expire immédiatement donc on peut ignorer le problème",
        "Il est lisible seulement en HTTP ; il suffit de passer en HTTPS",
      ],
      correctIndex: 0,
      explanation:
        "Un JWT est validé sans consulter le serveur, donc tant qu'il n'a pas expiré le voleur l'utilise. Une durée courte (minutes) avec refresh token à rotation réduit la fenêtre d'abus ; HTTPS protège le transport, pas un jeton déjà volé.",
      difficulty: "medium",
    },
    {
      id: "system-design-security-5",
      question:
        "Les données clients sont chiffrées en AES-256 au repos, mais la clé est stockée dans la même base, dans une table de configuration. Que penser de cette protection ?",
      options: [
        "Elle est suffisante, AES-256 étant incassable",
        "Elle est inutile uniquement si la base n'est pas sauvegardée",
        "Elle protège peu : la clé fuit avec la base, il faut un KMS",
        "Elle est meilleure qu'avec un KMS car tout reste au même endroit",
      ],
      correctIndex: 2,
      explanation:
        "La force de l'algorithme ne compte pas si la clé est exposée avec les données. On sépare les clés (KMS ou HSM, chiffrement par enveloppe), avec leurs propres contrôles d'accès et leur rotation.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/system-design/monitoring": [
    {
      id: "system-design-monitoring-1",
      question:
        "Une requête traverse 8 microservices et le temps total est élevé. Quel pilier de l'observabilité identifie le service responsable ?",
      options: [
        "Les traces distribuées (OpenTelemetry, Jaeger)",
        "Les logs applicatifs d'un seul service",
        "La métrique de CPU moyenne du cluster",
        "Un tableau de bord sur la mémoire des nœuds",
      ],
      correctIndex: 0,
      explanation:
        "Une trace suit une requête de bout en bout avec la durée de chaque span, ce qui montre où le temps est perdu. Les métriques agrégées et les logs isolés ne relient pas les appels entre services.",
      difficulty: "easy",
    },
    {
      id: "system-design-monitoring-2",
      question:
        "Un SLO de 99,9 % de disponibilité sur 30 jours correspond à un budget d'erreur d'environ combien ?",
      options: [
        "Environ 4 minutes",
        "Environ 7 heures",
        "Environ 43 minutes",
        "Environ 3 jours entiers",
      ],
      correctIndex: 2,
      explanation:
        "30 jours = 43 200 minutes, multipliées par 0,1 % donne environ 43 minutes. Quand ce budget est consommé, l'équipe ralentit les nouveautés pour privilégier la fiabilité.",
      difficulty: "easy",
    },
    {
      id: "system-design-monitoring-3",
      question:
        "L'équipe vise 99,95 % en interne et le contrat client promet 99,9 %. Quel est le raisonnement derrière cet écart ?",
      options: [
        "Le SLA doit toujours être plus strict que le SLO",
        "Le SLO plus strict garde une marge avant la pénalité du SLA",
        "Le SLO et le SLA sont deux noms pour la même valeur",
        "Le SLI est le seul indicateur à promettre au client",
      ],
      correctIndex: 1,
      explanation:
        "Le SLA est un engagement contractuel avec pénalités ; le SLO interne est volontairement plus exigeant pour réagir avant de rompre le contrat. Le SLI est la mesure (ex. latence p99), pas un engagement.",
      difficulty: "medium",
    },
    {
      id: "system-design-monitoring-4",
      question:
        "Quelle alerte réveillant l'astreinte est la plus utile ?",
      options: [
        "CPU d'un nœud supérieur à 80 % pendant une minute",
        "Mémoire libre inférieure à 20 % sur un seul pod",
        "Le taux d'erreurs dépasse le SLO sur 5 minutes",
        "Un redémarrage de conteneur isolé par la plateforme",
      ],
      correctIndex: 2,
      explanation:
        "Alerter sur les symptômes visibles des utilisateurs (erreurs, latence) évite le bruit des causes possibles qui n'ont aucun impact (CPU élevé mais requêtes servies). Trop d'alertes sur les causes provoque une fatigue d'alerte.",
      difficulty: "medium",
    },
    {
      id: "system-design-monitoring-5",
      question:
        "Le dashboard affiche une latence moyenne de 120 ms, mais des utilisateurs se plaignent de lenteurs. Chaque page appelle 50 services. Quel indicateur consulter et pourquoi ?",
      options: [
        "La latence p99, car la moyenne masque la queue de distribution",
        "La latence minimale, car elle montre le meilleur cas réel observé",
        "Le nombre de requêtes, car la lenteur vient du volume",
        "La moyenne sur 24 h, car elle lisse les pics",
      ],
      correctIndex: 0,
      explanation:
        "La moyenne cache les requêtes lentes ; avec 50 appels par page, la probabilité qu'au moins un tombe dans la queue p99 devient élevée (environ 40 %). Les percentiles (p95, p99) reflètent l'expérience réelle.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/system-design/whiteboard": [
    {
      id: "system-design-whiteboard-1",
      question:
        "En entretien de system design, quelle est la meilleure première étape après avoir lu l'énoncé « concevez un URL shortener » ?",
      options: [
        "Dessiner tout de suite l'architecture finale",
        "Clarifier les exigences et demander les volumes",
        "Choisir la base de données et justifier ce choix",
        "Détailler l'algorithme de génération des identifiants",
      ],
      correctIndex: 1,
      explanation:
        "Sans périmètre ni chiffres (URLs par jour, ratio lecture/écriture, durée de rétention), on risque de concevoir le mauvais système. Les choix techniques viennent après, justifiés par ces exigences.",
      difficulty: "easy",
    },
    {
      id: "system-design-whiteboard-2",
      question:
        "100 millions d'URLs créées par jour, avec un ratio lecture/écriture de 10:1. Quel est l'ordre de grandeur du QPS d'écriture et de lecture ?",
      options: [
        "Environ 1 200 écritures/s et 12 000 lectures/s",
        "Environ 100 écritures/s et 1 000 lectures/s",
        "Environ 12 000 écritures/s et 120 000 lectures/s",
        "Environ 1 200 écritures/s et 1 200 lectures/s",
      ],
      correctIndex: 0,
      explanation:
        "100 M / 86 400 s ≈ 1 157, arrondi à 1 200 écritures par seconde, soit 12 000 lectures avec un ratio de 10. Oublier la conversion en secondes ou le ratio de lecture donne des chiffres faux d'un ordre de grandeur.",
      difficulty: "medium",
    },
    {
      id: "system-design-whiteboard-3",
      question:
        "Toujours avec 100 M d'URLs par jour, quel stockage prévoir sur 5 ans à 500 octets par enregistrement ?",
      options: [
        "Environ 9 To",
        "Environ 18 To",
        "Environ 910 To",
        "Environ 91 To",
      ],
      correctIndex: 3,
      explanation:
        "100 M × 365 × 5 × 500 octets ≈ 9,1 × 10^13 octets, soit environ 91 To. Ce volume justifie un stockage partitionné plutôt qu'un seul serveur.",
      difficulty: "medium",
    },
    {
      id: "system-design-whiteboard-4",
      question:
        "Le service doit compter les clics de chaque lien. Quel code de redirection HTTP choisir et pourquoi ?",
      options: [
        "301, car les navigateurs le mettent en cache et soulagent le serveur",
        "301, car il est le seul accepté par les moteurs de recherche",
        "302, car il n'est pas mis en cache, chaque clic est vu",
        "302, car il est plus rapide à transmettre qu'une réponse 301",
      ],
      correctIndex: 2,
      explanation:
        "Un 301 permanent est mis en cache par le navigateur, qui ne repasse plus par le service : les clics ne sont plus comptés. Un 302 (temporaire) garde le contrôle, au prix d'une charge plus élevée.",
      difficulty: "easy",
    },
    {
      id: "system-design-whiteboard-5",
      question:
        "Pour générer les codes courts, on garde les 6 premiers caractères d'un hash MD5 de l'URL. Quel est le problème principal ?",
      options: [
        "MD5 ne produit que des chiffres décimaux, donc pas de lettres base62",
        "Les collisions apparaissent bien avant que l'espace soit plein",
        "Le hash est réversible, donc l'URL d'origine fuite",
        "Le hash est trop lent pour 1 200 écritures par seconde",
      ],
      correctIndex: 1,
      explanation:
        "En tronquant à 6 caractères, on réduit l'espace à quelques dizaines de milliards, et le paradoxe des anniversaires crée des collisions après quelques centaines de milliers d'URLs : il faut détecter et régénérer. Un compteur distribué ou un ID type Snowflake encodé en base62 évite ce problème.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/system-design/storage": [
    {
      id: "system-design-storage-1",
      question:
        "Dans un virement, le débit réussit puis le service plante avant le crédit. Quelle propriété ACID doit annuler le débit ?",
      options: [
        "Atomicité : tout ou rien",
        "Isolation : les transactions sont indépendantes",
        "Durabilité : les données écrites sont conservées",
        "Cohérence : les types de colonnes sont respectés",
      ],
      correctIndex: 0,
      explanation:
        "L'atomicité garantit que la transaction est appliquée entièrement ou pas du tout ; le débit est annulé (rollback). La durabilité, au contraire, conserverait un débit déjà validé.",
      difficulty: "easy",
    },
    {
      id: "system-design-storage-2",
      question:
        "Une application de paiement doit garantir la cohérence entre plusieurs tables et exécuter des jointures. Quel choix de stockage est le plus approprié ?",
      options: [
        "Un magasin clé-valeur en cohérence éventuelle uniquement",
        "Une base orientée graphes pour les relations",
        "Un magasin de documents sans transactions",
        "Une base relationnelle SQL avec transactions ACID",
      ],
      correctIndex: 3,
      explanation:
        "Les besoins de transactions multi-tables et de jointures désignent le modèle relationnel. Le NoSQL excelle plutôt pour l'écriture massive, la distribution horizontale et les schémas flexibles.",
      difficulty: "easy",
    },
    {
      id: "system-design-storage-3",
      question:
        "Lors d'une partition réseau entre deux datacenters, un système CP et un système AP réagissent différemment. Comment ?",
      options: [
        "CP continue de répondre partout, AP s'arrête",
        "CP refuse des requêtes, AP répond avec des données périmées",
        "CP et AP perdent tous deux les données écrites pendant la panne",
        "CP et AP restent cohérents et disponibles grâce au cache",
      ],
      correctIndex: 1,
      explanation:
        "La partition est inévitable : il faut choisir entre cohérence (refuser ou attendre) et disponibilité (répondre quitte à être périmé). Le théorème CAP interdit d'avoir les deux pendant la partition.",
      difficulty: "medium",
    },
    {
      id: "system-design-storage-4",
      question:
        "Avec une réplication asynchrone, un utilisateur modifie son profil puis recharge la page, lue sur un réplica : il voit l'ancienne valeur. Quelle correction cible ce problème ?",
      options: [
        "Passer toutes les lectures sur des réplicas plus nombreux et plus rapides",
        "Désactiver la réplication pour toutes les tables",
        "Lire sur le primaire peu après une écriture (read-your-writes)",
        "Augmenter le TTL du cache de profil",
      ],
      correctIndex: 2,
      explanation:
        "Le réplica n'a pas encore reçu l'écriture (retard de réplication). On garantit la lecture de ses propres écritures en routant ces lectures vers le primaire, ou en attendant la position de réplication. Augmenter le TTL aggraverait la péremption.",
      difficulty: "medium",
    },
    {
      id: "system-design-storage-5",
      question:
        "Une table d'événements est partitionnée par plages de created_at, une partition par mois. Quel problème apparaît en production ?",
      options: [
        "Les écritures récentes se concentrent sur la dernière partition",
        "Les écritures se répartissent parfaitement entre toutes les partitions",
        "Les requêtes par plage de dates deviennent impossibles",
        "Les anciennes partitions ne peuvent plus être lues",
      ],
      correctIndex: 0,
      explanation:
        "Toutes les nouvelles écritures visent la partition du mois courant, qui devient un hotspot pendant que les autres sont inactives. Un hachage de la clé répartit mieux les écritures mais pénalise les requêtes par plage : c'est le compromis du choix de shard key.",
      difficulty: "hard",
    },
  ],
};
