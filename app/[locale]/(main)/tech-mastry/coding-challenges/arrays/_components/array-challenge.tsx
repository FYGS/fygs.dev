"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Clock, Code, CheckCircle, XCircle } from "lucide-react";
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
    title: "Two Sum",
    description: "Trouvez deux nombres dans le tableau qui donnent une somme cible.",
    technique: "Hash Map",
    examples: [
      { input: "2,7,11,15 | 9", output: "0,1" },
      { input: "3,2,4 | 6", output: "1,2" },
    ],
    hint: "Pour chaque nombre, cherchez son complément (cible - nombre) dans une table de hachage des valeurs déjà vues : un seul passage, en O(n).",
    solution: `function twoSum(nums, target) {
  // Table valeur -> indice des éléments déjà parcourus
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    // Le complément a-t-il déjà été vu ?
    if (seen.has(complement)) {
      return [seen.get(complement), i];  // Retourner les indices
    }
    seen.set(nums[i], i);
  }
  return null;  // Aucune solution trouvée
}
// Complexité : O(n) en temps, O(n) en espace
// (la force brute à deux boucles imbriquées est en O(n²))`,
    verify: (input: string) => {
      const [arr, target] = input.split("|").map(s => s.trim());
      const nums = arr.split(",").map(Number);
      const targetNum = Number(target);
      
      for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
          if (nums[i] + nums[j] === targetNum) {
            return `${i},${j}`;
          }
        }
      }
      return "Not found";
    },
  },
  {
    id: 2,
    title: "Maximum Subarray Sum",
    description: "Trouvez la somme maximale d'un sous-tableau contigu.",
    technique: "Kadane (programmation dynamique)",
    examples: [
      { input: "-2,1,-3,4,-1,2,1,-5,4", output: "6" },
      { input: "1,2,3,-2,5", output: "9" },
    ],
    hint: "Utilisez l'algorithme de Kadane pour suivre la somme maximale locale et globale.",
    solution: `function maxSubArray(nums) {
  // Suppose un tableau non vide (sinon nums[0] est undefined)
  // Initialiser les variables de suivi
  let maxSoFar = nums[0];
  let maxEndingHere = nums[0];
  
  // Parcourir le tableau à partir du deuxième élément
  for (let i = 1; i < nums.length; i++) {
    // Mettre à jour la somme maximale se terminant ici
    maxEndingHere = Math.max(nums[i], maxEndingHere + nums[i]);
    // Mettre à jour la somme maximale globale
    maxSoFar = Math.max(maxSoFar, maxEndingHere);
  }
  
  return maxSoFar;
}`,
    verify: (input: string) => {
      const nums = input.split(",").map(Number);
      let maxSoFar = nums[0];
      let maxEndingHere = nums[0];
      
      for (let i = 1; i < nums.length; i++) {
        maxEndingHere = Math.max(nums[i], maxEndingHere + nums[i]);
        maxSoFar = Math.max(maxSoFar, maxEndingHere);
      }
      
      return maxSoFar.toString();
    },
  },
  {
    id: 3,
    title: "Longest Consecutive Sequence",
    description: "Trouvez la longueur de la plus longue séquence consécutive dans un tableau non trié.",
    technique: "Set / Hash Table",
    examples: [
      { input: "100,4,200,1,3,2", output: "4" },
      { input: "0,3,7,2,5,8,4,6,1", output: "9" },
    ],
    hint: "Utilisez un Set pour un accès O(1) et cherchez le début de chaque séquence.",
    solution: `function longestConsecutive(nums) {
  // Créer un Set pour un accès O(1) (élimine aussi les doublons)
  const numSet = new Set(nums);
  let maxLength = 0;
  
  // Parcourir chaque valeur distincte
  for (const num of numSet) {
    // Vérifier si c'est le début d'une séquence
    if (!numSet.has(num - 1)) {
      let currentNum = num;
      let currentLength = 1;
      
      // Compter la longueur de la séquence
      while (numSet.has(currentNum + 1)) {
        currentNum++;
        currentLength++;
      }
      
      maxLength = Math.max(maxLength, currentLength);
    }
  }
  
  return maxLength;
}`,
    verify: (input: string) => {
      const nums = input.split(",").map(Number);
      const numSet = new Set(nums);
      let maxLength = 0;
      
      for (const num of nums) {
        if (!numSet.has(num - 1)) {
          let currentNum = num;
          let currentLength = 1;
          
          while (numSet.has(currentNum + 1)) {
            currentNum++;
            currentLength++;
          }
          
          maxLength = Math.max(maxLength, currentLength);
        }
      }
      
      return maxLength.toString();
    },
  },
];

export function ArrayChallenge() {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes en secondes
  const [timerActive, setTimerActive] = useState(false);

  const challenge = challenges[currentChallenge];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timerActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timerActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = () => {
    if (!timerActive) {
      setTimerActive(true);
    }
    const output = challenge.verify(input);
    const isCorrect = challenge.examples.some(ex => 
      challenge.verify(ex.input) === output
    );
    setResult(isCorrect);
  };

  const handleNext = () => {
    if (currentChallenge < challenges.length - 1) {
      setCurrentChallenge(prev => prev + 1);
      setInput("");
      setResult(null);
      setShowHint(false);
      setTimeLeft(300);
      setTimerActive(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-semibold">{challenge.title}</h2>
              <p className="text-muted-foreground mt-1">{challenge.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={timeLeft > 60 ? "outline" : "destructive"}
                className="text-sm"
              >
                <Clock className="w-4 h-4 mr-1" />
                {formatTime(timeLeft)}
              </Badge>
              <Badge variant="outline">{challenge.technique}</Badge>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Exemples :</h3>
          <div className="grid gap-3">
            {challenge.examples.map((example, index) => (
              <div key={index} className="flex items-center gap-2">
                <Badge variant="outline">Input: {example.input}</Badge>
                <Badge variant="outline">Output: {example.output}</Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Entrez votre test..."
              className="flex-1"
            />
            <Button onClick={handleSubmit} disabled={input.trim().length === 0}>
              Tester
            </Button>
          </div>

          {result !== null && (
            <div className="flex items-center gap-2">
              {result ? (
                <Badge variant="green" className="gap-1">
                  <CheckCircle className="w-4 h-4" /> Correct
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1">
                  <XCircle className="w-4 h-4" /> Incorrect
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowHint(!showHint)}>
              {showHint ? "Masquer l'indice" : "Voir l'indice"}
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary">
                  <Code className="w-4 h-4 mr-2" />
                  Solution
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Solution: {challenge.title}</DialogTitle>
                  <DialogDescription>
                    Voici une solution possible pour ce défi :
                  </DialogDescription>
                </DialogHeader>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto" tabIndex={0}>
                  <code className="text-sm">{challenge.solution}</code>
                </pre>
              </DialogContent>
            </Dialog>
          </div>

          {currentChallenge < challenges.length - 1 && (
            <Button onClick={handleNext} disabled={result !== true}>
              Défi suivant
            </Button>
          )}
        </div>

        {showHint && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-muted-foreground">💡 {challenge.hint}</p>
          </div>
        )}
      </Card>
    </div>
  );
}
