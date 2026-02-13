const fs = require("fs");
const path = require("path");

const BASE = path.join(
  __dirname,
  "..",
  "app",
  "[locale]",
  "(main)",
  "tech-mastry",
);

function w(rel, content) {
  const p = path.join(BASE, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, "utf8");
  console.log("  Created:", rel);
}

// ============================================================
// P3.1 — ALGORITHMS EXPANSION (Greedy, Backtracking, Graph Algos)
// ============================================================
console.log("\n=== P3.1 ALGORITHMS EXPANSION ===");

w(
  "algorithms/greedy/page.tsx",
  `import type { Metadata } from "next";
import { GreedyGuide } from "./_components/greedy-guide";

export const metadata: Metadata = {
  title: "Algorithmes Gloutons | Tech-Mastry",
  description: "Guide complet des algorithmes gloutons : sélection d'activités, Huffman, Kruskal, et stratégies de résolution.",
};

export default function GreedyPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-amber-500/20 to-yellow-500/20 mb-2">
          <span className="text-3xl">🎯</span>
        </div>
        <h1 className="text-4xl font-bold">Algorithmes Gloutons</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Les algorithmes gloutons font le choix localement optimal à chaque étape
          en espérant atteindre l&apos;optimum global. Maîtrisez cette technique puissante.
        </p>
      </div>
      <GreedyGuide />
    </main>
  );
}
`,
);

w(
  "algorithms/greedy/_components/greedy-guide.tsx",
  `"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckCircle2, Code2, Lightbulb, AlertTriangle } from "lucide-react";
import { useState } from "react";

const greedyAlgorithms = [
  {
    name: "Sélection d'Activités",
    complexity: "O(n log n)",
    description: "Sélectionner le maximum d'activités non-chevauchantes. Trier par fin, puis sélectionner gloutonement.",
    code: \`function activitySelection(activities) {
  // Trier par temps de fin
  activities.sort((a, b) => a.end - b.end);
  
  const selected = [activities[0]];
  let lastEnd = activities[0].end;
  
  for (let i = 1; i < activities.length; i++) {
    if (activities[i].start >= lastEnd) {
      selected.push(activities[i]);
      lastEnd = activities[i].end;
    }
  }
  
  return selected;
}\`,
    whenToUse: "Problèmes d'ordonnancement, allocation de ressources",
    proof: "Le choix qui finit le plus tôt laisse le maximum de place pour les suivants.",
  },
  {
    name: "Codage de Huffman",
    complexity: "O(n log n)",
    description: "Compression de données par codage à longueur variable. Les caractères fréquents ont des codes plus courts.",
    code: \`class HuffmanNode {
  constructor(char, freq) {
    this.char = char;
    this.freq = freq;
    this.left = null;
    this.right = null;
  }
}

function buildHuffmanTree(text) {
  // Compter les fréquences
  const freq = {};
  for (const c of text) freq[c] = (freq[c] || 0) + 1;
  
  // Créer les noeuds initiaux
  const nodes = Object.entries(freq)
    .map(([char, f]) => new HuffmanNode(char, f));
  
  // Construire l'arbre (min-heap simplifié)
  while (nodes.length > 1) {
    nodes.sort((a, b) => a.freq - b.freq);
    const left = nodes.shift();
    const right = nodes.shift();
    const parent = new HuffmanNode(null, left.freq + right.freq);
    parent.left = left;
    parent.right = right;
    nodes.push(parent);
  }
  
  return nodes[0];
}\`,
    whenToUse: "Compression de fichiers, encodage de données",
    proof: "Les caractères les moins fréquents sont les plus profonds — optimal par l'inégalité de Kraft.",
  },
  {
    name: "Algorithme de Kruskal",
    complexity: "O(E log E)",
    description: "Trouver l'arbre couvrant minimum (MST) d'un graphe pondéré en ajoutant les arêtes par poids croissant.",
    code: \`class UnionFind {
  constructor(n) {
    this.parent = Array.from({length: n}, (_, i) => i);
    this.rank = new Array(n).fill(0);
  }
  
  find(x) {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // Path compression
    }
    return this.parent[x];
  }
  
  union(x, y) {
    const px = this.find(x), py = this.find(y);
    if (px === py) return false;
    if (this.rank[px] < this.rank[py]) this.parent[px] = py;
    else if (this.rank[px] > this.rank[py]) this.parent[py] = px;
    else { this.parent[py] = px; this.rank[px]++; }
    return true;
  }
}

function kruskal(n, edges) {
  edges.sort((a, b) => a.weight - b.weight);
  const uf = new UnionFind(n);
  const mst = [];
  
  for (const edge of edges) {
    if (uf.union(edge.u, edge.v)) {
      mst.push(edge);
      if (mst.length === n - 1) break;
    }
  }
  
  return mst;
}\`,
    whenToUse: "Réseaux de câblage, clustering, infrastructure réseau",
    proof: "Cut property : l'arête la plus légère traversant une coupe est dans le MST.",
  },
  {
    name: "Problème du Sac à Dos Fractionnaire",
    complexity: "O(n log n)",
    description: "Maximiser la valeur dans un sac en pouvant prendre des fractions d'objets. Trier par ratio valeur/poids.",
    code: \`function fractionalKnapsack(capacity, items) {
  // Trier par ratio valeur/poids décroissant
  items.sort((a, b) => (b.value / b.weight) - (a.value / a.weight));
  
  let totalValue = 0;
  let remaining = capacity;
  
  for (const item of items) {
    if (remaining <= 0) break;
    
    if (item.weight <= remaining) {
      // Prendre l'objet entier
      totalValue += item.value;
      remaining -= item.weight;
    } else {
      // Prendre une fraction
      const fraction = remaining / item.weight;
      totalValue += item.value * fraction;
      remaining = 0;
    }
  }
  
  return totalValue;
}\`,
    whenToUse: "Allocation de ressources divisibles, investissements",
    proof: "Le ratio valeur/poids maximal est optimal quand les objets sont divisibles.",
  },
];

const vsDP = [
  { aspect: "Choix", greedy: "Localement optimal", dp: "Tous les sous-problèmes" },
  { aspect: "Retour en arrière", greedy: "Jamais", dp: "Explore toutes les options" },
  { aspect: "Complexité", greedy: "Souvent O(n log n)", dp: "Souvent O(n\u00B2) ou plus" },
  { aspect: "Optimal ?", greedy: "Pas toujours", dp: "Toujours (si applicable)" },
  { aspect: "Facilité", greedy: "Plus simple", dp: "Plus complexe" },
];

export function GreedyGuide() {
  const [activeAlgo, setActiveAlgo] = useState(0);

  return (
    <div className="space-y-12">
      {/* Algorithm Selector */}
      <div className="flex flex-wrap gap-2">
        {greedyAlgorithms.map((algo, i) => (
          <button
            key={algo.name}
            onClick={() => setActiveAlgo(i)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeAlgo === i
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            {algo.name}
          </button>
        ))}
      </div>

      {/* Active Algorithm Detail */}
      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{greedyAlgorithms[activeAlgo].name}</h2>
            <Badge variant="outline">{greedyAlgorithms[activeAlgo].complexity}</Badge>
          </div>
          <p className="text-muted-foreground">{greedyAlgorithms[activeAlgo].description}</p>
        </div>

        <div>
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-primary" />
            Implémentation
          </h3>
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
            <code>{greedyAlgorithms[activeAlgo].code}</code>
          </pre>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <h4 className="font-semibold text-green-500">Quand utiliser</h4>
            </div>
            <p className="text-sm text-muted-foreground">{greedyAlgorithms[activeAlgo].whenToUse}</p>
          </div>
          <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-blue-500" />
              <h4 className="font-semibold text-blue-500">Preuve d&apos;optimalité</h4>
            </div>
            <p className="text-sm text-muted-foreground">{greedyAlgorithms[activeAlgo].proof}</p>
          </div>
        </div>
      </Card>

      {/* Greedy vs DP Comparison */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-yellow-500" />
          Greedy vs Programmation Dynamique
        </h2>
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left font-semibold">Aspect</th>
                <th className="p-3 text-left font-semibold text-green-500">Greedy</th>
                <th className="p-3 text-left font-semibold text-blue-500">DP</th>
              </tr>
            </thead>
            <tbody>
              {vsDP.map((row) => (
                <tr key={row.aspect} className="border-b last:border-0">
                  <td className="p-3 font-medium">{row.aspect}</td>
                  <td className="p-3 text-muted-foreground">{row.greedy}</td>
                  <td className="p-3 text-muted-foreground">{row.dp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      {/* Key Takeaways */}
      <Card className="p-6 bg-muted/30">
        <h3 className="font-semibold mb-3">Points clés pour les entretiens</h3>
        <ul className="space-y-2">
          {[
            "Identifiez la propriété gloutonne : le choix local mène-t-il à l'optimum global ?",
            "Prouvez l'optimalité : échange d'arguments (exchange argument) ou contradiction",
            "Vérifiez la sous-structure optimale : la solution optimale contient des sous-solutions optimales",
            "Si Greedy ne fonctionne pas, pensez DP (ex: sac à dos 0/1 → DP, fractionnaire → Greedy)",
            "Commencez toujours par trier les données selon un critère pertinent",
          ].map((tip, i) => (
            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              {tip}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
`,
);

w(
  "algorithms/backtracking/page.tsx",
  `import type { Metadata } from "next";
import { BacktrackingGuide } from "./_components/backtracking-guide";

export const metadata: Metadata = {
  title: "Backtracking | Tech-Mastry",
  description: "Guide complet du backtracking : N-Queens, Sudoku solver, permutations, et patterns de résolution systématique.",
};

export default function BacktrackingPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-purple-500/20 to-violet-500/20 mb-2">
          <span className="text-3xl">🔙</span>
        </div>
        <h1 className="text-4xl font-bold">Backtracking</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Explorer systématiquement toutes les possibilités en revenant en arrière
          dès qu&apos;une solution partielle ne peut pas mener à une solution valide.
        </p>
      </div>
      <BacktrackingGuide />
    </main>
  );
}
`,
);

w(
  "algorithms/backtracking/_components/backtracking-guide.tsx",
  `"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Code2, Lightbulb } from "lucide-react";
import { useState } from "react";

const problems = [
  {
    name: "N-Queens",
    difficulty: "hard",
    description: "Placer N reines sur un échiquier N\u00D7N sans qu'aucune ne s'attaque mutuellement.",
    code: \`function solveNQueens(n) {
  const solutions = [];
  const board = Array(n).fill().map(() => Array(n).fill('.'));
  
  function isValid(row, col) {
    // Vérifier colonne
    for (let i = 0; i < row; i++) {
      if (board[i][col] === 'Q') return false;
    }
    // Diagonale gauche
    for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
      if (board[i][j] === 'Q') return false;
    }
    // Diagonale droite
    for (let i = row - 1, j = col + 1; i >= 0 && j < n; i--, j++) {
      if (board[i][j] === 'Q') return false;
    }
    return true;
  }
  
  function backtrack(row) {
    if (row === n) {
      solutions.push(board.map(r => r.join('')));
      return;
    }
    
    for (let col = 0; col < n; col++) {
      if (isValid(row, col)) {
        board[row][col] = 'Q';     // Placer
        backtrack(row + 1);         // Explorer
        board[row][col] = '.';     // Retirer (backtrack)
      }
    }
  }
  
  backtrack(0);
  return solutions;
}\`,
    pattern: "Placement avec contraintes",
    tips: ["Utiliser un set pour les colonnes et diagonales occupées (O(1) lookup)", "Optimisation : bitmasking pour les contraintes"],
  },
  {
    name: "Permutations",
    difficulty: "medium",
    description: "Générer toutes les permutations possibles d'un tableau de nombres distincts.",
    code: \`function permute(nums) {
  const result = [];
  
  function backtrack(current, remaining) {
    if (remaining.length === 0) {
      result.push([...current]);
      return;
    }
    
    for (let i = 0; i < remaining.length; i++) {
      current.push(remaining[i]);
      backtrack(
        current,
        [...remaining.slice(0, i), ...remaining.slice(i + 1)]
      );
      current.pop(); // Backtrack
    }
  }
  
  backtrack([], nums);
  return result;
}

// Optimisation avec swap (in-place)
function permuteOptimized(nums) {
  const result = [];
  
  function backtrack(start) {
    if (start === nums.length) {
      result.push([...nums]);
      return;
    }
    
    for (let i = start; i < nums.length; i++) {
      [nums[start], nums[i]] = [nums[i], nums[start]];
      backtrack(start + 1);
      [nums[start], nums[i]] = [nums[i], nums[start]];
    }
  }
  
  backtrack(0);
  return result;
}\`,
    pattern: "Génération exhaustive",
    tips: ["n! permutations → O(n!) en temps", "Variante : permutations avec doublons → trier + skip"],
  },
  {
    name: "Sudoku Solver",
    difficulty: "hard",
    description: "Résoudre un Sudoku 9\u00D79 en remplissant les cases vides avec les chiffres 1-9.",
    code: \`function solveSudoku(board) {
  function isValid(board, row, col, num) {
    const char = String(num);
    // Ligne
    for (let j = 0; j < 9; j++) {
      if (board[row][j] === char) return false;
    }
    // Colonne
    for (let i = 0; i < 9; i++) {
      if (board[i][col] === char) return false;
    }
    // Bloc 3x3
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = boxRow; i < boxRow + 3; i++) {
      for (let j = boxCol; j < boxCol + 3; j++) {
        if (board[i][j] === char) return false;
      }
    }
    return true;
  }
  
  function solve() {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j] === '.') {
          for (let num = 1; num <= 9; num++) {
            if (isValid(board, i, j, num)) {
              board[i][j] = String(num);
              if (solve()) return true;
              board[i][j] = '.'; // Backtrack
            }
          }
          return false; // Aucun chiffre valide
        }
      }
    }
    return true; // Tout rempli
  }
  
  solve();
  return board;
}\`,
    pattern: "Satisfaction de contraintes (CSP)",
    tips: ["Optimisation : choisir la case avec le moins d'options (MRV heuristic)", "Pré-calculer les contraintes avec des sets"],
  },
  {
    name: "Subsets / Combinaisons",
    difficulty: "medium",
    description: "Générer tous les sous-ensembles ou combinaisons de taille k d'un ensemble.",
    code: \`// Tous les sous-ensembles
function subsets(nums) {
  const result = [];
  
  function backtrack(start, current) {
    result.push([...current]);
    
    for (let i = start; i < nums.length; i++) {
      current.push(nums[i]);
      backtrack(i + 1, current);
      current.pop();
    }
  }
  
  backtrack(0, []);
  return result;
}

// Combinaisons de taille k
function combine(n, k) {
  const result = [];
  
  function backtrack(start, current) {
    if (current.length === k) {
      result.push([...current]);
      return;
    }
    
    // Pruning : assez d'éléments restants ?
    const remaining = n - start + 1;
    const needed = k - current.length;
    if (remaining < needed) return;
    
    for (let i = start; i <= n; i++) {
      current.push(i);
      backtrack(i + 1, current);
      current.pop();
    }
  }
  
  backtrack(1, []);
  return result;
}\`,
    pattern: "Génération de sous-ensembles",
    tips: ["2^n sous-ensembles → O(2^n)", "Le pruning réduit drastiquement l'espace de recherche"],
  },
];

const templateCode = \`function backtrack(state, choices) {
  // CAS DE BASE
  if (isGoal(state)) {
    results.push(copy(state));
    return;
  }
  
  // EXPLORER LES CHOIX
  for (const choice of choices) {
    if (isValid(state, choice)) {
      // 1. FAIRE le choix
      apply(state, choice);
      
      // 2. EXPLORER avec ce choix
      backtrack(state, nextChoices(choice));
      
      // 3. ANNULER le choix (backtrack)
      undo(state, choice);
    }
  }
}\`;

export function BacktrackingGuide() {
  const [activeProblem, setActiveProblem] = useState(0);

  const getDifficultyColor = (d) => {
    switch (d) {
      case "medium": return "bg-yellow-500/10 text-yellow-500";
      case "hard": return "bg-red-500/10 text-red-500";
      default: return "";
    }
  };

  return (
    <div className="space-y-12">
      {/* Template */}
      <Card className="p-6 border-primary/30">
        <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary" />
          Template Universel du Backtracking
        </h2>
        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
          <code>{templateCode}</code>
        </pre>
        <p className="text-sm text-muted-foreground mt-3">
          Trois étapes : <strong>Faire</strong> → <strong>Explorer</strong> → <strong>Annuler</strong>.
          C&apos;est le cœur de tout algorithme de backtracking.
        </p>
      </Card>

      {/* Problem Selector */}
      <div className="flex flex-wrap gap-2">
        {problems.map((p, i) => (
          <button
            key={p.name}
            onClick={() => setActiveProblem(i)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeProblem === i
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Problem Detail */}
      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{problems[activeProblem].name}</h2>
            <Badge className={getDifficultyColor(problems[activeProblem].difficulty)}>
              {problems[activeProblem].difficulty === "medium" ? "Moyen" : "Difficile"}
            </Badge>
            <Badge variant="outline">{problems[activeProblem].pattern}</Badge>
          </div>
          <p className="text-muted-foreground">{problems[activeProblem].description}</p>
        </div>

        <div>
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-primary" />
            Implémentation
          </h3>
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
            <code>{problems[activeProblem].code}</code>
          </pre>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Conseils d&apos;entretien</h4>
          <ul className="space-y-1">
            {problems[activeProblem].tips.map((tip, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {/* Complexity Table */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Complexité des problèmes classiques</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left font-semibold">Problème</th>
                <th className="p-3 text-left font-semibold">Temps</th>
                <th className="p-3 text-left font-semibold">Espace</th>
                <th className="p-3 text-left font-semibold">Pattern</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b"><td className="p-3">Permutations</td><td className="p-3 font-mono text-xs">O(n!)</td><td className="p-3 font-mono text-xs">O(n)</td><td className="p-3">Génération</td></tr>
              <tr className="border-b"><td className="p-3">Sous-ensembles</td><td className="p-3 font-mono text-xs">O(2\u207F)</td><td className="p-3 font-mono text-xs">O(n)</td><td className="p-3">Génération</td></tr>
              <tr className="border-b"><td className="p-3">N-Queens</td><td className="p-3 font-mono text-xs">O(n!)</td><td className="p-3 font-mono text-xs">O(n)</td><td className="p-3">Contraintes</td></tr>
              <tr className="border-b"><td className="p-3">Sudoku</td><td className="p-3 font-mono text-xs">O(9\u207F)</td><td className="p-3 font-mono text-xs">O(1)</td><td className="p-3">CSP</td></tr>
              <tr><td className="p-3">Combinaisons</td><td className="p-3 font-mono text-xs">O(C(n,k))</td><td className="p-3 font-mono text-xs">O(k)</td><td className="p-3">Sous-ensembles</td></tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
`,
);

w(
  "algorithms/graph-algorithms/page.tsx",
  `import type { Metadata } from "next";
import { GraphAlgorithmsGuide } from "./_components/graph-algorithms-guide";

export const metadata: Metadata = {
  title: "Algorithmes de Graphes | Tech-Mastry",
  description: "BFS, DFS, Dijkstra, Bellman-Ford, tri topologique et algorithmes de graphes essentiels pour les entretiens.",
};

export default function GraphAlgorithmsPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-indigo-500/20 to-blue-500/20 mb-2">
          <span className="text-3xl">🕸️</span>
        </div>
        <h1 className="text-4xl font-bold">Algorithmes de Graphes</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Parcours, plus courts chemins, détection de cycles et algorithmes fondamentaux
          sur les graphes — les favoris des entretiens techniques.
        </p>
      </div>
      <GraphAlgorithmsGuide />
    </main>
  );
}
`,
);

w(
  "algorithms/graph-algorithms/_components/graph-algorithms-guide.tsx",
  `"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Code2 } from "lucide-react";
import { useState } from "react";

const algorithms = [
  {
    name: "BFS (Breadth-First Search)",
    category: "Parcours",
    complexity: "O(V + E)",
    space: "O(V)",
    description: "Parcours par niveaux utilisant une file. Trouve le plus court chemin dans un graphe non pondéré.",
    code: \`function bfs(graph, start) {
  const visited = new Set([start]);
  const queue = [start];
  const order = [];
  
  while (queue.length > 0) {
    const node = queue.shift();
    order.push(node);
    
    for (const neighbor of graph[node] || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  
  return order;
}

// Plus court chemin (non pondéré)
function shortestPath(graph, start, end) {
  const visited = new Set([start]);
  const queue = [[start, [start]]];
  
  while (queue.length > 0) {
    const [node, path] = queue.shift();
    if (node === end) return path;
    
    for (const neighbor of graph[node] || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([neighbor, [...path, neighbor]]);
      }
    }
  }
  
  return null; // Pas de chemin
}\`,
    useCases: ["Plus court chemin (non pondéré)", "Parcours par niveaux d'arbre", "Résolution de labyrinthes", "Réseaux sociaux (amis d'amis)"],
  },
  {
    name: "DFS (Depth-First Search)",
    category: "Parcours",
    complexity: "O(V + E)",
    space: "O(V)",
    description: "Parcours en profondeur utilisant une pile (ou récursion). Détecte les cycles et les composantes connexes.",
    code: \`// Récursif
function dfsRecursive(graph, start, visited = new Set()) {
  visited.add(start);
  console.log(start);
  
  for (const neighbor of graph[start] || []) {
    if (!visited.has(neighbor)) {
      dfsRecursive(graph, neighbor, visited);
    }
  }
  
  return visited;
}

// Itératif (avec pile)
function dfsIterative(graph, start) {
  const visited = new Set();
  const stack = [start];
  
  while (stack.length > 0) {
    const node = stack.pop();
    if (visited.has(node)) continue;
    visited.add(node);
    
    for (const neighbor of graph[node] || []) {
      if (!visited.has(neighbor)) {
        stack.push(neighbor);
      }
    }
  }
  
  return visited;
}

// Détection de cycle (graphe orienté)
function hasCycle(graph, n) {
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Array(n).fill(WHITE);
  
  function dfs(node) {
    color[node] = GRAY;
    for (const neighbor of graph[node] || []) {
      if (color[neighbor] === GRAY) return true; // Cycle !
      if (color[neighbor] === WHITE && dfs(neighbor)) return true;
    }
    color[node] = BLACK;
    return false;
  }
  
  for (let i = 0; i < n; i++) {
    if (color[i] === WHITE && dfs(i)) return true;
  }
  return false;
}\`,
    useCases: ["Détection de cycles", "Tri topologique", "Composantes connexes", "Résolution de puzzles"],
  },
  {
    name: "Dijkstra",
    category: "Plus courts chemins",
    complexity: "O((V+E) log V)",
    space: "O(V)",
    description: "Plus court chemin depuis une source dans un graphe pondéré positif. Utilise un min-heap.",
    code: \`function dijkstra(graph, start, n) {
  const dist = new Array(n).fill(Infinity);
  const visited = new Set();
  dist[start] = 0;
  
  // Min-heap simplifié (utiliser une vraie PQ en production)
  const pq = [[0, start]]; // [distance, node]
  
  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, u] = pq.shift();
    
    if (visited.has(u)) continue;
    visited.add(u);
    
    for (const [v, weight] of graph[u] || []) {
      const newDist = dist[u] + weight;
      if (newDist < dist[v]) {
        dist[v] = newDist;
        pq.push([newDist, v]);
      }
    }
  }
  
  return dist;
}\`,
    useCases: ["GPS et navigation", "Routage réseau", "Chemins les plus courts pondérés", "Jeux vidéo (pathfinding)"],
  },
  {
    name: "Tri Topologique",
    category: "Ordonnancement",
    complexity: "O(V + E)",
    space: "O(V)",
    description: "Ordonnancement linéaire des sommets d'un DAG tel que pour chaque arête u→v, u précède v.",
    code: \`// Kahn's Algorithm (BFS)
function topologicalSort(graph, n) {
  const inDegree = new Array(n).fill(0);
  
  // Calculer les degrés entrants
  for (let u = 0; u < n; u++) {
    for (const v of graph[u] || []) {
      inDegree[v]++;
    }
  }
  
  // Ajouter les noeuds sans prédécesseur
  const queue = [];
  for (let i = 0; i < n; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }
  
  const order = [];
  while (queue.length > 0) {
    const u = queue.shift();
    order.push(u);
    
    for (const v of graph[u] || []) {
      inDegree[v]--;
      if (inDegree[v] === 0) queue.push(v);
    }
  }
  
  // Si order.length !== n, le graphe a un cycle
  return order.length === n ? order : null;
}\`,
    useCases: ["Ordonnancement de tâches", "Résolution de dépendances (npm, make)", "Compilation", "Planning de cours"],
  },
];

export function GraphAlgorithmsGuide() {
  const [activeAlgo, setActiveAlgo] = useState(0);

  return (
    <div className="space-y-12">
      {/* Algorithm Selector */}
      <div className="flex flex-wrap gap-2">
        {algorithms.map((algo, i) => (
          <button
            key={algo.name}
            onClick={() => setActiveAlgo(i)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeAlgo === i
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            {algo.name}
          </button>
        ))}
      </div>

      {/* Active Algorithm */}
      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-bold">{algorithms[activeAlgo].name}</h2>
            <Badge variant="outline">{algorithms[activeAlgo].category}</Badge>
            <Badge variant="secondary">Temps: {algorithms[activeAlgo].complexity}</Badge>
            <Badge variant="secondary">Espace: {algorithms[activeAlgo].space}</Badge>
          </div>
          <p className="text-muted-foreground">{algorithms[activeAlgo].description}</p>
        </div>

        <div>
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-primary" />
            Implémentation
          </h3>
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
            <code>{algorithms[activeAlgo].code}</code>
          </pre>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Applications</h4>
          <div className="flex flex-wrap gap-2">
            {algorithms[activeAlgo].useCases.map((uc, i) => (
              <Badge key={i} variant="outline">{uc}</Badge>
            ))}
          </div>
        </div>
      </Card>

      {/* Comparison Table */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Quand utiliser quel algorithme ?</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left font-semibold">Scénario</th>
                <th className="p-3 text-left font-semibold">Algorithme</th>
                <th className="p-3 text-left font-semibold">Pourquoi</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b"><td className="p-3">Plus court chemin (non pondéré)</td><td className="p-3 font-medium">BFS</td><td className="p-3 text-muted-foreground">Explore par niveaux = distances croissantes</td></tr>
              <tr className="border-b"><td className="p-3">Plus court chemin (pondéré +)</td><td className="p-3 font-medium">Dijkstra</td><td className="p-3 text-muted-foreground">Explore par distance minimale</td></tr>
              <tr className="border-b"><td className="p-3">Plus court chemin (poids négatifs)</td><td className="p-3 font-medium">Bellman-Ford</td><td className="p-3 text-muted-foreground">Relaxe toutes les arêtes V-1 fois</td></tr>
              <tr className="border-b"><td className="p-3">Détection de cycle</td><td className="p-3 font-medium">DFS (3 couleurs)</td><td className="p-3 text-muted-foreground">Arête arrière (gray → gray) = cycle</td></tr>
              <tr className="border-b"><td className="p-3">Ordonnancement</td><td className="p-3 font-medium">Tri topologique</td><td className="p-3 text-muted-foreground">DAG → ordre linéaire</td></tr>
              <tr><td className="p-3">Arbre couvrant minimum</td><td className="p-3 font-medium">Kruskal / Prim</td><td className="p-3 text-muted-foreground">Connecter tous les noeuds au coût minimal</td></tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
`,
);

console.log(
  "P3.1 Algorithms: DONE (3 new pages: greedy, backtracking, graph-algorithms)",
);

// ============================================================
// P3.2 — FRONTEND EXPANSION (CSS Advanced, Testing, Next.js)
// ============================================================
console.log("\n=== P3.2 FRONTEND EXPANSION ===");

w(
  "frontend/css-advanced/page.tsx",
  `import type { Metadata } from "next";
import { CSSAdvancedGuide } from "./_components/css-advanced-guide";

export const metadata: Metadata = {
  title: "CSS Avancé | Tech-Mastry",
  description: "Grid, Flexbox avancé, animations CSS, Container Queries, et techniques modernes de layout.",
};

export default function CSSAdvancedPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-pink-500/20 to-rose-500/20 mb-2">
          <span className="text-3xl">🎨</span>
        </div>
        <h1 className="text-4xl font-bold">CSS Avancé</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Maîtrisez Grid, Flexbox avancé, animations et les nouvelles APIs CSS
          pour créer des interfaces modernes et performantes.
        </p>
      </div>
      <CSSAdvancedGuide />
    </main>
  );
}
`,
);

w(
  "frontend/css-advanced/_components/css-advanced-guide.tsx",
  `"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState } from "react";

const topics = [
  {
    name: "CSS Grid Avancé",
    examples: [
      {
        title: "Grid Template Areas",
        css: \`.layout {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar main aside"
    "footer footer footer";
  grid-template-columns: 250px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  gap: 1rem;
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.aside { grid-area: aside; }
.footer { grid-area: footer; }

/* Responsive */
@media (max-width: 768px) {
  .layout {
    grid-template-areas:
      "header"
      "main"
      "sidebar"
      "aside"
      "footer";
    grid-template-columns: 1fr;
  }
}\`,
        description: "Layouts complexes avec zones nommées et responsive sans media queries imbriquées.",
      },
      {
        title: "Auto-fit & Minmax",
        css: \`.auto-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* Masonry-like avec subgrid */
.masonry {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 10px;
  gap: 1rem;
}

.masonry-item {
  grid-row: span var(--rows);
}\`,
        description: "Grilles responsives automatiques sans media queries. auto-fit + minmax = magie.",
      },
    ],
  },
  {
    name: "Animations & Transitions",
    examples: [
      {
        title: "Keyframes Avancés",
        css: \`@keyframes morphing {
  0% {
    border-radius: 40% 60% 60% 40% / 60% 30% 70% 40%;
    transform: rotate(0deg);
  }
  50% {
    border-radius: 60% 40% 30% 70% / 40% 60% 70% 30%;
    transform: rotate(180deg);
  }
  100% {
    border-radius: 40% 60% 60% 40% / 60% 30% 70% 40%;
    transform: rotate(360deg);
  }
}

.blob {
  animation: morphing 8s ease-in-out infinite;
  background: linear-gradient(135deg, #667eea, #764ba2);
}

/* Scroll-driven animations (Chrome 115+) */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.scroll-reveal {
  animation: fadeIn auto both;
  animation-timeline: view();
  animation-range: entry 0% entry 100%;
}\`,
        description: "Morphing, animations au scroll, et transitions GPU-accélérées.",
      },
    ],
  },
  {
    name: "Container Queries",
    examples: [
      {
        title: "Container Queries",
        css: \`/* Conteneur */
.card-container {
  container-type: inline-size;
  container-name: card;
}

/* Requêtes de conteneur */
@container card (min-width: 400px) {
  .card-layout {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 1rem;
  }
}

@container card (min-width: 600px) {
  .card-layout {
    grid-template-columns: 250px 1fr auto;
  }
  .card-actions { display: flex; }
}

/* Container Query Units */
.responsive-text {
  font-size: clamp(1rem, 3cqi, 2rem);
}\`,
        description: "Responsive au niveau du composant, pas de la fenêtre. Le futur du responsive design.",
      },
    ],
  },
  {
    name: "Techniques Modernes",
    examples: [
      {
        title: "Cascade Layers & :has()",
        css: \`/* Cascade Layers — Contrôle de la spécificité */
@layer base, components, utilities;

@layer base {
  h1 { font-size: 2rem; }
}

@layer components {
  .card h1 { font-size: 1.5rem; } /* Priorité sur base */
}

@layer utilities {
  .text-xl { font-size: 1.25rem !important; }
}

/* :has() — Parent selector enfin ! */
.card:has(img) {
  padding: 0;
}

.form:has(input:invalid) .submit-btn {
  opacity: 0.5;
  pointer-events: none;
}

/* :is() et :where() */
:is(h1, h2, h3):hover {
  color: var(--primary);
}\`,
        description: "Layers pour organiser la cascade, :has() comme sélecteur parent, et pseudo-classes logiques.",
      },
    ],
  },
];

export function CSSAdvancedGuide() {
  const [activeTopic, setActiveTopic] = useState(0);

  return (
    <div className="space-y-12">
      <div className="flex flex-wrap gap-2">
        {topics.map((t, i) => (
          <button
            key={t.name}
            onClick={() => setActiveTopic(i)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTopic === i ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
            )}
          >
            {t.name}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {topics[activeTopic].examples.map((ex) => (
          <Card key={ex.title} className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold">{ex.title}</h3>
              <Badge variant="outline">CSS</Badge>
            </div>
            <p className="text-muted-foreground">{ex.description}</p>
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
              <code>{ex.css}</code>
            </pre>
          </Card>
        ))}
      </div>

      <Card className="p-6 bg-muted/30">
        <h3 className="font-semibold mb-3">Questions d&apos;entretien CSS fréquentes</h3>
        <ul className="space-y-2">
          {[
            "Expliquez la différence entre Grid et Flexbox — quand utiliser l'un ou l'autre ?",
            "Comment fonctionne la cascade CSS ? Qu'est-ce que la spécificité ?",
            "Comment optimiser les animations CSS pour 60fps ? (will-change, transform, opacity)",
            "Qu'est-ce que le BFC (Block Formatting Context) et comment l'utiliser ?",
            "Comment créer un layout responsive sans media queries ? (auto-fit, clamp, container queries)",
          ].map((q, i) => (
            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              {q}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
`,
);

w(
  "frontend/testing/page.tsx",
  `import type { Metadata } from "next";
import { TestingGuide } from "./_components/testing-guide";

export const metadata: Metadata = {
  title: "Testing Frontend | Tech-Mastry",
  description: "Tests unitaires, d'intégration et E2E pour applications React : Vitest, Testing Library, Playwright.",
};

export default function TestingPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-green-500/20 to-emerald-500/20 mb-2">
          <span className="text-3xl">🧪</span>
        </div>
        <h1 className="text-4xl font-bold">Testing Frontend</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Stratégies de test pour applications React : unitaires avec Vitest,
          composants avec Testing Library, E2E avec Playwright.
        </p>
      </div>
      <TestingGuide />
    </main>
  );
}
`,
);

w(
  "frontend/testing/_components/testing-guide.tsx",
  `"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Code2 } from "lucide-react";
import { useState } from "react";

const testTypes = [
  {
    name: "Tests Unitaires (Vitest)",
    description: "Tester des fonctions et modules isolés. Rapides et nombreux.",
    code: \`import { describe, it, expect, vi } from 'vitest';
import { formatCurrency, validateEmail } from './utils';

describe('formatCurrency', () => {
  it('formats positive amounts', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats with custom locale', () => {
    expect(formatCurrency(1234.56, 'fr-FR')).toBe('1 234,56 \u20AC');
  });
});

describe('validateEmail', () => {
  it.each([
    ['user@example.com', true],
    ['invalid-email', false],
    ['a@b.c', false],
    ['user+tag@domain.co', true],
  ])('validates %s as %s', (email, expected) => {
    expect(validateEmail(email)).toBe(expected);
  });
});

// Mocking
describe('API service', () => {
  it('fetches user data', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ name: 'John' }),
    });
    global.fetch = mockFetch;

    const user = await fetchUser('123');
    expect(user.name).toBe('John');
    expect(mockFetch).toHaveBeenCalledWith('/api/users/123');
  });
});\`,
  },
  {
    name: "Tests de Composants (Testing Library)",
    description: "Tester les composants React comme l'utilisateur les voit et interagit.",
    code: \`import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('renders form fields', () => {
    render(<LoginForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /connexion/i })).toBeInTheDocument();
  });

  it('shows validation errors on empty submit', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    
    await user.click(screen.getByRole('button', { name: /connexion/i }));
    
    expect(await screen.findByText(/email requis/i)).toBeInTheDocument();
    expect(screen.getByText(/mot de passe requis/i)).toBeInTheDocument();
  });

  it('calls onSubmit with valid data', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();
    render(<LoginForm onSubmit={handleSubmit} />);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/mot de passe/i), 'password123');
    await user.click(screen.getByRole('button', { name: /connexion/i }));
    
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('disables button while submitting', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={() => new Promise(r => setTimeout(r, 1000))} />);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/mot de passe/i), 'password123');
    await user.click(screen.getByRole('button', { name: /connexion/i }));
    
    expect(screen.getByRole('button')).toBeDisabled();
  });
});\`,
  },
  {
    name: "Tests E2E (Playwright)",
    description: "Tester les parcours utilisateur complets dans un vrai navigateur.",
    code: \`import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('successful login redirects to dashboard', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByLabel('Email').fill('admin@example.com');
    await page.getByLabel('Mot de passe').fill('password123');
    await page.getByRole('button', { name: 'Connexion' }).click();
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('Bienvenue')).toBeVisible();
  });

  test('failed login shows error', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByLabel('Email').fill('wrong@example.com');
    await page.getByLabel('Mot de passe').fill('wrong');
    await page.getByRole('button', { name: 'Connexion' }).click();
    
    await expect(page.getByText(/identifiants invalides/i)).toBeVisible();
    await expect(page).toHaveURL('/login');
  });

  test('protected routes redirect to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\\/login/);
  });
});

test.describe('Search Feature', () => {
  test('finds and displays results', async ({ page }) => {
    await page.goto('/');
    
    const searchInput = page.getByPlaceholder('Rechercher...');
    await searchInput.fill('React');
    
    // Wait for results
    const results = page.getByTestId('search-results');
    await expect(results).toBeVisible();
    await expect(results.getByRole('link')).toHaveCount.greaterThan(0);
    
    // Click first result
    await results.getByRole('link').first().click();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('React');
  });
});\`,
  },
  {
    name: "Hooks Testing",
    description: "Tester les custom hooks React de manière isolée.",
    code: \`import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';
import { useDebounce } from './useDebounce';

describe('useCounter', () => {
  it('initializes with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('increments and decrements', () => {
    const { result } = renderHook(() => useCounter(10));
    
    act(() => result.current.increment());
    expect(result.current.count).toBe(11);
    
    act(() => result.current.decrement());
    expect(result.current.count).toBe(10);
  });

  it('respects min and max bounds', () => {
    const { result } = renderHook(() =>
      useCounter(5, { min: 0, max: 10 })
    );
    
    act(() => { for (let i = 0; i < 20; i++) result.current.increment(); });
    expect(result.current.count).toBe(10);
  });
});

describe('useDebounce', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('debounces value updates', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    );
    
    expect(result.current).toBe('initial');
    
    rerender({ value: 'updated' });
    expect(result.current).toBe('initial'); // Not yet updated
    
    act(() => vi.advanceTimersByTime(500));
    expect(result.current).toBe('updated'); // Now updated
  });
});\`,
  },
];

const pyramid = [
  { name: "E2E", pct: 10, color: "bg-red-500", desc: "Peu, lents, parcours critiques" },
  { name: "Intégration", pct: 30, color: "bg-yellow-500", desc: "Composants + services" },
  { name: "Unitaires", pct: 60, color: "bg-green-500", desc: "Nombreux, rapides, isolés" },
];

export function TestingGuide() {
  const [activeTest, setActiveTest] = useState(0);

  return (
    <div className="space-y-12">
      {/* Testing Pyramid */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Pyramide des Tests</h2>
        <div className="flex flex-col items-center gap-2 py-4">
          {pyramid.map((level, i) => (
            <div key={level.name} className="flex items-center gap-4" style={{ width: \`\${40 + i * 30}%\` }}>
              <div className={cn("h-10 rounded-lg flex items-center justify-center text-white text-sm font-medium w-full", level.color)}>
                {level.name} ({level.pct}%)
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{level.desc}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Test Type Selector */}
      <div className="flex flex-wrap gap-2">
        {testTypes.map((t, i) => (
          <button
            key={t.name}
            onClick={() => setActiveTest(i)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTest === i ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
            )}
          >
            {t.name}
          </button>
        ))}
      </div>

      <Card className="p-6 space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{testTypes[activeTest].name}</h2>
          <p className="text-muted-foreground">{testTypes[activeTest].description}</p>
        </div>
        <div>
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-primary" />
            Exemple
          </h3>
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
            <code>{testTypes[activeTest].code}</code>
          </pre>
        </div>
      </Card>

      <Card className="p-6 bg-muted/30">
        <h3 className="font-semibold mb-3">Best Practices</h3>
        <ul className="space-y-2">
          {[
            "Testez le comportement, pas l'implémentation (Testing Library)",
            "Un test = un scénario. Pas de logique dans les tests.",
            "Nommez vos tests comme des phrases : 'should display error when email is invalid'",
            "Moquez les dépendances externes (API, localStorage), jamais la logique interne",
            "Utilisez data-testid en dernier recours — préférez les rôles ARIA et les labels",
          ].map((tip, i) => (
            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              {tip}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
`,
);

w(
  "frontend/nextjs-patterns/page.tsx",
  `import type { Metadata } from "next";
import { NextjsGuide } from "./_components/nextjs-guide";

export const metadata: Metadata = {
  title: "Next.js Patterns | Tech-Mastry",
  description: "Patterns avancés Next.js 14+ : App Router, Server Components, Server Actions, streaming et caching.",
};

export default function NextjsPatternsPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-gray-500/20 to-zinc-500/20 mb-2">
          <span className="text-3xl">▲</span>
        </div>
        <h1 className="text-4xl font-bold">Next.js Patterns</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Patterns avancés pour Next.js 14+ avec App Router, React Server Components,
          Server Actions, et stratégies de caching.
        </p>
      </div>
      <NextjsGuide />
    </main>
  );
}
`,
);

w(
  "frontend/nextjs-patterns/_components/nextjs-guide.tsx",
  `"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Code2 } from "lucide-react";
import { useState } from "react";

const patterns = [
  {
    name: "Server Components",
    code: \`// app/dashboard/page.tsx — Server Component (default)
import { db } from '@/lib/db';

export default async function DashboardPage() {
  // ✅ Accès direct à la DB (jamais envoyé au client)
  const stats = await db.analytics.getStats();
  const user = await db.user.getCurrent();
  
  return (
    <main>
      <h1>Bonjour {user.name}</h1>
      <StatsGrid stats={stats} />
      {/* Client Component imbriqué */}
      <Suspense fallback={<Skeleton />}>
        <InteractiveChart data={stats.chartData} />
      </Suspense>
    </main>
  );
}

// Règle d'or : Server par défaut, Client seulement quand nécessaire
// ❌ useState, useEffect, onClick → Client
// ✅ fetch, db, fs, env secrets → Server\`,
    keyPoints: ["Rendu côté serveur par défaut", "Accès direct DB/API/env", "Pas de JS envoyé au client", "Suspense pour le streaming"],
  },
  {
    name: "Server Actions",
    code: \`// app/actions.ts
'use server'

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const CreatePostSchema = z.object({
  title: z.string().min(3).max(100),
  content: z.string().min(10),
});

export async function createPost(formData: FormData) {
  const validated = CreatePostSchema.parse({
    title: formData.get('title'),
    content: formData.get('content'),
  });
  
  await db.post.create({ data: validated });
  revalidatePath('/posts'); // Invalide le cache
  redirect('/posts');
}

// Usage dans un formulaire
// <form action={createPost}>
//   <input name="title" />
//   <textarea name="content" />
//   <button type="submit">Publier</button>
// </form>

// Avec useActionState (React 19)
export async function updateProfile(prevState, formData) {
  try {
    const data = ProfileSchema.parse(Object.fromEntries(formData));
    await db.user.update({ data });
    return { success: true, message: 'Profil mis à jour' };
  } catch (error) {
    return { success: false, message: 'Erreur de validation' };
  }
}\`,
    keyPoints: ["Mutations côté serveur type-safe", "Revalidation automatique", "Progressive enhancement (fonctionne sans JS)", "Validation Zod intégrée"],
  },
  {
    name: "Caching & Revalidation",
    code: \`// Stratégies de cache Next.js

// 1. Static (build time) — par défaut
async function getStaticData() {
  const res = await fetch('https://api.example.com/data');
  return res.json();
}

// 2. Time-based revalidation
async function getISRData() {
  const res = await fetch('https://api.example.com/data', {
    next: { revalidate: 3600 } // Revalider toutes les heures
  });
  return res.json();
}

// 3. On-demand revalidation
import { revalidatePath, revalidateTag } from 'next/cache';

// Par path
export async function publishPost() {
  await db.post.publish();
  revalidatePath('/blog');
}

// Par tag
async function getTaggedData() {
  const res = await fetch('https://api.example.com/data', {
    next: { tags: ['posts'] }
  });
  return res.json();
}

export async function updatePost() {
  await db.post.update();
  revalidateTag('posts'); // Invalide toutes les fetches taguées
}

// 4. No cache
async function getDynamicData() {
  const res = await fetch('https://api.example.com/data', {
    cache: 'no-store'
  });
  return res.json();
}\`,
    keyPoints: ["4 stratégies : Static, ISR, On-demand, Dynamic", "Tags pour invalidation granulaire", "revalidatePath vs revalidateTag", "Partial Prerendering (PPR) en expérimental"],
  },
  {
    name: "Streaming & Suspense",
    code: \`// app/dashboard/page.tsx
import { Suspense } from 'react';

export default function DashboardPage() {
  return (
    <main>
      <h1>Dashboard</h1>
      
      {/* Contenu rapide — envoyé immédiatement */}
      <QuickStats />
      
      {/* Contenu lent — streamé progressivement */}
      <Suspense fallback={<ChartSkeleton />}>
        <SlowChart />
      </Suspense>
      
      <Suspense fallback={<TableSkeleton />}>
        <SlowDataTable />
      </Suspense>
    </main>
  );
}

// loading.tsx — Streaming automatique par route
export default function Loading() {
  return <DashboardSkeleton />;
}

// Parallel data fetching
async function ParallelPage() {
  // ✅ Fetch en parallèle
  const [users, posts, analytics] = await Promise.all([
    getUsers(),
    getPosts(),
    getAnalytics(),
  ]);
  
  return <Dashboard users={users} posts={posts} analytics={analytics} />;
}\`,
    keyPoints: ["Streaming HTML progressif", "Suspense boundaries granulaires", "loading.tsx par segment de route", "Promise.all pour le parallélisme"],
  },
];

export function NextjsGuide() {
  const [activePattern, setActivePattern] = useState(0);

  return (
    <div className="space-y-12">
      <div className="flex flex-wrap gap-2">
        {patterns.map((p, i) => (
          <button
            key={p.name}
            onClick={() => setActivePattern(i)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activePattern === i ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
            )}
          >
            {p.name}
          </button>
        ))}
      </div>

      <Card className="p-6 space-y-6">
        <h2 className="text-2xl font-bold">{patterns[activePattern].name}</h2>
        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
          <code>{patterns[activePattern].code}</code>
        </pre>
        <div>
          <h4 className="font-semibold mb-2">Points clés</h4>
          <div className="flex flex-wrap gap-2">
            {patterns[activePattern].keyPoints.map((kp, i) => (
              <Badge key={i} variant="outline">{kp}</Badge>
            ))}
          </div>
        </div>
      </Card>

      {/* Server vs Client Decision Tree */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Server ou Client Component ?</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left font-semibold">Besoin</th>
                <th className="p-3 text-left font-semibold text-blue-500">Server</th>
                <th className="p-3 text-left font-semibold text-purple-500">Client</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b"><td className="p-3">Fetch data</td><td className="p-3">✅</td><td className="p-3">⚠️ (useEffect)</td></tr>
              <tr className="border-b"><td className="p-3">Accès DB/API directe</td><td className="p-3">✅</td><td className="p-3">❌</td></tr>
              <tr className="border-b"><td className="p-3">Secrets/env vars</td><td className="p-3">✅</td><td className="p-3">❌</td></tr>
              <tr className="border-b"><td className="p-3">Interactivité (onClick)</td><td className="p-3">❌</td><td className="p-3">✅</td></tr>
              <tr className="border-b"><td className="p-3">State (useState)</td><td className="p-3">❌</td><td className="p-3">✅</td></tr>
              <tr className="border-b"><td className="p-3">Effects (useEffect)</td><td className="p-3">❌</td><td className="p-3">✅</td></tr>
              <tr><td className="p-3">Browser APIs</td><td className="p-3">❌</td><td className="p-3">✅</td></tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
`,
);

console.log(
  "P3.2 Frontend: DONE (3 new pages: css-advanced, testing, nextjs-patterns)",
);

// ============================================================
// P3.5 — BEST PRACTICES EXERCISES
// ============================================================
console.log("\n=== P3.5 BEST PRACTICES EXERCISES ===");

w(
  "best-practices/exercises/page.tsx",
  `import type { Metadata } from "next";
import { BestPracticesExercises } from "./_components/exercises";

export const metadata: Metadata = {
  title: "Exercices Situationnels | Tech-Mastry",
  description: "Mettez en pratique les bonnes pratiques avec des exercices de refactoring, code review et design.",
};

export default function ExercisesPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-emerald-500/20 to-green-500/20 mb-2">
          <span className="text-3xl">💡</span>
        </div>
        <h1 className="text-4xl font-bold">Exercices Situationnels</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Mettez en pratique les bonnes pratiques de développement avec des exercices
          de refactoring, code review et design architectural.
        </p>
      </div>
      <BestPracticesExercises />
    </main>
  );
}
`,
);

w(
  "best-practices/exercises/_components/exercises.tsx",
  `"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Code2, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";

const exercises = [
  {
    title: "Code Review : Identifier les problèmes",
    difficulty: "medium",
    category: "Code Quality",
    description: "Trouvez les problèmes dans ce code et proposez des corrections.",
    badCode: \`// ❌ Code à revoir
async function getData(id) {
  let data = null;
  try {
    const response = await fetch("/api/users/" + id);
    data = await response.json();
    if (data.error) {
      console.log("Error: " + data.error);
      return null;
    }
    // Process data
    let result = {};
    result.name = data.firstName + " " + data.lastName;
    result.email = data.email;
    result.age = new Date().getFullYear() - new Date(data.birthday).getFullYear();
    result.isAdmin = data.role == "admin";
    localStorage.setItem("lastUser", JSON.stringify(result));
    return result;
  } catch (e) {
    console.log(e);
    return null;
  }
}\`,
    goodCode: \`// ✅ Code corrigé
interface User {
  name: string;
  email: string;
  age: number;
  isAdmin: boolean;
}

class UserServiceError extends Error {
  constructor(message: string, public readonly statusCode?: number) {
    super(message);
    this.name = 'UserServiceError';
  }
}

async function getUser(userId: string): Promise<User> {
  const response = await fetch(\\\`/api/users/\\\${encodeURIComponent(userId)}\\\`);
  
  if (!response.ok) {
    throw new UserServiceError(
      \\\`Failed to fetch user: \\\${response.statusText}\\\`,
      response.status
    );
  }

  const data = await response.json();
  
  return {
    name: \\\`\\\${data.firstName} \\\${data.lastName}\\\`,
    email: data.email,
    age: calculateAge(new Date(data.birthday)),
    isAdmin: data.role === "admin", // === strict
  };
}

function calculateAge(birthday: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthday.getFullYear();
  const monthDiff = today.getMonth() - birthday.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
    age--;
  }
  return age;
}\`,
    issues: [
      "=\u003D au lieu de ===",
      "Pas de typage TypeScript",
      "Calcul d'âge incorrect (ne considère pas le mois/jour)",
      "Pas d'encodage de l'ID dans l'URL (injection possible)",
      "localStorage dans une fonction de service (couplage)",
      "console.log au lieu de gestion d'erreur propre",
      "Concaténation de strings au lieu de template literals",
    ],
  },
  {
    title: "Refactoring : Single Responsibility",
    difficulty: "hard",
    category: "SOLID",
    description: "Refactorez cette classe qui viole le principe SRP.",
    badCode: \`// ❌ Violation du SRP
class OrderService {
  async createOrder(items, userId) {
    // Validation
    if (!items || items.length === 0) throw new Error("No items");
    for (const item of items) {
      if (item.quantity <= 0) throw new Error("Invalid quantity");
      if (item.price < 0) throw new Error("Invalid price");
    }
    
    // Calcul du total
    let total = 0;
    for (const item of items) {
      total += item.price * item.quantity;
      if (item.discount) total -= item.discount;
    }
    const tax = total * 0.2;
    total += tax;
    
    // Sauvegarde en DB
    const order = await db.orders.create({
      userId, items, total, tax, status: "pending"
    });
    
    // Envoi d'email
    const user = await db.users.findById(userId);
    await sendEmail(user.email, "Commande confirmée", 
      \\\`Votre commande #\\\${order.id} de \\\${total}\u20AC...\\\`);
    
    // Logging
    console.log(\\\`Order \\\${order.id} created for user \\\${userId}\\\`);
    await db.logs.create({ action: "order_created", orderId: order.id });
    
    return order;
  }
}\`,
    goodCode: \`// ✅ Respect du SRP
class OrderValidator {
  validate(items: OrderItem[]): void {
    if (!items?.length) throw new ValidationError("No items");
    items.forEach(item => {
      if (item.quantity <= 0) throw new ValidationError("Invalid quantity");
      if (item.price < 0) throw new ValidationError("Invalid price");
    });
  }
}

class PriceCalculator {
  calculate(items: OrderItem[]): { subtotal: number; tax: number; total: number } {
    const subtotal = items.reduce((sum, item) => 
      sum + (item.price * item.quantity) - (item.discount || 0), 0
    );
    const tax = subtotal * 0.2;
    return { subtotal, tax, total: subtotal + tax };
  }
}

class OrderNotifier {
  async notify(user: User, order: Order): Promise<void> {
    await this.emailService.send(user.email, "Commande confirmée", ...);
  }
}

class OrderService {
  constructor(
    private validator: OrderValidator,
    private calculator: PriceCalculator,
    private notifier: OrderNotifier,
    private repository: OrderRepository,
  ) {}
  
  async create(items: OrderItem[], userId: string): Promise<Order> {
    this.validator.validate(items);
    const pricing = this.calculator.calculate(items);
    const order = await this.repository.save({ userId, items, ...pricing });
    await this.notifier.notify(await this.userRepo.find(userId), order);
    return order;
  }
}\`,
    issues: [
      "La classe fait la validation, le calcul, la persistence, l'email et le logging",
      "Impossible de tester le calcul sans la DB",
      "Changer le format d'email nécessite de modifier OrderService",
      "Pas d'injection de dépendances",
      "Violation du OCP : ajouter un canal de notification = modifier la classe",
    ],
  },
];

export function BestPracticesExercises() {
  const [activeExercise, setActiveExercise] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  return (
    <div className="space-y-8">
      {/* Exercise Selector */}
      <div className="flex flex-wrap gap-2">
        {exercises.map((ex, i) => (
          <button
            key={ex.title}
            onClick={() => { setActiveExercise(i); setShowSolution(false); }}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeExercise === i ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
            )}
          >
            {ex.title}
          </button>
        ))}
      </div>

      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">{exercises[activeExercise].title}</h2>
            <Badge variant="outline">{exercises[activeExercise].category}</Badge>
            <Badge className={exercises[activeExercise].difficulty === "hard" ? "bg-red-500/10 text-red-500" : "bg-yellow-500/10 text-yellow-500"}>
              {exercises[activeExercise].difficulty === "hard" ? "Difficile" : "Moyen"}
            </Badge>
          </div>
          <p className="text-muted-foreground">{exercises[activeExercise].description}</p>
        </div>

        {/* Bad Code */}
        <div>
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500" />
            Code à améliorer
          </h3>
          <pre className="bg-red-500/5 border border-red-500/20 p-4 rounded-lg text-sm overflow-x-auto">
            <code>{exercises[activeExercise].badCode}</code>
          </pre>
        </div>

        {/* Issues to Find */}
        <div>
          <h4 className="font-semibold mb-2">Problèmes à identifier ({exercises[activeExercise].issues.length})</h4>
          <ul className="space-y-1">
            {exercises[activeExercise].issues.map((issue, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                {issue}
              </li>
            ))}
          </ul>
        </div>

        {/* Solution Toggle */}
        <button
          onClick={() => setShowSolution(!showSolution)}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
        >
          {showSolution ? "Masquer la solution" : "Voir la solution"}
        </button>

        {showSolution && (
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Solution
            </h3>
            <pre className="bg-green-500/5 border border-green-500/20 p-4 rounded-lg text-sm overflow-x-auto">
              <code>{exercises[activeExercise].goodCode}</code>
            </pre>
          </div>
        )}
      </Card>
    </div>
  );
}
`,
);

console.log("P3.5 Best Practices exercises: DONE");

console.log("\n✅ ALL PHASE 3 CONTENT CREATED");
console.log(
  "  - P3.1: 3 algorithm pages (greedy, backtracking, graph-algorithms)",
);
console.log(
  "  - P3.2: 3 frontend pages (css-advanced, testing, nextjs-patterns)",
);
console.log("  - P3.5: 1 best-practices exercises page");
