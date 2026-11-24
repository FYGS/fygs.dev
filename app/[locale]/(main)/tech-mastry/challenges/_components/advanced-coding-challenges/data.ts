import type { Challenge } from "./types";

export const challenges: Challenge[] = [
  {
    id: "1",
    title: "Two Sum",
    description:
      "Étant donné un tableau d'entiers nums et un entier target, retournez les indices des deux nombres dont la somme est égale à target.",
    difficulty: "beginner",
    category: "Tableaux",
    estimatedTime: 15,
    tags: ["array", "hash-map"],
    testCases: [
      {
        id: "1",
        input: "[2,7,11,15], 9",
        expectedOutput: "[0,1]",
        isHidden: false,
      },
      {
        id: "2",
        input: "[3,2,4], 6",
        expectedOutput: "[1,2]",
        isHidden: false,
      },
      {
        id: "3",
        input: "[3,3], 6",
        expectedOutput: "[0,1]",
        isHidden: true,
      },
      {
        id: "4",
        input: "[1,2,3,4,5], 8",
        expectedOutput: "[2,4]",
        isHidden: true,
      },
    ],
    starterCode: `function twoSum(nums, target) {
  // Your code here
  
}`,
    solution: `function twoSum(nums, target) {
  const seen = {};
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (complement in seen) {
      return [seen[complement], i];
    }
    seen[nums[i]] = i;
  }
  
  return [];
}`,
    hints: [
      {
        id: "1",
        content:
          "Essayez d'utiliser une table de hachage (objet) pour stocker chaque nombre et son index en parcourant le tableau.",
        revealCost: 0,
      },
      {
        id: "2",
        content:
          "Pour chaque nombre, vérifiez si target - nombre existe dans votre table de hachage avant d'ajouter le nombre courant.",
        revealCost: 10,
      },
      {
        id: "3",
        content:
          "La solution optimale a une complexité en temps de O(n) et en espace de O(n).",
        revealCost: 20,
      },
    ],
    explanation: `La solution optimale utilise une table de hachage pour stocker les nombres déjà vus et leurs index. En parcourant le tableau, on calcule pour chaque nombre son complément (target - nombre). Si le complément existe dans la table, on a trouvé nos deux nombres. Cette approche a une complexité en temps de O(n) et en espace de O(n).`,
  },
  {
    id: "2",
    title: "Valid Parentheses",
    description:
      "Étant donné une chaîne contenant uniquement les caractères '(', ')', '{', '}', '[' et ']', déterminez si la chaîne est valide.",
    difficulty: "beginner",
    category: "Piles",
    estimatedTime: 20,
    tags: ["stack", "string", "validation"],
    testCases: [
      {
        id: "1",
        input: '"()"',
        expectedOutput: "true",
        isHidden: false,
      },
      {
        id: "2",
        input: '"()[]{}"',
        expectedOutput: "true",
        isHidden: false,
      },
      {
        id: "3",
        input: '"(]"',
        expectedOutput: "false",
        isHidden: true,
      },
    ],
    starterCode: `function isValid(s) {
  // Your code here
  
}`,
    solution: `function isValid(s) {
  const stack = [];
  const pairs = {
    ')': '(',
    '}': '{',
    ']': '['
  };
  
  for (let char of s) {
    if (char in pairs) {
      if (stack.pop() !== pairs[char]) return false;
    } else {
      stack.push(char);
    }
  }
  
  return stack.length === 0;
}`,
    hints: [
      {
        id: "1",
        content:
          "Utilisez une pile pour garder la trace des parenthèses ouvrantes.",
        revealCost: 0,
      },
      {
        id: "2",
        content:
          "Quand vous rencontrez une parenthèse fermante, vérifiez qu'elle correspond à la dernière parenthèse ouvrante.",
        revealCost: 10,
      },
    ],
    explanation: `Ce problème se prête parfaitement à une pile. On parcourt la chaîne en empilant les parenthèses ouvrantes. Quand on rencontre une parenthèse fermante, on vérifie qu'elle correspond à la dernière ouvrante empilée en dépilant. Si toutes les parenthèses sont correctement appariées, la pile est vide à la fin.`,
  },
  {
    id: "3",
    adapter: "tree",
    title: "Binary Tree Level Order Traversal",
    description:
      "Étant donné la racine d'un arbre binaire, retournez le parcours par niveaux des valeurs de ses nœuds (c'est-à-dire de gauche à droite, niveau par niveau).",
    difficulty: "intermediate",
    category: "Arbres",
    estimatedTime: 25,
    tags: ["tree", "bfs", "queue"],
    testCases: [
      {
        id: "1",
        input: "[3,9,20,null,null,15,7]",
        expectedOutput: "[[3],[9,20],[15,7]]",
        isHidden: false,
      },
      {
        id: "2",
        input: "[1]",
        expectedOutput: "[[1]]",
        isHidden: false,
      },
      {
        id: "3",
        input: "[]",
        expectedOutput: "[]",
        isHidden: true,
      },
    ],
    starterCode: `function levelOrder(root) {
  // Your code here
  
}`,
    solution: `function levelOrder(root) {
  if (!root) return [];
  
  const result = [];
  const queue = [root];
  
  while (queue.length > 0) {
    const levelSize = queue.length;
    const currentLevel = [];
    
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      currentLevel.push(node.val);
      
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    
    result.push(currentLevel);
  }
  
  return result;
}`,
    hints: [
      {
        id: "1",
        content:
          "Utilisez un parcours en largeur (BFS) avec une file pour parcourir l'arbre niveau par niveau.",
        revealCost: 0,
      },
      {
        id: "2",
        content:
          "À chaque niveau, traitez tous les nœuds présents dans la file avant d'ajouter leurs enfants.",
        revealCost: 15,
      },
    ],
    explanation: `Cette solution utilise un BFS avec une file. À chaque niveau, on traite tous les nœuds présents dans la file (qui représente le niveau courant) avant d'ajouter leurs enfants. On parcourt ainsi l'arbre niveau par niveau, de gauche à droite.`,
  },
];
