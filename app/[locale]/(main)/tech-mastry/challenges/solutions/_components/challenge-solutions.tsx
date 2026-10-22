"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowLeft, ChevronRight, Eye, EyeOff, Lightbulb, Zap } from "lucide-react";
import { useState } from "react";

interface Challenge {
  title: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  hints: string[];
  bruteForce: { code: string; complexity: string; explanation: string };
  optimal: { code: string; complexity: string; explanation: string };
  keyInsight: string;
}

const challenges: Challenge[] = [
  {
    title: "Two Sum",
    difficulty: "easy",
    category: "Hash Map",
    description: "Étant donné un tableau d'entiers et un entier cible, retournez les indices des deux nombres dont la somme est égale à la cible.",
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0, 1]", explanation: "nums[0] + nums[1] = 2 + 7 = 9" },
      { input: "nums = [3,2,4], target = 6", output: "[1, 2]" },
    ],
    hints: [
      "Pensez à une structure de données qui permet un lookup en O(1).",
      "Pour chaque nombre, de quel complément avez-vous besoin ?",
      "Utilisez un HashMap pour stocker les nombres déjà vus et leur index.",
    ],
    bruteForce: {
      code: `function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) {
        return [i, j];
      }
    }
  }
  return [];
}`,
      complexity: "O(n²) temps, O(1) espace",
      explanation: "Vérifier chaque paire possible. Simple mais lent pour de grands tableaux.",
    },
    optimal: {
      code: `function twoSum(nums, target) {
  const map = new Map();
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    
    map.set(nums[i], i);
  }
  
  return [];
}`,
      complexity: "O(n) temps, O(n) espace",
      explanation: "Pour chaque nombre, on calcule le complément nécessaire (target - num). Si ce complément existe déjà dans notre HashMap, on a trouvé la paire. Sinon, on stocke le nombre courant. Un seul passage suffit.",
    },
    keyInsight: "Le pattern 'Complement Search' avec HashMap est applicable à de nombreux problèmes : 3Sum, 4Sum, subarray sum, etc.",
  },
  {
    title: "Valid Parentheses",
    difficulty: "easy",
    category: "Stack",
    description: "Déterminer si une chaîne contenant uniquement '(', ')', '{', '}', '[', ']' est valide (chaque ouverture est fermée dans l'ordre correct).",
    examples: [
      { input: 's = "([])"', output: "true" },
      { input: 's = "([)]"', output: "false", explanation: "Les parenthèses ne sont pas fermées dans le bon ordre." },
    ],
    hints: [
      "Quelle structure de données suit le principe LIFO ?",
      "Empilez chaque caractère ouvrant et dépiler pour chaque fermant.",
      "À la fin, la pile doit être vide.",
    ],
    bruteForce: {
      code: `function isValid(s) {
  // Remplacer les paires jusqu'à stabilisation
  let prev = '';
  while (s !== prev) {
    prev = s;
    s = s.replace('()', '').replace('[]', '').replace('{}', '');
  }
  return s.length === 0;
}`,
      complexity: "O(n²) temps, O(n) espace",
      explanation: "Remplacer itérativement les paires adjacentes. Chaque passe est O(n), et on peut avoir n/2 passes.",
    },
    optimal: {
      code: `function isValid(s) {
  const stack = [];
  const pairs = { ')': '(', ']': '[', '}': '{' };
  
  for (const char of s) {
    if ('([{'.includes(char)) {
      stack.push(char);
    } else {
      if (stack.pop() !== pairs[char]) {
        return false;
      }
    }
  }
  
  return stack.length === 0;
}`,
      complexity: "O(n) temps, O(n) espace",
      explanation: "Empiler chaque ouverture. Pour chaque fermeture, vérifier que le sommet de la pile correspond. L'ordre LIFO de la pile garantit le bon appariement.",
    },
    keyInsight: "La pile est la structure idéale pour les problèmes d'appariement imbriqué : parenthèses, tags HTML, évaluation d'expressions.",
  },
  {
    title: "Maximum Subarray (Kadane)",
    difficulty: "medium",
    category: "Dynamic Programming",
    description: "Trouver le sous-tableau contigu de somme maximale dans un tableau d'entiers.",
    examples: [
      { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "Le sous-tableau [4,-1,2,1] a la somme maximale 6." },
    ],
    hints: [
      "À chaque position, deux choix : étendre le sous-tableau courant ou commencer un nouveau.",
      "Maintenez la somme courante et la somme maximale.",
      "Quand la somme courante devient négative, il vaut mieux repartir à zéro.",
    ],
    bruteForce: {
      code: `function maxSubArray(nums) {
  let maxSum = -Infinity;
  
  for (let i = 0; i < nums.length; i++) {
    let sum = 0;
    for (let j = i; j < nums.length; j++) {
      sum += nums[j];
      maxSum = Math.max(maxSum, sum);
    }
  }
  
  return maxSum;
}`,
      complexity: "O(n²) temps, O(1) espace",
      explanation: "Vérifier tous les sous-tableaux possibles. On peut faire mieux avec l'algorithme de Kadane.",
    },
    optimal: {
      code: `function maxSubArray(nums) {
  let currentSum = nums[0];
  let maxSum = nums[0];
  
  for (let i = 1; i < nums.length; i++) {
    // Étendre ou recommencer ?
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }
  
  return maxSum;
}`,
      complexity: "O(n) temps, O(1) espace",
      explanation: "L'algorithme de Kadane : à chaque étape, on décide si c'est mieux d'étendre le sous-tableau courant (currentSum + nums[i]) ou de recommencer (nums[i]). On garde le maximum global.",
    },
    keyInsight: "Kadane = DP 1D optimisé. Le sous-problème : 'meilleur sous-tableau se terminant ici'. Applicable à : maximum product subarray, maximum circular subarray.",
  },
  {
    title: "Merge Intervals",
    difficulty: "medium",
    category: "Intervals",
    description: "Fusionner les intervalles qui se chevauchent dans un tableau d'intervalles.",
    examples: [
      { input: "intervals = [[1,3],[2,6],[8,10],[15,18]]", output: "[[1,6],[8,10],[15,18]]", explanation: "[1,3] et [2,6] se chevauchent → [1,6]" },
    ],
    hints: [
      "Commencez par trier les intervalles par leur début.",
      "Deux intervalles se chevauchent si le début du second ≤ la fin du premier.",
      "Fusionnez en prenant le max des fins.",
    ],
    bruteForce: {
      code: `// Pas vraiment de brute force utile ici
// L'approche triée est standard`,
      complexity: "—",
      explanation: "L'approche triée est déjà la solution standard.",
    },
    optimal: {
      code: `function merge(intervals) {
  if (intervals.length <= 1) return intervals;
  
  // Trier une copie par début (sans modifier l'entrée)
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  
  const result = [[...sorted[0]]];
  
  for (let i = 1; i < sorted.length; i++) {
    const last = result[result.length - 1];
    const current = sorted[i];
    
    if (current[0] <= last[1]) {
      // Chevauchement → fusionner
      last[1] = Math.max(last[1], current[1]);
    } else {
      // Pas de chevauchement → ajouter
      result.push([...current]);
    }
  }
  
  return result;
}`,
      complexity: "O(n log n) temps, O(n) espace",
      explanation: "Trier par début, puis parcourir en fusionnant les intervalles qui se chevauchent. Le tri est le bottleneck.",
    },
    keyInsight: "Les problèmes d'intervalles commencent presque toujours par un tri. Variantes : insert interval, meeting rooms, minimum platforms.",
  },
];

export function ChallengeSolutions() {
  const [activeChallenge, setActiveChallenge] = useState<number | null>(null);
  const [revealedHints, setRevealedHints] = useState(0);
  const [showBrute, setShowBrute] = useState(false);
  const [showOptimal, setShowOptimal] = useState(false);

  const diffColor = (d: string) => {
    switch (d) {
      case "easy": return "bg-green-500/10 text-green-500";
      case "medium": return "bg-yellow-500/10 text-yellow-500";
      case "hard": return "bg-red-500/10 text-red-500";
      default: return "";
    }
  };

  const diffLabel = (d: string) => {
    switch (d) { case "easy": return "Facile"; case "medium": return "Moyen"; case "hard": return "Difficile"; default: return d; }
  };

  if (activeChallenge !== null) {
    const ch = challenges[activeChallenge];
    return (
      <div className="space-y-8">
        <Button variant="ghost" onClick={() => { setActiveChallenge(null); setRevealedHints(0); setShowBrute(false); setShowOptimal(false); }}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour
        </Button>

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{ch.title}</h2>
            <Badge className={diffColor(ch.difficulty)}>{diffLabel(ch.difficulty)}</Badge>
            <Badge variant="outline">{ch.category}</Badge>
          </div>
          <p className="text-muted-foreground">{ch.description}</p>
        </div>

        {/* Examples */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Exemples</h3>
          <div className="space-y-3">
            {ch.examples.map((ex, i) => (
              <div key={i} className="p-3 bg-muted rounded-lg text-sm space-y-1">
                <div><strong>Input:</strong> <code>{ex.input}</code></div>
                <div><strong>Output:</strong> <code>{ex.output}</code></div>
                {ex.explanation && <div className="text-muted-foreground">{ex.explanation}</div>}
              </div>
            ))}
          </div>
        </Card>

        {/* Progressive Hints */}
        <Card className="p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            Indices progressifs ({revealedHints}/{ch.hints.length})
          </h3>
          <div className="space-y-2">
            {ch.hints.map((hint, i) => (
              <div key={i} className={cn("p-3 rounded-lg text-sm transition-all", i < revealedHints ? "bg-yellow-500/5 border border-yellow-500/20" : "bg-muted/20 border border-dashed border-muted-foreground/20")}>
                {i < revealedHints ? (
                  <span className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                    {hint}
                  </span>
                ) : (
                  <span className="text-muted-foreground/50 italic">Indice {i + 1} masqué</span>
                )}
              </div>
            ))}
          </div>
          {revealedHints < ch.hints.length && (
            <Button variant="outline" className="mt-3" onClick={() => setRevealedHints(r => r + 1)}>
              <Lightbulb className="w-4 h-4 mr-2" />
              Révéler l&apos;indice {revealedHints + 1}
            </Button>
          )}
        </Card>

        {/* Brute Force */}
        <Card className="p-6">
          <button onClick={() => setShowBrute(!showBrute)} className="flex items-center gap-2 font-semibold w-full">
            {showBrute ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            Solution Brute Force
            <Badge variant="outline" className="ml-auto">{ch.bruteForce.complexity}</Badge>
          </button>
          {showBrute && (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-muted-foreground">{ch.bruteForce.explanation}</p>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto" tabIndex={0}>
                <code>{ch.bruteForce.code}</code>
              </pre>
            </div>
          )}
        </Card>

        {/* Optimal Solution */}
        <Card className="p-6 border-primary/30">
          <button onClick={() => setShowOptimal(!showOptimal)} className="flex items-center gap-2 font-semibold w-full">
            {showOptimal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <Zap className="w-4 h-4 text-primary" />
            Solution Optimale
            <Badge className="ml-auto bg-primary/10 text-primary">{ch.optimal.complexity}</Badge>
          </button>
          {showOptimal && (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-muted-foreground">{ch.optimal.explanation}</p>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto" tabIndex={0}>
                <code>{ch.optimal.code}</code>
              </pre>
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <h4 className="text-sm font-semibold text-primary mb-1">Insight clé</h4>
                <p className="text-sm text-muted-foreground">{ch.keyInsight}</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {challenges.map((ch, i) => (
        <Card
          key={ch.title}
          className="p-6 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
          onClick={() => setActiveChallenge(i)}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="font-bold">{ch.title}</h3>
              <Badge className={diffColor(ch.difficulty)}>{diffLabel(ch.difficulty)}</Badge>
              <Badge variant="outline">{ch.category}</Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{ch.description}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{ch.hints.length} indices</span>
              <span>{ch.examples.length} exemple{ch.examples.length > 1 ? "s" : ""}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
