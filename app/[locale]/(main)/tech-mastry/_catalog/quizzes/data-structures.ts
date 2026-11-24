import type { AreaQuizzes } from "./types";

export const dataStructuresQuizzes: AreaQuizzes = {
  "/tech-mastry/data-structures/arrays": [
    {
      id: "data-structures-arrays-1",
      question:
        "Vous retirez le premier élément d'un grand tableau avec arr.shift() dans une boucle. Quelle est la complexité d'un appel isolé ?",
      options: [
        "O(1), car on ne touche qu'à une case",
        "O(n), car tous les suivants sont décalés",
        "O(log n), car le tableau est réorganisé en arbre",
        "O(n²), car chaque élément est recopié n fois",
      ],
      correctIndex: 1,
      explanation:
        "Retirer en tête impose de décaler les n-1 éléments restants d'une case. Une boucle de n appels coûte alors O(n²), alors que pop() en fin de tableau est en O(1).",
      difficulty: "easy",
    },
    {
      id: "data-structures-arrays-2",
      question: "Pourquoi dit-on que push() est en O(1) amorti sur un tableau dynamique ?",
      options: [
        "Parce qu'il écrit toujours dans une case libre, sans vérifier la capacité restante",
        "Parce qu'il chaîne chaque nouvel élément à la fin d'une liste interne de noeuds",
        "Parce que le tableau est maintenu trié, ce qui évite tout déplacement d'éléments",
        "Parce que les rares recopies en O(n) sont lissées sur de nombreux ajouts",
      ],
      correctIndex: 3,
      explanation:
        "Quand la capacité est atteinte, le tableau est recopié (O(n)), mais la capacité double, donc cette copie survient rarement. Le coût moyen par ajout reste constant, même si un appel isolé peut être lent.",
      difficulty: "easy",
    },
    {
      id: "data-structures-arrays-3",
      question:
        "Dans un tableau trié, on cherche deux éléments de somme T avec deux pointeurs i (début) et j (fin). Que faire si a[i] + a[j] < T ?",
      options: [
        "Avancer i : il faut une somme plus grande",
        "Reculer j, car il faut une somme plus petite",
        "Avancer i et reculer j en même temps",
        "Recommencer avec une double boucle",
      ],
      correctIndex: 0,
      explanation:
        "Comme le tableau est trié, augmenter i augmente la somme et reculer j la diminue. Cette règle permet de trouver la paire en O(n) et O(1) d'espace, contre O(n²) pour la double boucle.",
      difficulty: "medium",
    },
    {
      id: "data-structures-arrays-4",
      question:
        "On a construit prefix[0] = 0 et prefix[k] = a[0] + … + a[k-1]. Quelle expression donne la somme de a[l] à a[r] inclus ?",
      options: [
        "prefix[r] - prefix[l]",
        "prefix[r] - prefix[l - 1]",
        "prefix[r + 1] - prefix[l]",
        "prefix[r + 1] - prefix[l + 1]",
      ],
      correctIndex: 2,
      explanation:
        "prefix[r+1] contient a[0..r] et prefix[l] contient a[0..l-1] : leur différence est a[l..r]. Les autres formules oublient une borne (erreur classique d'un décalage de un).",
      difficulty: "medium",
    },
    {
      id: "data-structures-arrays-5",
      question:
        "Kadane est initialisé ainsi : best = 0, cur = 0. Que retourne-t-il pour [-3, -1, -2], et que faut-il corriger ?",
      options: [
        "Il retourne 0 ; initialiser best et cur à a[0] pour obtenir -1",
        "Il retourne -1, c'est déjà correct",
        "Il retourne -6 ; il faut ignorer les valeurs négatives",
        "Il retourne 0 ; ce résultat est correct car le sous-tableau peut être vide",
      ],
      correctIndex: 0,
      explanation:
        "Avec best = 0, une somme positive ou nulle « vide » masque les négatifs, alors que le sous-tableau non vide de somme maximale est [-1], soit -1. Partir de a[0] règle le cas d'un tableau entièrement négatif.",
      difficulty: "hard",
    },
  ],

  "/tech-mastry/data-structures/lists": [
    {
      id: "data-structures-lists-1",
      question:
        "Dans une liste simplement chaînée qui ne conserve que le pointeur head, quelle est la complexité d'un ajout en fin de liste ?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
      correctIndex: 2,
      explanation:
        "Il faut parcourir toute la liste pour atteindre le dernier noeud. Conserver un pointeur tail ramène l'ajout à O(1), alors que l'ajout en tête l'est déjà.",
      difficulty: "easy",
    },
    {
      id: "data-structures-lists-2",
      question:
        "Quel avantage concret une liste doublement chaînée a-t-elle sur une liste simple quand on possède déjà une référence vers un noeud à supprimer ?",
      options: [
        "Suppression en O(1) sans parcours pour retrouver le précédent",
        "Elle permet un accès par indice en O(1) grâce au pointeur arrière",
        "Elle consomme moins de mémoire, un seul pointeur étant partagé",
        "Elle supprime les doublons à chaque insertion en tête de liste",
      ],
      correctIndex: 0,
      explanation:
        "Le pointeur prev permet de relier directement le précédent au suivant. En liste simple, il faudrait parcourir depuis head en O(n), et chaque noeud double coûte un pointeur de plus, pas moins.",
      difficulty: "easy",
    },
    {
      id: "data-structures-lists-3",
      question:
        "Que doit retourner cette inversion de liste ?\n\nlet prev = null, cur = head;\nwhile (cur) {\n  const next = cur.next;\n  cur.next = prev;\n  prev = cur; cur = next;\n}\nreturn ???;",
      options: ["head", "cur", "next", "prev"],
      correctIndex: 3,
      explanation:
        "À la fin, cur est null et prev pointe sur l'ancien dernier noeud, qui devient la nouvelle tête. Retourner head renverrait l'ancien premier noeud, désormais le dernier.",
      difficulty: "medium",
    },
    {
      id: "data-structures-lists-4",
      question:
        "Quel est l'avantage de la détection de cycle de Floyd (pointeurs lent et rapide) sur un Set de noeuds visités ?",
      options: [
        "Elle est en O(log n) au lieu de O(n)",
        "Elle n'utilise que O(1) de mémoire au lieu de O(n)",
        "Elle fonctionne aussi sur les tableaux triés",
        "Elle retrouve le nombre exact de noeuds en un seul passage",
      ],
      correctIndex: 1,
      explanation:
        "Les deux approches parcourent la liste en O(n), mais Floyd ne garde que deux pointeurs, alors que le Set stocke jusqu'à n références. Si le pointeur rapide atteint null, il n'y a pas de cycle.",
      difficulty: "medium",
    },
    {
      id: "data-structures-lists-5",
      question:
        "Pour trouver le milieu d'une liste de 6 noeuds en un seul passage :\n\nlet slow = head, fast = head;\nwhile (fast && fast.next) {\n  slow = slow.next; fast = fast.next.next;\n}\nQuel noeud slow désigne-t-il à la fin ?",
      options: ["Le 3e noeud", "Le 5e noeud", "Le 4e noeud", "Le 2e noeud"],
      correctIndex: 2,
      explanation:
        "Les pas successifs donnent slow = 2, 3, 4 pendant que fast va à 3, 5, puis null : on s'arrête avec slow sur le 4e noeud, le second milieu d'une liste de longueur paire. Pour obtenir le 3e, il faut tester fast.next.next.",
      difficulty: "hard",
    },
  ],

  "/tech-mastry/data-structures/trees": [
    {
      id: "data-structures-trees-1",
      question: "Que produit un parcours infixe (gauche, racine, droite) d'un arbre binaire de recherche ?",
      options: [
        "Les valeurs dans l'ordre d'insertion",
        "Les valeurs par niveaux, de haut en bas",
        "Les valeurs en commençant par les feuilles",
        "Les valeurs triées par ordre croissant",
      ],
      correctIndex: 3,
      explanation:
        "Dans un BST, tout le sous-arbre gauche est plus petit que la racine et tout le sous-arbre droit plus grand, donc gauche, racine, droite énumère les valeurs triées. L'ordre par niveaux est celui du parcours en largeur.",
      difficulty: "easy",
    },
    {
      id: "data-structures-trees-2",
      question:
        "Soit l'arbre de racine 1, d'enfant gauche 2 (qui a pour enfants 4 et 5) et d'enfant droit 3. Quel est son parcours postfixe (gauche, droite, racine) ?",
      options: [
        "1, 2, 4, 5, 3",
        "4, 5, 2, 3, 1",
        "4, 2, 5, 1, 3",
        "1, 2, 3, 4, 5",
      ],
      correctIndex: 1,
      explanation:
        "Le postfixe visite le sous-arbre gauche (4, 5, 2), puis le droit (3), puis la racine (1). La séquence 1, 2, 4, 5, 3 est le préfixe, et 4, 2, 5, 1, 3 l'infixe.",
      difficulty: "easy",
    },
    {
      id: "data-structures-trees-3",
      question:
        "On insère 1, 2, 3, …, n dans cet ordre dans un BST classique sans rééquilibrage. Quelle est ensuite la complexité d'une recherche ?",
      options: [
        "O(log n), car c'est un arbre binaire",
        "O(1), car les valeurs sont consécutives",
        "O(n), car l'arbre dégénère en liste",
        "O(n log n), car il faut retrier",
      ],
      correctIndex: 2,
      explanation:
        "Chaque nouvelle valeur devient le fils droit du dernier noeud : la hauteur vaut n et la recherche O(h) = O(n). AVL et arbres rouge-noir existent justement pour garantir une hauteur en O(log n).",
      difficulty: "medium",
    },
    {
      id: "data-structures-trees-4",
      question: "Quelle structure faut-il utiliser pour implémenter le parcours en largeur (par niveaux) d'un arbre ?",
      options: [
        "Une file (FIFO)",
        "Une pile (LIFO)",
        "Un tas min",
        "Une table de hachage",
      ],
      correctIndex: 0,
      explanation:
        "La file traite les noeuds dans l'ordre où ils ont été découverts, donc niveau par niveau. Une pile (ou la récursion) produit un parcours en profondeur.",
      difficulty: "medium",
    },
    {
      id: "data-structures-trees-5",
      question:
        "Cette validation de BST est incorrecte. Pourquoi ?\n\nfunction isBST(n) {\n  if (!n) return true;\n  if (n.left && n.left.val >= n.val) return false;\n  if (n.right && n.right.val <= n.val) return false;\n  return isBST(n.left) && isBST(n.right);\n}",
      options: [
        "Elle est en O(n²) car chaque noeud relance une vérification de son sous-arbre",
        "Elle devrait utiliser un parcours en largeur pour comparer chaque niveau",
        "Elle ne gère pas l'arbre vide et lève une exception sur null",
        "Elle ne compare qu'au parent direct : 5 → 3 → 7 est accepté alors que 7 > 5",
      ],
      correctIndex: 3,
      explanation:
        "La propriété du BST porte sur tout le sous-arbre, pas seulement sur les enfants directs. Il faut transmettre des bornes (min, max) en descendant, ou vérifier que le parcours infixe est strictement croissant.",
      difficulty: "hard",
    },
  ],

  "/tech-mastry/data-structures/hash-maps": [
    {
      id: "data-structures-hash-maps-1",
      question:
        "Pour trouver deux nombres de somme T dans un tableau non trié, on stocke chaque valeur vue dans une Map et on cherche T - x. Quelles sont les complexités (cas moyen) ?",
      options: [
        "Temps O(n), espace O(n)",
        "Temps O(n²), espace O(1)",
        "Temps O(n log n), espace O(1)",
        "Temps O(n), espace O(1)",
      ],
      correctIndex: 0,
      explanation:
        "Un seul passage avec des lectures et écritures en O(1) moyen donne O(n) en temps, mais la Map retient jusqu'à n valeurs. La version sans mémoire supplémentaire est la double boucle en O(n²).",
      difficulty: "easy",
    },
    {
      id: "data-structures-hash-maps-2",
      question:
        "Une table de 16 buckets a un facteur de charge maximal de 0,75. Après combien d'entrées doit-elle être redimensionnée ?",
      options: ["8", "16", "12", "24"],
      correctIndex: 2,
      explanation:
        "Le facteur de charge est entrées / buckets : 0,75 × 16 = 12. Au-delà, les chaînes s'allongent et le coût moyen s'éloigne de O(1), donc la capacité est doublée.",
      difficulty: "easy",
    },
    {
      id: "data-structures-hash-maps-3",
      question:
        "Que retourne ce code JavaScript ?\n\nconst m = new Map();\nm.set({ id: 1 }, \"x\");\nconsole.log(m.get({ id: 1 }));",
      options: ["\"x\"", "undefined", "null", "Une TypeError"],
      correctIndex: 1,
      explanation:
        "Une Map compare les clés objets par référence, et le second littéral est un nouvel objet : la clé est introuvable, d'où undefined. Il faut conserver la même référence ou utiliser une clé primitive.",
      difficulty: "medium",
    },
    {
      id: "data-structures-hash-maps-4",
      question:
        "Lors d'un redimensionnement, pourquoi faut-il recalculer la position de chaque entrée au lieu de recopier les buckets tels quels ?",
      options: [
        "Parce que la fonction de hachage change de formule quand la taille double",
        "Parce que les clés doivent être retriées pour garder les buckets ordonnés",
        "Parce que le ramasse-miettes libère l'ancien tableau de buckets en bloc",
        "Parce que l'indice hash % capacité change avec la nouvelle capacité",
      ],
      correctIndex: 3,
      explanation:
        "L'indice du bucket se calcule par hash modulo la capacité : quand celle-ci double, la plupart des entrées changent de bucket. Ce rehash coûte O(n) mais, comme il est rare, l'insertion reste en O(1) amorti.",
      difficulty: "medium",
    },
    {
      id: "data-structures-hash-maps-5",
      question:
        "Avec l'adressage ouvert et sondage linéaire, que se passe-t-il si la suppression d'une clé vide simplement sa case ?",
      options: [
        "Rien : la suppression reste correcte, la case libérée est réutilisée à l'insertion suivante",
        "Les clés placées plus loin dans la séquence de sondage deviennent introuvables : il faut un tombstone",
        "La table bascule automatiquement en chaînage dès que la case libre est détectée",
        "Le facteur de charge devient négatif et déclenche un redimensionnement erroné",
      ],
      correctIndex: 1,
      explanation:
        "Une recherche s'arrête à la première case vide : en vidant une case située au milieu d'une séquence de collisions, on coupe l'accès aux clés qui suivent. Un marqueur de suppression (tombstone) préserve la chaîne de sondage.",
      difficulty: "hard",
    },
  ],

  "/tech-mastry/data-structures/graphs": [
    {
      id: "data-structures-graphs-1",
      question:
        "Un graphe de 10 000 sommets possède environ 30 000 arêtes. Quelle représentation est la plus économique en mémoire ?",
      options: [
        "Une matrice d'adjacence, soit environ 10⁸ cases",
        "Une liste d'adjacence, en O(V+E)",
        "Une matrice, car elle contient moins de pointeurs",
        "Les deux se valent pour tout graphe",
      ],
      correctIndex: 1,
      explanation:
        "Le graphe est creux (E ≪ V²) : la liste d'adjacence tient en environ 40 000 entrées alors que la matrice en réserve V² = 10⁸. La matrice ne devient intéressante que pour les graphes denses ou pour tester une arête en O(1).",
      difficulty: "easy",
    },
    {
      id: "data-structures-graphs-2",
      question:
        "Que se passe-t-il si un parcours DFS ou BFS ne marque pas les noeuds déjà visités dans un graphe contenant un cycle ?",
      options: [
        "Il visite chaque noeud exactement une fois",
        "Il ignore les cycles automatiquement",
        "Il plante immédiatement à la première arête",
        "Il boucle indéfiniment sur le cycle",
      ],
      correctIndex: 3,
      explanation:
        "Sans ensemble de visités, un cycle ramène sans fin au même noeud. C'est ce marquage qui garantit les O(V+E) du parcours, contrairement à un arbre où il n'y a pas de cycle.",
      difficulty: "easy",
    },
    {
      id: "data-structures-graphs-3",
      question: "Quelle est la complexité d'un BFS sur un graphe de V sommets stocké en matrice d'adjacence ?",
      options: [
        "O(V²) : chaque sommet impose de scanner une ligne de V cases",
        "O(V+E), comme avec une liste d'adjacence, la file ne contenant que des voisins",
        "O(E log V), car chaque arête passe par une file de priorité du parcours",
        "O(V), car chaque sommet n'est défilé qu'une seule fois par le parcours",
      ],
      correctIndex: 0,
      explanation:
        "Pour trouver les voisins d'un sommet dans une matrice, il faut parcourir ses V cases, donc V × V au total. Le O(V+E) suppose une liste d'adjacence, qui n'énumère que les vrais voisins.",
      difficulty: "medium",
    },
    {
      id: "data-structures-graphs-4",
      question: "Comment compter les composantes connexes d'un graphe non orienté ?",
      options: [
        "Lancer un seul BFS depuis le premier sommet et compter les sommets atteints",
        "Compter les sommets de degré 1, extrémités de chaque composante",
        "Un parcours par sommet non visité, en comptant les lancements",
        "Calculer le plus court chemin entre tous les couples de sommets",
      ],
      correctIndex: 2,
      explanation:
        "Chaque parcours visite exactement une composante, donc le nombre de lancements est le nombre de composantes, en O(V+E) au total. Un seul BFS ne couvre que la composante du sommet de départ.",
      difficulty: "medium",
    },
    {
      id: "data-structures-graphs-5",
      question:
        "Dans un BFS sur une grille de 1000×1000, à quel moment faut-il marquer une case comme visitée ?",
      options: [
        "À l'enfilage, pour qu'elle n'entre qu'une fois dans la file",
        "Au défilage, quand on la traite, pour ne pas marquer trop tôt",
        "À la fin du parcours, en marquant toutes les cases atteintes d'un coup",
        "Cela n'a pas d'importance : la file élimine elle-même les doublons",
      ],
      correctIndex: 0,
      explanation:
        "Si on marque au défilage, une même case peut être ajoutée plusieurs fois par ses voisins avant d'être traitée, ce qui gonfle la file et peut faire exploser le temps. Marquer à l'enfilage garantit au plus 10⁶ entrées.",
      difficulty: "hard",
    },
  ],

  "/tech-mastry/data-structures/heaps": [
    {
      id: "data-structures-heaps-1",
      question: "Quelle est la complexité de la lecture de l'élément minimal (peek) d'un min-heap ?",
      options: ["O(n)", "O(log n)", "O(1)", "O(n log n)"],
      correctIndex: 2,
      explanation:
        "Le minimum est toujours à la racine, donc à l'indice 0 du tableau. Retirer ce minimum (extractMin) demande par contre O(log n) pour restaurer la propriété du tas.",
      difficulty: "easy",
    },
    {
      id: "data-structures-heaps-2",
      question:
        "Un tas est stocké dans un tableau (indices à partir de 0), l'enfant gauche de i étant en 2i + 1. Quel est l'indice du parent du noeud d'indice 5 ?",
      options: ["2", "3", "1", "4"],
      correctIndex: 0,
      explanation:
        "Le parent d'un noeud i est floor((i - 1) / 2), soit floor(4/2) = 2. Les enfants de 2 sont bien 5 et 6.",
      difficulty: "easy",
    },
    {
      id: "data-structures-heaps-3",
      question:
        "On construit un tas à partir d'un tableau de n éléments avec heapify de bas en haut. Quelle est la complexité ?",
      options: [
        "O(n log n), comme n insertions",
        "O(log n), car la hauteur est logarithmique",
        "O(n²), car chaque élément est comparé à tous les autres",
        "O(n)",
      ],
      correctIndex: 3,
      explanation:
        "La plupart des noeuds sont près des feuilles et descendent très peu : la somme des hauteurs est bornée par O(n). Faire n insertions successives coûterait O(n log n).",
      difficulty: "medium",
    },
    {
      id: "data-structures-heaps-4",
      question:
        "On veut les k plus grands éléments d'un flux de n valeurs, avec k petit. Quelle approche est la plus efficace en O(n log k) ?",
      options: [
        "Un max-heap contenant les n valeurs, puis k extractions successives de la racine",
        "Un min-heap de taille k, racine remplacée par toute valeur plus grande",
        "Trier tout le flux en O(n log n) puis garder les k dernières valeurs",
        "Un tableau de k éléments parcouru en entier pour y retrouver le minimum",
      ],
      correctIndex: 1,
      explanation:
        "La racine du min-heap est le plus petit des k meilleurs candidats : on le remplace si on trouve mieux, chaque mise à jour coûtant O(log k). Trier coûte O(n log n) et exige de tout stocker.",
      difficulty: "medium",
    },
    {
      id: "data-structures-heaps-5",
      question:
        "Pour la médiane d'un flux avec deux tas (moitié basse dans un max-heap, moitié haute dans un min-heap), le flux 5, 2, 8 est inséré. Quelle est la médiane ?",
      options: [
        "2, le plus petit élément, racine de la moitié basse",
        "8, le plus grand élément, racine de la moitié haute",
        "5, la racine du max-heap qui contient {2, 5}",
        "6,5, la moyenne des deux racines (5 et 8)",
      ],
      correctIndex: 2,
      explanation:
        "La moitié basse est {2, 5} (racine 5) et la haute {8}. Avec un nombre impair d'éléments, la médiane est la racine du tas le plus grand, soit 5 ; on ne calcule une moyenne des racines que pour un nombre pair.",
      difficulty: "hard",
    },
  ],

  "/tech-mastry/data-structures/stacks-queues": [
    {
      id: "data-structures-stacks-queues-1",
      question:
        "Quelle structure convient pour vérifier que les parenthèses, crochets et accolades d'une chaîne comme \"([{}])\" sont bien appariés ?",
      options: [
        "Une file (FIFO)",
        "Un tas min",
        "Une table de hachage",
        "Une pile (LIFO)",
      ],
      correctIndex: 3,
      explanation:
        "On empile chaque ouvrant et on dépile à chaque fermant : le dernier ouvert doit être le premier fermé, c'est exactement le comportement LIFO. Une file inverserait l'ordre d'appariement.",
      difficulty: "easy",
    },
    {
      id: "data-structures-stacks-queues-2",
      question:
        "Dans un BFS, on remplace la file par une pile. Quel type de parcours obtient-on ?",
      options: [
        "Toujours un BFS, car les noeuds visités restent les mêmes",
        "Un parcours en profondeur (DFS)",
        "Un tri topologique, car la pile mémorise l'ordre de fin",
        "Un parcours aléatoire, car l'ordre de dépilage est indéterminé",
      ],
      correctIndex: 1,
      explanation:
        "Avec une pile, le dernier voisin découvert est exploré en premier, ce qui fait descendre le parcours en profondeur. C'est la même idée que la récursion, qui s'appuie sur la pile d'appels.",
      difficulty: "easy",
    },
    {
      id: "data-structures-stacks-queues-3",
      question:
        "Quelle implémentation de file sur tableau garantit un dequeue en O(1) sans décaler les éléments ?",
      options: [
        "Un tableau et un indice head incrémenté à chaque dequeue",
        "Un tableau avec shift() à chaque dequeue",
        "Un tableau avec unshift() pour enqueue et pop() pour dequeue",
        "Un tableau avec splice(0, 1) à chaque dequeue",
      ],
      correctIndex: 0,
      explanation:
        "Avancer un indice head évite tout déplacement d'éléments. shift(), splice(0, 1) et unshift() décalent le tableau et coûtent O(n) en théorie.",
      difficulty: "medium",
    },
    {
      id: "data-structures-stacks-queues-4",
      question:
        "Une file est implémentée avec deux piles (in et out). Pourquoi le dequeue est-il en O(1) amorti, malgré le transfert de in vers out ?",
      options: [
        "Parce que le transfert n'a lieu que si in est plein, ce qui est rare",
        "Parce que le transfert déplace seulement un pointeur vers la pile in",
        "Parce que chaque élément n'est transféré qu'une fois pendant sa vie",
        "Parce que out reste trié, ce qui évite de reparcourir les éléments",
      ],
      correctIndex: 2,
      explanation:
        "Un élément est empilé dans in, transféré une fois dans out, puis dépilé : au plus 3 opérations par élément. Le transfert se déclenche quand out est vide, pas quand in est plein.",
      difficulty: "medium",
    },
    {
      id: "data-structures-stacks-queues-5",
      question:
        "Une pile monotone calcule, pour chaque élément, le prochain élément strictement plus grand (ou -1). Quel est le résultat pour [2, 7, 3, 5, 4, 6, 8] ?",
      options: [
        "[7, 8, 5, 6, 6, 8, 8]",
        "[7, -1, 5, 4, 6, 8, -1]",
        "[7, 8, 5, 6, 6, 8, 7]",
        "[7, 8, 5, 6, 6, 8, -1]",
      ],
      correctIndex: 3,
      explanation:
        "2→7, 7→8, 3→5, 5→6, 4→6, 6→8 et 8 n'a pas de plus grand élément à sa droite, d'où -1. La pile conserve les indices en attente de plus grand, et chaque élément y entre et en sort une fois : O(n).",
      difficulty: "hard",
    },
  ],
};
