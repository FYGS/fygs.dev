import type { AreaQuizzes } from "./types";

export const algorithmsQuizzes: AreaQuizzes = {
  "/tech-mastry/algorithms/complexity": [
    {
      id: "algorithms-complexity-1",
      question:
        "Quelle est la complexité temporelle de cette fonction ?\n\nfunction f(n) {\n  for (let i = 0; i < n; i++) work();\n  for (let j = 0; j < n; j++) work();\n}",
      options: ["O(n)", "O(n²)", "O(2ⁿ)", "O(n log n)"],
      correctIndex: 0,
      explanation:
        "Deux boucles successives s'additionnent : n + n = 2n, soit O(n) une fois la constante ignorée. Le O(n²) vient des boucles imbriquées, pas des boucles consécutives.",
      difficulty: "easy",
    },
    {
      id: "algorithms-complexity-2",
      question: "Un algorithme exécute 3n² + 5n + 20 opérations. Quelle est sa complexité en notation Big O ?",
      options: ["O(3n²)", "O(n² + n)", "O(n²)", "O(n)"],
      correctIndex: 2,
      explanation:
        "Big O ne garde que le terme dominant et ignore les coefficients constants : 3n² + 5n + 20 est en O(n²). Garder « 3 » ou le terme en n n'apporte rien à l'ordre de croissance.",
      difficulty: "easy",
    },
    {
      id: "algorithms-complexity-3",
      question:
        "Quelle est la complexité de cette boucle ?\n\nfor (let i = 1; i < n; i *= 2) {\n  work();\n}",
      options: ["O(n)", "O(log n)", "O(√n)", "O(n log n)"],
      correctIndex: 1,
      explanation:
        "i double à chaque tour : il atteint n après environ log₂(n) itérations. Ce n'est pas O(n), qui correspondrait à un pas constant (i++).",
      difficulty: "medium",
    },
    {
      id: "algorithms-complexity-4",
      question:
        "Quelle est la complexité spatiale (hors données d'entrée) de cette fonction ?\n\nfunction sum(n) {\n  if (n === 0) return 0;\n  return n + sum(n - 1);\n}",
      options: ["O(1)", "O(log n)", "O(n²)", "O(n)"],
      correctIndex: 3,
      explanation:
        "Chaque appel récursif empile un cadre qui reste en mémoire jusqu'au retour : la profondeur est n, donc O(n) de pile. Le fait qu'aucun tableau ne soit alloué ne la rend pas O(1).",
      difficulty: "medium",
    },
    {
      id: "algorithms-complexity-5",
      question:
        "Une fonction récursive f(n) fait un seul appel f(n/2), puis une boucle de n itérations. Quelle est sa complexité totale ?",
      options: ["O(n log n)", "O(log n)", "O(n)", "O(n²)"],
      correctIndex: 2,
      explanation:
        "T(n) = T(n/2) + n donne n + n/2 + n/4 + … ≈ 2n, soit O(n). O(n log n) serait le résultat avec deux appels f(n/2), comme dans le tri fusion.",
      difficulty: "hard",
    },
  ],

  "/tech-mastry/algorithms/sorting": [
    {
      id: "algorithms-sorting-1",
      question:
        "On trie des commandes par date avec n'importe quel tri, puis par client avec un tri stable. Que contient le résultat final ?",
      options: [
        "Les commandes triées par date uniquement",
        "Les commandes triées par client, puis par date pour un même client",
        "Les commandes triées par client, ordre des dates indéterminé",
        "Les commandes triées par date, puis par client pour une même date",
      ],
      correctIndex: 1,
      explanation:
        "Un tri stable conserve l'ordre relatif des éléments égaux : pour un même client, l'ordre par date de la première passe est préservé. Avec un tri instable, l'ordre des dates serait perdu.",
      difficulty: "easy",
    },
    {
      id: "algorithms-sorting-2",
      question: "Quelle est la complexité du tri par insertion sur un tableau déjà trié de n éléments ?",
      options: ["O(n²)", "O(log n)", "O(n log n)", "O(n)"],
      correctIndex: 3,
      explanation:
        "Chaque élément n'est comparé qu'une fois à son prédécesseur et n'est pas déplacé : n comparaisons au total. Le O(n²) correspond au pire cas (tableau trié à l'envers).",
      difficulty: "easy",
    },
    {
      id: "algorithms-sorting-3",
      question:
        "Un tri rapide choisit toujours le premier élément comme pivot. Quel est son comportement sur un tableau déjà trié ?",
      options: [
        "O(n²), car chaque partition ne retire qu'un seul élément",
        "O(n log n), car le tableau est déjà ordonné",
        "O(n), car aucune permutation n'est nécessaire",
        "O(n log n), mais avec une pile de récursion en O(n)",
      ],
      correctIndex: 0,
      explanation:
        "Le pivot est alors le minimum : une partition est vide et l'autre contient n-1 éléments, d'où n + (n-1) + … = O(n²) et une profondeur de récursion de n. Un pivot aléatoire ou la médiane de trois évite ce cas.",
      difficulty: "medium",
    },
    {
      id: "algorithms-sorting-4",
      question:
        "Vous triez 10 millions d'enregistrements et devez garantir un temps O(n log n) au pire cas ainsi que la stabilité. De la mémoire supplémentaire est disponible. Quel tri choisir ?",
      options: [
        "Le tri rapide avec un pivot aléatoire",
        "Le tri par tas (heapsort)",
        "Le tri fusion (mergesort)",
        "Le tri par sélection",
      ],
      correctIndex: 2,
      explanation:
        "Le tri fusion est stable et en O(n log n) dans tous les cas, au prix de O(n) de mémoire. Le heapsort a la même garantie mais n'est pas stable, et le tri rapide n'offre qu'une garantie probabiliste.",
      difficulty: "medium",
    },
    {
      id: "algorithms-sorting-5",
      question:
        "Le tri comptage trie n entiers de [0, k) en O(n + k). Pourquoi cela ne contredit-il pas la borne inférieure de O(n log n) ?",
      options: [
        "Il ne fonctionne que sur des tableaux déjà presque triés",
        "Il utilise un pivot qui divise parfaitement le tableau en deux",
        "La borne ne s'applique qu'aux tris stables en place",
        "La borne ne concerne que les tris par comparaison, or celui-ci indexe directement par valeur",
      ],
      correctIndex: 3,
      explanation:
        "La borne n log n vient de l'arbre de décision des comparaisons entre éléments. Le tri comptage n'en fait aucune, mais exige des clés entières dans un intervalle borné, sinon k domine le coût.",
      difficulty: "hard",
    },
  ],

  "/tech-mastry/algorithms/searching": [
    {
      id: "algorithms-searching-1",
      question:
        "Combien de comparaisons au maximum une recherche binaire effectue-t-elle sur un tableau trié d'un million d'éléments ?",
      options: ["Environ 1 000", "Environ 500 000", "Environ 20", "Environ 100"],
      correctIndex: 2,
      explanation:
        "Chaque comparaison divise l'intervalle par deux : log₂(10⁶) ≈ 19,9, donc 20 comparaisons au plus. 1 000 correspondrait à √n, pas à log n.",
      difficulty: "easy",
    },
    {
      id: "algorithms-searching-2",
      question:
        "On doit chercher une seule valeur dans un tableau non trié de n éléments. Quelle approche est la plus efficace ?",
      options: [
        "La recherche linéaire, en O(n)",
        "Trier puis recherche binaire, en O(n log n)",
        "La recherche binaire directement, en O(log n)",
        "Construire un arbre de recherche, en O(n²)",
      ],
      correctIndex: 0,
      explanation:
        "Pour une seule recherche, le parcours linéaire en O(n) est optimal : trier coûte déjà O(n log n). La recherche binaire donne un résultat faux sur des données non triées.",
      difficulty: "easy",
    },
    {
      id: "algorithms-searching-3",
      question:
        "Cette recherche binaire ne termine pas pour certaines entrées. Quelle est la cause ?\n\nlet lo = 0, hi = a.length - 1;\nwhile (lo < hi) {\n  const mid = (lo + hi) >> 1;\n  if (a[mid] < x) lo = mid;\n  else hi = mid;\n}",
      options: [
        "Le calcul de mid déborde toujours",
        "La condition devrait être lo > hi",
        "Il faut initialiser hi à a.length",
        "lo = mid ne progresse pas quand mid vaut lo : il faut lo = mid + 1",
      ],
      correctIndex: 3,
      explanation:
        "Avec lo = 0 et hi = 1, mid vaut 0 : si a[0] < x, lo reste à 0 et la boucle tourne indéfiniment. L'intervalle doit toujours rétrécir, d'où lo = mid + 1.",
      difficulty: "medium",
    },
    {
      id: "algorithms-searching-4",
      question:
        "Un ensemble statique de 100 000 identifiants est interrogé des millions de fois, uniquement pour savoir si un identifiant est présent (sans requête d'intervalle). Quelle structure choisir ?",
      options: [
        "Une liste chaînée parcourue séquentiellement",
        "Un ensemble par table de hachage (Set)",
        "Un tableau non trié parcouru à chaque requête",
        "Un tri à chaque requête puis une recherche binaire",
      ],
      correctIndex: 1,
      explanation:
        "Une table de hachage répond en O(1) en moyenne pour l'appartenance, au prix de O(n) de mémoire. Un tableau trié et une recherche binaire (O(log n)) fonctionnent, mais trier à chaque requête serait absurde.",
      difficulty: "medium",
    },
    {
      id: "algorithms-searching-5",
      question:
        "Un tableau trié contient des doublons. Comment retrouver l'indice de la première occurrence de x en O(log n) ?",
      options: [
        "Quand a[mid] === x, mémoriser mid puis continuer à gauche avec hi = mid - 1",
        "Faire une recherche binaire puis reculer d'un cran tant que la valeur est égale",
        "Quand a[mid] === x, retourner mid immédiatement",
        "Parcourir linéairement depuis le début jusqu'à trouver x",
      ],
      correctIndex: 0,
      explanation:
        "Continuer à chercher à gauche après un succès conserve la complexité O(log n). Reculer pas à pas dégrade en O(n) si tout le tableau contient x, et retourner mid renvoie une occurrence quelconque.",
      difficulty: "hard",
    },
  ],

  "/tech-mastry/algorithms/data-structures": [
    {
      id: "algorithms-data-structures-1",
      question: "Quelle structure donne l'accès à l'élément d'indice i en temps constant ?",
      options: [
        "La liste chaînée simple",
        "L'arbre binaire de recherche",
        "La pile implémentée avec des noeuds",
        "Le tableau",
      ],
      correctIndex: 3,
      explanation:
        "Les éléments d'un tableau sont contigus : l'adresse se calcule en O(1) par base + i × taille. Une liste chaînée doit suivre i pointeurs, soit O(i).",
      difficulty: "easy",
    },
    {
      id: "algorithms-data-structures-2",
      question:
        "Une application insère très fréquemment au début d'une collection de 100 000 éléments. Que choisir ?",
      options: [
        "Un tableau, car l'insertion en tête est en O(1)",
        "Une liste chaînée, car l'insertion en tête est en O(1)",
        "Un tableau trié, car la recherche est en O(log n)",
        "Une table de hachage, car elle conserve l'ordre d'insertion",
      ],
      correctIndex: 1,
      explanation:
        "Insérer en tête d'une liste chaînée ne modifie que deux pointeurs, alors qu'un tableau doit décaler les 100 000 éléments (O(n)). Le tableau gagne seulement si l'accès par indice domine.",
      difficulty: "easy",
    },
    {
      id: "algorithms-data-structures-3",
      question:
        "Quelles sont les complexités de cette détection de doublon (cas moyen) ?\n\nconst seen = new Set();\nfor (const x of a) {\n  if (seen.has(x)) return true;\n  seen.add(x);\n}\nreturn false;",
      options: [
        "Temps O(n²), espace O(1)",
        "Temps O(n log n), espace O(1)",
        "Temps O(n), espace O(n)",
        "Temps O(n), espace O(1)",
      ],
      correctIndex: 2,
      explanation:
        "has et add sont en O(1) en moyenne, donc n tours coûtent O(n), mais le Set peut contenir n valeurs : O(n) d'espace. On échange de la mémoire contre du temps par rapport aux deux boucles imbriquées (O(n²), O(1)).",
      difficulty: "medium",
    },
    {
      id: "algorithms-data-structures-4",
      question: "Dans quel cas une table de hachage dégrade-t-elle sa recherche en O(n) ?",
      options: [
        "Quand toutes les clés tombent dans le même bucket",
        "Quand elle contient plus de 1 000 entrées",
        "Quand les clés sont des chaînes de caractères",
        "Quand on lit une clé absente de la table",
      ],
      correctIndex: 0,
      explanation:
        "Si les collisions regroupent toutes les clés dans un seul bucket, la recherche devient un parcours de liste en O(n). Une clé absente ou des clés de type chaîne ne posent aucun problème en soi.",
      difficulty: "medium",
    },
    {
      id: "algorithms-data-structures-5",
      question:
        "On veut un cache LRU dont get et put sont tous deux en O(1). Quelle combinaison de structures convient ?",
      options: [
        "Un tableau trié par date d'accès",
        "Une table de hachage et une liste doublement chaînée",
        "Une pile et une file",
        "Un arbre binaire de recherche équilibré",
      ],
      correctIndex: 1,
      explanation:
        "La table de hachage retrouve un noeud en O(1), et la liste doublement chaînée le déplace en tête ou supprime le plus ancien en O(1). Un arbre équilibré ou un tableau trié coûtent O(log n) ou O(n).",
      difficulty: "hard",
    },
  ],

  "/tech-mastry/algorithms/greedy": [
    {
      id: "algorithms-greedy-1",
      question:
        "Pour choisir le maximum d'activités sans chevauchement, selon quel critère faut-il trier avant de choisir gloutonnement ?",
      options: [
        "Par heure de début croissante",
        "Par durée croissante",
        "Par heure de fin croissante",
        "Par heure de fin décroissante",
      ],
      correctIndex: 2,
      explanation:
        "L'activité qui finit le plus tôt laisse le plus de place aux suivantes ; c'est le seul de ces critères qui est prouvé optimal. Trier par début ou par durée admet des contre-exemples.",
      difficulty: "easy",
    },
    {
      id: "algorithms-greedy-2",
      question:
        "Avec les pièces {1, 3, 4} et un montant de 6, la stratégie gloutonne prend toujours la plus grande pièce possible. Que se passe-t-il ?",
      options: [
        "Elle rend 4+1+1 (3 pièces) alors que 3+3 (2 pièces) est optimal",
        "Elle rend 3+3, qui est optimal",
        "Elle rend 4+1+1 qui est optimal, car 4 est la plus grande pièce",
        "Elle échoue car 6 n'est pas atteignable avec ces pièces",
      ],
      correctIndex: 0,
      explanation:
        "Le choix local de la pièce 4 conduit à 3 pièces, alors que 3+3 en utilise 2. Pour des systèmes de pièces arbitraires, le rendu de monnaie demande la programmation dynamique.",
      difficulty: "easy",
    },
    {
      id: "algorithms-greedy-3",
      question: "Parmi ces problèmes, lequel n'est PAS résolu correctement par une stratégie gloutonne simple ?",
      options: [
        "La sélection d'activités",
        "Le sac à dos fractionnaire",
        "L'arbre couvrant minimum avec Kruskal",
        "Le sac à dos 0/1",
      ],
      correctIndex: 3,
      explanation:
        "Dans le sac à dos 0/1, on ne peut pas prendre de fraction : le meilleur ratio valeur/poids peut laisser de la capacité inutilisée et être battu par une autre combinaison. Il se résout par programmation dynamique en O(n×W).",
      difficulty: "medium",
    },
    {
      id: "algorithms-greedy-4",
      question:
        "Dans l'algorithme de Kruskal avec une structure union-find, quelle étape domine le coût en O(E log E) ?",
      options: [
        "Les opérations find avec compression de chemin",
        "Le tri des arêtes par poids",
        "Le test de cycle pour chaque arête",
        "La construction de la liste d'adjacence",
      ],
      correctIndex: 1,
      explanation:
        "Trier les E arêtes coûte O(E log E). Avec compression de chemin et union par rang, chaque find/union est presque constant (inverse d'Ackermann), donc le test de cycle ne domine pas.",
      difficulty: "medium",
    },
    {
      id: "algorithms-greedy-5",
      question:
        "On trie les activités par durée croissante au lieu de l'heure de fin. Avec A(0-6), B(5-7), C(6-12), qu'obtient-on ?",
      options: [
        "A puis C, soit 2 activités, ce qui est optimal",
        "A, B et C sont tous compatibles",
        "B (la plus courte), qui bloque A et C : 1 activité au lieu de 2",
        "C seule, car c'est la plus longue",
      ],
      correctIndex: 2,
      explanation:
        "B dure 2 et chevauche A (jusqu'à 6) et C (à partir de 6 mais B finit à 7), donc le choix glouton par durée donne 1 activité alors que A puis C en donnent 2. C'est un contre-exemple : seul le tri par fin est correct.",
      difficulty: "hard",
    },
  ],

  "/tech-mastry/algorithms/backtracking": [
    {
      id: "algorithms-backtracking-1",
      question:
        "Dans un algorithme de backtracking, quelle étape suit l'appel récursif et permet d'essayer le choix suivant ?",
      options: [
        "Recopier tout le tableau de solutions",
        "Relancer la fonction depuis la racine",
        "Trier les choix restants",
        "Annuler le choix (par exemple path.pop())",
      ],
      correctIndex: 3,
      explanation:
        "Après l'exploration d'un choix, il faut défaire son effet pour que l'état soit identique avant d'essayer l'alternative suivante. Sans cela, les choix s'accumulent et les solutions sont fausses.",
      difficulty: "easy",
    },
    {
      id: "algorithms-backtracking-2",
      question: "Combien de permutations existe-t-il pour 4 éléments distincts ?",
      options: ["16", "24", "12", "64"],
      correctIndex: 1,
      explanation:
        "Il y en a 4! = 4 × 3 × 2 × 1 = 24. Le nombre 16 correspond à 2⁴ (sous-ensembles) et 64 à 4³, qui ne comptent pas des ordres sans répétition.",
      difficulty: "easy",
    },
    {
      id: "algorithms-backtracking-3",
      question:
        "Ce code génère les sous-ensembles de a, mais res se retrouve rempli de tableaux vides. Pourquoi ?\n\nfunction sub(i) {\n  if (i === n) { res.push(path); return; }\n  path.push(a[i]); sub(i + 1);\n  path.pop(); sub(i + 1);\n}",
      options: [
        "res.push(path) stocke la même référence, vidée par les pop() : il faut push([...path])",
        "path.pop() est appelé trop tôt, avant l'appel récursif",
        "La condition d'arrêt devrait être i > n",
        "Il manque un tri de a avant la récursion",
      ],
      correctIndex: 0,
      explanation:
        "Tous les éléments de res pointent vers le même tableau path, qui est vide une fois la récursion terminée. Il faut enregistrer une copie à chaque feuille.",
      difficulty: "medium",
    },
    {
      id: "algorithms-backtracking-4",
      question:
        "Pour N-Queens, pourquoi place-t-on une reine par ligne, ligne après ligne ?",
      options: [
        "Cela évite d'utiliser la récursion",
        "Cela garantit que les diagonales ne se touchent jamais",
        "La contrainte de ligne est satisfaite par construction : il ne reste que colonnes et diagonales à vérifier",
        "Cela rend la complexité polynomiale",
      ],
      correctIndex: 2,
      explanation:
        "Une reine par ligne élimine la contrainte de ligne et réduit l'espace de recherche à au plus n! configurations. Le problème reste exponentiel et les diagonales doivent toujours être vérifiées.",
      difficulty: "medium",
    },
    {
      id: "algorithms-backtracking-5",
      question:
        "On cherche un sous-ensemble de nombres positifs de somme cible T, en abandonnant une branche dès que la somme partielle dépasse T. Quel est l'effet sur la complexité au pire cas ?",
      options: [
        "Elle devient polynomiale en n",
        "Elle reste O(2ⁿ) au pire cas, mais élague beaucoup en pratique",
        "Elle passe de O(2ⁿ) à O(n log n)",
        "Elle devient O(n!) à cause du tri préalable",
      ],
      correctIndex: 1,
      explanation:
        "L'élagage réduit le nombre de noeuds visités sur les entrées courantes, mais une entrée adverse (cible élevée, aucun dépassement) force toujours 2ⁿ branches. Un gain pratique n'est pas un changement de classe de complexité.",
      difficulty: "hard",
    },
  ],

  "/tech-mastry/algorithms/graph-algorithms": [
    {
      id: "algorithms-graph-algorithms-1",
      question:
        "Quel algorithme donne le plus court chemin, en nombre d'arêtes, dans un graphe non pondéré ?",
      options: [
        "BFS (parcours en largeur)",
        "DFS (parcours en profondeur)",
        "Le tri topologique",
        "L'algorithme de Kruskal",
      ],
      correctIndex: 0,
      explanation:
        "BFS explore les noeuds par niveaux, donc par distance croissante depuis la source. DFS suit une branche à fond et peut trouver un chemin beaucoup plus long.",
      difficulty: "easy",
    },
    {
      id: "algorithms-graph-algorithms-2",
      question:
        "Dans un graphe de dépendances de build, on a A→B, B→C et C→A. Que se passe-t-il pour le tri topologique ?",
      options: [
        "Il retourne A, B, C",
        "Il retourne C, B, A",
        "Il est impossible : le graphe contient un cycle",
        "Il est possible mais seulement en ignorant l'arête C→A",
      ],
      correctIndex: 2,
      explanation:
        "Un ordre topologique n'existe que pour un graphe orienté acyclique (DAG). Ici chaque noeud dépend indirectement de lui-même, aucun ordre ne respecte toutes les arêtes.",
      difficulty: "easy",
    },
    {
      id: "algorithms-graph-algorithms-3",
      question:
        "Arêtes A→B (2), A→C (5), C→B (-4). Dijkstra depuis A, qui finalise B avant d'examiner C, renvoie quelle distance pour B ?",
      options: [
        "1, car Dijkstra gère les poids négatifs",
        "-4, qui est le plus petit poids du graphe",
        "5, car il passe obligatoirement par C",
        "2, alors que la vraie distance est 1 : Dijkstra suppose des poids ≥ 0",
      ],
      correctIndex: 3,
      explanation:
        "Dijkstra considère une distance finalisée comme définitive, ce qui n'est vrai qu'avec des poids non négatifs. Ici A→C→B vaut 5 + (-4) = 1 ; Bellman-Ford le trouverait.",
      difficulty: "medium",
    },
    {
      id: "algorithms-graph-algorithms-4",
      question:
        "Comment Bellman-Ford détecte-t-il un cycle de poids négatif accessible depuis la source ?",
      options: [
        "Un tri topologique échoue",
        "Une V-ième passe sur les arêtes améliore encore une distance",
        "Une distance devient nulle",
        "Le nombre d'arêtes dépasse V-1",
      ],
      correctIndex: 1,
      explanation:
        "Sans cycle négatif, V-1 passes suffisent à stabiliser les distances. Si une V-ième passe relaxe encore une arête, on peut boucler indéfiniment pour diminuer le coût.",
      difficulty: "medium",
    },
    {
      id: "algorithms-graph-algorithms-5",
      question:
        "Pour un graphe creux de V = 100 000 sommets et E = 500 000 arêtes à poids positifs, quelle implémentation de Dijkstra est adaptée ?",
      options: [
        "Un tableau de distances parcouru en entier à chaque étape, O(V²) ≈ 10¹⁰",
        "Un BFS classique, O(V+E)",
        "Bellman-Ford, O(V×E) ≈ 5×10¹⁰",
        "Une file de priorité (tas binaire), O((V+E) log V) ≈ 10⁷",
      ],
      correctIndex: 3,
      explanation:
        "Avec un tas binaire, le coût est environ 600 000 × 17 ≈ 10⁷ opérations. La version en tableau O(V²) ne convient qu'aux graphes denses, et BFS est faux pour des poids quelconques.",
      difficulty: "hard",
    },
  ],

  "/tech-mastry/algorithms/dynamic-programming": [
    {
      id: "algorithms-dynamic-programming-1",
      question: "Pourquoi le Fibonacci récursif naïf est-il en O(2ⁿ) ?",
      options: [
        "Parce qu'il utilise un tableau de taille 2ⁿ",
        "Parce qu'il recalcule de très nombreuses fois les mêmes sous-problèmes",
        "Parce que la récursion est toujours exponentielle",
        "Parce que les additions deviennent plus coûteuses",
      ],
      correctIndex: 1,
      explanation:
        "fib(n) appelle fib(n-1) et fib(n-2), qui recalculent les mêmes valeurs en cascade. Mémoriser chaque résultat ramène le coût à O(n) ; la récursion en elle-même n'est pas la cause.",
      difficulty: "easy",
    },
    {
      id: "algorithms-dynamic-programming-2",
      question:
        "Pour quel problème la programmation dynamique n'apporte-t-elle rien, faute de sous-problèmes qui se chevauchent ?",
      options: [
        "La plus longue sous-séquence commune",
        "Le nombre de chemins dans une grille",
        "Le sac à dos 0/1",
        "Le tri fusion",
      ],
      correctIndex: 3,
      explanation:
        "Dans le tri fusion, chaque moitié du tableau est un sous-problème distinct, jamais recalculé : diviser pour régner suffit. LCS, grille et sac à dos réutilisent les mêmes états (i, j).",
      difficulty: "easy",
    },
    {
      id: "algorithms-dynamic-programming-3",
      question:
        "Combien de chemins existent d'en haut à gauche à en bas à droite d'une grille 3×3, en se déplaçant seulement à droite ou en bas ?\n\ndp[i][j] = dp[i-1][j] + dp[i][j-1]",
      options: ["6", "9", "8", "4"],
      correctIndex: 0,
      explanation:
        "La première ligne et la première colonne valent 1, puis dp[1][1]=2, dp[1][2]=dp[2][1]=3 et dp[2][2]=6 (soit C(4,2)). 9 serait le nombre de cases, pas de chemins.",
      difficulty: "medium",
    },
    {
      id: "algorithms-dynamic-programming-4",
      question:
        "Quelle est la longueur de la plus longue sous-séquence commune de \"ABCD\" et \"ACBD\" ?",
      options: ["2", "4", "3", "1"],
      correctIndex: 2,
      explanation:
        "\"ABD\" et \"ACD\" sont des sous-séquences communes de longueur 3 ; 4 imposerait que les chaînes soient identiques. Une sous-séquence peut sauter des caractères mais doit garder l'ordre.",
      difficulty: "medium",
    },
    {
      id: "algorithms-dynamic-programming-5",
      question:
        "Le sac à dos 0/1 se résout en O(n×W). Pourquoi cette complexité n'est-elle pas considérée comme polynomiale ?",
      options: [
        "W est codé sur log W bits : le temps est exponentiel en la taille de l'entrée",
        "Parce que la table contient n×W cases, ce qui est trop grand",
        "Parce que le problème est résolu de façon gloutonne",
        "Parce que la récursion fait doubler le nombre d'appels",
      ],
      correctIndex: 0,
      explanation:
        "Le temps dépend de la valeur numérique de W, pas du nombre de bits qui la représente : on parle de complexité pseudo-polynomiale. Le problème reste NP-difficile.",
      difficulty: "hard",
    },
  ],
};
