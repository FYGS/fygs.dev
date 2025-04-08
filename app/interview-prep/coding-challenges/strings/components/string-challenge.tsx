"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Clock, Code, CheckCircle2, XCircle } from "lucide-react";
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
    title: "Palindrome Check",
    description:
      "Écrivez une fonction qui vérifie si une chaîne est un palindrome.",
    examples: [
      { input: "radar", output: true },
      { input: "hello", output: false },
    ],
    hint: "Un palindrome se lit de la même façon dans les deux sens.",
    solution: `function isPalindrome(str) {
  // Nettoyer la chaîne (enlever les espaces et la ponctuation)
  str = str.toLowerCase().replace(/[^a-z0-9]/g, "");
  // Comparer la chaîne avec sa version inversée
  return str === str.split("").reverse().join("");
}`,
    verify: (input: string) => {
      input = input.toLowerCase().replace(/[^a-z0-9]/g, "");
      return input === input.split("").reverse().join("");
    },
  },
  {
    id: 2,
    title: "Anagramme Check",
    description:
      "Écrivez une fonction qui vérifie si deux chaînes sont des anagrammes.",
    examples: [
      { input: "listen,silent", output: true },
      { input: "hello,world", output: false },
    ],
    hint: "Deux chaînes sont des anagrammes si elles contiennent les mêmes caractères.",
    solution: `function isAnagram(str1, str2) {
  // Nettoyer les chaînes
  const clean = s => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  str1 = clean(str1);
  str2 = clean(str2);
  
  // Trier les caractères et comparer
  return str1.split("").sort().join("") === 
         str2.split("").sort().join("");
}`,
    verify: (input: string) => {
      if (!input.includes(",")) {
        return false;
      }
      const [str1, str2] = input
        .split(",")
        .map((s) => s.toLowerCase().replace(/[^a-z0-9]/g, ""));
      return str1.split("").sort().join("") === str2.split("").sort().join("");
    },
  },
];

export function StringChallenge() {
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
    
    // Vérifier le format de l'input pour le défi des anagrammes
    if (challenge.id === 2 && !input.includes(",")) {
      setResult(false);
      return;
    }
    
    const isCorrect = challenge.verify(input);
    setResult(isCorrect);
  };

  const handleNext = () => {
    if (currentChallenge < challenges.length - 1) {
      setCurrentChallenge((prev) => prev + 1);
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
        <div className="flex justify-between items-start">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">{challenge.title}</h2>
            <p className="text-muted-foreground">{challenge.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={timeLeft > 60 ? "outline" : "destructive"}
              className="text-sm"
            >
              <Clock className="w-4 h-4 mr-1" />
              {formatTime(timeLeft)}
            </Badge>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Exemples :</h3>
          <div className="grid gap-3">
            {challenge.examples.map((example, index) => (
              <div key={index} className="flex items-center gap-2">
                <Badge variant="outline">Input: {example.input}</Badge>
                <Badge variant="outline">
                  Output: {String(example.output)}
                </Badge>
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
                  <CheckCircle2 className="w-4 h-4" /> Correct
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
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
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
