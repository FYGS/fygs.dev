import type { AreaQuizzes } from "./types";

export const practiceQuizzes: AreaQuizzes = {
  "/tech-mastry/challenges": [
    {
      id: "practice-challenges-1",
      question: "Dans Two Sum, pourquoi stocker les nombres déjà vus dans une Map fait passer la complexité de O(n²) à O(n) ?",
      options: [
        "La Map trie les nombres à l'insertion, ce qui permet ensuite une recherche dichotomique à chaque étape",
        "Chercher le complément target - x dans la Map coûte O(1) en moyenne, sans second parcours",
        "La Map évite toute allocation supplémentaire, donc la solution garde un espace O(1) sans parcours imbriqué",
        "La Map mémorise les indices déjà testés, mais il faut toujours comparer chaque nombre à tous les autres",
      ],
      correctIndex: 1,
      explanation:
        "Le second parcours est remplacé par une recherche en O(1) amorti, ce qui donne un seul passage. Le gain se paie en mémoire : l'espace passe de O(1) à O(n).",
      difficulty: "easy",
    },
    {
      id: "practice-challenges-2",
      question: "Quelle structure de données permet de vérifier que les parenthèses (), [] et {} d'une chaîne sont correctement imbriquées ?",
      options: [
        "Une file FIFO, car on doit comparer la première ouvrante avec la première fermante",
        "Un tas minimum, car il garde le plus petit symbole accessible en premier",
        "Une table de hachage qui compte le nombre d'ouvrantes et de fermantes de chaque type",
        "Une pile LIFO, car la dernière ouvrante rencontrée doit être la première refermée",
      ],
      correctIndex: 3,
      explanation:
        "L'imbrication est un comportement dernier entré, premier sorti. Un simple compteur accepterait à tort « ([)] » puisque les nombres sont équilibrés mais l'ordre est faux.",
      difficulty: "easy",
    },
    {
      id: "practice-challenges-3",
      question:
        "Dans ce parcours par niveaux, pourquoi lit-on queue.length dans levelSize avant la boucle for ?\nwhile (queue.length > 0) {\n  const levelSize = queue.length;\n  for (let i = 0; i < levelSize; i++) {\n    /* retirer un nœud, ajouter ses enfants */\n  }\n}",
      options: [
        "levelSize fige le nombre de nœuds du niveau, car la file grossit pendant la boucle",
        "Cela évite un dépassement de pile, car la boucle for est en réalité une récursion déguisée",
        "Cela garantit que shift() s'exécute en O(1), car la taille de la file est connue d'avance",
        "Cela trie les valeurs du niveau par ordre croissant avant de les ajouter au résultat",
      ],
      correctIndex: 0,
      explanation:
        "Sans cette copie, la condition i < queue.length mélangerait les nœuds de plusieurs niveaux, car la file grossit à chaque ajout. Le BFS n'est pas récursif et ne trie rien.",
      difficulty: "medium",
    },
    {
      id: "practice-challenges-4",
      question: "Un test caché appelle levelOrder(null), c'est-à-dire un arbre vide. Quelle garde au début de la fonction est indispensable ?",
      options: [
        "if (root.left === null) return [];",
        "if (queue.length > 1) return [];",
        "if (!root) return [];",
        "if (root.val === 0) return [];",
      ],
      correctIndex: 2,
      explanation:
        "Il faut tester la racine elle-même avant de la déréférencer. Les autres gardes lisent root.val ou root.left sur null et lèvent une TypeError, ce que les tests cachés d'entrée vide sont conçus pour révéler.",
      difficulty: "medium",
    },
    {
      id: "practice-challenges-5",
      question: "Un BFS écrit avec un tableau JavaScript et queue.shift() à chaque extraction : que faut-il savoir sur sa complexité réelle ?",
      options: [
        "shift() est toujours O(1), car les tableaux JavaScript sont implémentés comme des listes chaînées",
        "shift() peut coûter O(n) sur un grand tableau : le BFS dérive vers O(n²), d'où l'index de tête",
        "shift() libère le nœud sans le décaler, ce qui donne un BFS en O(log n) par extraction",
        "shift() trie la file à chaque appel, ce qui impose un coût de O(n log n) par niveau",
      ],
      correctIndex: 1,
      explanation:
        "Retirer le premier élément d'un grand tableau peut obliger le moteur à décaler tous les suivants. Pour des entrées volumineuses, on avance un index de lecture ou on utilise une vraie file.",
      difficulty: "hard",
    },
  ],

  "/tech-mastry/challenges/solutions": [
    {
      id: "practice-challenges-solutions-1",
      question: "Dans l'algorithme de Kadane, que traduit currentSum = Math.max(nums[i], currentSum + nums[i]) ?",
      options: [
        "Étendre le sous-tableau courant ou repartir de nums[i], selon la meilleure somme",
        "Toujours additionner l'élément courant, puis comparer plus tard au maximum global",
        "Retenir le plus petit élément rencontré pour pouvoir l'exclure du sous-tableau final",
        "Trier le tableau pour que les plus grandes valeurs soient additionnées en premier",
      ],
      correctIndex: 0,
      explanation:
        "Le sous-problème est « meilleure somme d'un sous-tableau qui se termine en i ». Si la somme précédente est négative, elle ne peut qu'alourdir : on repart de nums[i].",
      difficulty: "easy",
    },
    {
      id: "practice-challenges-solutions-2",
      question: "Quelle est la première étape de la solution standard de Merge Intervals ?",
      options: [
        "Trier les intervalles par durée croissante pour fusionner les plus courts d'abord",
        "Placer tous les débuts d'intervalle dans un Set pour détecter les doublons",
        "Trier par début croissant, pour que les chevauchements deviennent adjacents",
        "Comparer chaque paire d'intervalles avec deux boucles imbriquées avant toute fusion",
      ],
      correctIndex: 2,
      explanation:
        "Une fois triés par début, deux intervalles qui se chevauchent sont forcément voisins, et un seul passage suffit. La double boucle donnerait O(n²) sans simplifier la logique.",
      difficulty: "easy",
    },
    {
      id: "practice-challenges-solutions-3",
      question: "La solution de Merge Intervals ne contient qu'une seule boucle de fusion, pourquoi n'est-elle pas en O(n) ?",
      options: [
        "Parce que la fusion compare chaque intervalle à tous les précédents dans result",
        "Parce que Math.max est en O(log n) et il est appelé à chaque itération",
        "Parce que result.push recopie le tableau à chaque ajout, d'où un coût quadratique",
        "Le tri préalable en O(n log n) domine le parcours linéaire qui suit",
      ],
      correctIndex: 3,
      explanation:
        "Le parcours est linéaire, mais le tri est le goulot : O(n log n) au total. La fusion ne compare qu'avec le dernier intervalle de result, pas avec tous.",
      difficulty: "medium",
    },
    {
      id: "practice-challenges-solutions-4",
      question:
        "Que retourne cette variante de Kadane sur [-3, -1, -2], et est-ce correct ?\nlet cur = 0, best = 0;\nfor (const x of [-3, -1, -2]) {\n  cur = Math.max(x, cur + x);\n  best = Math.max(best, cur);\n}\nreturn best;",
      options: [
        "-1, ce qui est correct car le meilleur sous-tableau est [-1]",
        "0, faux : le sous-tableau doit être non vide, la bonne réponse est -1",
        "-3, car la boucle s'arrête au premier élément négatif rencontré",
        "-6, car la somme de tout le tableau est retournée quand tout est négatif",
      ],
      correctIndex: 1,
      explanation:
        "best démarre à 0 et aucune somme négative ne peut le dépasser, donc la fonction renvoie 0, somme d'un sous-tableau vide. Il faut initialiser cur et best avec nums[0].",
      difficulty: "medium",
    },
    {
      id: "practice-challenges-solutions-5",
      question:
        "Avec ce code de fusion, quel effet de bord subit le tableau d'entrée ?\nintervals.sort((a, b) => a[0] - b[0]);\nconst result = [intervals[0]];\n// ...\nlast[1] = Math.max(last[1], current[1]);",
      options: [
        "L'entrée est triée sur place et ses intervalles sont modifiés (mêmes références)",
        "Aucun : result est une copie profonde, l'entrée reste intacte",
        "Seul l'ordre change, les valeurs des intervalles restent exactement celles d'origine",
        "Les intervalles absorbés par une fusion sont supprimés du tableau d'entrée",
      ],
      correctIndex: 0,
      explanation:
        "sort() travaille sur place et result[0] est le même tableau que intervals[0] : écrire last[1] modifie l'entrée de l'appelant. On copie les intervalles ([...x]) si l'entrée doit rester intacte.",
      difficulty: "hard",
    },
  ],

  "/tech-mastry/coding-challenges": [
    {
      id: "practice-coding-challenges-1",
      question: "Pour trouver la plus longue sous-chaîne sans caractère répété, quel pattern reconnaître ?",
      options: [
        "Un backtracking qui génère toutes les sous-chaînes possibles",
        "Un tri des caractères suivi d'une recherche dichotomique",
        "Une table de programmation dynamique à deux dimensions",
        "Une fenêtre glissante avec un Set des caractères présents",
      ],
      correctIndex: 3,
      explanation:
        "On élargit la fenêtre à droite et on la rétrécit à gauche dès qu'un doublon apparaît, soit O(n). Générer toutes les sous-chaînes serait cubique et le tri détruirait l'ordre qui compte ici.",
      difficulty: "easy",
    },
    {
      id: "practice-coding-challenges-2",
      question: "Dans une grille où chaque déplacement coûte 1, quel parcours trouve le plus court chemin entre deux cases ?",
      options: [
        "Un DFS, car il va au bout d'un chemin avant d'essayer les autres",
        "Un BFS, car il explore par distance croissante depuis le départ",
        "Un tri topologique, car il ordonne les cases de la sortie vers l'entrée",
        "Un algorithme de Kruskal, car il retient les arêtes les plus légères",
      ],
      correctIndex: 1,
      explanation:
        "Le BFS visite d'abord toutes les cases à distance k avant celles à distance k+1 : la première arrivée est la plus courte. Le DFS peut atteindre la cible par un chemin bien plus long.",
      difficulty: "easy",
    },
    {
      id: "practice-coding-challenges-3",
      question: "Dans un tableau trié, on cherche deux éléments de somme donnée en O(n) temps et O(1) mémoire. Quelle approche choisir ?",
      options: [
        "Une Map des compléments, qui est en O(n) temps mais demande O(n) mémoire",
        "Deux boucles imbriquées, qui n'utilisent aucune mémoire mais coûtent O(n²) en temps",
        "Deux pointeurs qui convergent depuis les extrémités selon la somme obtenue",
        "Une recherche dichotomique du complément pour chaque élément, en O(n log n)",
      ],
      correctIndex: 2,
      explanation:
        "Le tri permet de savoir quel pointeur déplacer à chaque comparaison, d'où un seul passage sans mémoire. Les trois autres approches violent la contrainte de temps ou d'espace.",
      difficulty: "medium",
    },
    {
      id: "practice-coding-challenges-4",
      question: "Quelle combinaison de propriétés signale qu'un problème se résout par programmation dynamique ?",
      options: [
        "Des sous-problèmes qui se recoupent et une solution optimale bâtie sur eux",
        "Des données déjà triées et un parcours qui ne lit l'entrée qu'une seule fois",
        "Un graphe sans cycle dont les nœuds se traitent dans l'ordre topologique des dépendances",
        "Un parcours qui doit lister les éléments niveau par niveau en utilisant une file",
      ],
      correctIndex: 0,
      explanation:
        "Sans recoupement, comme dans un tri fusion, la mémoïsation n'apporte rien : le diviser pour régner suffit. C'est la répétition de sous-problèmes identiques qui justifie de stocker les résultats.",
      difficulty: "medium",
    },
    {
      id: "practice-coding-challenges-5",
      question: "En entretien, après dix minutes, vous ne voyez pas la solution optimale. Quelle est la meilleure attitude ?",
      options: [
        "Rester silencieux jusqu'à trouver l'idée, pour ne pas montrer d'hésitation à l'intervieweur",
        "Demander à passer à une autre question, puisque celle-ci semble trop difficile pour vous",
        "Coder la brute force correcte, la chiffrer, puis chercher le travail répété à supprimer",
        "Deviner un pattern et coder directement l'optimisation, sans la tester sur un exemple",
      ],
      correctIndex: 2,
      explanation:
        "Une solution correcte et analysée vaut mieux qu'une idée inachevée, et elle expose le travail répété que l'optimisation supprimera. Penser à voix haute permet aussi à l'intervieweur de vous guider.",
      difficulty: "hard",
    },
  ],

  "/tech-mastry/interview-simulation": [
    {
      id: "practice-interview-simulation-1",
      question: "Qu'affiche cette ligne de code, question classique d'un entretien JavaScript ?\nconsole.log(0 == '0', 0 === '0');",
      options: [
        "false false",
        "true true",
        "true false",
        "false true",
      ],
      correctIndex: 2,
      explanation:
        "== convertit les types avant de comparer (« 0 » devient 0), alors que === compare aussi le type et refuse number contre string. En pratique on utilise presque toujours ===.",
      difficulty: "easy",
    },
    {
      id: "practice-interview-simulation-2",
      question: "Que signifie STAR dans la réponse à une question comportementale ?",
      options: [
        "Situation, Tâche, Action, Résultat",
        "Stratégie, Test, Analyse, Revue",
        "Savoir, Technique, Approche, Réflexion",
        "Sprint, Tickets, Architecture, Release",
      ],
      correctIndex: 0,
      explanation:
        "STAR structure l'histoire : le contexte, votre rôle précis, ce que vous avez fait, et l'impact mesuré. C'est le résultat chiffré et votre rôle personnel que les recruteurs retiennent.",
      difficulty: "easy",
    },
    {
      id: "practice-interview-simulation-3",
      question: "On vous demande en 30 minutes de concevoir un raccourcisseur d'URL comme Bit.ly. Quelle est la meilleure première étape ?",
      options: [
        "Dessiner tout de suite le schéma de la base NoSQL et ses partitions",
        "Clarifier les besoins et les volumes : URLs par jour, lecture/écriture, latence",
        "Choisir le langage et le framework, puisque cela conditionne le reste de l'architecture",
        "Lister toutes les technologies de cache disponibles avant de parler des besoins",
      ],
      correctIndex: 1,
      explanation:
        "Sans chiffres, on ne peut justifier ni le stockage, ni le cache, ni le partitionnement. Plonger directement dans une technologie est l'erreur la plus fréquente en system design.",
      difficulty: "medium",
    },
    {
      id: "practice-interview-simulation-4",
      question: "Le minuteur de la simulation expire en pleine réponse et passe automatiquement à la question suivante. Quelle leçon en tirer ?",
      options: [
        "Parler plus vite pour tout dire avant la fin du temps imparti",
        "Ne jamais commencer de réponse longue et se limiter à une phrase",
        "Attendre la dernière seconde pour répondre afin d'avoir plus de temps de réflexion",
        "Donner d'abord le résumé et la décision, puis détailler les points un par un",
      ],
      correctIndex: 3,
      explanation:
        "Structurer de la conclusion vers le détail protège l'essentiel de la réponse face au temps limité, comme en vrai entretien. Accélérer le débit nuit à la clarté sans garantir plus de contenu.",
      difficulty: "medium",
    },
    {
      id: "practice-interview-simulation-5",
      question:
        "Dans une file de tâches distribuée, un worker plante après avoir exécuté une tâche mais avant de l'acquitter : elle sera rejouée. Quelle réponse est la plus solide ?",
      options: [
        "Désactiver les retries pour garantir qu'une tâche ne s'exécute jamais deux fois",
        "Acquitter le message dès sa réception, avant d'exécuter la tâche",
        "Ajouter davantage de workers pour que les doublons deviennent statistiquement rares",
        "Accepter une livraison at-least-once et rendre les tâches idempotentes",
      ],
      correctIndex: 3,
      explanation:
        "Supprimer les retries ou acquitter trop tôt fait perdre des tâches lors d'un crash, et le exactly-once natif est rarement garanti. Des traitements idempotents rendent le rejeu inoffensif.",
      difficulty: "hard",
    },
  ],

  "/tech-mastry/coding-challenges/arrays": [
    {
      id: "practice-coding-challenges-arrays-1",
      question: "Quelle est la complexité de Two Sum résolu avec deux boucles imbriquées (i, puis j > i) ?",
      options: [
        "O(n) en temps et O(n) en espace",
        "O(n²) en temps et O(1) en espace",
        "O(n log n) en temps et O(1) en espace",
        "O(n²) en temps et O(n) en espace",
      ],
      correctIndex: 1,
      explanation:
        "Il y a environ n(n-1)/2 paires à tester, sans structure auxiliaire. C'est la base de comparaison pour justifier l'optimisation par table de hachage.",
      difficulty: "easy",
    },
    {
      id: "practice-coding-challenges-arrays-2",
      question: "Pourquoi trier le tableau puis utiliser deux pointeurs ne répond-il pas directement à Two Sum quand on doit renvoyer des indices ?",
      options: [
        "Le tri coûte O(n²), ce qui est trop lent pour que les deux pointeurs apportent un gain",
        "Deux pointeurs ne fonctionnent que sur des tableaux de taille paire",
        "Après le tri, les positions d'origine sont perdues : il faut les garder à part",
        "Les deux pointeurs ne peuvent pas converger lorsque la cible est négative",
      ],
      correctIndex: 2,
      explanation:
        "Les valeurs trouvées sont correctes mais leurs indices ont changé avec le tri. On trie alors des paires (valeur, indice), ou on utilise la Map qui évite ce problème.",
      difficulty: "easy",
    },
    {
      id: "practice-coding-challenges-arrays-3",
      question: "Dans Longest Consecutive Sequence, pourquoi le test if (!numSet.has(num - 1)) garde-t-il l'algorithme en O(n) ?",
      options: [
        "Seul le début de chaque séquence déclenche un comptage",
        "Il supprime les doublons du tableau, ce qui réduit n avant le comptage",
        "Il trie implicitement le Set, ce qui rend les recherches suivantes plus rapides",
        "Il limite la longueur des séquences à n / 2, ce qui divise le travail par deux",
      ],
      correctIndex: 0,
      explanation:
        "Sans ce test, chaque élément relancerait un comptage dans sa séquence, ce qui donne O(n²). Avec lui, la boucle while ne s'exécute qu'à partir des débuts de séquence, soit O(n) au total.",
      difficulty: "medium",
    },
    {
      id: "practice-coding-challenges-arrays-4",
      question:
        "Quelle valeur renvoie best à la fin ?\nlet cur = 4, best = 4;\nfor (const x of [-5, 3, 2]) {\n  cur = Math.max(x, cur + x);\n  best = Math.max(best, cur);\n}",
      options: [
        "4",
        "3",
        "-1",
        "5",
      ],
      correctIndex: 3,
      explanation:
        "cur vaut successivement max(-5, -1) = -1, puis max(3, 2) = 3, puis max(2, 5) = 5. Le meilleur sous-tableau est [3, 2] avec 5, qui dépasse le maximum précédent 4 : best vaut donc 5.",
      difficulty: "medium",
    },
    {
      id: "practice-coding-challenges-arrays-5",
      question: "Pourquoi une fenêtre glissante classique échoue-t-elle pour « sous-tableau de somme exactement k » avec des valeurs négatives ?",
      options: [
        "La somme n'est plus monotone ; il faut des sommes préfixes et une Map",
        "La fenêtre ne peut pas dépasser la moitié du tableau quand certaines valeurs sont négatives",
        "Les valeurs négatives provoquent des dépassements d'entiers qui faussent la comparaison à k",
        "Le tri préalable devient obligatoire, ce qui est incompatible avec une fenêtre glissante",
      ],
      correctIndex: 0,
      explanation:
        "La fenêtre repose sur l'idée que rétrécir diminue la somme et élargir l'augmente, vrai seulement avec des valeurs positives. Avec des négatifs, on mémorise les sommes préfixes déjà vues pour tester préfixe - k en O(n).",
      difficulty: "hard",
    },
  ],

  "/tech-mastry/coding-challenges/strings": [
    {
      id: "practice-coding-challenges-strings-1",
      question: "Vérifier que deux chaînes de longueur n sont des anagrammes en les triant toutes les deux, puis en les comparant : quelle complexité en temps ?",
      options: [
        "O(1), car on compare seulement deux chaînes",
        "O(n), car chaque caractère est lu une seule fois",
        "O(n²), car chaque lettre est cherchée dans l'autre mot",
        "O(n log n)",
      ],
      correctIndex: 3,
      explanation:
        "Le tri des caractères domine (O(n log n)) ; la comparaison finale n'ajoute que O(n). Un compteur de fréquences permet de descendre à O(n).",
      difficulty: "easy",
    },
    {
      id: "practice-coding-challenges-strings-2",
      question:
        "Que renvoie ce test de palindrome naïf ?\nconst s = 'Radar';\nconsole.log(s === s.split('').reverse().join(''));",
      options: [
        "false : R et r diffèrent, la casse n'est pas normalisée",
        "true, car Radar se lit de la même façon dans les deux sens de lecture",
        "true, car === ignore la casse pour les chaînes de caractères JavaScript",
        "Une erreur, car reverse() n'existe pas sur les chaînes de caractères",
      ],
      correctIndex: 0,
      explanation:
        "L'inverse de « Radar » est « radaR » et la comparaison est sensible à la casse. D'où l'étape de normalisation (toLowerCase, suppression de la ponctuation) avant de comparer.",
      difficulty: "easy",
    },
    {
      id: "practice-coding-challenges-strings-3",
      question: "Quel est l'avantage d'un compteur de fréquences sur le tri pour tester un anagramme ?",
      options: [
        "Il conserve l'ordre des caractères, ce qui permet de reconstruire la chaîne d'origine",
        "Il n'utilise aucune mémoire supplémentaire, contrairement au tri",
        "Un seul passage en O(n) et une mémoire bornée par la taille de l'alphabet, sans tri",
        "Il fonctionne sans vérifier les longueurs, même quand les deux chaînes diffèrent",
      ],
      correctIndex: 2,
      explanation:
        "On incrémente pour une chaîne et on décrémente pour l'autre, puis on vérifie que tout est à zéro. Le compteur utilise bien de la mémoire (taille de l'alphabet) et une différence de longueur est un cas d'échec immédiat.",
      difficulty: "medium",
    },
    {
      id: "practice-coding-challenges-strings-4",
      question: "Quel gain apporte la méthode des deux pointeurs (début et fin qui convergent) par rapport à split, reverse, join pour un palindrome ?",
      options: [
        "Elle ignore automatiquement la casse et la ponctuation sans code supplémentaire",
        "Aucune copie inversée de la chaîne, et arrêt dès la première différence",
        "Elle passe de O(n) à O(log n) en temps, car on ne lit que la moitié des caractères",
        "Elle fonctionne pour les emojis, ce que split('') ne sait pas gérer",
      ],
      correctIndex: 1,
      explanation:
        "On compare sans allouer de chaîne inversée et on s'arrête au premier désaccord. Le temps reste O(n) dans le pire cas, et la normalisation reste à faire par ailleurs.",
      difficulty: "medium",
    },
    {
      id: "practice-coding-challenges-strings-5",
      question:
        "Que renvoie ce code et que révèle-t-il ?\nconst clean = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');\nclean('école') === clean('cole');",
      options: [
        "false, car le é est conservé et les deux mots restent différents",
        "true, car le é est supprimé : c'est un bug de normalisation",
        "true, ce qui est correct car é et e sont considérés comme équivalents",
        "Une erreur, car la regex ne supporte pas les caractères accentués",
      ],
      correctIndex: 1,
      explanation:
        "La classe [^a-z0-9] retire toute lettre accentuée, donc « école » devient « cole ». Pour du texte français, on normalise avec normalize('NFD') ou on utilise \\p{L} avec le drapeau u.",
      difficulty: "hard",
    },
  ],

  "/tech-mastry/coding-challenges/trees": [
    {
      id: "practice-coding-challenges-trees-1",
      question: "Que produit un parcours inorder (gauche, nœud, droite) d'un arbre binaire de recherche valide ?",
      options: [
        "Les valeurs triées par ordre croissant",
        "Les valeurs triées par ordre décroissant",
        "Les valeurs niveau par niveau, de la racine vers les feuilles",
        "Les feuilles d'abord, puis la racine en dernier",
      ],
      correctIndex: 0,
      explanation:
        "Tout le sous-arbre gauche est inférieur au nœud et tout le sous-arbre droit supérieur, donc gauche-nœud-droite donne l'ordre croissant. C'est aussi une façon de valider un BST.",
      difficulty: "easy",
    },
    {
      id: "practice-coding-challenges-trees-2",
      question: "Quelle est la complexité de maxDepth récursif sur un arbre binaire de n nœuds et de hauteur h ?",
      options: [
        "O(log n) en temps et O(1) en espace",
        "O(n) en temps et O(n²) en espace",
        "O(h) en temps et O(n) en espace",
        "O(n) en temps, O(h) en pile",
      ],
      correctIndex: 3,
      explanation:
        "Chaque nœud est visité une fois, et la récursion empile au plus h appels. Sur un arbre dégénéré (liste), h vaut n, d'où le risque de dépassement de pile.",
      difficulty: "easy",
    },
    {
      id: "practice-coding-challenges-trees-3",
      question:
        "Cette validation de BST ne compare chaque nœud qu'à ses enfants directs. Que renvoie-t-elle sur l'arbre 5 (gauche 1, droite 6 qui a pour enfants 3 et 7) ?\nif (n.left && n.left.val >= n.val) return false;\nif (n.right && n.right.val <= n.val) return false;\nreturn bad(n.left) && bad(n.right);",
      options: [
        "false, car 3 est inférieur à 5 et la fonction le détecte bien",
        "true, à tort : 3 est à droite de 5 sans y être supérieur ; il faut des bornes",
        "true, et c'est correct car chaque nœud respecte la règle avec ses enfants directs",
        "Une boucle infinie, car la fonction rappelle bad sur des enfants null",
      ],
      correctIndex: 1,
      explanation:
        "La règle du BST s'applique à tout le sous-arbre, pas seulement aux enfants. La version correcte passe (min, max) à la récursion et rejette un nœud hors de ses bornes.",
      difficulty: "medium",
    },
    {
      id: "practice-coding-challenges-trees-4",
      question: "Pourquoi la sérialisation d'un arbre écrit-elle un marqueur « null » pour chaque enfant absent ?",
      options: [
        "Pour garantir que l'arbre désérialisé est équilibré",
        "Parce que le format texte interdit les chaînes de longueur variable dans la sortie",
        "Sans marqueurs, la structure n'est pas reconstructible de façon unique",
        "Pour réduire la taille de la chaîne en regroupant les feuilles",
      ],
      correctIndex: 2,
      explanation:
        "Les valeurs 1,2,3 pourraient décrire plusieurs formes d'arbre ; les null indiquent où chaque sous-arbre s'arrête. Ils augmentent légèrement la taille au lieu de la réduire.",
      difficulty: "medium",
    },
    {
      id: "practice-coding-challenges-trees-5",
      question:
        "Que renvoie cet ancêtre commun quand p est dans l'arbre mais que q n'y est pas ?\nif (!root || root === p || root === q) return root;\nconst l = lca(root.left, p, q);\nconst r = lca(root.right, p, q);\nreturn l && r ? root : l || r;",
      options: [
        "null, car l'algorithme détecte que q est absent",
        "La racine, car c'est l'ancêtre de tous les nœuds",
        "p, résultat erroné : l'algorithme suppose que p et q existent",
        "Une exception, car l'un des deux appels récursifs renvoie undefined",
      ],
      correctIndex: 2,
      explanation:
        "Seul p est trouvé, l'un des côtés reste null et le code renvoie le côté non null, donc p. Si l'existence des nœuds n'est pas garantie, il faut compter les nœuds trouvés ou vérifier ensuite.",
      difficulty: "hard",
    },
  ],

  "/tech-mastry/coding-challenges/graphs": [
    {
      id: "practice-coding-challenges-graphs-1",
      question: "Dans Dijkstra, quelle structure retrouve efficacement le nœud non traité de plus petite distance ?",
      options: [
        "Une pile, car le dernier nœud ajouté est le plus proche",
        "Une file FIFO, car les nœuds sont ajoutés par distance croissante",
        "Un tas minimum (file de priorité), extraction en O(log n)",
        "Une table de hachage indexée par nœud, qui retrouve la distance en O(1)",
      ],
      correctIndex: 2,
      explanation:
        "Le tas donne le minimum à chaque extraction, pour un total en O((V + E) log V). Trier un tableau à chaque itération, comme le fait la solution de la page, est plus coûteux.",
      difficulty: "easy",
    },
    {
      id: "practice-coding-challenges-graphs-2",
      question: "À la fin de l'algorithme de Kahn, result.length est inférieur au nombre de nœuds. Que cela signifie-t-il ?",
      options: [
        "Le graphe n'est pas connexe, mais un tri topologique reste possible",
        "Le graphe contient un cycle, donc aucun ordre topologique n'existe",
        "Il manque des arêtes sortantes et il faut relancer l'algorithme",
        "Certains nœuds ont un degré entrant négatif",
      ],
      correctIndex: 1,
      explanation:
        "Les nœuds d'un cycle ne voient jamais leur degré entrant tomber à 0, ils ne sont donc jamais ajoutés au résultat. Un graphe non connexe se traite normalement.",
      difficulty: "easy",
    },
    {
      id: "practice-coding-challenges-graphs-3",
      question: "Pourquoi un simple ensemble visited ne suffit-il pas pour détecter un cycle dans un graphe orienté ?",
      options: [
        "Deux chemins peuvent mener au même nœud sans cycle (diamant)",
        "Parce que visited ne peut contenir que des nombres et pas des identifiants de nœud",
        "Parce que le DFS ne peut pas parcourir les arêtes orientées dans le bon sens",
        "Parce qu'un cycle n'existe que si le nœud de départ est revisité à la toute fin",
      ],
      correctIndex: 0,
      explanation:
        "Avec visited seul, le second accès à 3 dans le diamant serait pris pour un cycle. La pile de récursion ne contient que les ancêtres du nœud courant : y retomber prouve un cycle.",
      difficulty: "medium",
    },
    {
      id: "practice-coding-challenges-graphs-4",
      question: "Quel est le rôle d'Union-Find dans Kruskal, et quelle étape domine la complexité ?",
      options: [
        "Trier les arêtes par poids, et c'est Union-Find qui coûte le plus cher au total",
        "Calculer les distances depuis la source, avec une complexité totale en O(V²)",
        "Ordonner les nœuds topologiquement, d'où une complexité linéaire en la taille du graphe",
        "Détecter les cycles presque en O(1) ; le tri des arêtes en O(E log E) domine",
      ],
      correctIndex: 3,
      explanation:
        "Avec compression de chemin, find est quasi constant, et le tri des arêtes pèse O(E log E). Kruskal ne calcule pas de distances et ne suppose aucun ordre topologique.",
      difficulty: "medium",
    },
    {
      id: "practice-coding-challenges-graphs-5",
      question:
        "Graphe orienté : A→B (2), A→C (5), C→B (-4). Dijkstra part de A et s'arrête dès que B est extrait. Que renvoie-t-il pour B ?",
      options: [
        "2, alors que A→C→B vaut 1 : poids négatifs interdits pour Dijkstra",
        "1, car Dijkstra explore toujours toutes les arêtes avant de conclure",
        "-4, car l'arête de poids négatif est toujours privilégiée",
        "L'infini, car un poids négatif empêche l'algorithme de terminer",
      ],
      correctIndex: 0,
      explanation:
        "B est extrait à 2 avant que C (5) soit traité, et il est alors considéré comme définitif. Dijkstra suppose que passer par un autre nœud ne peut qu'allonger le chemin ; avec des poids négatifs, on utilise Bellman-Ford.",
      difficulty: "hard",
    },
  ],

  "/tech-mastry/coding-challenges/dp": [
    {
      id: "practice-coding-challenges-dp-1",
      question: "Que change la mémoïsation pour le calcul récursif naïf du n-ième nombre de Fibonacci ?",
      options: [
        "Elle passe de O(n) à O(1) en temps grâce à une formule fermée de Fibonacci",
        "De O(2^n) à O(n) : chaque sous-problème n'est calculé qu'une fois",
        "Elle supprime la récursion, donc l'espace passe de O(n) à O(1) en mémoire",
        "Elle passe de O(n²) à O(n log n) en triant les appels récursifs",
      ],
      correctIndex: 1,
      explanation:
        "Le fib(n-1) et le fib(n-2) naïfs recalculent sans cesse les mêmes valeurs, d'où l'arbre d'appels exponentiel. Avec un cache, il n'y a que n sous-problèmes distincts, mais la récursion garde O(n) de pile.",
      difficulty: "easy",
    },
    {
      id: "practice-coding-challenges-dp-2",
      question: "Avec la récurrence ways[i] = ways[i-1] + ways[i-2], ways[1] = 1 et ways[2] = 2, combien de façons de monter 5 marches ?",
      options: [
        "8",
        "5",
        "10",
        "13",
      ],
      correctIndex: 0,
      explanation:
        "La suite est 1, 2, 3, 5, 8 pour n = 1 à 5. C'est la suite de Fibonacci décalée : on arrive à la marche i depuis la marche i-1 ou i-2.",
      difficulty: "easy",
    },
    {
      id: "practice-coding-challenges-dp-3",
      question: "Avec les pièces 1, 3 et 4 et le montant 6, comparez la stratégie gloutonne (plus grosse pièce d'abord) et la DP.",
      options: [
        "Le glouton donne 2 pièces (3 + 3) et la DP aussi, les deux stratégies sont équivalentes",
        "Le glouton donne 3 pièces (4 + 1 + 1) et la DP aussi, car 3 pièces est le minimum",
        "Le glouton donne 2 pièces (4 + 1 + 1) et la DP 3 pièces (3 + 3)",
        "Le glouton donne 3 pièces (4 + 1 + 1), alors que la DP trouve 2 pièces (3 + 3)",
      ],
      correctIndex: 3,
      explanation:
        "Le choix local de la pièce 4 conduit à un résultat non optimal pour ce système de pièces. La DP essaie chaque pièce pour chaque montant et garde le minimum.",
      difficulty: "medium",
    },
    {
      id: "practice-coding-challenges-dp-4",
      question:
        "Dans Coin Change, pourquoi initialiser dp avec Infinity (sauf dp[0] = 0) et finir par un test sur Infinity ?\nconst dp = new Array(amount + 1).fill(Infinity);\ndp[0] = 0;\n// ... dp[i] = Math.min(dp[i], dp[i - coin] + 1)\nreturn dp[amount] === Infinity ? -1 : dp[amount];",
      options: [
        "Infinity accélère Math.min, et le test final sert uniquement à éviter un dépassement de mémoire",
        "Avec 0 comme valeur initiale, tout fonctionnerait de la même façon, Infinity n'est qu'une convention",
        "Infinity marque un montant pas encore atteint ; avec 0, min() ne mettrait jamais à jour",
        "Infinity garantit que les pièces sont utilisées dans l'ordre croissant",
      ],
      correctIndex: 2,
      explanation:
        "Une valeur initiale de 0 serait toujours « meilleure » que n'importe quel compte de pièces, et le minimum resterait faux. Infinity est l'élément neutre du min et signale un montant impossible.",
      difficulty: "medium",
    },
    {
      id: "practice-coding-challenges-dp-5",
      question:
        "Dans la version à une dimension du sac à dos 0/1, pourquoi la boucle sur c va-t-elle de W vers w[i] en décroissant ?\nfor (let i = 0; i < n; i++) {\n  for (let c = W; c >= w[i]; c--) {\n    dp[c] = Math.max(dp[c], dp[c - w[i]] + v[i]);\n  }\n}",
      options: [
        "Pour que les petites capacités, plus faciles à calculer, soient traitées en dernier lieu",
        "Pour réduire la complexité de O(nW) à O(n log W)",
        "Pour éviter un dépassement de tableau quand c est inférieur à w[i]",
        "Pour que dp[c - w[i]] soit encore l'état avant l'objet i (sinon objet réutilisable)",
      ],
      correctIndex: 3,
      explanation:
        "En parcourant en décroissant, les cases plus petites n'ont pas encore été mises à jour avec l'objet i. En croissant, on obtiendrait le sac à dos non borné, où chaque objet peut être pris à volonté.",
      difficulty: "hard",
    },
  ],

  "/tech-mastry/coding-challenges/system-design": [
    {
      id: "practice-coding-challenges-system-design-1",
      question: "Un raccourcisseur d'URL utilise 7 caractères en Base62 (a-z, A-Z, 0-9). Combien d'identifiants distincts cela représente-t-il environ ?",
      options: [
        "Environ 3,5 millions",
        "Environ 3,5 milliards",
        "Environ 56 milliards",
        "3,5 × 10^12",
      ],
      correctIndex: 3,
      explanation:
        "62^7 vaut environ 3,5 × 10^12, très largement au-dessus des 100 millions d'URLs actives de l'énoncé. Avec 6 caractères, on aurait déjà environ 57 milliards.",
      difficulty: "easy",
    },
    {
      id: "practice-coding-challenges-system-design-2",
      question: "Le raccourcisseur est très majoritairement sollicité en lecture (redirections). Quel est l'apport principal d'un cache Redis devant la base ?",
      options: [
        "Il remplace la base de données et supprime le besoin de stockage durable",
        "Il garantit l'unicité des identifiants générés",
        "Il sert les URLs populaires depuis la mémoire et protège la base",
        "Il chiffre les URLs pour empêcher leur lecture par des tiers",
      ],
      correctIndex: 2,
      explanation:
        "Une petite part des liens concentre l'essentiel du trafic, un cache en mémoire absorbe ces lectures. Redis perd ses données si on ne le persiste pas, il ne remplace donc pas la base.",
      difficulty: "easy",
    },
    {
      id: "practice-coding-challenges-system-design-3",
      question: "Pourquoi un fil d'actualité en fan-out à l'écriture pose-t-il problème pour les comptes à plusieurs millions d'abonnés ?",
      options: [
        "Parce que les abonnés ne peuvent pas lire un fil de tweets déjà calculé à l'avance",
        "Un tweet déclenche des millions d'écritures ; on lit les célébrités à la demande",
        "Parce que les caches ne peuvent pas stocker de simples identifiants de tweets",
        "Parce que le fan-out à l'écriture interdit toute pagination par curseur",
      ],
      correctIndex: 1,
      explanation:
        "Le coût d'écriture croît avec le nombre d'abonnés. Le modèle hybride précalcule le fil pour la majorité des comptes et fusionne à la lecture les tweets des célébrités.",
      difficulty: "medium",
    },
    {
      id: "practice-coding-challenges-system-design-4",
      question: "Quel défaut du rate limiter à fenêtre fixe (100 requêtes par minute) le token bucket corrige-t-il en grande partie ?",
      options: [
        "Deux rafales de 100 requêtes de part et d'autre du changement de minute passent",
        "Il est impossible de configurer une limite différente par utilisateur",
        "Il nécessite un stockage centralisé, alors que le token bucket n'en a pas besoin",
        "Il refuse toute rafale, même légitime, tandis que le token bucket les accepte toutes",
      ],
      correctIndex: 0,
      explanation:
        "À la frontière de deux fenêtres, les compteurs se remettent à zéro et laissent passer jusqu'à 2 fois la limite. Le token bucket lisse le débit tout en autorisant des rafales bornées par la taille du seau.",
      difficulty: "medium",
    },
    {
      id: "practice-coding-challenges-system-design-5",
      question:
        "Ce rate limiter Redis est-il fiable si le processus plante entre les deux lignes ?\nconst n = await redis.incr(key);\nif (n === 1) await redis.expire(key, 60);",
      options: [
        "Oui, INCR et EXPIRE sont toujours exécutés ensemble par Redis",
        "Non : sans TTL, la clé bloque le client pour toujours ; script Lua",
        "Oui, car Redis supprime automatiquement les clés sans TTL après une minute",
        "Non, mais le seul remède est de passer à une base SQL relationnelle",
      ],
      correctIndex: 1,
      explanation:
        "Deux commandes successives ne sont pas atomiques. Si l'expiration n'est jamais posée, le compteur dépasse la limite sans jamais se réinitialiser, d'où l'intérêt d'un script Lua exécuté d'un bloc.",
      difficulty: "hard",
    },
  ],

  "/tech-mastry/interview-simulation/question-bank": [
    {
      id: "practice-question-bank-1",
      question: "Quand préférer un BFS à un DFS dans un graphe ?",
      options: [
        "Pour le plus court chemin non pondéré, car il explore par niveaux",
        "Pour détecter les cycles dans un graphe orienté avec le moins de mémoire possible",
        "Pour trouver un tri topologique, car la file reflète l'ordre des dépendances",
        "Pour parcourir un graphe infini, car la file se vide naturellement",
      ],
      correctIndex: 0,
      explanation:
        "Le BFS atteint chaque nœud par le chemin avec le moins d'arêtes. Les cycles et le tri topologique se traitent naturellement en DFS ; sur un graphe infini, aucun des deux ne termine sans limite.",
      difficulty: "easy",
    },
    {
      id: "practice-question-bank-2",
      question: "Que se passe-t-il dans une table de hachage quand deux clés produisent le même indice ?",
      options: [
        "La seconde écrase la première, c'est pourquoi les clés doivent toujours être uniques",
        "Les deux sont conservées (chaînage ou sondage), avec des lectures O(n) au pire",
        "La table est reconstruite immédiatement, ce qui garantit O(1) dans tous les cas",
        "L'insertion échoue et lève une exception de collision",
      ],
      correctIndex: 1,
      explanation:
        "Le chaînage ou l'adressage ouvert résolvent les collisions. Le coût moyen reste O(1) avec un bon facteur de charge, mais beaucoup de collisions dégradent la table vers O(n).",
      difficulty: "easy",
    },
    {
      id: "practice-question-bank-3",
      question: "Dans un cache LRU en O(1), pourquoi associer une table de hachage à une liste doublement chaînée ?",
      options: [
        "La table garde l'ordre d'utilisation et la liste fait les recherches par clé",
        "Une liste simplement chaînée suffit, la liste doublement chaînée n'est qu'une optimisation mémoire",
        "La table donne le nœud, les pointeurs prev/next le déplacent en O(1)",
        "La liste garantit que les clés sont triées pour une éviction par ordre alphabétique",
      ],
      correctIndex: 2,
      explanation:
        "Pour retirer un nœud au milieu en O(1), il faut son précédent, ce que seule la liste doublement chaînée fournit directement. Avec une liste simple, on devrait la parcourir.",
      difficulty: "medium",
    },
    {
      id: "practice-question-bank-4",
      question: "Que dit le théorème CAP lorsqu'une partition réseau survient ?",
      options: [
        "On peut conserver cohérence, disponibilité et tolérance aux partitions, à condition d'ajouter des réplicas",
        "Un système CA est le choix naturel d'une base distribuée, car les partitions sont rares",
        "La cohérence est toujours sacrifiée au profit de la latence",
        "Il faut choisir : CP refuse des requêtes, AP répond avec des données possiblement divergentes",
      ],
      correctIndex: 3,
      explanation:
        "Dans un système distribué, les partitions arrivent, la vraie décision porte donc sur cohérence ou disponibilité pendant la panne. Ajouter des réplicas n'abolit pas ce compromis.",
      difficulty: "medium",
    },
    {
      id: "practice-question-bank-5",
      question: "Quel problème le pattern Outbox résout-il dans une architecture microservices ?",
      options: [
        "Il remplace les transactions locales par des transactions distribuées en deux phases (2PC)",
        "Il évite d'utiliser un broker de messages entre deux services",
        "Il rend atomiques la mise à jour en base et l'événement, écrit dans la même transaction",
        "Il chiffre les événements pour éviter qu'un autre service ne les lise",
      ],
      correctIndex: 2,
      explanation:
        "Si on écrit en base puis qu'on publie, un crash entre les deux perd l'événement (double écriture). L'Outbox rend l'événement durable avec les données ; la livraison est au moins une fois, d'où l'idempotence côté consommateur.",
      difficulty: "hard",
    },
  ],

  "/tech-mastry/system-design/architecture": [
    {
      id: "practice-system-design-architecture-1",
      question: "Quel est le rôle d'un répartiteur de charge placé devant plusieurs serveurs applicatifs ?",
      options: [
        "Stocker de façon durable les sessions de tous les utilisateurs de l'application",
        "Chiffrer les données au repos dans la base de données et les sauvegardes",
        "Répartir les requêtes entre serveurs identiques et écarter ceux en panne",
        "Traduire les requêtes REST des clients en requêtes SQL pour la base",
      ],
      correctIndex: 2,
      explanation:
        "Le répartiteur permet la mise à l'échelle horizontale et la tolérance aux pannes d'un serveur. Il ne stocke ni sessions ni données et ne génère pas de SQL.",
      difficulty: "easy",
    },
    {
      id: "practice-system-design-architecture-2",
      question: "À quoi sert le CDN du template « Application web scalable » ?",
      options: [
        "À répliquer la base de données dans plusieurs régions",
        "À remplacer le répartiteur de charge pour les requêtes dynamiques",
        "À authentifier les utilisateurs avant qu'ils atteignent l'application",
        "Servir les statiques près de l'utilisateur et décharger l'origine",
      ],
      correctIndex: 3,
      explanation:
        "Les images, scripts et feuilles de style changent peu et se mettent en cache en périphérie. Les requêtes dynamiques et la réplication de données relèvent d'autres composants.",
      difficulty: "easy",
    },
    {
      id: "practice-system-design-architecture-3",
      question: "Vous ajoutez un réplica en lecture à la base maître. Quel compromis faut-il accepter ?",
      options: [
        "Les lectures sur le réplica peuvent avoir un léger retard sur le maître",
        "Les écritures doivent désormais aller sur le réplica pour rester cohérentes",
        "Le maître ne peut plus lire ses propres données récentes",
        "Les lectures deviennent plus lentes, car chaque lecture contacte les deux bases",
      ],
      correctIndex: 0,
      explanation:
        "Le maître réplique les écritures avec un léger décalage, un lecteur peut donc voir une version un peu ancienne. Les écritures restent sur le maître ; les lectures sont soulagées, pas ralenties.",
      difficulty: "medium",
    },
    {
      id: "practice-system-design-architecture-4",
      question: "Dans le template microservices, pourquoi Auth Service, User Service et Order Service ont-ils chacun leur base ?",
      options: [
        "Pour que les requêtes SQL soient exécutées plus vite grâce à des tables plus petites",
        "Pour découpler les services, au prix d'une cohérence distribuée plus difficile",
        "Pour éviter d'avoir besoin d'une passerelle API devant les services",
        "Pour qu'une transaction ACID puisse couvrir plusieurs services à la fois",
      ],
      correctIndex: 1,
      explanation:
        "Une base partagée recrée un couplage fort entre services. En contrepartie, une opération entre services n'est plus une transaction unique, ce qui demande des sagas ou de la cohérence à terme.",
      difficulty: "medium",
    },
    {
      id: "practice-system-design-architecture-5",
      question:
        "Deux serveurs applicatifs derrière un répartiteur : des utilisateurs sont déconnectés de façon aléatoire. Les sessions sont gardées en mémoire de chaque serveur. Quelle solution adopter ?",
      options: [
        "Externaliser les sessions dans un store partagé comme Redis",
        "Doubler la mémoire de chaque serveur pour conserver davantage de sessions",
        "Ajouter un troisième serveur pour réduire la charge sur chacun",
        "Augmenter la durée de vie des sessions en mémoire à plusieurs jours",
      ],
      correctIndex: 0,
      explanation:
        "Une session créée sur le serveur 1 est inconnue du serveur 2. Un store partagé rend les serveurs interchangeables ; les autres options laissent le défaut intact ou l'aggravent.",
      difficulty: "hard",
    },
  ],

  "/tech-mastry/algorithms/visualizations": [
    {
      id: "practice-algorithms-visualizations-1",
      question: "Sur un tableau de 1000 éléments trié à l'envers, quel ordre de grandeur de comparaisons fait le tri à bulles ?",
      options: [
        "Environ 1 000",
        "Environ 500 000",
        "Environ 10 000",
        "Environ un milliard",
      ],
      correctIndex: 1,
      explanation:
        "Le tri à bulles est en O(n²) : n(n-1)/2 vaut environ 500 000 pour n = 1000. Environ 10 000 correspondrait à n log n, ce que visent le tri fusion et le tri rapide.",
      difficulty: "easy",
    },
    {
      id: "practice-algorithms-visualizations-2",
      question: "Quelles sont les complexités du tri fusion ?",
      options: [
        "O(n log n) en temps dans tous les cas, avec O(n) de mémoire auxiliaire",
        "O(n log n) en temps en moyenne mais O(n²) dans le pire cas, avec O(1) de mémoire",
        "O(n²) en temps, avec O(log n) de mémoire pour la récursion",
        "O(n) en temps sur des données triées, avec O(1) de mémoire",
      ],
      correctIndex: 0,
      explanation:
        "La division en deux moitiés donne log n niveaux et chaque niveau fusionne n éléments, indépendamment de l'entrée. Le tableau temporaire des fusions coûte O(n) de mémoire.",
      difficulty: "easy",
    },
    {
      id: "practice-algorithms-visualizations-3",
      question: "Dans la visualisation, pourquoi le tri par insertion paraît-il si rapide sur un tableau presque trié ?",
      options: [
        "Parce qu'il découpe le tableau en deux moitiés indépendantes",
        "Parce qu'il choisit un pivot proche de la médiane",
        "Parce qu'il n'échange jamais deux éléments, il se contente de les compter",
        "Presque aucun décalage à faire par élément, donc le coût tend vers O(n)",
      ],
      correctIndex: 3,
      explanation:
        "Le nombre de décalages vaut le nombre d'inversions, proche de zéro dans un tableau presque trié. Le tri par insertion est utilisé comme étape finale dans plusieurs tris hybrides.",
      difficulty: "medium",
    },
    {
      id: "practice-algorithms-visualizations-4",
      question: "Quelle observation sur le tri par sélection la visualisation met-elle en évidence ?",
      options: [
        "Il s'arrête dès que le tableau est trié, donc il est linéaire sur une entrée triée",
        "Il est stable, car il ne déplace jamais deux éléments égaux",
        "Il fait toujours environ n²/2 comparaisons mais au plus n-1 échanges",
        "Il demande O(n) de mémoire auxiliaire comme le tri fusion",
      ],
      correctIndex: 2,
      explanation:
        "Il cherche le minimum du reste à chaque tour sans pouvoir s'arrêter plus tôt, mais n'échange qu'une fois par tour. Son échange à distance le rend non stable.",
      difficulty: "medium",
    },
    {
      id: "practice-algorithms-visualizations-5",
      question: "Pourquoi un tri rapide qui prend toujours le dernier élément comme pivot devient-il quadratique sur un tableau déjà trié ?",
      options: [
        "Parce que les appels récursifs ne peuvent plus être limités en profondeur par le moteur",
        "Parce que le tri rapide ne sait pas comparer des éléments qui sont déjà ordonnés",
        "Parce que la fusion des sous-tableaux coûte O(n²) sur des données déjà ordonnées",
        "Le pivot est le maximum : partitions déséquilibrées, donc n niveaux de récursion",
      ],
      correctIndex: 3,
      explanation:
        "Chaque partition retire un seul élément, d'où n + (n-1) + ... = O(n²) comparaisons et une pile profonde. Le tri rapide ne fusionne pas ses sous-tableaux : tout le travail est dans la partition.",
      difficulty: "hard",
    },
  ],

  "/tech-mastry/qa": [
    {
      id: "practice-qa-1",
      question: "Quelle est la complexité temporelle de QuickSort en moyenne et dans le pire cas ?",
      options: [
        "O(n log n) en moyenne, O(n²) au pire",
        "O(n log n) en moyenne et dans le pire cas",
        "O(n) en moyenne, O(n log n) dans le pire cas",
        "O(n²) en moyenne, O(n log n) dans le pire cas",
      ],
      correctIndex: 0,
      explanation:
        "Avec des pivots bien répartis, la profondeur est log n ; avec des partitions déséquilibrées de façon répétée, elle atteint n. C'est le tri fusion, pas QuickSort, qui garantit O(n log n) dans le pire cas.",
      difficulty: "easy",
    },
    {
      id: "practice-qa-2",
      question: "Que garantit l'atomicité (le A de ACID) d'une transaction ?",
      options: [
        "Que deux transactions ne peuvent jamais s'exécuter en même temps",
        "Que les données validées survivent à une panne de courant",
        "Exécution entière ou nulle, sans état intermédiaire persistant",
        "Que les contraintes d'intégrité de la base sont respectées avant et après",
      ],
      correctIndex: 2,
      explanation:
        "En cas d'erreur à mi-parcours, tout est annulé (rollback). La survie aux pannes relève de la durabilité, les contraintes de la cohérence, et l'exécution concurrente de l'isolation.",
      difficulty: "easy",
    },
    {
      id: "practice-qa-3",
      question: "Quelle différence entre un index clustered et un index non-clustered ?",
      options: [
        "Le clustered est stocké en mémoire alors que le non-clustered est sur disque",
        "Le clustered fixe l'ordre physique des lignes, donc un seul par table",
        "Le non-clustered accélère les lectures, tandis que le clustered ne sert qu'aux écritures",
        "Le clustered ne peut porter que sur une clé étrangère",
      ],
      correctIndex: 1,
      explanation:
        "Les données ne peuvent être triées physiquement que d'une façon, donc un seul index clustered par table. Les index non-clustered sont multiples et ajoutent un détour vers la ligne.",
      difficulty: "medium",
    },
    {
      id: "practice-qa-4",
      question: "Quelle défense est la plus solide contre les attaques XSS ?",
      options: [
        "Supprimer les balises script des entrées avec une expression régulière côté serveur",
        "Interdire les caractères spéciaux dans tous les champs de formulaire du site",
        "Chiffrer les cookies de session côté serveur uniquement",
        "Encoder la sortie selon le contexte et ajouter une Content Security Policy",
      ],
      correctIndex: 3,
      explanation:
        "Le danger apparaît au moment d'afficher des données non fiables, c'est donc là qu'il faut les encoder. Filtrer l'entrée par liste noire se contourne facilement ; la CSP limite les dégâts restants.",
      difficulty: "medium",
    },
    {
      id: "practice-qa-5",
      question: "Vous shardez une table de commandes avec un shard par mois de création. Quel problème principal apparaît ?",
      options: [
        "Les requêtes sur un client donné deviennent impossibles à exécuter",
        "Toutes les écritures récentes visent un seul shard : un point chaud",
        "Le nombre de shards est fixé une fois pour toutes et ne peut plus évoluer",
        "Les transactions ACID deviennent impossibles dans chaque shard",
      ],
      correctIndex: 1,
      explanation:
        "Une clé croissante comme la date concentre le trafic sur un seul nœud. Un hachage d'un identifiant répartit mieux la charge, au prix de requêtes par plage plus coûteuses et d'un rééquilibrage délicat.",
      difficulty: "hard",
    },
  ],
};
