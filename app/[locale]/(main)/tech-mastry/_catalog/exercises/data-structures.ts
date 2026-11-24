import type { AreaExercises } from "./types";

export const dataStructuresExercises: AreaExercises = {
  "/tech-mastry/data-structures/arrays": [
    {
      id: "data-structures-arrays-classify-1",
      type: "classify",
      prompt: "Classez ces opérations sur un tableau selon leur coût.",
      categories: ["O(1)", "O(n)"],
      items: [
        { text: "arr[i]", category: 0 },
        { text: "push() (amorti)", category: 0 },
        { text: "shift()", category: 1 },
        { text: "splice() au milieu", category: 1 },
        { text: "indexOf() sur un tableau non trié", category: 1 },
        { text: "pop()", category: 0 },
      ],
      explanation:
        "Toucher la fin ou lire un indice ne déplace aucun élément. Dès qu'on agit au début ou au milieu, les éléments suivants sont décalés, d'où O(n).",
    },
    {
      id: "data-structures-arrays-match-1",
      type: "match",
      prompt: "Associez chaque technique à son usage typique.",
      pairs: [
        { term: "Deux pointeurs", definition: "Chercher une paire dans un tableau trié en O(n)" },
        { term: "Fenêtre glissante", definition: "Optimiser les sous-tableaux contigus" },
        { term: "Sommes préfixes", definition: "Somme de plage en O(1) après pré-calcul" },
        { term: "Kadane", definition: "Sous-tableau de somme maximale en un passage" },
      ],
      explanation:
        "Ces techniques remplacent des doubles boucles en O(n²) par un seul passage. Les sommes préfixes déplacent le coût dans un pré-calcul en O(n) pour répondre ensuite à chaque requête en O(1).",
    },
    {
      id: "data-structures-arrays-fill-1",
      type: "fill",
      prompt: "Complétez la somme de a[l] à a[r] inclus avec un tableau de sommes préfixes.",
      code: "const prefix = [0];\nfor (const x of a) prefix.push(prefix[prefix.length - 1] + x);\n// somme de a[l..r] inclus\nconst sum = prefix[{{1}}] - prefix[{{2}}];",
      blanks: [
        { options: ["r", "r + 1", "r - 1"], answer: 1 },
        { options: ["l - 1", "l + 1", "l"], answer: 2 },
      ],
      explanation:
        "prefix[k] contient la somme des k premiers éléments : prefix[r + 1] couvre a[0..r] et prefix[l] couvre a[0..l-1]. La différence est a[l..r]; les décalages de un sont l'erreur courante.",
    },
  ],

  "/tech-mastry/data-structures/lists": [
    {
      id: "data-structures-lists-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre l'inversion d'une liste simplement chaînée.",
      steps: [
        "Initialiser prev = null et cur = head",
        "Tant que cur n'est pas null, sauvegarder next = cur.next",
        "Retourner le lien : cur.next = prev",
        "Avancer : prev = cur puis cur = next",
        "Retourner prev, qui est la nouvelle tête",
      ],
      explanation:
        "Il faut sauvegarder next avant de modifier cur.next, sinon on perd la suite de la liste. À la fin cur est null et prev désigne l'ancien dernier noeud.",
    },
    {
      id: "data-structures-lists-classify-1",
      type: "classify",
      prompt: "Classez ces opérations de liste chaînée selon leur coût.",
      categories: ["O(1)", "O(n)"],
      items: [
        { text: "Insérer en tête d'une liste simple", category: 0 },
        { text: "Ajouter en queue d'une liste simple sans pointeur tail", category: 1 },
        { text: "Supprimer un noeud connu d'une liste doublement chaînée", category: 0 },
        { text: "Chercher une valeur", category: 1 },
        { text: "Inverser toute la liste", category: 1 },
        { text: "Supprimer le premier noeud", category: 0 },
      ],
      explanation:
        "Les opérations qui n'affectent que la tête ou un noeud déjà localisé touchent quelques pointeurs. Tout ce qui impose de parcourir la liste (recherche, queue sans tail, inversion) est linéaire.",
    },
    {
      id: "data-structures-lists-fill-1",
      type: "fill",
      prompt: "Complétez la détection de cycle de Floyd.",
      code: "let slow = head, fast = head;\nwhile (fast && fast.{{1}}) {\n  slow = slow.next;\n  fast = fast.next.{{2}};\n  if (slow === {{3}}) return true;\n}\nreturn false;",
      blanks: [
        { options: ["prev", "next", "value"], answer: 1 },
        { options: ["prev", "value", "next"], answer: 2 },
        { options: ["head", "fast", "null"], answer: 1 },
      ],
      explanation:
        "Le pointeur rapide avance de deux noeuds (fast.next.next), donc fast.next doit exister. S'il y a un cycle, le rapide finit par rattraper le lent ; sinon il atteint null.",
    },
  ],

  "/tech-mastry/data-structures/trees": [
    {
      id: "data-structures-trees-match-1",
      type: "match",
      prompt: "Associez chaque parcours d'arbre à son ordre de visite.",
      pairs: [
        { term: "Préfixe", definition: "Racine, gauche, droite" },
        { term: "Infixe", definition: "Gauche, racine, droite" },
        { term: "Postfixe", definition: "Gauche, droite, racine" },
        { term: "Largeur", definition: "Niveau par niveau avec une file" },
      ],
      explanation:
        "Le nom préfixe, infixe ou postfixe indique la position de la racine par rapport à ses sous-arbres. Seul le parcours en largeur change de structure de contrôle : une file au lieu de la récursion.",
    },
    {
      id: "data-structures-trees-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre l'insertion d'une valeur v dans un arbre binaire de recherche.",
      steps: [
        "Partir de la racine",
        "Comparer v à la valeur du noeud courant",
        "Descendre à gauche si v est plus petit, à droite sinon",
        "Répéter jusqu'à trouver un emplacement vide (null)",
        "Créer le nouveau noeud à cet emplacement",
      ],
      explanation:
        "L'insertion suit le même chemin qu'une recherche, puis place la feuille. Son coût est la hauteur de l'arbre : O(log n) équilibré, O(n) si l'arbre dégénère.",
    },
    {
      id: "data-structures-trees-classify-1",
      type: "classify",
      prompt: "Ces éléments relèvent-ils d'un parcours en profondeur ou d'un parcours en largeur ?",
      categories: ["Profondeur (DFS)", "Largeur (BFS)"],
      items: [
        { text: "Parcours préfixe", category: 0 },
        { text: "Parcours infixe", category: 0 },
        { text: "Parcours postfixe", category: 0 },
        { text: "Ordre par niveaux", category: 1 },
        { text: "Utilise une file FIFO", category: 1 },
        { text: "S'appuie sur la pile d'appels", category: 0 },
      ],
      explanation:
        "Préfixe, infixe et postfixe sont trois variantes du parcours en profondeur, qui s'appuie sur la récursion (une pile). Le parcours par niveaux est le seul à utiliser une file.",
    },
  ],

  "/tech-mastry/data-structures/hash-maps": [
    {
      id: "data-structures-hash-maps-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre les étapes de set(key, value) dans une table de hachage à chaînage.",
      steps: [
        "Calculer hash(key)",
        "Réduire à un indice : index = hash % capacité",
        "Parcourir le bucket pour voir si la clé existe déjà",
        "Mettre à jour la valeur si elle existe, sinon ajouter l'entrée",
        "Si le facteur de charge dépasse le seuil, doubler la capacité et rehasher",
      ],
      explanation:
        "L'indice se calcule avant tout accès au bucket, et le redimensionnement vient en dernier une fois l'entrée ajoutée. Le rehash est en O(n) mais rare, donc l'insertion reste en O(1) amorti.",
    },
    {
      id: "data-structures-hash-maps-match-1",
      type: "match",
      prompt: "Associez chaque notion à sa définition.",
      pairs: [
        { term: "Chaînage", definition: "Chaque bucket contient une liste d'entrées" },
        { term: "Adressage ouvert", definition: "En cas de collision, on sonde une autre case de la table" },
        { term: "Facteur de charge", definition: "Nombre d'entrées divisé par le nombre de buckets" },
        { term: "Rehash", definition: "Recalcul des positions après un redimensionnement" },
        { term: "Tombstone", definition: "Marqueur de case supprimée qui préserve les séquences de sondage" },
      ],
      explanation:
        "Chaînage et adressage ouvert sont les deux stratégies de résolution de collisions. Le facteur de charge déclenche le redimensionnement, qui impose de recalculer les indices.",
    },
    {
      id: "data-structures-hash-maps-classify-1",
      type: "classify",
      prompt: "Pour chaque besoin, la table de hachage est-elle adaptée ?",
      categories: ["Table de hachage adaptée", "Autre structure plus adaptée"],
      items: [
        { text: "Compter les occurrences de chaque mot", category: 0 },
        { text: "Retrouver les clients dont l'âge est entre 30 et 40", category: 1 },
        { text: "Vérifier si un identifiant a déjà été vu", category: 0 },
        { text: "Lister les clés par ordre alphabétique", category: 1 },
        { text: "Two Sum : stocker les compléments déjà rencontrés", category: 0 },
        { text: "Retirer sans cesse le plus petit élément", category: 1 },
      ],
      explanation:
        "La table excelle pour les recherches exactes par clé, pas pour les intervalles ni l'ordre : on préfère alors un arbre de recherche, ou un tas pour extraire le minimum.",
    },
  ],

  "/tech-mastry/data-structures/graphs": [
    {
      id: "data-structures-graphs-match-1",
      type: "match",
      prompt: "Associez chaque notion à sa caractéristique.",
      pairs: [
        { term: "Liste d'adjacence", definition: "Mémoire en O(V+E), idéale pour les graphes creux" },
        { term: "Matrice d'adjacence", definition: "Mémoire en O(V²), test d'arête en O(1)" },
        { term: "BFS", definition: "Plus court chemin en nombre d'arêtes" },
        { term: "DFS", definition: "Explore une branche à fond avant de revenir" },
        { term: "Dijkstra", definition: "Plus court chemin avec poids non négatifs" },
      ],
      explanation:
        "La représentation détermine la mémoire et le coût des parcours. BFS ne donne le plus court chemin que sans poids, Dijkstra le généralise aux poids positifs.",
    },
    {
      id: "data-structures-graphs-fill-1",
      type: "fill",
      prompt: "Complétez ce DFS récursif.",
      code: "function dfs(u, seen) {\n  seen.{{1}}(u);\n  for (const v of graph[u]) {\n    if (!seen.{{2}}(v)) dfs(v, {{3}});\n  }\n}",
      blanks: [
        { options: ["has", "add", "delete"], answer: 1 },
        { options: ["has", "add", "size"], answer: 0 },
        { options: ["u", "graph", "seen"], answer: 2 },
      ],
      explanation:
        "On marque u comme visité (add), on ne descend que dans les voisins non visités (has) et on transmet le même ensemble seen. Sans ce marquage, un cycle ferait boucler la récursion.",
    },
    {
      id: "data-structures-graphs-classify-1",
      type: "classify",
      prompt: "Attribuez chaque propriété au BFS ou au DFS.",
      categories: ["BFS", "DFS"],
      items: [
        { text: "Plus court chemin dans un graphe non pondéré", category: 0 },
        { text: "Utilise une file", category: 0 },
        { text: "Utilise une pile ou la récursion", category: 1 },
        { text: "Détection de cycle par arête arrière", category: 1 },
        { text: "Explore par niveaux de distance", category: 0 },
        { text: "Base du tri topologique", category: 1 },
      ],
      explanation:
        "BFS visite par distance croissante, ce qui donne les plus courts chemins sans poids. DFS descend à fond, ce qui sert à détecter les cycles et à ordonner topologiquement.",
    },
  ],

  "/tech-mastry/data-structures/heaps": [
    {
      id: "data-structures-heaps-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre l'insertion dans un min-heap (remontée ou bubble up).",
      steps: [
        "Ajouter l'élément à la fin du tableau",
        "Comparer l'élément à son parent",
        "S'il est plus petit que son parent, les échanger",
        "Se placer à l'indice du parent et recommencer",
        "S'arrêter quand le parent est plus petit ou égal, ou à la racine",
      ],
      explanation:
        "L'ajout en fin garde l'arbre complet, puis la remontée rétablit l'ordre. Elle traverse au plus la hauteur de l'arbre, soit O(log n) échanges.",
    },
    {
      id: "data-structures-heaps-fill-1",
      type: "fill",
      prompt: "Complétez les formules d'indices d'un tas stocké dans un tableau (indices à partir de 0).",
      code: "const parent = i => {{1}};\nconst left = i => {{2}};\nconst right = i => {{3}};",
      blanks: [
        { options: ["Math.floor((i - 1) / 2)", "Math.floor(i / 2)", "2 * i + 1"], answer: 0 },
        { options: ["2 * i", "2 * i + 1", "2 * i + 2"], answer: 1 },
        { options: ["2 * i + 2", "2 * i + 1", "2 * i + 3"], answer: 0 },
      ],
      explanation:
        "En numérotant depuis 0, les enfants de i sont 2i+1 et 2i+2, et le parent est floor((i-1)/2). Les formules 2i et i/2 valent pour une numérotation à partir de 1.",
    },
    {
      id: "data-structures-heaps-match-1",
      type: "match",
      prompt: "Associez chaque opération à sa description.",
      pairs: [
        { term: "peek", definition: "Lire la racine en O(1)" },
        { term: "insert", definition: "Ajout à la fin puis remontée en O(log n)" },
        { term: "extract", definition: "Retrait de la racine puis descente en O(log n)" },
        { term: "heapify", definition: "Transformer un tableau en tas en O(n)" },
        { term: "Top-K", definition: "Min-heap de taille k, en O(n log k)" },
      ],
      explanation:
        "Seule la racine est accessible directement. Construire un tas d'un coup en O(n) est plus rapide que d'enchaîner n insertions en O(n log n).",
    },
  ],

  "/tech-mastry/data-structures/stacks-queues": [
    {
      id: "data-structures-stacks-queues-classify-1",
      type: "classify",
      prompt: "Chaque cas relève-t-il d'une pile (LIFO) ou d'une file (FIFO) ?",
      categories: ["Pile (LIFO)", "File (FIFO)"],
      items: [
        { text: "Annuler la dernière action (undo)", category: 0 },
        { text: "Parcours en largeur d'un graphe", category: 1 },
        { text: "Vérifier l'appariement des parenthèses", category: 0 },
        { text: "File d'attente d'impressions", category: 1 },
        { text: "Pile d'appels des fonctions", category: 0 },
        { text: "Traiter des tâches dans l'ordre d'arrivée", category: 1 },
      ],
      explanation:
        "Quand le dernier élément ajouté doit être traité en premier (undo, appels imbriqués, parenthèses), il faut une pile. Quand l'équité d'arrivée compte, c'est une file.",
    },
    {
      id: "data-structures-stacks-queues-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre l'opération dequeue d'une file construite avec deux piles in et out.",
      steps: [
        "Vérifier si la pile out est vide",
        "Si oui, dépiler chaque élément de in",
        "Empiler chacun dans out, ce qui inverse l'ordre",
        "Dépiler le sommet de out",
        "Retourner cet élément comme résultat du dequeue",
      ],
      explanation:
        "Le transfert inverse l'ordre de in, ce qui place le plus ancien élément au sommet de out. On ne transfère que si out est vide, d'où un coût amorti en O(1).",
    },
    {
      id: "data-structures-stacks-queues-fill-1",
      type: "fill",
      prompt: "Complétez la vérification de parenthèses avec une pile.",
      code: "const pairs = { ')': '(', ']': '[' };\nconst stack = [];\nfor (const c of s) {\n  if (c === '(' || c === '[') stack.{{1}}(c);\n  else if (stack.{{2}}() !== pairs[c]) return false;\n}\nreturn stack.length === {{3}};",
      blanks: [
        { options: ["pop", "push", "shift"], answer: 1 },
        { options: ["pop", "push", "peek"], answer: 0 },
        { options: ["1", "0", "s.length"], answer: 1 },
      ],
      explanation:
        "On empile chaque ouvrant, et chaque fermant doit correspondre au sommet dépilé. À la fin la pile doit être vide : un ouvrant restant signifie une parenthèse jamais fermée.",
    },
  ],
};
