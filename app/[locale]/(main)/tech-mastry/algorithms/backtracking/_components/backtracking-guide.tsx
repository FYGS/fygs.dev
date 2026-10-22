"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Code2, Lightbulb } from "lucide-react";
import { useState } from "react";

const problems = [
  {
    name: "N-Queens",
    difficulty: "hard",
    description:
      "Placer N reines sur un échiquier N×N sans qu'aucune ne s'attaque mutuellement.",
    code: `function solveNQueens(n) {
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
}`,
    pattern: "Placement avec contraintes",
    tips: [
      "Utiliser un set pour les colonnes et diagonales occupées (O(1) lookup)",
      "Optimisation : bitmasking pour les contraintes",
    ],
  },
  {
    name: "Permutations",
    difficulty: "medium",
    description:
      "Générer toutes les permutations possibles d'un tableau de nombres distincts.",
    code: `function permute(nums) {
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
}`,
    pattern: "Génération exhaustive",
    tips: [
      "n! permutations de taille n → O(n × n!) en temps (copie de chaque résultat)",
      "Variante : permutations avec doublons → trier + skip",
    ],
  },
  {
    name: "Sudoku Solver",
    difficulty: "hard",
    description:
      "Résoudre un Sudoku 9×9 en remplissant les cases vides avec les chiffres 1-9.",
    code: `function solveSudoku(board) {
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
  
  solve(); // modifie la grille board en place
  return board;
}`,
    pattern: "Satisfaction de contraintes (CSP)",
    tips: [
      "Optimisation : choisir la case avec le moins d'options (MRV heuristic)",
      "Pré-calculer les contraintes avec des sets",
    ],
  },
  {
    name: "Subsets / Combinaisons",
    difficulty: "medium",
    description:
      "Générer tous les sous-ensembles ou combinaisons de taille k d'un ensemble.",
    code: `// Tous les sous-ensembles
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
}`,
    pattern: "Génération de sous-ensembles",
    tips: [
      "2^n sous-ensembles → O(n × 2^n) en temps (copie de chaque résultat)",
      "Le pruning réduit drastiquement l'espace de recherche",
    ],
  },
];

const templateCode = `function backtrack(state, choices) {
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
}`;

export function BacktrackingGuide() {
  const [activeProblem, setActiveProblem] = useState(0);

  const getDifficultyColor = (d: string) => {
    switch (d) {
      case "medium":
        return "bg-yellow-500/10 text-yellow-500";
      case "hard":
        return "bg-red-500/10 text-red-500";
      default:
        return "";
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
        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto" tabIndex={0}>
          <code>{templateCode}</code>
        </pre>
        <p className="text-sm text-muted-foreground mt-3">
          Trois étapes : <strong>Faire</strong> → <strong>Explorer</strong> →{" "}
          <strong>Annuler</strong>. C&apos;est le cœur de tout algorithme de
          backtracking.
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
                : "bg-muted hover:bg-muted/80",
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
            <h2 className="text-2xl font-bold">
              {problems[activeProblem].name}
            </h2>
            <Badge
              className={getDifficultyColor(problems[activeProblem].difficulty)}
            >
              {problems[activeProblem].difficulty === "medium"
                ? "Moyen"
                : "Difficile"}
            </Badge>
            <Badge variant="outline">{problems[activeProblem].pattern}</Badge>
          </div>
          <p className="text-muted-foreground">
            {problems[activeProblem].description}
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-primary" />
            Implémentation
          </h3>
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto" tabIndex={0}>
            <code>{problems[activeProblem].code}</code>
          </pre>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Conseils d&apos;entretien</h4>
          <ul className="space-y-1">
            {problems[activeProblem].tips.map((tip, i) => (
              <li
                key={i}
                className="text-sm text-muted-foreground flex items-start gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {/* Complexity Table */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">
          Complexité des problèmes classiques
        </h3>
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
              <tr className="border-b">
                <td className="p-3">Permutations</td>
                <td className="p-3 font-mono text-xs">O(n × n!)</td>
                <td className="p-3 font-mono text-xs">O(n)</td>
                <td className="p-3">Génération</td>
              </tr>
              <tr className="border-b">
                <td className="p-3">Sous-ensembles</td>
                <td className="p-3 font-mono text-xs">O(n × 2ⁿ)</td>
                <td className="p-3 font-mono text-xs">O(n)</td>
                <td className="p-3">Génération</td>
              </tr>
              <tr className="border-b">
                <td className="p-3">N-Queens</td>
                <td className="p-3 font-mono text-xs">O(n!)</td>
                <td className="p-3 font-mono text-xs">O(n)</td>
                <td className="p-3">Contraintes</td>
              </tr>
              <tr className="border-b">
                <td className="p-3">Sudoku (n = cases vides)</td>
                <td className="p-3 font-mono text-xs">O(9ⁿ)</td>
                <td className="p-3 font-mono text-xs">O(1)</td>
                <td className="p-3">CSP</td>
              </tr>
              <tr>
                <td className="p-3">Combinaisons</td>
                <td className="p-3 font-mono text-xs">O(C(n,k))</td>
                <td className="p-3 font-mono text-xs">O(k)</td>
                <td className="p-3">Sous-ensembles</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
