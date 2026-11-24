import type { Exercise } from "./types";

// Données des exercices
export const exercises: Exercise[] = [
  {
    id: "array-1",
    title: "Inverser un tableau",
    difficulty: "easy",
    category: "arrays",
    description:
      "Écrivez une fonction qui inverse l'ordre des éléments dans un tableau. Par exemple, [1, 2, 3, 4, 5] devient [5, 4, 3, 2, 1].",
    hints: [
      "Vous pouvez utiliser deux pointeurs, un au début et un à la fin du tableau.",
      "Échangez les éléments aux positions des pointeurs, puis déplacez les pointeurs vers le centre.",
      "Arrêtez lorsque les pointeurs se croisent ou se rencontrent.",
    ],
    solution: {
      explanation:
        "Pour inverser un tableau, nous utilisons l'approche des deux pointeurs. Nous initialisons un pointeur au début du tableau et un autre à la fin. Nous échangeons les éléments à ces positions, puis déplaçons les pointeurs vers le centre. Nous continuons jusqu'à ce que les pointeurs se croisent.",
      code: `function reverseArray(arr) {
  let left = 0;
  let right = arr.length - 1;

  while (left < right) {
    // Échanger les éléments
    const temp = arr[left];
    arr[left] = arr[right];
    arr[right] = temp;

    // Déplacer les pointeurs
    left++;
    right--;
  }

  return arr;
}`,
      steps: [
        {
          step: 1,
          description:
            "Initialiser deux pointeurs, 'left' au début du tableau (index 0) et 'right' à la fin du tableau (index length-1).",
          code: `let left = 0;
let right = arr.length - 1;`,
        },
        {
          step: 2,
          description:
            "Créer une boucle qui continue tant que 'left' est inférieur à 'right'.",
          code: `while (left < right) {
  // Code à venir
}`,
        },
        {
          step: 3,
          description:
            "À l'intérieur de la boucle, échanger les éléments aux positions 'left' et 'right'.",
          code: `const temp = arr[left];
arr[left] = arr[right];
arr[right] = temp;`,
        },
        {
          step: 4,
          description:
            "Incrémenter 'left' et décrémenter 'right' pour se déplacer vers le centre du tableau.",
          code: `left++;
right--;`,
        },
        {
          step: 5,
          description:
            "Une fois la boucle terminée, le tableau est inversé. Retourner le tableau.",
          code: `return arr;`,
        },
      ],
    },
  },
  {
    id: "linked-list-1",
    title: "Détecter un cycle dans une liste chaînée",
    difficulty: "medium",
    category: "linked-lists",
    description:
      "Écrivez une fonction qui détermine si une liste chaînée contient un cycle. Un cycle se produit lorsqu'un nœud de la liste pointe vers un nœud précédent, créant une boucle.",
    hints: [
      "Vous pouvez utiliser l'algorithme du lièvre et de la tortue (Floyd's Cycle-Finding Algorithm).",
      "Utilisez deux pointeurs qui se déplacent à des vitesses différentes.",
      "Si les pointeurs se rencontrent, il y a un cycle.",
    ],
    solution: {
      explanation:
        "Pour détecter un cycle dans une liste chaînée, nous utilisons l'algorithme du lièvre et de la tortue (Floyd's Cycle-Finding Algorithm). Nous utilisons deux pointeurs, 'slow' qui avance d'un nœud à la fois et 'fast' qui avance de deux nœuds à la fois. Si la liste contient un cycle, les deux pointeurs finiront par se rencontrer. Si 'fast' atteint la fin de la liste, alors il n'y a pas de cycle.",
      code: `function hasCycle(head) {
  if (!head || !head.next) {
    return false;
  }

  let slow = head;
  let fast = head;

  while (fast && fast.next) {
    slow = slow.next;          // Avance d'un nœud
    fast = fast.next.next;     // Avance de deux nœuds

    if (slow === fast) {
      return true;  // Cycle détecté
    }
  }

  return false;  // Pas de cycle
}`,
      steps: [
        {
          step: 1,
          description:
            "Vérifier les cas de base: si la liste est vide ou ne contient qu'un seul nœud, elle ne peut pas contenir de cycle.",
          code: `if (!head || !head.next) {
  return false;
}`,
        },
        {
          step: 2,
          description:
            "Initialiser deux pointeurs 'slow' et 'fast' au début de la liste.",
          code: `let slow = head;
let fast = head;`,
        },
        {
          step: 3,
          description:
            "Créer une boucle qui continue tant que 'fast' et 'fast.next' ne sont pas null.",
          code: `while (fast && fast.next) {
  // Code à venir
}`,
        },
        {
          step: 4,
          description:
            "À l'intérieur de la boucle, déplacer 'slow' d'un nœud et 'fast' de deux nœuds.",
          code: `slow = slow.next;          // Avance d'un nœud
fast = fast.next.next;     // Avance de deux nœuds`,
        },
        {
          step: 5,
          description:
            "Vérifier si 'slow' et 'fast' pointent vers le même nœud. Si c'est le cas, un cycle a été détecté.",
          code: `if (slow === fast) {
  return true;  // Cycle détecté
}`,
        },
        {
          step: 6,
          description:
            "Si la boucle se termine sans que les pointeurs ne se rencontrent, il n'y a pas de cycle.",
          code: `return false;  // Pas de cycle`,
        },
      ],
    },
  },
  {
    id: "stack-1",
    title: "Valider les parenthèses",
    difficulty: "medium",
    category: "stacks",
    description:
      "Écrivez une fonction qui détermine si une chaîne de caractères contenant uniquement les caractères '(', ')', '{', '}', '[' et ']' est valide. Une chaîne est valide si les parenthèses ouvrantes sont fermées par le même type de parenthèses fermantes, et si elles sont fermées dans le bon ordre.",
    hints: [
      "Utilisez une pile pour garder une trace des parenthèses ouvrantes.",
      "Lorsque vous rencontrez une parenthèse fermante, vérifiez si elle correspond à la dernière parenthèse ouvrante.",
      "La chaîne est valide si la pile est vide à la fin.",
    ],
    solution: {
      explanation:
        "Pour valider les parenthèses, nous utilisons une pile. Nous parcourons la chaîne caractère par caractère. Si nous rencontrons une parenthèse ouvrante, nous la poussons sur la pile. Si nous rencontrons une parenthèse fermante, nous vérifions si elle correspond à la dernière parenthèse ouvrante (celle au sommet de la pile). Si c'est le cas, nous retirons la parenthèse ouvrante de la pile. Sinon, la chaîne n'est pas valide. À la fin, la pile doit être vide pour que la chaîne soit valide.",
      code: `function isValid(s) {
  const stack = [];
  const map = {
    '(': ')',
    '{': '}',
    '[': ']'
  };

  for (let i = 0; i < s.length; i++) {
    const char = s[i];

    if (map[char]) {
      // C'est une parenthèse ouvrante, la pousser sur la pile
      stack.push(char);
    } else {
      // C'est une parenthèse fermante, vérifier si elle correspond
      const lastBracket = stack.pop();

      if (map[lastBracket] !== char) {
        return false;
      }
    }
  }

  // La chaîne est valide si la pile est vide
  return stack.length === 0;
}`,
      steps: [
        {
          step: 1,
          description:
            "Initialiser une pile vide et une map qui associe chaque parenthèse ouvrante à sa parenthèse fermante correspondante.",
          code: `const stack = [];
const map = {
  '(': ')',
  '{': '}',
  '[': ']'
};`,
        },
        {
          step: 2,
          description: "Parcourir la chaîne caractère par caractère.",
          code: `for (let i = 0; i < s.length; i++) {
  const char = s[i];
  // Code à venir
}`,
        },
        {
          step: 3,
          description:
            "Si le caractère est une parenthèse ouvrante (présente comme clé dans la map), la pousser sur la pile.",
          code: `if (map[char]) {
  // C'est une parenthèse ouvrante, la pousser sur la pile
  stack.push(char);
}`,
        },
        {
          step: 4,
          description:
            "Si le caractère est une parenthèse fermante, retirer la dernière parenthèse ouvrante de la pile et vérifier si elle correspond.",
          code: `else {
  // C'est une parenthèse fermante, vérifier si elle correspond
  const lastBracket = stack.pop();

  if (map[lastBracket] !== char) {
    return false;
  }
}`,
        },
        {
          step: 5,
          description:
            "Après avoir parcouru toute la chaîne, vérifier si la pile est vide. Si c'est le cas, la chaîne est valide.",
          code: `return stack.length === 0;`,
        },
      ],
    },
  },
  {
    id: "hash-table-1",
    title: "Trouver deux nombres dont la somme est égale à une cible",
    difficulty: "easy",
    category: "hash-tables",
    description:
      "Étant donné un tableau d'entiers et une valeur cible, retournez les indices des deux nombres tels que leur somme soit égale à la cible. Vous pouvez supposer que chaque entrée a exactement une solution, et vous ne pouvez pas utiliser le même élément deux fois.",
    hints: [
      "Une approche naïve serait d'utiliser deux boucles imbriquées, mais cela donnerait une complexité de O(n²).",
      "Vous pouvez utiliser une table de hachage pour stocker les nombres déjà vus et leur indice.",
      "Pour chaque nombre, vérifiez si son complément (cible - nombre) est déjà dans la table de hachage.",
    ],
    solution: {
      explanation:
        "Pour résoudre ce problème efficacement, nous utilisons une table de hachage. Nous parcourons le tableau une seule fois. Pour chaque nombre, nous calculons son complément (cible - nombre) et vérifions si ce complément est déjà dans la table de hachage. Si c'est le cas, nous avons trouvé notre paire. Sinon, nous ajoutons le nombre actuel à la table de hachage avec son indice. Cette approche a une complexité temporelle de O(n) et une complexité spatiale de O(n).",
      code: `function twoSum(nums, target) {
  const map = new Map();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];

    if (map.has(complement)) {
      return [map.get(complement), i];
    }

    map.set(nums[i], i);
  }

  return null; // Aucune solution trouvée
}`,
      steps: [
        {
          step: 1,
          description:
            "Initialiser une table de hachage (Map) vide pour stocker les nombres déjà vus et leur indice.",
          code: `const map = new Map();`,
        },
        {
          step: 2,
          description: "Parcourir le tableau d'entiers.",
          code: `for (let i = 0; i < nums.length; i++) {
  // Code à venir
}`,
        },
        {
          step: 3,
          description:
            "Pour chaque nombre, calculer son complément (cible - nombre).",
          code: `const complement = target - nums[i];`,
        },
        {
          step: 4,
          description:
            "Vérifier si le complément est déjà dans la table de hachage. Si c'est le cas, retourner les indices.",
          code: `if (map.has(complement)) {
  return [map.get(complement), i];
}`,
        },
        {
          step: 5,
          description:
            "Si le complément n'est pas dans la table de hachage, ajouter le nombre actuel à la table avec son indice.",
          code: `map.set(nums[i], i);`,
        },
        {
          step: 6,
          description:
            "Si aucune solution n'est trouvée après avoir parcouru tout le tableau, retourner null.",
          code: `return null; // Aucune solution trouvée`,
        },
      ],
    },
  },
  {
    id: "binary-tree-1",
    title: "Parcours d'un arbre binaire en ordre (inorder)",
    difficulty: "medium",
    category: "binary-trees",
    description:
      "Écrivez une fonction qui effectue un parcours en ordre (inorder) d'un arbre binaire et retourne les valeurs des nœuds dans l'ordre visité. Le parcours en ordre visite d'abord le sous-arbre gauche, puis le nœud courant, puis le sous-arbre droit.",
    hints: [
      "Le parcours en ordre peut être implémenté de manière récursive.",
      "Pour chaque nœud, parcourez d'abord le sous-arbre gauche, puis visitez le nœud, puis parcourez le sous-arbre droit.",
      "Vous pouvez également implémenter une version itérative en utilisant une pile.",
    ],
    solution: {
      explanation:
        "Le parcours en ordre (inorder) d'un arbre binaire visite les nœuds dans l'ordre: gauche, racine, droite. Nous implémentons d'abord une solution récursive, qui est plus intuitive. Pour chaque nœud, nous parcourons récursivement le sous-arbre gauche, puis nous visitons le nœud (en ajoutant sa valeur au résultat), puis nous parcourons récursivement le sous-arbre droit. Nous présentons également une solution itérative qui utilise une pile pour simuler la récursion.",
      code: `// Solution récursive
function inorderTraversal(root) {
  const result = [];

  function traverse(node) {
    if (node === null) return;

    // Parcourir le sous-arbre gauche
    traverse(node.left);

    // Visiter le nœud courant
    result.push(node.val);

    // Parcourir le sous-arbre droit
    traverse(node.right);
  }

  traverse(root);
  return result;
}

// Solution itérative
function inorderTraversalIterative(root) {
  const result = [];
  const stack = [];
  let current = root;

  while (current !== null || stack.length > 0) {
    // Aller le plus à gauche possible
    while (current !== null) {
      stack.push(current);
      current = current.left;
    }

    // Visiter le nœud au sommet de la pile
    current = stack.pop();
    result.push(current.val);

    // Passer au sous-arbre droit
    current = current.right;
  }

  return result;
}`,
      steps: [
        {
          step: 1,
          description:
            "Pour la solution récursive, initialiser un tableau pour stocker le résultat.",
          code: `const result = [];`,
        },
        {
          step: 2,
          description:
            "Définir une fonction récursive 'traverse' qui prend un nœud en paramètre.",
          code: `function traverse(node) {
  if (node === null) return;

  // Code à venir
}`,
        },
        {
          step: 3,
          description:
            "Dans la fonction 'traverse', vérifier d'abord si le nœud est null. Si c'est le cas, retourner.",
          code: `if (node === null) return;`,
        },
        {
          step: 4,
          description: "Parcourir récursivement le sous-arbre gauche.",
          code: `traverse(node.left);`,
        },
        {
          step: 5,
          description:
            "Visiter le nœud courant en ajoutant sa valeur au tableau résultat.",
          code: `result.push(node.val);`,
        },
        {
          step: 6,
          description: "Parcourir récursivement le sous-arbre droit.",
          code: `traverse(node.right);`,
        },
        {
          step: 7,
          description:
            "Appeler la fonction 'traverse' avec la racine de l'arbre et retourner le résultat.",
          code: `traverse(root);
return result;`,
        },
      ],
    },
  },
];
