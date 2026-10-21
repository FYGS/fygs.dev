import type { AreaQuizzes } from "./types";

export const architectureQuizzes: AreaQuizzes = {
  "/tech-mastry/architecture/solid": [
    {
      id: "architecture-solid-1",
      question:
        "Une classe InvoiceService calcule les totaux, génère le PDF et envoie l'email au client. Quel principe SOLID viole-t-elle en premier lieu ?",
      options: [
        "Open/Closed : elle ne peut pas être étendue",
        "Responsabilité unique : plusieurs raisons de changer",
        "Liskov : elle n'est pas substituable",
        "Inversion de dépendance : elle utilise des classes concrètes",
      ],
      correctIndex: 1,
      explanation:
        "La classe a trois raisons de changer (règles de calcul, format du PDF, canal d'envoi), ce qui est la définition de la violation du SRP. L'OCP et le DIP peuvent aussi être concernés, mais ils ne sont pas la cause racine ici.",
      difficulty: "easy",
    },
    {
      id: "architecture-solid-2",
      question:
        "Voici le code d'un module de paiement :\nif (type === \"card\") { payByCard(); }\nelse if (type === \"paypal\") { payByPaypal(); }\nOn doit ajouter Apple Pay chaque trimestre. Quelle évolution respecte le principe Ouvert/Fermé ?",
      options: [
        "Ajouter un else if pour chaque nouveau moyen",
        "Déplacer le if dans une fonction utilitaire séparée du module",
        "Une interface PaymentMethod avec une classe par moyen",
        "Remplacer le type par un enum plus strict",
      ],
      correctIndex: 2,
      explanation:
        "Avec une abstraction et une implémentation par moyen, on étend le système en ajoutant une classe sans modifier le code existant. Déplacer ou typer le if ne change rien : chaque ajout oblige toujours à modifier la même fonction.",
      difficulty: "easy",
    },
    {
      id: "architecture-solid-3",
      question:
        "Square hérite de Rectangle et redéfinit setWidth pour modifier aussi la hauteur. Un client fait :\nr.setWidth(5);\nr.setHeight(4);\nr.area(); // attendu : 20\nAvec un Square, il obtient 16. Que révèle ce résultat ?",
      options: [
        "Square viole Liskov : il casse le contrat de Rectangle",
        "Rectangle viole la responsabilité unique du calcul",
        "Le code client viole Ouvert/Fermé en appelant area",
        "L'héritage est correct car un carré est un rectangle mathématique",
      ],
      correctIndex: 0,
      explanation:
        "Le principe de substitution exige qu'un sous-type respecte le comportement attendu du type de base, pas seulement sa signature. Le fait qu'un carré soit géométriquement un rectangle ne suffit pas : c'est le contrat comportemental (largeur et hauteur indépendantes) qui compte.",
      difficulty: "medium",
    },
    {
      id: "architecture-solid-4",
      question:
        "L'interface Worker déclare work() et eat(). La classe Robot l'implémente mais eat() lève une exception « non supporté ». Quelle correction applique la ségrégation des interfaces ?",
      options: [
        "Laisser eat() vide pour ne plus lever d'exception",
        "Faire hériter Robot d'une classe abstraite commune",
        "Documenter que eat() ne doit jamais être appelé sur un Robot",
        "Séparer en Workable et Feedable, Robot implémente Workable",
      ],
      correctIndex: 3,
      explanation:
        "Aucun client ne doit être forcé de dépendre de méthodes qu'il n'utilise pas : on découpe l'interface en rôles plus petits. Vider la méthode ou la documenter masque le problème et laisse un piège à l'exécution.",
      difficulty: "medium",
    },
    {
      id: "architecture-solid-5",
      question:
        "OrderService fait new PostgresOrderRepository() dans son constructeur. Quelle affirmation sur le principe d'inversion de dépendance est exacte ?",
      options: [
        "Utiliser un conteneur d'injection suffit pour le respecter",
        "Le module métier définit l'interface, l'infrastructure l'implémente",
        "Il impose de mettre l'interface dans le même package que l'implémentation Postgres",
        "Il interdit toute dépendance du métier vers une bibliothèque",
      ],
      correctIndex: 1,
      explanation:
        "Le DIP inverse le sens de la dépendance : le haut niveau possède l'abstraction et le bas niveau s'y conforme. L'injection de dépendances est une technique utile, mais injecter une interface définie côté infrastructure laisse le métier dépendant de celle-ci.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/architecture/design-patterns": [
    {
      id: "architecture-design-patterns-1",
      question:
        "Votre application utilise une interface PaymentGateway { charge(amount, currency) }. Le SDK d'un nouveau prestataire expose pay({ cents, cur }). Quel pattern permet de l'intégrer sans modifier les appelants ?",
      options: [
        "Adapter : il traduit l'interface du SDK vers la vôtre",
        "Singleton : une seule instance du SDK suffit",
        "Observer : les appelants sont notifiés du paiement",
        "Decorator : on enrobe le SDK pour ajouter du comportement",
      ],
      correctIndex: 0,
      explanation:
        "L'Adapter convertit une interface incompatible en celle attendue par le client. Le Decorator conserve la même interface et ajoute un comportement, ce qui n'est pas le besoin ici.",
      difficulty: "easy",
    },
    {
      id: "architecture-design-patterns-2",
      question:
        "Pourquoi le Singleton est-il souvent considéré comme un anti-pattern dans les bases de code testées ?",
      options: [
        "Il consomme trop de mémoire à cause de l'instance unique",
        "Il est impossible à implémenter sans framework",
        "Il crée un état global caché qui complique les tests",
        "Il empêche toute utilisation d'interfaces en TypeScript",
      ],
      correctIndex: 2,
      explanation:
        "Une instance globale accessible partout masque les dépendances et partage un état entre les tests, qui deviennent dépendants de leur ordre. Le coût mémoire d'une seule instance est au contraire négligeable.",
      difficulty: "easy",
    },
    {
      id: "architecture-design-patterns-3",
      question:
        "Le calcul des frais de livraison varie selon le transporteur choisi par le client à l'exécution, et de nouveaux transporteurs arrivent régulièrement. Quel pattern est le plus adapté ?",
      options: [
        "Observer : chaque transporteur s'abonne à la commande",
        "Singleton : un calculateur global pour toute l'application",
        "Factory Method : un seul transporteur est créé au démarrage",
        "Strategy : un algorithme interchangeable par transporteur",
      ],
      correctIndex: 3,
      explanation:
        "Strategy encapsule une famille d'algorithmes interchangeables derrière une interface et en choisit un à l'exécution, sans if/else géant. Une Factory peut aider à instancier la stratégie, mais ne remplace pas la variation de comportement elle-même.",
      difficulty: "medium",
    },
    {
      id: "architecture-design-patterns-4",
      question:
        "Un service HTTP doit pouvoir être enrichi par de la journalisation, du cache et de la compression, activables séparément et dans des ordres variables. Quelle solution est la plus flexible ?",
      options: [
        "Des Decorators qui implémentent la même interface et s'empilent",
        "Une sous-classe par combinaison possible de fonctionnalités activées",
        "Un Singleton qui active ou désactive chaque option",
        "Un Observer qui réagit à chaque requête traitée",
      ],
      correctIndex: 0,
      explanation:
        "Les Decorators partagent l'interface du service et se composent librement à l'exécution. L'approche par sous-classes provoque une explosion combinatoire (2 puissance n classes).",
      difficulty: "medium",
    },
    {
      id: "architecture-design-patterns-5",
      question:
        "Dans une SPA, des composants s'abonnent à un EventEmitter global au montage mais ne se désabonnent jamais. Après une longue navigation, la mémoire grossit. Quel problème classique de l'Observer est en cause ?",
      options: [
        "Le sujet notifie trop lentement ses observateurs",
        "Le sujet garde des références fortes aux observateurs morts",
        "Les observateurs ne respectent pas le principe de substitution de Liskov",
        "L'Observer est incompatible avec le garbage collector",
      ],
      correctIndex: 1,
      explanation:
        "Tant que le sujet référence l'abonné, le ramasse-miettes ne peut pas le libérer : c'est le « lapsed listener ». Il faut se désabonner au démontage ou utiliser des références faibles ; le GC fonctionne très bien avec l'Observer.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/architecture/clean-architecture": [
    {
      id: "architecture-clean-architecture-1",
      question:
        "Quelle est la règle de dépendance de la Clean Architecture ?",
      options: [
        "Chaque couche appelle uniquement la couche juste au-dessus",
        "Les couches externes ne peuvent jamais appeler les internes",
        "Toutes les couches dépendent d'un module commun partagé",
        "Les dépendances du code source pointent vers l'intérieur",
      ],
      correctIndex: 3,
      explanation:
        "Le code d'un cercle interne ne connaît rien des cercles externes : les dépendances source vont des frameworks vers les entités. Les couches externes appellent bien les internes, c'est l'inverse qui est interdit.",
      difficulty: "easy",
    },
    {
      id: "architecture-clean-architecture-2",
      question:
        "Où placer le code qui transforme le résultat d'un cas d'utilisation en JSON pour une API REST ?",
      options: [
        "Dans les Interface Adapters (controller ou presenter)",
        "Dans les Entities, avec les règles métier",
        "Dans les Use Cases, pour garder le format maîtrisé",
        "Dans la base de données via une vue SQL",
      ],
      correctIndex: 0,
      explanation:
        "Les Interface Adapters convertissent les données vers le format pratique pour l'agent externe (web, DB). Mettre du JSON dans les entités ou les use cases les couplerait au mode de livraison.",
      difficulty: "easy",
    },
    {
      id: "architecture-clean-architecture-3",
      question:
        "Le use case CreateOrder doit sauvegarder la commande, mais PostgreSQL est dans la couche externe. Comment le faire sans dépendre de Prisma ?",
      options: [
        "Importer Prisma dans le use case, c'est un détail technique",
        "Faire appeler le use case par le repository Prisma",
        "Déclarer un port OrderRepository, implémenté par l'adaptateur",
        "Dupliquer la logique de persistance dans chaque contrôleur de l'application",
      ],
      correctIndex: 2,
      explanation:
        "Le use case définit une interface (port) qu'il possède, et la couche externe fournit l'implémentation : c'est l'inversion de dépendance qui permet au flux de contrôle d'aller vers l'extérieur sans casser la règle de dépendance.",
      difficulty: "medium",
    },
    {
      id: "architecture-clean-architecture-4",
      question:
        "Une revue de code montre dans l'entité Order : import { PrismaClient } from \"@prisma/client\". Quelle conséquence concrète est la plus probable ?",
      options: [
        "Le build échoue car les entités n'ont pas accès aux modules",
        "L'entité devient plus rapide car elle évite un appel intermédiaire inutile",
        "Aucune, tant que les tests d'intégration passent",
        "Les tests exigent une base, et changer d'ORM touche le coeur",
      ],
      correctIndex: 3,
      explanation:
        "Une entité qui connaît l'ORM perd ses deux bénéfices : testabilité sans infrastructure et indépendance vis-à-vis des frameworks. Que les tests d'intégration passent ne corrige pas le couplage.",
      difficulty: "medium",
    },
    {
      id: "architecture-clean-architecture-5",
      question:
        "Une équipe de deux personnes développe un back-office CRUD de trois écrans, sans règle métier complexe. Quelle position est la plus raisonnable ?",
      options: [
        "Appliquer les 4 couches complètes dès le départ par principe",
        "Rester simple, et ajouter des couches si la logique grandit",
        "Écrire tout dans les contrôleurs et ne jamais refactorer",
        "Utiliser la Clean Architecture seulement pour le front-end",
      ],
      correctIndex: 1,
      explanation:
        "La Clean Architecture a un coût (mappings, interfaces, indirections) qui se rentabilise quand les règles métier sont riches ou durables. Pour du CRUD simple, la sur-ingénierie ralentit sans bénéfice ; l'erreur inverse est de ne jamais séparer quand la complexité apparaît.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/architecture/ddd": [
    {
      id: "architecture-ddd-1",
      question:
        "Dans un e-commerce, « Product » est un article décrit et catégorisé dans Catalog, mais une ligne avec quantité et prix dans Order. Que dit le DDD de cette différence ?",
      options: [
        "C'est une erreur : il faut un unique modèle Product global pour tous",
        "C'est une duplication à supprimer avec une base partagée",
        "C'est légitime : chaque Bounded Context a son propre modèle",
        "C'est un défaut de nommage à corriger avec des préfixes",
      ],
      correctIndex: 2,
      explanation:
        "Un Bounded Context délimite un modèle et un langage cohérents ; le même mot peut y recouvrir des concepts différents. Forcer un modèle unique crée un « gros modèle » que personne ne maîtrise.",
      difficulty: "easy",
    },
    {
      id: "architecture-ddd-2",
      question:
        "Parmi ces concepts, lequel est le meilleur candidat pour un Value Object ?",
      options: [
        "Money (montant et devise), immuable et comparé par valeur",
        "Customer, identifié par un customerId stable",
        "Order, dont le statut évolue dans le temps",
        "Payment, tracé par un identifiant de transaction",
      ],
      correctIndex: 0,
      explanation:
        "Un Value Object n'a pas d'identité : deux Money de 10 EUR sont interchangeables et on les remplace plutôt que de les modifier. Les autres ont une identité et un cycle de vie, ce sont des Entities.",
      difficulty: "easy",
    },
    {
      id: "architecture-ddd-3",
      question:
        "Order est un Aggregate qui contient des OrderItem. Un service veut modifier directement la quantité d'un OrderItem via un OrderItemRepository. Quel est le problème ?",
      options: [
        "Les OrderItem n'ont pas d'identifiant, donc la modification est impossible",
        "Les Aggregates doivent être modifiés uniquement en lecture seule",
        "Un Repository ne peut jamais utiliser une base relationnelle",
        "Cela contourne la racine qui garantit les invariants de l'Aggregate",
      ],
      correctIndex: 3,
      explanation:
        "Seule la racine (Order) est accessible de l'extérieur : elle applique les invariants (ex. total cohérent, limite d'articles) et définit la frontière transactionnelle. Modifier un enfant directement permet de violer ces règles.",
      difficulty: "medium",
    },
    {
      id: "architecture-ddd-4",
      question:
        "Quand une commande est confirmée dans le contexte Order, le contexte Payment doit créer une facture. Quelle approche est la plus cohérente avec le DDD ?",
      options: [
        "Order écrit directement dans les tables de Payment",
        "Order publie un Domain Event OrderPlaced, Payment y réagit",
        "Payment interroge la base d'Order toutes les secondes en continu",
        "Les deux contextes partagent une seule classe Order",
      ],
      correctIndex: 1,
      explanation:
        "Un Domain Event exprime un fait du métier et découple les contextes, au prix d'une cohérence à terme. Écrire dans les tables d'un autre contexte ou partager le modèle détruit l'autonomie des Bounded Contexts.",
      difficulty: "medium",
    },
    {
      id: "architecture-ddd-5",
      question:
        "Quelle conception du Repository est cohérente avec le DDD tactique ?",
      options: [
        "Une classe par table, avec des méthodes SQL exposées au domaine",
        "Un objet générique qui renvoie des tableaux de lignes brutes de la base",
        "Un singleton global que les entités appellent pour se sauvegarder",
        "Une interface du domaine, implémentée en infra, qui rend des Aggregates",
      ],
      correctIndex: 3,
      explanation:
        "Le Repository donne l'illusion d'une collection d'Aggregates : son contrat appartient au domaine (ex. findById(id): Promise<Order | null>) et seule l'implémentation connaît Prisma ou SQL. Un repository par table fuit le modèle de stockage vers le domaine.",
      difficulty: "hard",
    },
  ],
};
