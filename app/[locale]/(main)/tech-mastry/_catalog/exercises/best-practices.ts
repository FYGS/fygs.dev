import type { AreaExercises } from "./types";

export const bestPracticesExercises: AreaExercises = {
  "/tech-mastry/best-practices/code-quality": [
    {
      id: "best-practices-code-quality-classify-1",
      type: "classify",
      prompt: "Classez ces commentaires selon leur utilité.",
      categories: ["Commentaire utile", "Commentaire inutile"],
      items: [
        { text: "// Le partenaire plafonne à 100 requêtes par minute", category: 0 },
        { text: "// Incrémente i", category: 1 },
        { text: "// Boucle sur les items", category: 1 },
        { text: "// Arrondi à l'inférieur : exigence légale sur les remises", category: 0 },
        { text: "// Contourne un bug connu de Safari 16", category: 0 },
        { text: "// Calcule le total", category: 1 },
      ],
      explanation:
        "Un commentaire utile apporte le pourquoi (contrainte, choix, piège) que le code ne dit pas. Ceux qui répètent le code vieillissent mal et n'apprennent rien.",
    },
    {
      id: "best-practices-code-quality-order-1",
      type: "order",
      prompt: "Ordonnez un refactoring sûr d'une longue fonction sans test.",
      steps: [
        "Écrire des tests de caractérisation du comportement actuel",
        "Extraire une première petite fonction",
        "Relancer les tests",
        "Commiter ce petit pas",
        "Renommer et supprimer le code mort",
      ],
      explanation:
        "Les tests garantissent que le comportement ne change pas, et chaque petit pas commité permet de revenir en arrière. Tout réécrire d'un coup fait perdre cette sécurité.",
    },
  ],
  "/tech-mastry/best-practices/communication": [
    {
      id: "best-practices-communication-order-1",
      type: "order",
      prompt: "Ordonnez le déroulé d'une réponse à un problème d'entretien technique.",
      steps: [
        "Reformuler et clarifier les contraintes",
        "Annoncer l'approche et ses compromis",
        "Coder en expliquant ses choix",
        "Tester sur un exemple et des cas limites",
        "Discuter la complexité et les optimisations",
      ],
      explanation:
        "Clarifier avant de coder évite de résoudre le mauvais problème, et expliquer son raisonnement le rend évaluable. Les optimisations se discutent une fois la solution correcte.",
    },
    {
      id: "best-practices-communication-classify-1",
      type: "classify",
      prompt: "Classez ces comportements en entretien.",
      categories: ["À faire", "À éviter"],
      items: [
        { text: "Poser des questions sur les cas limites et les contraintes", category: 0 },
        { text: "Coder plusieurs minutes en silence", category: 1 },
        { text: "Annoncer les compromis avant de choisir", category: 0 },
        { text: "Supposer que vous connaissez tous les détails", category: 1 },
        { text: "Demander les exigences non fonctionnelles", category: 0 },
        { text: "Poser une question dont la réponse est évidente", category: 1 },
      ],
      explanation:
        "Les bonnes pratiques rendent le raisonnement visible et ciblent les vraies zones d'incertitude. Le silence et les suppositions cachent vos compétences ou vous font résoudre un autre problème.",
    },
  ],
  "/tech-mastry/best-practices/design-patterns": [
    {
      id: "best-practices-design-patterns-match-1",
      type: "match",
      prompt: "Associez chaque pattern au problème qu'il résout.",
      pairs: [
        { term: "Strategy", definition: "Rend interchangeables des algorithmes derrière une interface commune" },
        { term: "Adapter", definition: "Traduit une interface incompatible vers celle attendue" },
        { term: "Decorator", definition: "Ajoute des comportements en enveloppant un objet de même interface" },
        { term: "Observer", definition: "Prévient des abonnés quand l'état d'un objet change" },
        { term: "Proxy", definition: "Substitut qui contrôle l'accès : cache, lazy loading, droits" },
        { term: "Builder", definition: "Construit un objet complexe étape par étape" },
      ],
      explanation:
        "Decorator et Proxy gardent la même interface : le premier enrichit le comportement, le second contrôle l'accès. Adapter est le seul qui change d'interface.",
    },
    {
      id: "best-practices-design-patterns-classify-1",
      type: "classify",
      prompt: "Rangez chaque pattern dans sa famille GoF.",
      categories: ["Création", "Structurel", "Comportemental"],
      items: [
        { text: "Singleton", category: 0 },
        { text: "Builder", category: 0 },
        { text: "Adapter", category: 1 },
        { text: "Decorator", category: 1 },
        { text: "Proxy", category: 1 },
        { text: "Observer", category: 2 },
        { text: "Strategy", category: 2 },
      ],
      explanation:
        "Les patterns de création gèrent l'instanciation, les structurels l'assemblage des objets, les comportementaux leurs interactions. Observer et Strategy portent sur la façon dont les objets communiquent ou se délèguent un comportement.",
    },
  ],
  "/tech-mastry/best-practices/negotiation": [
    {
      id: "best-practices-negotiation-order-1",
      type: "order",
      prompt: "Ordonnez les étapes d'une négociation salariale bien menée.",
      steps: [
        "Rechercher les salaires du marché pour le poste",
        "Définir votre fourchette à partir de ces données",
        "Attendre une offre ferme avant de négocier",
        "Répondre en argumentant sur votre valeur avec un chiffre",
        "Prendre un délai pour réfléchir aux contreparties",
        "Obtenir les termes finaux par écrit",
      ],
      explanation:
        "La préparation donne des arguments, et on négocie sur une offre ferme plutôt qu'en l'air. L'écrit final protège les deux parties des malentendus.",
    },
    {
      id: "best-practices-negotiation-classify-1",
      type: "classify",
      prompt: "Classez ces phrases selon leur effet probable dans une négociation.",
      categories: ["Constructive", "À éviter"],
      items: [
        { text: "Vu mon expérience et mes résultats, je visais plutôt X", category: 0 },
        { text: "C'est trop bas, j'ai une meilleure offre ailleurs", category: 1 },
        { text: "Pouvons-nous parler de formation et d'évolution ?", category: 0 },
        { text: "Je veux uniquement parler du salaire de base", category: 1 },
        { text: "J'aimerais d'abord mieux comprendre le périmètre du poste", category: 0 },
        { text: "Je prétends avoir une autre offre pour faire monter l'enchère", category: 1 },
      ],
      explanation:
        "Les phrases constructives s'appuient sur des faits et ouvrent la discussion à tout le package. Ultimatums et bluffs abîment la confiance, surtout s'ils sont vérifiables.",
    },
  ],
  "/tech-mastry/best-practices/problem-solving": [
    {
      id: "best-practices-problem-solving-order-1",
      type: "order",
      prompt: "Ordonnez la méthode de résolution d'un problème algorithmique.",
      steps: [
        "Reformuler le problème : entrées, sorties, contraintes",
        "Comparer plusieurs approches et leurs compromis",
        "Implémenter l'approche retenue",
        "Tester les cas limites : vide, null, doublons",
        "Optimiser après avoir mesuré",
      ],
      explanation:
        "On comprend et on compare avant de coder, puis on teste les cas limites. Optimiser en dernier évite l'optimisation prématurée d'une solution qui n'est pas encore correcte.",
    },
    {
      id: "best-practices-problem-solving-match-1",
      type: "match",
      prompt: "Associez chaque approche pour trouver des doublons à sa complexité.",
      pairs: [
        { term: "Parcours avec un Set", definition: "O(n) en temps, O(n) en mémoire" },
        { term: "Tri puis comparaison des voisins", definition: "O(n log n) en temps" },
        { term: "Deux boucles imbriquées", definition: "O(n²) en temps" },
        { term: "Recherche binaire dans un tableau trié", definition: "O(log n) par recherche" },
      ],
      explanation:
        "Le Set échange de la mémoire contre du temps, le tri coûte O(n log n) et la force brute O(n²). La recherche binaire n'est valable que sur des données déjà triées.",
    },
    {
      id: "best-practices-problem-solving-match-2",
      type: "match",
      prompt: "Associez chaque lettre de la méthode STAR à ce qu'elle doit contenir.",
      pairs: [
        { term: "Situation", definition: "Le contexte du problème" },
        { term: "Task", definition: "L'objectif à atteindre" },
        { term: "Action", definition: "Ce que vous avez fait concrètement" },
        { term: "Result", definition: "Ce qui a été obtenu, si possible chiffré" },
      ],
      explanation:
        "STAR structure une réponse comportementale du contexte au résultat. L'erreur fréquente est de décrire longuement la situation et d'oublier le résultat.",
    },
  ],
  "/tech-mastry/best-practices/system-design": [
    {
      id: "best-practices-system-design-order-1",
      type: "order",
      prompt: "Ordonnez les six étapes d'une démarche de system design.",
      steps: [
        "Clarifier les exigences",
        "Faire les estimations de charge",
        "Concevoir l'API",
        "Modéliser les données",
        "Dessiner l'architecture générale",
        "Approfondir goulots et compromis",
      ],
      explanation:
        "Les exigences et la charge guident les choix d'API, de modèle de données puis d'architecture. Plonger dans les détails avant le schéma global fait perdre le fil.",
    },
    {
      id: "best-practices-system-design-match-1",
      type: "match",
      prompt: "Associez chaque brique d'architecture à son rôle.",
      pairs: [
        { term: "Load balancer", definition: "Répartit le trafic entre plusieurs serveurs" },
        { term: "CDN", definition: "Sert les contenus statiques depuis des points proches des utilisateurs" },
        { term: "Cache-aside", definition: "L'application lit le cache puis la base si absent, et remplit le cache" },
        { term: "File de messages", definition: "Découple producteurs et consommateurs par échange asynchrone" },
        { term: "Sharding", definition: "Répartit les données horizontalement entre plusieurs bases" },
      ],
      explanation:
        "Chaque brique cible un goulot précis : trafic, latence, lecture, couplage ou volume de données. Le sharding, contrairement aux réplicas de lecture, répartit aussi les écritures.",
    },
    {
      id: "best-practices-system-design-fill-1",
      type: "fill",
      prompt: "Complétez l'estimation de charge pour 10 millions d'utilisateurs actifs par jour.",
      code: "DAU = 10_000_000\nrequests_per_day = 10\nqps = DAU * requests_per_day / {{1}}\npeak_qps = qps * {{2}}",
      blanks: [
        { options: ["3600", "86400", "1440", "1000"], answer: 1 },
        { options: ["1", "3", "86400"], answer: 1 },
      ],
      explanation:
        "Un jour compte 86 400 secondes, d'où environ 1 157 QPS en moyenne ; on dimensionne pour le pic, ici avec un facteur 3. Diviser par 3 600 donnerait une charge par heure, pas par seconde.",
    },
  ],
  "/tech-mastry/best-practices/exercises": [
    {
      id: "best-practices-exercises-order-1",
      type: "order",
      prompt: "Ordonnez le refactoring d'un OrderService qui viole le SRP.",
      steps: [
        "Identifier les responsabilités mélangées",
        "Extraire OrderValidator et PriceCalculator",
        "Définir une interface Notifier",
        "Injecter les dépendances dans le constructeur d'OrderService",
        "Tester chaque classe isolément",
      ],
      explanation:
        "On repère d'abord les responsabilités, on les extrait, puis on injecte les dépendances pour que chaque pièce se teste seule. Injecter avant d'avoir extrait n'aurait rien à injecter.",
    },
    {
      id: "best-practices-exercises-fill-1",
      type: "fill",
      prompt: "Complétez cette version corrigée de getUser.",
      code: "async function getUser(id: string): Promise<User> {\n  const safeId = {{1}}(id);\n  const res = await fetch(\"/api/users/\" + safeId);\n  if (!res.{{2}}) throw new UserServiceError(res.statusText, res.status);\n  const data = await res.json();\n  return { isAdmin: data.role {{3}} \"admin\" };\n}",
      blanks: [
        { options: ["escape", "encodeURIComponent", "JSON.stringify", "String"], answer: 1 },
        { options: ["json", "ok", "redirected"], answer: 1 },
        { options: ["==", "=", "==="], answer: 2 },
      ],
      explanation:
        "encodeURIComponent protège l'URL d'un identifiant malveillant, res.ok détecte les erreurs HTTP au lieu de les avaler, et === évite les conversions implicites de ==. Un simple = serait une affectation.",
    },
    {
      id: "best-practices-exercises-classify-1",
      type: "classify",
      prompt: "En revue de code, classez chaque élément.",
      categories: ["À corriger", "Acceptable"],
      items: [
        { text: "catch (e) { console.log(e); return null; }", category: 0 },
        { text: "data.role == \"admin\"", category: 0 },
        { text: "Un constructeur qui reçoit ses dépendances", category: 1 },
        { text: "Une classe qui valide, calcule, sauvegarde et envoie un e-mail", category: 0 },
        { text: "Une erreur typée UserServiceError avec statusCode", category: 1 },
        { text: "Une fonction calculateAge extraite et testée", category: 1 },
      ],
      explanation:
        "Un catch qui renvoie null masque la cause, == convertit les types et une classe à cinq responsabilités ne se teste pas. L'injection, les erreurs typées et les fonctions extraites sont les corrections attendues.",
    },
  ],
};
