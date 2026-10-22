import type { AreaExercises } from "./types";

export const practiceExercises: AreaExercises = {
  "/tech-mastry/challenges": [
    {
      id: "practice-challenges-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre la démarche à suivre devant un défi de code avec tests, du début à la soumission.",
      steps: [
        "Lire l'énoncé et les exemples, puis lister les cas limites (entrée vide, un seul élément)",
        "Écrire une solution brute force correcte",
        "Identifier le travail répété et choisir la structure de données qui l'évite",
        "Coder la version optimisée",
        "Lancer chaque test visible, puis soumettre pour passer aussi les tests cachés",
      ],
      explanation:
        "Une solution correcte d'abord, optimisée ensuite : optimiser sans base juste fait perdre du temps. Les tests cachés couvrent surtout les cas limites listés au début.",
    },
    {
      id: "practice-challenges-fill-1",
      type: "fill",
      prompt: "Complétez la solution de Two Sum en O(n) qui mémorise les nombres déjà vus avec leur indice.",
      code: "function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const need = {{1}};\n    if (map.{{2}}(need)) return [map.get(need), i];\n    map.set({{3}}, i);\n  }\n  return [];\n}",
      blanks: [
        { options: ["target + nums[i]", "target - nums[i]", "nums[i] - target"], answer: 1 },
        { options: ["has", "delete", "clear"], answer: 0 },
        { options: ["need", "target", "nums[i]"], answer: 2 },
      ],
      explanation:
        "Le complément est target - nums[i]. On le cherche avec has avant d'insérer le nombre courant, ce qui évite d'utiliser deux fois le même élément.",
    },
  ],

  "/tech-mastry/challenges/solutions": [
    {
      id: "practice-challenges-solutions-match-1",
      type: "match",
      prompt: "Associez chaque problème à la technique de la solution optimale.",
      pairs: [
        { term: "Two Sum", definition: "Table de hachage des compléments" },
        { term: "Valid Parentheses", definition: "Pile LIFO" },
        { term: "Maximum Subarray", definition: "Algorithme de Kadane" },
        { term: "Merge Intervals", definition: "Tri par début puis fusion" },
      ],
      explanation:
        "Chaque technique supprime un travail répété : recherche du complément en O(1), appariement dans l'ordre inverse, meilleure somme se terminant ici, chevauchements rendus voisins par le tri.",
    },
    {
      id: "practice-challenges-solutions-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre les étapes de la solution optimale de Merge Intervals.",
      steps: [
        "Trier les intervalles par début croissant",
        "Placer le premier intervalle dans le résultat",
        "Comparer le début de l'intervalle courant à la fin du dernier du résultat",
        "S'ils se chevauchent, étendre la fin du dernier au maximum des deux fins",
        "Sinon, ajouter l'intervalle courant au résultat",
      ],
      explanation:
        "Le tri est la condition de validité : sans lui, deux intervalles qui se chevauchent ne seraient pas voisins. La fin fusionnée est le maximum des deux, pas simplement celle du nouvel intervalle.",
    },
  ],

  "/tech-mastry/coding-challenges": [
    {
      id: "practice-coding-challenges-classify-1",
      type: "classify",
      prompt: "Rangez chaque énoncé sous le pattern qui le résout le plus naturellement.",
      categories: ["Fenêtre glissante", "Deux pointeurs", "BFS", "Programmation dynamique"],
      items: [
        { text: "Plus longue sous-chaîne sans caractère répété", category: 0 },
        { text: "Sous-tableau de taille k de somme maximale", category: 0 },
        { text: "Deux éléments d'un tableau trié dont la somme vaut la cible", category: 1 },
        { text: "Tester un palindrome en comparant les deux extrémités", category: 1 },
        { text: "Plus court chemin dans une grille sans poids", category: 2 },
        { text: "Nombre minimal de pièces pour un montant donné", category: 3 },
      ],
      explanation:
        "La fenêtre glisse sur une plage contiguë, les deux pointeurs convergent sur une structure ordonnée, le BFS explore par distance croissante, et la DP stocke des sous-problèmes qui se recoupent.",
    },
    {
      id: "practice-coding-challenges-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre la méthode à suivre pendant un entretien de code.",
      steps: [
        "Reformuler l'énoncé et poser des questions sur les contraintes",
        "Dérouler un ou deux exemples à la main",
        "Proposer la brute force et annoncer sa complexité",
        "Optimiser en identifiant le goulot d'étranglement",
        "Coder en expliquant à voix haute",
        "Tester sur un cas limite et annoncer la complexité finale",
      ],
      explanation:
        "Cet ordre montre votre raisonnement avant le code. Coder trop tôt expose à partir sur un malentendu de l'énoncé.",
    },
  ],

  "/tech-mastry/interview-simulation": [
    {
      id: "practice-interview-simulation-match-1",
      type: "match",
      prompt: "Associez chaque lettre de la méthode STAR à ce que doit contenir cette partie de la réponse.",
      pairs: [
        { term: "S - Situation", definition: "Le contexte et l'enjeu du projet" },
        { term: "T - Tâche", definition: "Votre responsabilité précise" },
        { term: "A - Action", definition: "Ce que vous avez fait personnellement" },
        { term: "R - Résultat", definition: "L'impact mesurable obtenu" },
      ],
      explanation:
        "Les recruteurs cherchent votre contribution individuelle (Tâche et Action) et un résultat chiffré. Dire « nous » partout masque ce que vous avez réellement fait.",
    },
    {
      id: "practice-interview-simulation-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre le déroulé d'une question de system design de 30 minutes.",
      steps: [
        "Clarifier les fonctionnalités et les contraintes",
        "Estimer les volumes (requêtes, stockage)",
        "Définir l'API et le modèle de données",
        "Dessiner l'architecture de haut niveau",
        "Approfondir un goulot d'étranglement (cache, partitionnement)",
        "Discuter les compromis et les pannes possibles",
      ],
      explanation:
        "Les chiffres justifient les choix d'architecture, et l'approfondissement se fait sur le point le plus risqué. Annoncer les compromis à la fin montre le recul attendu.",
    },
  ],

  "/tech-mastry/coding-challenges/arrays": [
    {
      id: "practice-coding-challenges-arrays-fill-1",
      type: "fill",
      prompt: "Complétez l'algorithme de Kadane pour la somme maximale d'un sous-tableau contigu.",
      code: "let cur = nums[0];\nlet best = nums[0];\nfor (let i = 1; i < nums.length; i++) {\n  cur = Math.{{1}}(nums[i], cur + nums[i]);\n  best = Math.max(best, {{2}});\n}\nreturn best;",
      blanks: [
        { options: ["min", "max", "abs"], answer: 1 },
        { options: ["cur", "nums[i]", "best + cur"], answer: 0 },
      ],
      explanation:
        "À chaque indice on garde le meilleur entre repartir de nums[i] et prolonger le sous-tableau. Le maximum global se met à jour avec cur, la meilleure somme se terminant ici.",
    },
    {
      id: "practice-coding-challenges-arrays-fill-2",
      type: "fill",
      prompt: "Complétez la plus longue séquence consécutive : on ne compte qu'à partir du début d'une séquence.",
      code: "const set = new Set(nums);\nlet best = 0;\nfor (const n of nums) {\n  if (!set.has({{1}})) {\n    let len = 1;\n    while (set.has(n + {{2}})) len++;\n    best = Math.max(best, len);\n  }\n}\nreturn best;",
      blanks: [
        { options: ["n + 1", "n", "n - 1"], answer: 2 },
        { options: ["1", "len", "best"], answer: 1 },
      ],
      explanation:
        "n - 1 absent signifie que n démarre une séquence. Ensuite n + len est le prochain nombre attendu, car len vaut le nombre d'éléments déjà comptés.",
    },
    {
      id: "practice-coding-challenges-arrays-match-1",
      type: "match",
      prompt: "Associez chaque problème de tableau à la technique adaptée.",
      pairs: [
        { term: "Paire de somme cible, tableau trié", definition: "Deux pointeurs aux extrémités" },
        { term: "Paire de somme cible, tableau non trié", definition: "Table de hachage des compléments" },
        { term: "Somme maximale d'un sous-tableau contigu", definition: "Kadane en un seul passage" },
        { term: "Plus longue séquence consécutive non triée", definition: "Set et départ de séquence" },
      ],
      explanation:
        "Le tri permet les deux pointeurs ; sans tri, la table de hachage évite de trier en O(n log n). Kadane et le Set donnent aussi un temps linéaire.",
    },
  ],

  "/tech-mastry/coding-challenges/strings": [
    {
      id: "practice-coding-challenges-strings-fill-1",
      type: "fill",
      prompt: "Complétez le test de palindrome par deux pointeurs sur la chaîne déjà normalisée t.",
      code: "let i = 0, j = t.length - 1;\nwhile (i {{1}} j) {\n  if (t[i] !== t[{{2}}]) return false;\n  i++;\n  j--;\n}\nreturn true;",
      blanks: [
        { options: ["<", "!==", ">"], answer: 0 },
        { options: ["j", "i + 1", "t.length"], answer: 0 },
      ],
      explanation:
        "Les pointeurs se rapprochent tant que i < j, et on compare le caractère de gauche à celui de droite. t.length est hors limites, i + 1 compare des voisins.",
    },
    {
      id: "practice-coding-challenges-strings-classify-1",
      type: "classify",
      prompt: "Classez chaque traitement de chaîne de longueur n selon sa complexité en temps.",
      categories: ["O(n)", "O(n log n)", "O(n²)"],
      items: [
        { text: "Anagramme par compteur de fréquences", category: 0 },
        { text: "Palindrome par deux pointeurs", category: 0 },
        { text: "Anagramme en triant les deux chaînes", category: 1 },
        { text: "Trier les lettres d'un mot", category: 1 },
        { text: "Comparer chaque caractère à tous les autres", category: 2 },
      ],
      explanation:
        "Un passage unique donne O(n) ; tout tri ajoute un facteur log n ; comparer toutes les paires de positions donne O(n²).",
    },
  ],

  "/tech-mastry/coding-challenges/trees": [
    {
      id: "practice-coding-challenges-trees-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre les étapes du parcours par niveaux (BFS) d'un arbre binaire.",
      steps: [
        "Retourner [] si la racine est nulle",
        "Mettre la racine dans la file",
        "Tant que la file n'est pas vide, mémoriser levelSize = queue.length",
        "Retirer levelSize nœuds et noter leurs valeurs",
        "Ajouter les enfants de chaque nœud retiré à la file",
        "Ajouter la liste du niveau au résultat",
      ],
      explanation:
        "Mémoriser levelSize avant de retirer les nœuds sépare les niveaux : la file grossit avec les enfants ajoutés. La garde sur la racine nulle évite une erreur à l'accès à root.val.",
    },
    {
      id: "practice-coding-challenges-trees-fill-1",
      type: "fill",
      prompt: "Complétez la validation d'un BST par bornes min et max.",
      code: "function isValid(n, min = -Infinity, max = Infinity) {\n  if (!n) return {{1}};\n  if (n.val <= min || n.val >= max) return {{2}};\n  return isValid(n.left, min, n.val) && isValid(n.right, {{3}}, max);\n}",
      blanks: [
        { options: ["true", "false", "null"], answer: 0 },
        { options: ["true", "false", "min"], answer: 1 },
        { options: ["max", "min", "n.val"], answer: 2 },
      ],
      explanation:
        "Un arbre vide est valide. Un nœud hors des bornes invalide l'arbre. À droite, la borne inférieure devient la valeur du nœud courant, et la borne supérieure reste max.",
    },
  ],

  "/tech-mastry/coding-challenges/graphs": [
    {
      id: "practice-coding-challenges-graphs-match-1",
      type: "match",
      prompt: "Associez chaque problème de graphe à l'algorithme adapté.",
      pairs: [
        { term: "Plus court chemin, poids positifs", definition: "Dijkstra avec tas minimum" },
        { term: "Plus court chemin avec poids négatifs", definition: "Bellman-Ford" },
        { term: "Ordonner des tâches avec dépendances", definition: "Tri topologique (Kahn)" },
        { term: "Arbre couvrant de poids minimal", definition: "Kruskal avec Union-Find" },
        { term: "Détecter un cycle orienté", definition: "DFS avec pile de récursion" },
      ],
      explanation:
        "Dijkstra suppose des poids positifs, d'où Bellman-Ford pour les poids négatifs. Kahn exige un graphe sans cycle, et Kruskal a besoin d'Union-Find pour refuser les cycles.",
    },
    {
      id: "practice-coding-challenges-graphs-fill-1",
      type: "fill",
      prompt: "Complétez le DFS qui détecte un cycle dans un graphe orienté.",
      code: "function dfs(node) {\n  visited.add(node);\n  stack.add(node);\n  for (const next of graph[node] || []) {\n    if (!visited.has(next)) {\n      if (dfs(next)) return true;\n    } else if ({{1}}.has(next)) return true;\n  }\n  stack.{{2}}(node);\n  return false;\n}",
      blanks: [
        { options: ["visited", "stack", "graph"], answer: 1 },
        { options: ["delete", "add", "clear"], answer: 0 },
      ],
      explanation:
        "Un cycle existe quand on retombe sur un nœud encore dans la pile de récursion. Il faut retirer le nœud de la pile à la sortie, sinon deux chemins sans cycle seraient pris pour un cycle.",
    },
  ],

  "/tech-mastry/coding-challenges/dp": [
    {
      id: "practice-coding-challenges-dp-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre les étapes de construction d'une solution de programmation dynamique.",
      steps: [
        "Définir l'état : ce que représente dp[i]",
        "Écrire la récurrence entre dp[i] et les états plus petits",
        "Fixer les cas de base",
        "Choisir l'ordre de remplissage (de 1 à n)",
        "Retourner dp[n]",
        "Réduire la mémoire si seules les dernières valeurs servent",
      ],
      explanation:
        "La récurrence découle de la définition de l'état, il faut donc la poser en premier. La réduction de mémoire (deux variables pour House Robber) vient en dernier, une fois la solution correcte.",
    },
    {
      id: "practice-coding-challenges-dp-fill-1",
      type: "fill",
      prompt: "Complétez Coin Change : nombre minimal de pièces pour atteindre amount.",
      code: "const dp = new Array(amount + 1).fill({{1}});\ndp[0] = {{2}};\nfor (let i = 1; i <= amount; i++) {\n  for (const c of coins) {\n    if (i >= c) dp[i] = Math.min(dp[i], dp[{{3}}] + 1);\n  }\n}",
      blanks: [
        { options: ["0", "Infinity", "-1"], answer: 1 },
        { options: ["1", "Infinity", "0"], answer: 2 },
        { options: ["i - c", "i + c", "c"], answer: 0 },
      ],
      explanation:
        "Infinity représente un montant pas encore atteint, et zéro pièce suffit pour le montant 0. Après avoir posé la pièce c, il reste i - c à former.",
    },
  ],

  "/tech-mastry/coding-challenges/system-design": [
    {
      id: "practice-coding-challenges-system-design-match-1",
      type: "match",
      prompt: "Associez chaque besoin de conception à la technique qui y répond.",
      pairs: [
        { term: "Identifiants courts et uniques", definition: "Encodage Base62 d'un compteur" },
        { term: "Lectures massives des mêmes URLs", definition: "Cache Redis en mémoire" },
        { term: "Fil d'actualité d'une célébrité", definition: "Fan-out hybride, lecture à la demande" },
        { term: "Limiter le débit avec rafales bornées", definition: "Token bucket" },
        { term: "Vidéo à débit adaptatif", definition: "HLS ou DASH derrière un CDN" },
      ],
      explanation:
        "Chaque technique répond au goulot du cas : unicité, lecture répétée, écriture explosive, rafales ou bande passante. Retenez le signal avant la solution.",
    },
    {
      id: "practice-coding-challenges-system-design-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre le traitement d'une redirection par le raccourcisseur d'URL.",
      steps: [
        "Le client demande /abc1234 au répartiteur de charge",
        "Le service cherche le code dans le cache Redis",
        "En cas d'absence, il lit l'URL longue en base de données",
        "Il remplit le cache avec l'URL trouvée",
        "Il répond par une redirection HTTP vers l'URL longue",
      ],
      explanation:
        "C'est le schéma cache-aside : lecture du cache, repli sur la base, puis remplissage du cache pour les lectures suivantes. La redirection n'a lieu qu'une fois l'URL connue.",
    },
  ],

  "/tech-mastry/interview-simulation/question-bank": [
    {
      id: "practice-question-bank-classify-1",
      type: "classify",
      prompt: "Rangez chaque question d'entretien dans sa catégorie.",
      categories: ["Algorithmes", "System Design", "Base de données", "Comportemental"],
      items: [
        { text: "Implémenter un cache LRU en O(1)", category: 0 },
        { text: "Expliquer la différence entre BFS et DFS", category: 0 },
        { text: "Concevoir un rate limiter distribué", category: 1 },
        { text: "Expliquer le théorème CAP", category: 1 },
        { text: "Optimiser une requête SQL lente avec EXPLAIN", category: 2 },
        { text: "Choisir entre SQL et NoSQL", category: 2 },
        { text: "Gérer un désaccord technique avec un collègue senior", category: 3 },
        { text: "Décrire un projet dont vous êtes fier", category: 3 },
      ],
      explanation:
        "La banque classe les questions pour cibler la révision. Le choix SQL ou NoSQL relève des bases de données, même s'il intervient aussi en conception.",
    },
    {
      id: "practice-question-bank-match-1",
      type: "match",
      prompt: "Associez chaque pattern à ce qu'il fait.",
      pairs: [
        { term: "Chaînage", definition: "Liste par bucket pour résoudre les collisions" },
        { term: "Saga", definition: "Transactions locales avec compensations" },
        { term: "Outbox", definition: "Événement écrit dans la même transaction que les données" },
        { term: "Cache-aside", definition: "Lecture du cache, puis de la base en cas d'absence" },
        { term: "Token bucket", definition: "Seau de jetons qui autorise des rafales bornées" },
      ],
      explanation:
        "Saga et Outbox traitent la cohérence entre services, cache-aside et token bucket la performance et la protection. Le chaînage est un détail de table de hachage.",
    },
  ],

  "/tech-mastry/system-design/architecture": [
    {
      id: "practice-system-design-architecture-match-1",
      type: "match",
      prompt: "Associez chaque composant du diagramme à son rôle.",
      pairs: [
        { term: "Load Balancer", definition: "Répartit les requêtes entre serveurs identiques" },
        { term: "CDN", definition: "Sert les ressources statiques près de l'utilisateur" },
        { term: "Redis Cache", definition: "Garde en mémoire les données lues souvent" },
        { term: "Read Replica", definition: "Copie de la base qui absorbe les lectures" },
        { term: "API Gateway", definition: "Point d'entrée unique des microservices" },
      ],
      explanation:
        "Le répartiteur et le CDN soulagent le front, le cache et le réplica soulagent la base. La passerelle API centralise l'accès aux services.",
    },
    {
      id: "practice-system-design-architecture-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre le trajet d'une requête de lecture dans le template « Scalable Web Application ».",
      steps: [
        "Le navigateur envoie la requête au répartiteur de charge",
        "Le répartiteur choisit un serveur applicatif",
        "Le serveur interroge d'abord Redis",
        "En cas d'absence, il lit la base via un réplica",
        "Le serveur renvoie la réponse au client",
      ],
      explanation:
        "Le cache est consulté avant la base pour éviter une lecture coûteuse, et les lectures vont au réplica pour décharger le maître.",
    },
  ],

  "/tech-mastry/algorithms/visualizations": [
    {
      id: "practice-algorithms-visualizations-classify-1",
      type: "classify",
      prompt: "Classez chaque tri selon sa complexité en temps dans le cas moyen.",
      categories: ["O(n²)", "O(n log n)"],
      items: [
        { text: "Tri à bulles", category: 0 },
        { text: "Tri par sélection", category: 0 },
        { text: "Tri par insertion", category: 0 },
        { text: "Tri fusion", category: 1 },
        { text: "Tri rapide", category: 1 },
        { text: "Tri par tas", category: 1 },
      ],
      explanation:
        "Les tris simples comparent beaucoup de paires et sont quadratiques. Les tris récursifs ou par tas atteignent n log n, le tri rapide ne dégénérant en O(n²) que dans le pire cas.",
    },
    {
      id: "practice-algorithms-visualizations-fill-1",
      type: "fill",
      prompt: "Complétez le tri par insertion : chaque élément est glissé à sa place dans la partie déjà triée.",
      code: "for (let i = 1; i < a.length; i++) {\n  const key = a[i];\n  let j = i - 1;\n  while (j >= 0 && a[j] {{1}} key) {\n    a[j + 1] = a[j];\n    j--;\n  }\n  a[{{2}}] = key;\n}",
      blanks: [
        { options: ["<", ">", "==="], answer: 1 },
        { options: ["j", "i", "j + 1"], answer: 2 },
      ],
      explanation:
        "On décale vers la droite tout élément plus grand que key. À la sortie de la boucle, j pointe sur l'élément précédent la bonne place : key se range en j + 1.",
    },
  ],

  "/tech-mastry/qa": [
    {
      id: "practice-qa-match-1",
      type: "match",
      prompt: "Associez chaque propriété ACID à sa garantie.",
      pairs: [
        { term: "Atomicité", definition: "La transaction s'exécute entièrement ou pas du tout" },
        { term: "Cohérence", definition: "Les contraintes d'intégrité restent respectées" },
        { term: "Isolation", definition: "Les transactions concurrentes n'interfèrent pas" },
        { term: "Durabilité", definition: "Les données validées survivent à une panne" },
      ],
      explanation:
        "Les quatre garanties visent des risques distincts : erreur à mi-parcours, données invalides, accès concurrents et panne. On les confond souvent entre elles en entretien.",
    },
    {
      id: "practice-qa-classify-1",
      type: "classify",
      prompt: "Rangez chaque mesure de sécurité sous l'attaque qu'elle prévient d'abord.",
      categories: ["XSS", "Injection SQL", "CSRF"],
      items: [
        { text: "Encoder la sortie HTML selon son contexte", category: 0 },
        { text: "Content Security Policy", category: 0 },
        { text: "Requêtes paramétrées", category: 1 },
        { text: "Ne jamais concaténer l'entrée dans une requête", category: 1 },
        { text: "Cookies avec SameSite", category: 2 },
        { text: "Jeton anti-CSRF dans les formulaires", category: 2 },
      ],
      explanation:
        "Chaque attaque exploite un point différent : l'affichage non encodé, le mélange de données et de code SQL, ou l'envoi automatique des cookies par le navigateur.",
    },
  ],
};
