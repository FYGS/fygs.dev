"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Clock, Code, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const challenges = [
  {
    id: 1,
    title: "Fibonacci Sequence",
    description:
      "Calculer le n-ième nombre de Fibonacci efficacement avec la mémoïzation.",
    technique: "Memoization",
    examples: [
      { input: "5", output: "5" },
      { input: "10", output: "55" },
      { input: "15", output: "610" },
    ],
    hint: "Mémorisez les résultats déjà calculés pour éviter les calculs redondants.",
    solution: `function fibonacci(n, memo = {}) {
  if (n <= 1) return n;
  
  // Si déjà calculé, retourner la valeur mémorisée
  if (memo[n] !== undefined) return memo[n];
  
  // Calculer et mémoriser
  memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo);
  return memo[n];
}`,
    verify: (input: string) => {
      const n = parseInt(input);
      if (!Number.isInteger(n) || n < 0) return "Entrez un entier n >= 0";
      // Itératif : la version récursive naïve est en O(2^n) et gèlerait la page
      let a = 0,
        b = 1;
      for (let i = 0; i < n; i++) [a, b] = [b, a + b];
      return a.toString();
    },
  },
  {
    id: 2,
    title: "Climbing Stairs",
    description:
      "Combien de façons différentes de monter un escalier de n marches (1 ou 2 marches à la fois)?",
    technique: "Tabulation",
    examples: [
      { input: "2", output: "2" },
      { input: "3", output: "3" },
      { input: "5", output: "8" },
    ],
    hint: "C'est similaire à Fibonacci! ways[i] = ways[i-1] + ways[i-2]",
    solution: `function climbStairs(n) {
  if (n <= 2) return n;
  
  const dp = new Array(n + 1);
  dp[1] = 1;
  dp[2] = 2;
  
  for (let i = 3; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  
  return dp[n];
}`,
    verify: (input: string) => {
      const n = parseInt(input);
      if (n <= 2) return n.toString();
      let prev2 = 1,
        prev1 = 2;
      for (let i = 3; i <= n; i++) {
        const current = prev1 + prev2;
        prev2 = prev1;
        prev1 = current;
      }
      return prev1.toString();
    },
  },
  {
    id: 3,
    title: "House Robber",
    description:
      "Maximiser l'argent volé sans cambrioler deux maisons adjacentes.",
    technique: "DP Optimization",
    examples: [
      { input: "1,2,3,1", output: "4" },
      { input: "2,7,9,3,1", output: "12" },
    ],
    hint: "À chaque maison: max(voler_actuelle + max_i-2, ne_pas_voler = max_i-1)",
    solution: `function rob(nums) {
  if (nums.length === 0) return 0;
  if (nums.length === 1) return nums[0];
  
  let prev2 = 0;
  let prev1 = nums[0];
  
  for (let i = 1; i < nums.length; i++) {
    const current = Math.max(nums[i] + prev2, prev1);
    prev2 = prev1;
    prev1 = current;
  }
  
  return prev1;
}`,
    verify: (input: string) => {
      const nums = input.split(",").map(Number);
      if (nums.length === 0) return "0";
      if (nums.length === 1) return nums[0].toString();
      let prev2 = 0,
        prev1 = nums[0];
      for (let i = 1; i < nums.length; i++) {
        const current = Math.max(nums[i] + prev2, prev1);
        prev2 = prev1;
        prev1 = current;
      }
      return prev1.toString();
    },
  },
  {
    id: 4,
    title: "Coin Change",
    description:
      "Trouver le nombre minimum de pièces pour obtenir un montant donné.",
    technique: "DP Bottom-Up",
    examples: [
      { input: "1,2,5 | 11", output: "3" },
      { input: "2 | 3", output: "-1" },
      { input: "1 | 0", output: "0" },
    ],
    hint: "Pour chaque montant, essayez toutes les pièces et prenez le minimum + 1.",
    solution: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (i >= coin) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }
  
  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
    verify: (input: string) => {
      const [coinsStr, amountStr] = input.split("|").map((s) => s.trim());
      const coins = coinsStr.split(",").map(Number);
      const amount = parseInt(amountStr);

      const dp = new Array(amount + 1).fill(Infinity);
      dp[0] = 0;

      for (let i = 1; i <= amount; i++) {
        for (const coin of coins) {
          if (i >= coin) {
            dp[i] = Math.min(dp[i], dp[i - coin] + 1);
          }
        }
      }

      return dp[amount] === Infinity ? "-1" : dp[amount].toString();
    },
  },
  {
    id: 5,
    title: "Longest Increasing Subsequence",
    description:
      "Trouver la longueur de la plus longue sous-séquence strictement croissante.",
    technique: "DP Array",
    examples: [
      { input: "10,9,2,5,3,7,101,18", output: "4" },
      { input: "0,1,0,3,2,3", output: "4" },
    ],
    hint: "dp[i] = longueur de la plus longue sous-séquence se terminant à l'index i.",
    solution: `function lengthOfLIS(nums) {
  if (nums.length === 0) return 0;
  
  const dp = new Array(nums.length).fill(1);
  let maxLen = 1;
  
  for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[i] > nums[j]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
    maxLen = Math.max(maxLen, dp[i]);
  }
  
  return maxLen;
}`,
    verify: (input: string) => {
      const nums = input.split(",").map(Number);
      if (nums.length === 0) return "0";

      const dp = new Array(nums.length).fill(1);
      let maxLen = 1;

      for (let i = 1; i < nums.length; i++) {
        for (let j = 0; j < i; j++) {
          if (nums[i] > nums[j]) {
            dp[i] = Math.max(dp[i], dp[j] + 1);
          }
        }
        maxLen = Math.max(maxLen, dp[i]);
      }

      return maxLen.toString();
    },
  },
  {
    id: 6,
    title: "0/1 Knapsack Problem",
    description: "Maximiser la valeur dans un sac à dos avec capacité limitée.",
    technique: "2D DP Table",
    examples: [
      { input: "1,3,4,5 | 4,5,8,10 | 7", output: "14" },
      { input: "2,3,4 | 3,4,5 | 5", output: "7" },
    ],
    hint: "dp[i][w] = valeur max avec les i premiers items et capacité w.",
    solution: `function knapsack(weights, values, capacity) {
  const n = weights.length;
  const dp = Array(n + 1).fill(0).map(() => Array(capacity + 1).fill(0));
  
  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      if (weights[i - 1] <= w) {
        dp[i][w] = Math.max(
          values[i - 1] + dp[i - 1][w - weights[i - 1]],
          dp[i - 1][w]
        );
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }
  
  return dp[n][capacity];
}`,
    verify: (input: string) => {
      const parts = input.split("|").map((s) => s.trim());
      const weights = parts[0].split(",").map(Number);
      const values = parts[1].split(",").map(Number);
      const capacity = parseInt(parts[2]);

      const n = weights.length;
      const dp = Array(n + 1)
        .fill(0)
        .map(() => Array(capacity + 1).fill(0));

      for (let i = 1; i <= n; i++) {
        for (let w = 0; w <= capacity; w++) {
          if (weights[i - 1] <= w) {
            dp[i][w] = Math.max(
              values[i - 1] + dp[i - 1][w - weights[i - 1]],
              dp[i - 1][w]
            );
          } else {
            dp[i][w] = dp[i - 1][w];
          }
        }
      }

      return dp[n][capacity].toString();
    },
  },
];

export function DPChallenge() {
  const [selectedChallenge, setSelectedChallenge] = useState(challenges[0]);
  const [userInput, setUserInput] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const runTest = () => {
    const expected = selectedChallenge.verify(userInput);
    const correct = expected === userInput.split("|").pop()?.trim();
    setResult(expected);
    setIsCorrect(correct);
  };

  const resetChallenge = () => {
    setUserInput("");
    setResult(null);
    setIsCorrect(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Challenges List */}
      <Card className="p-6 lg:col-span-1 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Défis DP</h2>
          <Badge variant="outline">{challenges.length} défis</Badge>
        </div>

        <div className="space-y-2">
          {challenges.map((challenge) => (
            <Button
              key={challenge.id}
              variant={
                selectedChallenge.id === challenge.id ? "default" : "ghost"
              }
              className="w-full justify-start text-left"
              onClick={() => {
                setSelectedChallenge(challenge);
                resetChallenge();
              }}
            >
              <div className="flex items-center gap-2 w-full">
                <span className="text-xs text-muted-foreground">
                  #{challenge.id}
                </span>
                <span className="flex-1 truncate">{challenge.title}</span>
              </div>
            </Button>
          ))}
        </div>
      </Card>

      {/* Challenge Details */}
      <Card className="p-6 lg:col-span-2 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{selectedChallenge.title}</h1>
            <Badge>{selectedChallenge.technique}</Badge>
          </div>
          <p className="text-muted-foreground">
            {selectedChallenge.description}
          </p>
        </div>

        {/* Examples */}
        <div className="space-y-2">
          <h3 className="font-semibold">Exemples:</h3>
          <div className="space-y-2">
            {selectedChallenge.examples.map((example, idx) => (
              <div
                key={idx}
                className="p-3 bg-muted/50 rounded-lg font-mono text-sm"
              >
                <div>
                  <span className="text-muted-foreground">Input:</span>{" "}
                  {example.input}
                </div>
                <div>
                  <span className="text-muted-foreground">Output:</span>{" "}
                  {example.output}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="space-y-2">
          <Label htmlFor="user-input">Votre réponse:</Label>
          <Input
            id="user-input"
            placeholder="Entrez votre input (format des exemples)"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={runTest} disabled={!userInput}>
            <Code className="w-4 h-4 mr-2" />
            Tester
          </Button>
          <Button variant="outline" onClick={resetChallenge}>
            Réinitialiser
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost">
                <Clock className="w-4 h-4 mr-2" />
                Indice
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Indice</DialogTitle>
                <DialogDescription>{selectedChallenge.hint}</DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost">Solution</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Solution</DialogTitle>
              </DialogHeader>
              <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm" tabIndex={0}>
                <code>{selectedChallenge.solution}</code>
              </pre>
            </DialogContent>
          </Dialog>
        </div>

        {/* Result */}
        {result !== null && (
          <Card
            className={`p-4 ${
              isCorrect ? "bg-green-500/10" : "bg-yellow-500/10"
            }`}
          >
            <div className="flex items-center gap-2">
              {isCorrect ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <Clock className="w-5 h-5 text-yellow-500" />
              )}
              <div>
                <div className="font-semibold">
                  {isCorrect ? "Correct!" : "Résultat attendu:"}
                </div>
                {!isCorrect && (
                  <div className="text-sm text-muted-foreground">{result}</div>
                )}
              </div>
            </div>
          </Card>
        )}
      </Card>
    </div>
  );
}

function Label({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium">
      {children}
    </label>
  );
}
