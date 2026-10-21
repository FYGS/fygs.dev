import type { AreaQuizzes } from "./types";

export const bestPracticesQuizzes: AreaQuizzes = {
  "/tech-mastry/best-practices/code-quality": [
    {
      id: "best-practices-code-quality-1",
      question:
        "Quel commentaire apporte le plus de valeur au-dessus de ce code ?\n\nif (retries > 3) return;",
      options: [
        "// Si retries est supérieur à 3, on retourne",
        "// Vérifie le nombre d'essais effectués jusqu'ici avant de poursuivre le traitement",
        "// Le partenaire bloque l'IP après 3 échecs : inutile d'insister",
        "// TODO: à revoir un jour quand on aura le temps",
      ],
      correctIndex: 2,
      explanation:
        "Un bon commentaire explique le pourquoi, c'est-à-dire une contrainte externe que le code ne montre pas. Les deux premiers paraphrasent simplement le code.",
      difficulty: "easy",
    },
    {
      id: "best-practices-code-quality-2",
      question:
        "Pour une fonction calculateTotalPrice, quel jeu de tests apporte le plus de confiance ?",
      options: [
        "Un cas nominal, plus panier vide, quantité 0, remise de 100 % et prix décimaux",
        "Dix variantes du même panier nominal avec des produits différents",
        "Uniquement le chemin heureux, car les erreurs sont rares en production ; on testera plus tard si besoin",
        "Un unique test d'intégration qui parcourt toute l'application",
      ],
      correctIndex: 0,
      explanation:
        "Les bugs se cachent dans les cas limites et les erreurs ; répéter le chemin heureux n'ajoute aucune information. Un test d'intégration est utile mais ne remplace pas des tests unitaires ciblés.",
      difficulty: "easy",
    },
    {
      id: "best-practices-code-quality-3",
      question:
        "Une fonction de 60 lignes mélange validation, calcul et sauvegarde, sans aucun test. Que faire avant de la refactorer ?",
      options: [
        "Tout réécrire proprement d'un coup, puis écrire les tests ensuite",
        "Écrire des tests de caractérisation du comportement actuel, puis extraire par petits commits",
        "Se contenter de renommer les variables, un refactoring sans test étant à proscrire et on le documente dans le wiki",
        "Extraire les trois blocs dans des fichiers séparés et vérifier en production",
      ],
      correctIndex: 1,
      explanation:
        "Refactorer, c'est changer la structure sans changer le comportement, ce que seuls des tests peuvent garantir. Réécrire d'un bloc rend impossible de savoir si le comportement a changé.",
      difficulty: "medium",
    },
    {
      id: "best-practices-code-quality-4",
      question:
        "Deux fonctions ont la même structure : l'une applique la TVA, l'autre les frais de livraison, avec des règles qui évolueront séparément. Que faire ?",
      options: [
        "Les fusionner en une fonction générique pilotée par un drapeau booléen, au nom de DRY",
        "Les fusionner et ajouter un paramètre à chaque différence qui apparaîtra",
        "Les garder séparées : même forme, mais raisons de changer différentes",
        "Supprimer l'une des deux et réutiliser l'autre partout dans le code",
      ],
      correctIndex: 2,
      explanation:
        "DRY concerne la duplication de connaissance, pas la ressemblance de forme. Fusionner des règles qui évoluent indépendamment crée un couplage et des paramètres de plus en plus nombreux.",
      difficulty: "medium",
    },
    {
      id: "best-practices-code-quality-5",
      question:
        "Une PR de 800 lignes concatène une entrée utilisateur dans une requête SQL, n'a aucun test et contient quelques noms peu clairs. Quelle revue est la plus pertinente ?",
      options: [
        "Approuver avec des remarques sur les noms, puisque le comportement fonctionne en démo puis les corriger après la mise en production",
        "Lister d'abord trente défauts de style, la sécurité pouvant attendre un ticket",
        "Refuser la PR en bloc, sans explication, pour montrer l'exigence de l'équipe",
        "Bloquer sur l'injection SQL et l'absence de tests, proposer de découper, noms en suggestion",
      ],
      correctIndex: 3,
      explanation:
        "Une bonne revue hiérarchise : sécurité et tests bloquent, le style reste non bloquant. Une PR trop grosse se relit mal, d'où la demande de découpage.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/best-practices/communication": [
    {
      id: "best-practices-communication-1",
      question:
        "En entretien, on vous dit : « Concevez un système de notifications. » Quelle est la meilleure première réaction ?",
      options: [
        "Citer Kafka d'emblée pour montrer l'étendue de vos connaissances pour impressionner l'interviewer",
        "Dessiner l'architecture finale puis demander si elle convient",
        "Réfléchir en silence quelques minutes avant de dire quoi que ce soit",
        "Demander canaux, volumétrie, latence acceptable et garanties de livraison",
      ],
      correctIndex: 3,
      explanation:
        "L'énoncé est volontairement flou : poser des questions sur les contraintes évite de résoudre le mauvais problème. Proposer une technologie avant de connaître les besoins est prématuré.",
      difficulty: "easy",
    },
    {
      id: "best-practices-communication-2",
      question:
        "Vous hésitez entre un hashmap et un tri pour résoudre un problème d'entretien. Que faire ?",
      options: [
        "Choisir en silence l'option la plus simple pour gagner du temps",
        "Exposer les deux approches avec leurs compromis, puis justifier votre choix",
        "Demander à l'intervieweur laquelle il préfère, sans proposer d'analyse",
        "Coder les deux solutions en entier pour pouvoir les comparer ensuite et choisir la meilleure ensuite",
      ],
      correctIndex: 1,
      explanation:
        "Penser à voix haute rend votre raisonnement visible et évaluable. Le silence cache vos qualités, et coder deux solutions complètes gaspille le temps disponible.",
      difficulty: "easy",
    },
    {
      id: "best-practices-communication-3",
      question:
        "Vous devez expliquer à un chef de produit non technique le report d'une fonctionnalité pour migrer une base de données. Quelle approche est la plus efficace ?",
      options: [
        "Détailler d'abord le schéma de migration et les contraintes d'index",
        "Dire que c'est un sujet technique et qu'il doit vous faire confiance",
        "Partir de l'impact (risque de pannes, délais futurs), proposer des options et en recommander une",
        "Envoyer la documentation technique complète et attendre ses questions et laisser le chef de produit choisir seul",
      ],
      correctIndex: 2,
      explanation:
        "Un interlocuteur non technique décide à partir de l'impact et des options, pas des détails d'implémentation. Demander une confiance aveugle ne l'aide pas à arbitrer.",
      difficulty: "medium",
    },
    {
      id: "best-practices-communication-4",
      question:
        "En revue de conception, un collègue défend une autre solution que la vôtre. Quelle réponse est la plus constructive ?",
      options: [
        "Répéter vos arguments plus fermement jusqu'à ce qu'il cède jusqu'à ce qu'il comprenne que vous avez raison",
        "Céder immédiatement pour éviter un conflit devant l'équipe",
        "Trancher en vous appuyant sur votre ancienneté dans l'équipe",
        "Reformuler sa position, convenir de critères (latence, coût) et comparer sur des faits",
      ],
      correctIndex: 3,
      explanation:
        "Reformuler montre que vous avez compris, et des critères partagés déplacent le débat des personnes vers les faits. Céder ou imposer ne règle pas le désaccord technique.",
      difficulty: "medium",
    },
    {
      id: "best-practices-communication-5",
      question:
        "Pendant votre solution, l'intervieweur signale un cas où votre algorithme échoue. Vous n'êtes pas certain qu'il ait raison. Que faites-vous ?",
      options: [
        "Dérouler votre code sur son exemple à voix haute, et corriger s'il avait raison",
        "Défendre votre solution : un intervieweur peut très bien se tromper, il a pu mal interpréter l'énoncé",
        "Tout réécrire depuis le début, en silence, pour repartir sur de bonnes bases",
        "Accepter sa remarque sans la vérifier, pour montrer votre esprit de coopération",
      ],
      correctIndex: 0,
      explanation:
        "Tester l'objection sur l'exemple tranche factuellement et montre rigueur et ouverture. Se braquer ou céder sans vérifier évite justement la démarche que l'on évalue.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/best-practices/design-patterns": [
    {
      id: "best-practices-design-patterns-1",
      question:
        "Une fonction pay() contient un long switch sur le type de paiement qui grossit à chaque nouveau moyen. Quel pattern convient ?",
      options: [
        "Strategy : une interface commune et une implémentation injectée par moyen de paiement",
        "Singleton : une instance unique de pay() évite de dupliquer la logique, ce qui évite de réécrire la logique",
        "Builder : construire le paiement étape par étape avec une API fluide",
        "Observer : notifier chaque moyen de paiement par un événement",
      ],
      correctIndex: 0,
      explanation:
        "Strategy remplace un switch par des algorithmes interchangeables, ce qui permet d'ajouter un moyen de paiement sans modifier le code existant. Les autres patterns ne traitent pas ce problème.",
      difficulty: "easy",
    },
    {
      id: "best-practices-design-patterns-2",
      question:
        "Votre code attend { name, email } mais une API héritée renvoie { nom, mail }. Quel pattern isole proprement cette différence ?",
      options: [
        "Decorator, qui ajoute des champs sans changer l'interface",
        "Proxy, qui remplace l'API pour contrôler son accès",
        "Adapter, qui traduit l'interface héritée vers celle attendue",
        "Factory Method, qui choisit la classe à créer selon la source",
      ],
      correctIndex: 2,
      explanation:
        "Adapter sert exactement à faire collaborer deux interfaces incompatibles. Decorator et Proxy conservent la même interface que l'objet enveloppé.",
      difficulty: "easy",
    },
    {
      id: "best-practices-design-patterns-3",
      question:
        "Quel est le principal inconvénient d'un Singleton accessible partout via getInstance() ?",
      options: [
        "Il consomme beaucoup de mémoire car l'instance n'est jamais libérée et ralentit le ramasse-miettes",
        "Il est interdit en TypeScript à cause du constructeur privé",
        "Il impose l'héritage et empêche donc d'implémenter une interface",
        "Il crée un état global caché qui complique les tests ; mieux vaut injecter l'instance",
      ],
      correctIndex: 3,
      explanation:
        "Un accès global crée une dépendance invisible qu'on ne peut pas remplacer par un faux dans un test. On garde une instance unique, mais on la fournit par injection de dépendances.",
      difficulty: "medium",
    },
    {
      id: "best-practices-design-patterns-4",
      question:
        "CachedDataService expose la même interface que DataService et décide d'appeler le vrai service ou de renvoyer la valeur en cache. Quel pattern est-ce ?",
      options: [
        "Proxy : même interface, avec contrôle de l'accès à l'objet réel",
        "Adapter : il traduit une interface incompatible vers une autre",
        "Observer : il notifie les clients quand la donnée change",
        "Builder : il construit l'objet de données étape par étape et contrôle la création de ces objets",
      ],
      correctIndex: 0,
      explanation:
        "Un Proxy partage l'interface de l'objet réel et contrôle l'accès (cache, lazy loading, droits). Un Adapter, lui, change d'interface.",
      difficulty: "medium",
    },
    {
      id: "best-practices-design-patterns-5",
      question:
        "Une équipe crée une AbstractFactory et cinq interfaces « au cas où », alors qu'il n'existe qu'une seule implémentation. Quelle réaction en revue ?",
      options: [
        "Approuver : prévoir tous les besoins futurs est la raison d'être des patterns et éviter toute refonte ultérieure",
        "Simplifier, et n'introduire l'abstraction que lorsqu'une deuxième variante réelle apparaît",
        "Ajouter un Singleton pour limiter le nombre d'instances de la factory",
        "Demander un Decorator de plus pour que le code soit plus extensible",
      ],
      correctIndex: 1,
      explanation:
        "Un pattern répond à un problème présent ; sans variante réelle, il ajoute de l'indirection et de la maintenance (YAGNI). Les autres propositions empilent encore de la complexité.",
      difficulty: "hard",
    },
    {
      id: "best-practices-design-patterns-6",
      question:
        "Un composant s'abonne à un EventEmitter à son initialisation, sans jamais se désabonner, et il est recréé à chaque navigation. Que risque-t-on ?",
      options: [
        "Rien : les écouteurs sont supprimés automatiquement avec le composant dès que la page est fermée",
        "Une erreur de typage, car les événements ne sont plus reconnus",
        "Des fuites mémoire et des handlers qui s'exécutent plusieurs fois par événement",
        "Un blocage de l'émetteur, qui attend la fin de chaque handler",
      ],
      correctIndex: 2,
      explanation:
        "L'émetteur garde une référence vers chaque callback tant qu'on ne les retire pas. Il faut donc appeler la fonction de désabonnement (unsub) au démontage.",
      difficulty: "medium",
    },
  ],
  "/tech-mastry/best-practices/negotiation": [
    {
      id: "best-practices-negotiation-1",
      question:
        "Dès le premier échange, la recruteuse vous demande vos prétentions salariales. Quelle réponse est la plus judicieuse ?",
      options: [
        "Donner tout de suite votre chiffre idéal pour montrer votre transparence et débloquer la suite du processus",
        "Demander à mieux cerner le poste et le périmètre, et la fourchette prévue",
        "Refuser de parler d'argent avant d'avoir signé le contrat",
        "Annoncer votre salaire actuel pour qu'elle s'aligne dessus",
      ],
      correctIndex: 1,
      explanation:
        "Citer un chiffre le premier vous prive d'information et peut vous ancrer trop bas. Il vaut mieux comprendre le périmètre et connaître la fourchette, sans pour autant refuser la discussion.",
      difficulty: "easy",
    },
    {
      id: "best-practices-negotiation-2",
      question:
        "L'offre est inférieure à vos attentes. Quelle formulation a le plus de chances d'aboutir ?",
      options: [
        "« C'est trop bas, j'ai une meilleure offre ailleurs. »",
        "« Je prends, mais je continuerai à chercher mieux sur le marché. » pour ne pas perdre cette opportunité",
        "« Je ne discute pas de salaire, c'est à prendre ou à laisser. »",
        "« Vu mon expérience et mes résultats, je visais plutôt X ; que peut-on faire ? »",
      ],
      correctIndex: 3,
      explanation:
        "Argumenter avec votre valeur et proposer un chiffre ouvre la discussion. Un ultimatum ou un bluff ferme la porte et abîme la relation.",
      difficulty: "easy",
    },
    {
      id: "best-practices-negotiation-3",
      question:
        "L'entreprise affirme que sa grille interdit de dépasser 52 k€ de base. Que négocier en priorité ?",
      options: [
        "Prime de bienvenue, télétravail, budget formation et revue de salaire datée, par écrit",
        "Rien : si la base est bloquée, la discussion est terminée et qu'il faut passer à une autre entreprise",
        "Uniquement l'intitulé du poste, qui n'a aucune incidence financière",
        "Une promesse orale d'augmentation dès que possible",
      ],
      correctIndex: 0,
      explanation:
        "La rémunération est un package : quand la base est bloquée, d'autres leviers ont de la valeur. Une promesse orale n'engage personne, c'est l'écrit qui compte.",
      difficulty: "medium",
    },
    {
      id: "best-practices-negotiation-4",
      question:
        "Vous n'avez en réalité aucune autre offre, mais vous aimeriez faire monter l'enchère. Que faites-vous ?",
      options: [
        "Inventer une offre concurrente légèrement supérieure : ce n'est qu'une tactique",
        "Vous appuyer sur des données de marché et vos réalisations, sans mentir",
        "Menacer de retirer votre candidature, même si ce poste vous intéresse",
        "Laisser entendre qu'une offre arrive, sans préciser laquelle",
      ],
      correctIndex: 1,
      explanation:
        "Mentir sur une autre offre est risqué (vérification, perte de confiance) et le guide le déconseille explicitement. Des faits sur le marché et vos résultats forment un argument solide.",
      difficulty: "medium",
    },
    {
      id: "best-practices-negotiation-5",
      question:
        "Vous avez une offre ferme qui expire dans 48 h, et l'entretien final de votre premier choix a lieu la semaine prochaine. Quelle démarche est la meilleure ?",
      options: [
        "Accepter pour sécuriser, quitte à rompre ensuite si l'autre offre arrive ; l'employeur comprendra forcément la situation",
        "Ignorer le délai et attendre l'autre réponse sans prévenir",
        "Remercier, expliquer honnêtement votre situation, demander quelques jours et confirmer par écrit",
        "Prétendre avoir déjà une autre offre ferme pour accélérer la décision",
      ],
      correctIndex: 2,
      explanation:
        "Demander un délai poliment est courant et préserve la relation, surtout si c'est confirmé par écrit. Accepter puis se rétracter ou mentir détruit votre crédibilité.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/best-practices/problem-solving": [
    {
      id: "best-practices-problem-solving-1",
      question:
        "Que faire en premier face à l'énoncé « implémentez une fonction de recherche » ?",
      options: [
        "Coder une recherche binaire, qui est la plus performante dans tous les cas de figure",
        "Écrire des tests de performance avant de connaître les données",
        "Reformuler et clarifier entrées, sorties, taille des données et contraintes",
        "Choisir le langage et la bibliothèque de recherche à utiliser",
      ],
      correctIndex: 2,
      explanation:
        "La recherche binaire suppose des données triées : sans clarification, on peut résoudre le mauvais problème. Comprendre l'énoncé est la première étape de la méthode.",
      difficulty: "easy",
    },
    {
      id: "best-practices-problem-solving-2",
      question:
        "Pour détecter des doublons dans un tableau, quelle approche donne un temps moyen en O(n) ?",
      options: [
        "Parcourir une fois en mémorisant les valeurs déjà vues dans un Set",
        "Comparer chaque élément à tous les autres avec deux boucles imbriquées",
        "Trier le tableau puis comparer chaque élément à son voisin",
        "Appliquer la récursivité sur les deux moitiés du tableau",
      ],
      correctIndex: 0,
      explanation:
        "Le Set donne un O(n) en temps moyen au prix de O(n) en mémoire. Le tri coûte O(n log n), et les deux boucles imbriquées O(n²).",
      difficulty: "easy",
    },
    {
      id: "best-practices-problem-solving-3",
      question:
        "Pour tester une fonction qui convertit une chaîne en entier, quel jeu d'entrées couvre le mieux les cas limites ?",
      options: [
        "\"42\", \"17\", \"100\" et \"2024\"",
        "\"\", null, \" 42 \", \"4x2\", \"-7\" et un nombre dépassant la capacité",
        "Cent entiers positifs tirés au hasard",
        "Les nombres de 1 à 1000, en séquence pour couvrir toute la plage de valeurs possibles",
      ],
      correctIndex: 1,
      explanation:
        "Les cas limites sont l'entrée vide, nulle, avec espaces, invalide, négative ou hors bornes. Des entrées toutes valides et du même type n'exercent que le chemin heureux.",
      difficulty: "medium",
    },
    {
      id: "best-practices-problem-solving-4",
      question:
        "Une requête SQL est lente en production. Quelle démarche est la plus rigoureuse ?",
      options: [
        "Ajouter un index sur toutes les colonnes de la table, par précaution, même si les écritures deviennent plus lentes",
        "Réécrire la requête avec un ORM, qui est toujours plus rapide",
        "Mesurer avec EXPLAIN, indexer les colonnes de filtre ou de jointure, puis remesurer",
        "Doubler la mémoire du serveur de base de données",
      ],
      correctIndex: 2,
      explanation:
        "On optimise à partir d'une mesure, puis on vérifie le gain. Indexer partout ralentit les écritures et n'est pas justifié par une mesure.",
      difficulty: "medium",
    },
    {
      id: "best-practices-problem-solving-5",
      question:
        "Un algorithme diviser pour régner coupe un tableau de taille n en deux moitiés traitées récursivement, puis fusionne en O(n). Quelle est sa complexité ?",
      options: [
        "O(n), car chaque élément n'est parcouru qu'une seule fois",
        "O(n²), car chaque niveau de récursion refait un parcours complet",
        "O(log n), car le tableau est divisé par deux à chaque niveau et que le travail de fusion est négligeable",
        "O(n log n) : log n niveaux de récursion, chacun coûtant O(n) à fusionner",
      ],
      correctIndex: 3,
      explanation:
        "Avec T(n) = 2T(n/2) + O(n), il y a log n niveaux et un travail total de n par niveau. O(log n) ne vaudrait que si l'on ne traitait qu'une seule moitié.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/best-practices/system-design": [
    {
      id: "best-practices-system-design-1",
      question: "Quelle est la première étape d'une démarche de system design ?",
      options: [
        "Choisir la base de données et le broker de messages selon les tendances actuelles du marché",
        "Dessiner l'architecture avec un maximum de composants",
        "Estimer le coût mensuel de l'infrastructure cloud",
        "Clarifier les exigences fonctionnelles et non fonctionnelles (utilisateurs, charge, latence)",
      ],
      correctIndex: 3,
      explanation:
        "Les choix techniques dépendent des exigences : volume, latence et disponibilité. Choisir les outils avant de les connaître est prématuré.",
      difficulty: "easy",
    },
    {
      id: "best-practices-system-design-2",
      question: "Quel est le rôle principal d'un CDN ?",
      options: [
        "Chiffrer les données stockées dans la base de données",
        "Servir assets et médias depuis des serveurs proches des utilisateurs",
        "Répartir les écritures entre plusieurs bases de données",
        "Garantir la cohérence forte entre les réplicas d'une base et empêcher les lectures obsolètes",
      ],
      correctIndex: 1,
      explanation:
        "Un CDN met en cache le contenu au plus près des utilisateurs, ce qui réduit la latence et la charge sur l'origine. Répartir les écritures relève du sharding.",
      difficulty: "easy",
    },
    {
      id: "best-practices-system-design-3",
      question:
        "Une application compte 10 millions d'utilisateurs actifs par jour, chacun faisant 10 requêtes par jour. Quelle estimation de charge est correcte (pic = 3 x moyenne) ?",
      options: [
        "Environ 115 QPS en moyenne et 350 en pointe",
        "Environ 11 600 QPS en moyenne et 35 000 en pointe",
        "Environ 1 200 QPS en moyenne et 3 500 en pointe",
        "Environ 100 millions de QPS, car il y a 100 millions de requêtes",
      ],
      correctIndex: 2,
      explanation:
        "10^8 requêtes par jour / 86 400 secondes donne environ 1 157 QPS, soit environ 3 500 au pic. Confondre jour et seconde donne les autres ordres de grandeur.",
      difficulty: "medium",
    },
    {
      id: "best-practices-system-design-4",
      question:
        "Votre service est lu 100 fois plus qu'il n'est écrit et tolère des données périmées de quelques secondes. Quelle stratégie de cache choisir ?",
      options: [
        "Aucun cache : chaque lecture va en base pour garantir la fraîcheur",
        "Un cache write-through sans TTL, qui conserve les valeurs indéfiniment pour ne jamais lire de valeur périmée",
        "Un cache avec TTL d'une journée pour minimiser les accès à la base",
        "Un cache-aside avec TTL court, en prévoyant une protection contre le cache stampede",
      ],
      correctIndex: 3,
      explanation:
        "Le cache-aside avec un TTL adapté à la tolérance de péremption absorbe l'essentiel des lectures. Un TTL d'une journée dépasse de loin la fraîcheur acceptable.",
      difficulty: "medium",
    },
    {
      id: "best-practices-system-design-5",
      question:
        "Pendant une partition réseau, quel choix est cohérent pour un solde bancaire et pour un compteur de « j'aime » ?",
      options: [
        "Solde en CP, quitte à refuser des opérations ; compteur en AP, à cohérence éventuelle",
        "Les deux en AP : la disponibilité prime toujours sur la cohérence, et corriger les incohérences plus tard",
        "Solde en AP et compteur en CP, car un compteur doit rester exact",
        "Les deux en CA : il suffit d'éviter les partitions réseau",
      ],
      correctIndex: 0,
      explanation:
        "Un solde incohérent a un coût métier élevé, alors qu'un compteur approximatif est acceptable. Dans un système distribué, les partitions sont inévitables : CA n'est pas une option réaliste.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/best-practices/exercises": [
    {
      id: "best-practices-exercises-1",
      question:
        "Que renvoie ce code JavaScript ?\n\nconsole.log(0 == \"\", 0 === \"\")",
      options: [
        "true false",
        "false false",
        "true true",
        "false true",
      ],
      correctIndex: 0,
      explanation:
        "== convertit la chaîne vide en 0 avant de comparer, donc true. === compare sans conversion de type, donc false : c'est pourquoi la revue recommande ===.",
      difficulty: "easy",
    },
    {
      id: "best-practices-exercises-2",
      question:
        "OrderService valide, calcule le total, sauvegarde, envoie un e-mail et journalise. Quel bénéfice concret apporte la séparation des responsabilités ?",
      options: [
        "Le code s'exécute plus vite grâce à des classes plus petites et consomment moins de mémoire",
        "On n'a plus besoin d'écrire de tests unitaires",
        "Le calcul du total se teste sans base de données ni envoi d'e-mail",
        "Les règles métier ne nécessitent plus jamais de modification",
      ],
      correctIndex: 2,
      explanation:
        "Une responsabilité isolée se teste et se modifie indépendamment des autres. Le SRP améliore la maintenabilité, pas les performances d'exécution.",
      difficulty: "easy",
    },
    {
      id: "best-practices-exercises-3",
      question:
        "Ce calcul d'âge est-il correct pour une personne née le 31/12/2000, le 1er janvier 2025 ?\n\nconst age = new Date().getFullYear() - new Date(birthday).getFullYear();",
      options: [
        "Oui, il renvoie toujours l'âge exact",
        "Non, il renvoie 24 alors que la personne a 25 ans",
        "Non, il échoue car getFullYear n'existe pas sur Date dans cet environnement",
        "Non, il renvoie 25 alors que la personne n'a que 24 ans",
      ],
      correctIndex: 3,
      explanation:
        "La différence des années ignore le mois et le jour : avant l'anniversaire, le résultat est trop grand d'une unité. Il faut comparer mois et jour, comme le fait la version corrigée.",
      difficulty: "medium",
    },
    {
      id: "best-practices-exercises-4",
      question:
        "Dans getData, le catch fait console.log(e) puis return null, et data.error provoque aussi un return null. Quel est le problème en revue ?",
      options: [
        "L'appelant ne distingue plus « utilisateur absent » d'une panne : les erreurs sont avalées",
        "console.log est interdit dans le code exécuté côté client par principe, car il ralentit toute l'application",
        "Renvoyer null est plus lent que lever une exception",
        "Un try/catch ne fonctionne pas avec await",
      ],
      correctIndex: 0,
      explanation:
        "Transformer toutes les erreurs en null masque la cause et empêche toute gestion adaptée. Il vaut mieux lever une erreur typée (UserServiceError) portant le statut HTTP.",
      difficulty: "medium",
    },
    {
      id: "best-practices-exercises-5",
      question:
        "On veut ajouter un canal SMS à OrderService, qui appelle directement sendEmail. Quelle conception respecte OCP et DIP ?",
      options: [
        "Ajouter un if (user.prefersSms) dans OrderService.create, pour rester simple plutôt que de créer de nouvelles classes inutilement",
        "Injecter une interface Notifier avec des implémentations Email et SMS, sans modifier OrderService",
        "Créer une sous-classe SmsOrderService qui recopie le code de create",
        "Passer un drapeau booléen sendSms à la méthode createOrder",
      ],
      correctIndex: 1,
      explanation:
        "En dépendant d'une abstraction, on ajoute un canal en créant une classe sans toucher au code existant. Les if et drapeaux obligent à modifier la classe à chaque nouveau canal.",
      difficulty: "hard",
    },
  ],
};
