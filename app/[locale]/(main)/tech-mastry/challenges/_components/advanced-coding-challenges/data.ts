import type { Challenge } from "./types";

export const challenges: Challenge[] = [
  {
    id: "1",
    title: "Two Sum",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    difficulty: "beginner",
    category: "Arrays",
    estimatedTime: 15,
    tags: ["array", "hash-map", "two-pointers"],
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
          "Try using a hash map (object) to store each number and its index as you iterate through the array.",
        revealCost: 0,
      },
      {
        id: "2",
        content:
          "For each number, check if target - number exists in your hash map before adding the current number.",
        revealCost: 10,
      },
      {
        id: "3",
        content:
          "The optimal solution has O(n) time complexity and O(n) space complexity.",
        revealCost: 20,
      },
    ],
    explanation: `The optimal solution uses a hash map to store numbers we've seen and their indices. As we iterate through the array, for each number we calculate its complement (target - number). If the complement exists in our hash map, we've found our two numbers. This approach has O(n) time complexity and O(n) space complexity.`,
  },
  {
    id: "2",
    title: "Valid Parentheses",
    description:
      "Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    difficulty: "beginner",
    category: "Stacks",
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
          "Use a stack data structure to keep track of opening brackets.",
        revealCost: 0,
      },
      {
        id: "2",
        content:
          "When you encounter a closing bracket, check if it matches the most recent opening bracket.",
        revealCost: 10,
      },
    ],
    explanation: `This problem is perfectly suited for a stack data structure. We iterate through the string, pushing opening brackets onto the stack. When we encounter a closing bracket, we check if it matches the most recently pushed opening bracket by popping from the stack. If all brackets are properly matched, the stack will be empty at the end.`,
  },
  {
    id: "3",
    title: "Binary Tree Level Order Traversal",
    description:
      "Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level)",
    difficulty: "intermediate",
    category: "Trees",
    estimatedTime: 25,
    tags: ["tree", "bfs", "recursion"],
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
        expectedOutput: "[[]]",
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
          "Use breadth-first search (BFS) with a queue to traverse the tree level by level.",
        revealCost: 0,
      },
      {
        id: "2",
        content:
          "At each level, process all nodes currently in the queue before adding their children.",
        revealCost: 15,
      },
    ],
    explanation: `This solution uses BFS with a queue. At each level, we process all nodes currently in the queue (which represents the current level) before adding their children. This ensures we traverse the tree level by level from left to right.`,
  },
];
