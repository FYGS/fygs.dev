import type { PlaygroundTemplate } from "../../_types";

/** Node API and algorithm templates. */
export const backendAlgorithmsTemplates: PlaygroundTemplate[] = [
  // ─── Backend Templates ─────────────────────────────────────────────────────
  {
    id: "node-api",
    name: "Express API",
    description: "Real Express.js REST API with WebContainer",
    icon: "Server",
    category: "backend",
    tags: ["node", "express", "api", "rest"],
    mainFile: "index.js",
    files: [
      {
        name: "package.json",
        path: "package.json",
        content: JSON.stringify(
          {
            name: "express-api",
            version: "1.0.0",
            type: "commonjs",
            scripts: {
              start: "node index.js",
            },
            dependencies: {
              express: "^4.21.0",
            },
          },
          null,
          2,
        ),
        language: "json",
      },
      {
        name: "index.js",
        path: "index.js",
        content: `const express = require('express');
const app = express();
const PORT = 3111;

app.use(express.json());

// In-memory database
const users = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" },
];
let nextId = 3;

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Express API running in WebContainer!',
    routes: ['GET /api/users', 'GET /api/users/:id', 'POST /api/users'],
  });
});

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and email required' });
  const user = { id: nextId++, name, email };
  users.push(user);
  res.status(201).json(user);
});

app.listen(PORT, () => {
  console.log(\`Server running at http://localhost:\${PORT}\`);
});
`,
        language: "javascript",
        isEntryPoint: true,
      },
    ],
  },

  // ─── Algorithm / Data Structure Templates ──────────────────────────────────
  {
    id: "algorithms",
    name: "Algorithms",
    description: "Common algorithms with TypeScript implementations",
    icon: "BrainCircuit",
    category: "language",
    tags: ["algorithms", "dsa", "typescript"],
    mainFile: "algorithms.ts",
    files: [
      {
        name: "algorithms.ts",
        path: "algorithms.ts",
        content: `// ─── Sorting Algorithms ─────────────────────────────────────────────────────

function quickSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);
  return [...quickSort(left), ...middle, ...quickSort(right)];
}

function mergeSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge(left: number[], right: number[]): number[] {
  const result: number[] = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) result.push(left[i++]);
    else result.push(right[j++]);
  }
  return [...result, ...left.slice(i), ...right.slice(j)];
}

// ─── Binary Search ──────────────────────────────────────────────────────────

function binarySearch(arr: number[], target: number): number {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}

// ─── Tests ──────────────────────────────────────────────────────────────────

const data = [38, 27, 43, 3, 9, 82, 10];
console.log("Original:", data);
console.log("QuickSort:", quickSort(data));
console.log("MergeSort:", mergeSort(data));

const sorted = quickSort(data);
console.log("\\nBinary Search for 43:", binarySearch(sorted, 43));
console.log("Binary Search for 99:", binarySearch(sorted, 99));
`,
        language: "typescript",
        isEntryPoint: true,
      },
    ],
  },

];
