import type { AreaExercises } from "./types";

export const algorithmsExercises: AreaExercises = {
  "/tech-mastry/algorithms/complexity": [
    {
      id: "algorithms-complexity-classify-1",
      type: "classify",
      prompt: "Rangez chaque opération dans sa classe de complexité.",
      categories: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
      items: [
        { text: "Lire arr[i] dans un tableau", category: 0 },
        { text: "Recherche binaire dans un tableau trié", category: 1 },
        { text: "Trouver le maximum d'un tableau non trié", category: 2 },
        { text: "Comparer toutes les paires d'éléments", category: 3 },
        { text: "Ajouter avec push() (coût amorti)", category: 0 },
        { text: "Diviser n par 2 jusqu'à atteindre 1", category: 1 },
      ],
      explanation:
        "Une opération qui divise le problème par deux à chaque étape est logarithmique, un parcours unique est linéaire et un double parcours est quadratique. La tentation est de classer le push() en O(n) à cause des réallocations, mais elles sont rares, donc amorties.",
    },
    {
      id: "algorithms-complexity-match-1",
      type: "match",
      prompt: "Associez chaque ordre de croissance à l'exemple typique correspondant.",
      pairs: [
        { term: "Temps constant", definition: "Accès à arr[i]" },
        { term: "Logarithmique", definition: "Recherche binaire" },
        { term: "Linéaire", definition: "Parcours complet d'un tableau" },
        { term: "Quadratique", definition: "Deux boucles imbriquées sur n" },
      ],
      explanation:
        "L'ordre de croissance décrit comment le coût évolue quand n grandit : fixe, divisé par deux à chaque étape, proportionnel à n, ou proportionnel à n². Deux boucles consécutives restent linéaires, seules les boucles imbriquées donnent n².",
    },
    {
      id: "algorithms-complexity-fill-1",
      type: "fill",
      prompt: "Complétez la boucle pour qu'elle soit logarithmique, puis donnez sa complexité.",
      code: "// i double à chaque tour\nfor (let i = 1; i < n; i {{1}} 2) {\n  work();\n}\n// complexité : {{2}}",
      blanks: [
        { options: ["+=", "-=", "*="], answer: 2 },
        { options: ["O(n)", "O(log n)", "O(n²)"], answer: 1 },
      ],
      explanation:
        "Multiplier i par 2 atteint n en environ log₂(n) tours. Avec i += 2, la boucle ferait n/2 tours, donc resterait en O(n) : les constantes ne changent pas la classe.",
    },
  ],

  "/tech-mastry/algorithms/sorting": [
    {
      id: "algorithms-sorting-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre les étapes du tri fusion.",
      steps: [
        "Si le tableau a 0 ou 1 élément, le retourner (cas de base)",
        "Couper le tableau en deux moitiés",
        "Trier récursivement la moitié gauche",
        "Trier récursivement la moitié droite",
        "Fusionner les deux moitiés triées en comparant leurs premiers éléments",
      ],
      explanation:
        "Le cas de base arrête la récursion, puis on trie chaque moitié avant de les fusionner. Le travail de comparaison se fait dans la fusion, en O(n) par niveau, d'où O(n log n) au total.",
    },
    {
      id: "algorithms-sorting-classify-1",
      type: "classify",
      prompt: "Ces tris sont-ils stables (ordre des égaux conservé) ou instables ?",
      categories: ["Stable", "Instable"],
      items: [
        { text: "Tri fusion", category: 0 },
        { text: "Tri par insertion", category: 0 },
        { text: "Tri à bulles", category: 0 },
        { text: "Tri rapide en place", category: 1 },
        { text: "Tri par tas", category: 1 },
        { text: "Tri par sélection", category: 1 },
      ],
      explanation:
        "Fusion, insertion et bulles ne font jamais passer un élément au-dessus d'un égal. Sélection, tas et tri rapide en place échangent des éléments éloignés, ce qui peut inverser l'ordre de doublons.",
    },
    {
      id: "algorithms-sorting-fill-1",
      type: "fill",
      prompt: "Complétez ce tri rapide fonctionnel (version non en place).",
      code: "function quick(a) {\n  if (a.length {{1}} 1) return a;\n  const pivot = a[a.length >> 1];\n  const left = a.filter(x => x {{2}} pivot);\n  const mid = a.filter(x => x === pivot);\n  const right = a.filter(x => x > pivot);\n  return [...quick(left), ...mid, ...quick({{3}})];\n}",
      blanks: [
        { options: ["===", ">=", "<="], answer: 2 },
        { options: ["<=", "<", ">"], answer: 1 },
        { options: ["left", "right", "mid"], answer: 1 },
      ],
      explanation:
        "Le cas de base doit inclure le tableau vide (<= 1), sinon la récursion ne s'arrête pas. Comme mid regroupe déjà les égaux, left doit être strictement inférieur, et la dernière partie à trier récursivement est right.",
    },
  ],

  "/tech-mastry/algorithms/searching": [
    {
      id: "algorithms-searching-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre les étapes de la recherche binaire.",
      steps: [
        "Initialiser lo = 0 et hi = n - 1",
        "Tant que lo <= hi, calculer le milieu mid",
        "Si a[mid] vaut la cible, retourner mid",
        "Sinon, réduire l'intervalle de moitié (lo = mid + 1 ou hi = mid - 1)",
        "Si lo dépasse hi, retourner -1 : la cible est absente",
      ],
      explanation:
        "L'intervalle de recherche rétrécit à chaque tour jusqu'à contenir la cible ou être vide. Oublier le +1 ou le -1 sur les bornes est l'erreur classique qui provoque une boucle infinie.",
    },
    {
      id: "algorithms-searching-fill-1",
      type: "fill",
      prompt: "Complétez la recherche binaire sur un tableau trié.",
      code: "let lo = 0, hi = a.length - 1;\nwhile (lo {{1}} hi) {\n  const mid = (lo + hi) >> 1;\n  if (a[mid] === x) return mid;\n  if (a[mid] < x) lo = {{2}};\n  else hi = {{3}};\n}\nreturn -1;",
      blanks: [
        { options: ["<", "<=", ">="], answer: 1 },
        { options: ["mid - 1", "mid", "mid + 1"], answer: 2 },
        { options: ["mid - 1", "mid", "mid + 1"], answer: 0 },
      ],
      explanation:
        "Avec hi = n - 1 (borne incluse), il faut <= pour examiner un intervalle d'un seul élément. mid est déjà écarté, donc lo = mid + 1 et hi = mid - 1 ; sans cela l'intervalle peut ne plus rétrécir.",
    },
    {
      id: "algorithms-searching-classify-1",
      type: "classify",
      prompt: "Attribuez chaque propriété à la recherche linéaire ou à la recherche binaire.",
      categories: ["Recherche linéaire", "Recherche binaire"],
      items: [
        { text: "Fonctionne sur des données non triées", category: 0 },
        { text: "Exige un tableau trié", category: 1 },
        { text: "O(n) dans le pire cas", category: 0 },
        { text: "O(log n) dans le pire cas", category: 1 },
        { text: "Utilisable sur une liste chaînée", category: 0 },
        { text: "Divise l'intervalle par deux à chaque comparaison", category: 1 },
      ],
      explanation:
        "La recherche binaire a besoin d'un tri préalable et d'un accès direct au milieu, ce qui exclut la liste chaînée. La recherche linéaire n'a aucune exigence, au prix de O(n).",
    },
  ],

  "/tech-mastry/algorithms/data-structures": [
    {
      id: "algorithms-data-structures-match-1",
      type: "match",
      prompt: "Associez chaque structure à sa caractéristique principale.",
      pairs: [
        { term: "Tableau", definition: "Accès par indice en O(1)" },
        { term: "Liste chaînée", definition: "Insertion en tête en O(1)" },
        { term: "Table de hachage", definition: "Recherche par clé en O(1) en moyenne" },
        { term: "Pile", definition: "Dernier entré, premier sorti" },
        { term: "File", definition: "Premier entré, premier sorti" },
      ],
      explanation:
        "Chaque structure rend certaines opérations bon marché : l'indice pour le tableau, la tête pour la liste, la clé pour le hachage. Pile et file se distinguent uniquement par l'ordre de sortie.",
    },
    {
      id: "algorithms-data-structures-classify-1",
      type: "classify",
      prompt: "Quelles opérations sont en temps constant et lesquelles en temps linéaire ?",
      categories: ["O(1)", "O(n)"],
      items: [
        { text: "Lire arr[i] dans un tableau", category: 0 },
        { text: "Insérer au début d'un tableau", category: 1 },
        { text: "Insérer en tête d'une liste chaînée", category: 0 },
        { text: "Accéder au k-ième noeud d'une liste chaînée", category: 1 },
        { text: "get dans une table de hachage (cas moyen)", category: 0 },
        { text: "Chercher une valeur dans un tableau non trié", category: 1 },
      ],
      explanation:
        "L'insertion en tête décale tout un tableau (O(n)) mais ne modifie que des pointeurs dans une liste. À l'inverse, la liste doit suivre k pointeurs pour atteindre le k-ième noeud.",
    },
    {
      id: "algorithms-data-structures-fill-1",
      type: "fill",
      prompt: "Complétez la détection de doublons avec un Set.",
      code: "const seen = new Set();\nfor (const x of a) {\n  if (seen.{{1}}(x)) return true;\n  seen.{{2}}(x);\n}\nreturn false;",
      blanks: [
        { options: ["add", "has", "push"], answer: 1 },
        { options: ["push", "set", "add"], answer: 2 },
      ],
      explanation:
        "On teste l'appartenance avec has() avant d'ajouter avec add() : un Set n'a ni push ni set. Le tout est en O(n) en temps au prix de O(n) de mémoire.",
    },
  ],

  "/tech-mastry/algorithms/greedy": [
    {
      id: "algorithms-greedy-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre l'algorithme glouton de sélection d'activités.",
      steps: [
        "Trier les activités par heure de fin croissante",
        "Retenir la première activité",
        "Parcourir les activités suivantes dans l'ordre",
        "Retenir une activité si son début est >= à la fin de la dernière retenue",
        "Mettre à jour la fin de la dernière activité retenue",
      ],
      explanation:
        "Le tri par fin est l'étape clé : l'activité qui finit le plus tôt laisse le plus de temps libre. Trier par durée ou par début n'est pas prouvé optimal.",
    },
    {
      id: "algorithms-greedy-fill-1",
      type: "fill",
      prompt: "Complétez la boucle de sélection (activités déjà triées par fin).",
      code: "let last = activities[0].end;\nconst chosen = [activities[0]];\nfor (const act of activities.slice(1)) {\n  if (act.start {{1}} last) {\n    chosen.push(act);\n    last = act.{{2}};\n  }\n}",
      blanks: [
        { options: [">=", "<=", "<"], answer: 0 },
        { options: ["start", "end", "duration"], answer: 1 },
      ],
      explanation:
        "Une activité est compatible si elle commence après (ou à) la fin de la précédente. On retient ensuite sa fin, pas son début, car c'est elle qui limite les choix suivants.",
    },
    {
      id: "algorithms-greedy-classify-1",
      type: "classify",
      prompt: "La stratégie gloutonne est-elle correcte, ou faut-il la programmation dynamique ?",
      categories: ["Glouton correct", "Programmation dynamique nécessaire"],
      items: [
        { text: "Sélection d'activités (tri par fin)", category: 0 },
        { text: "Codage de Huffman", category: 0 },
        { text: "Arbre couvrant minimum de Kruskal", category: 0 },
        { text: "Sac à dos fractionnaire", category: 0 },
        { text: "Sac à dos 0/1", category: 1 },
        { text: "Rendu de monnaie avec les pièces {1, 3, 4}", category: 1 },
      ],
      explanation:
        "Le glouton est correct quand le choix local est prouvé sûr. Pour le sac à dos 0/1 ou des pièces {1, 3, 4}, le meilleur choix local peut mener à une solution moins bonne (pour 6 : 4+1+1 au lieu de 3+3).",
    },
  ],

  "/tech-mastry/algorithms/backtracking": [
    {
      id: "algorithms-backtracking-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre le canevas d'un algorithme de backtracking.",
      steps: [
        "Si la solution partielle est complète, en enregistrer une copie et retourner",
        "Pour chaque choix possible à cette étape",
        "Ignorer le choix s'il viole une contrainte (élagage)",
        "Ajouter le choix à la solution partielle",
        "Appeler récursivement pour l'étape suivante",
        "Retirer le choix pour restaurer l'état avant d'essayer le suivant",
      ],
      explanation:
        "Le schéma est choisir, explorer, annuler. Oublier d'annuler laisse des choix résiduels dans l'état, et enregistrer la solution sans la copier la ferait modifier après coup.",
    },
    {
      id: "algorithms-backtracking-fill-1",
      type: "fill",
      prompt: "Complétez la génération des permutations de a (n éléments).",
      code: "function permute(path, used) {\n  if (path.length === n) { res.push({{1}}); return; }\n  for (let i = 0; i < n; i++) {\n    if (used[i]) continue;\n    used[i] = true; path.push(a[i]);\n    permute(path, used);\n    path.{{2}}(); used[i] = {{3}};\n  }\n}",
      blanks: [
        { options: ["path", "[...path]", "path.length"], answer: 1 },
        { options: ["shift", "splice", "pop"], answer: 2 },
        { options: ["false", "true", "null"], answer: 0 },
      ],
      explanation:
        "On enregistre une copie de path, sinon toutes les entrées de res pointent vers le même tableau, vidé par le retour en arrière. L'annulation retire le dernier élément ajouté (pop) et remet used[i] à false.",
    },
    {
      id: "algorithms-backtracking-classify-1",
      type: "classify",
      prompt: "Combien de candidats l'espace de recherche contient-il : 2ⁿ ou n! ?",
      categories: ["2ⁿ candidats", "n! candidats"],
      items: [
        { text: "Tous les sous-ensembles de n éléments", category: 0 },
        { text: "Toutes les permutations de n éléments", category: 1 },
        { text: "Toutes les chaînes binaires de longueur n", category: 0 },
        { text: "Tous les ordres de visite de n villes", category: 1 },
        { text: "Chaque élément est pris ou non pris", category: 0 },
        { text: "Toutes les façons d'ordonner n tâches", category: 1 },
      ],
      explanation:
        "Un choix binaire par élément donne 2ⁿ ; un ordre de n éléments donne n × (n-1) × … × 1 = n!. L'élagage réduit les noeuds visités mais ne change pas ces bornes dans le pire cas.",
    },
  ],

  "/tech-mastry/algorithms/graph-algorithms": [
    {
      id: "algorithms-graph-algorithms-match-1",
      type: "match",
      prompt: "Associez chaque problème à l'algorithme adapté.",
      pairs: [
        { term: "Plus court chemin sans poids", definition: "BFS" },
        { term: "Plus court chemin, poids positifs", definition: "Dijkstra" },
        { term: "Plus court chemin, poids négatifs possibles", definition: "Bellman-Ford" },
        { term: "Ordonner des dépendances sans cycle", definition: "Tri topologique" },
        { term: "Relier tous les noeuds au moindre coût", definition: "Kruskal ou Prim" },
      ],
      explanation:
        "Le choix dépend des poids : BFS sans poids, Dijkstra avec poids positifs, Bellman-Ford dès qu'un poids est négatif. Le tri topologique ordonne un DAG, Kruskal et Prim construisent un arbre couvrant minimum.",
    },
    {
      id: "algorithms-graph-algorithms-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre les étapes de l'algorithme de Dijkstra.",
      steps: [
        "Initialiser dist[source] = 0 et les autres distances à l'infini",
        "Insérer la source dans une file de priorité",
        "Extraire le sommet u de plus petite distance",
        "Pour chaque voisin v, tester si dist[u] + poids < dist[v]",
        "Si oui, mettre à jour dist[v] et l'insérer dans la file",
      ],
      explanation:
        "On extrait toujours le sommet le plus proche, puis on relaxe ses arêtes sortantes. Cela n'est correct que si les poids sont positifs, car une distance extraite est alors définitive.",
    },
    {
      id: "algorithms-graph-algorithms-fill-1",
      type: "fill",
      prompt: "Complétez ce BFS qui calcule les distances depuis start.",
      code: "const dist = new Map([[start, 0]]);\nconst queue = [start];\nwhile (queue.length) {\n  const u = queue.{{1}}();\n  for (const v of graph[u]) {\n    if (!dist.{{2}}(v)) {\n      dist.set(v, dist.get(u) + 1);\n      queue.push(v);\n    }\n  }\n}",
      blanks: [
        { options: ["pop", "shift", "push"], answer: 1 },
        { options: ["delete", "get", "has"], answer: 2 },
      ],
      explanation:
        "Une file retire par l'avant (shift) ce qui a été ajouté par l'arrière ; pop donnerait un DFS. dist.has(v) sert aussi d'ensemble de visités, ce qui garantit que chaque noeud n'entre qu'une fois.",
    },
  ],

  "/tech-mastry/algorithms/dynamic-programming": [
    {
      id: "algorithms-dynamic-programming-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre la démarche pour concevoir une solution en programmation dynamique.",
      steps: [
        "Repérer les sous-problèmes qui se chevauchent",
        "Définir l'état : ce que représente dp[i]",
        "Écrire la relation de récurrence",
        "Fixer les cas de base",
        "Remplir la table dans un ordre où les dépendances sont déjà calculées",
        "Lire la réponse dans la case finale",
      ],
      explanation:
        "Tout part de la définition précise de l'état, car la récurrence en découle. Remplir la table avant d'avoir fixé les cas de base ou l'ordre de dépendance donne des valeurs fausses.",
    },
    {
      id: "algorithms-dynamic-programming-fill-1",
      type: "fill",
      prompt: "Complétez Fibonacci avec mémoïsation.",
      code: "const memo = new Map();\nfunction fib(n) {\n  if (n <= {{1}}) return n;\n  if (memo.has(n)) return memo.get(n);\n  const r = fib(n - 1) + fib({{2}});\n  memo.{{3}}(n, r);\n  return r;\n}",
      blanks: [
        { options: ["0", "1", "2"], answer: 1 },
        { options: ["n - 2", "n - 1", "n / 2"], answer: 0 },
        { options: ["get", "set", "add"], answer: 1 },
      ],
      explanation:
        "fib(0) = 0 et fib(1) = 1 sont les cas de base, d'où n <= 1. Le cache est alimenté avec set avant le retour, ce qui ramène le coût de O(2ⁿ) à O(n).",
    },
    {
      id: "algorithms-dynamic-programming-classify-1",
      type: "classify",
      prompt: "Ces caractéristiques décrivent-elles la mémoïsation ou la tabulation ?",
      categories: ["Mémoïsation (top-down)", "Tabulation (bottom-up)"],
      items: [
        { text: "Fonction récursive avec un cache", category: 0 },
        { text: "Boucles qui remplissent un tableau dp", category: 1 },
        { text: "Ne calcule que les états réellement demandés", category: 0 },
        { text: "Aucun risque de dépassement de la pile de récursion", category: 1 },
        { text: "Part des cas de base vers le résultat final", category: 1 },
        { text: "Consulte le cache avant chaque appel", category: 0 },
      ],
      explanation:
        "La mémoïsation descend depuis le problème complet et ne calcule que le nécessaire, mais sa récursion peut être profonde. La tabulation remplit tous les états en itératif, sans pile d'appels.",
    },
  ],
};
