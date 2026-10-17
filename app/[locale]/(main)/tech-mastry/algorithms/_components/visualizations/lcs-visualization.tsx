"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useMemo, useRef, useState } from "react";
import { DPVisualizationBase } from "./dp-visualization-base";

interface LCSStep {
  i: number;
  j: number;
  result?: number;
  decision?: "match" | "mismatch";
  table: number[][];
  lcs?: string;
}

// Générer les étapes pour la résolution du problème LCS
function generateSteps(str1: string, str2: string): LCSStep[] {
  const steps: LCSStep[] = [];
  const m = str1.length;
  const n = str2.length;
  
  // Initialiser la table DP
  const dp: number[][] = Array(m + 1)
    .fill(0)
    .map(() => Array(n + 1).fill(0));
  
  // Étape initiale
  steps.push({
    i: 0,
    j: 0,
    table: dp.map(row => [...row]),
  });
  
  // Initialiser la première ligne et la première colonne
  for (let i = 0; i <= m; i++) {
    for (let j = 0; j <= n; j++) {
      if (i === 0 || j === 0) {
        steps.push({
          i,
          j,
          result: 0,
          table: dp.map(row => [...row]),
        });
      }
    }
  }
  
  // Remplir la table DP
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
        steps.push({
          i,
          j,
          result: dp[i][j],
          decision: "match",
          table: dp.map(row => [...row]),
        });
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        steps.push({
          i,
          j,
          result: dp[i][j],
          decision: "mismatch",
          table: dp.map(row => [...row]),
        });
      }
    }
  }
  
  // Reconstruire la LCS
  let lcs = "";
  let i = m, j = n;
  
  while (i > 0 && j > 0) {
    if (str1[i - 1] === str2[j - 1]) {
      lcs = str1[i - 1] + lcs;
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  
  // Ajouter une étape finale avec la LCS
  steps.push({
    i: m,
    j: n,
    result: dp[m][n],
    table: dp.map(row => [...row]),
    lcs,
  });
  
  return steps;
}

export function LCSVisualization() {
  const [str1, setStr1] = useState("ABCBDAB");
  const [str2, setStr2] = useState("BDCABA");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Les étapes dérivent des deux chaînes
  const steps = useMemo(() => generateSteps(str1, str2), [str1, str2]);
  
  // Réinitialiser la visualisation
  const handleReset = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  // Changer une des chaînes réinitialise la visualisation
  const handleStr1Change = (value: string) => {
    if (value === str1) return;
    setStr1(value);
    handleReset();
  };
  const handleStr2Change = (value: string) => {
    if (value === str2) return;
    setStr2(value);
    handleReset();
  };

  // Passer à l'étape suivante
  const handleStepForward = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      setIsPlaying(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };
  
  // Revenir à l'étape précédente
  const handleStepBackward = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };
  
  // Démarrer la lecture automatique
  const handlePlay = () => {
    setIsPlaying(true);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setCurrentStepIndex((prevIndex) => {
        if (prevIndex < steps.length - 1) {
          return prevIndex + 1;
        } else {
          setIsPlaying(false);
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return prevIndex;
        }
      });
    }, 1000 / speed);
  };
  
  // Mettre en pause la lecture automatique
  const handlePause = () => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
  
  // Mettre à jour la vitesse de lecture
  const handleSpeedChange = (value: number) => {
    setSpeed(value);
    
    if (isPlaying) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      timerRef.current = setInterval(() => {
        setCurrentStepIndex((prevIndex) => {
          if (prevIndex < steps.length - 1) {
            return prevIndex + 1;
          } else {
            setIsPlaying(false);
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            return prevIndex;
          }
        });
      }, 1000 / value);
    }
  };
  
  // Nettoyer le timer lors du démontage du composant
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // Obtenir l'étape actuelle
  const currentStep = steps[currentStepIndex] || {
    i: 0,
    j: 0,
    table: [[0]],
  };
  
  return (
    <DPVisualizationBase
      title="Visualisation de la Plus Longue Sous-séquence Commune (LCS)"
      description="Résolution du problème de la plus longue sous-séquence commune en utilisant la programmation dynamique."
      onReset={handleReset}
      onStepForward={handleStepForward}
      onStepBackward={handleStepBackward}
      onPlay={handlePlay}
      onPause={handlePause}
      isPlaying={isPlaying}
      currentStep={currentStepIndex}
      totalSteps={steps.length - 1}
      speed={speed}
      onSpeedChange={handleSpeedChange}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex flex-col gap-4">
            <div>
              <Label htmlFor="str1" className="text-sm">
                Chaîne 1:
              </Label>
              <Input
                id="str1"
                value={str1}
                onChange={(e) => handleStr1Change(e.target.value.toUpperCase())}
                className="font-mono"
                maxLength={10}
              />
            </div>
            
            <div>
              <Label htmlFor="str2" className="text-sm">
                Chaîne 2:
              </Label>
              <Input
                id="str2"
                value={str2}
                onChange={(e) => handleStr2Change(e.target.value.toUpperCase())}
                className="font-mono"
                maxLength={10}
              />
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Comparaison des caractères</h4>
            <div className="bg-muted/30 rounded-lg p-4 overflow-auto">
              <div className="flex mb-4">
                <div className="w-10 h-10"></div>
                {str2.split("").map((char, index) => (
                  <div
                    key={index}
                    className={`w-10 h-10 flex items-center justify-center font-mono border border-border ${
                      index + 1 === currentStep.j ? "bg-primary/20" : ""
                    }`}
                  >
                    {char}
                  </div>
                ))}
              </div>
              
              <div className="space-y-1">
                {str1.split("").map((char, index) => (
                  <div key={index} className="flex">
                    <div
                      className={`w-10 h-10 flex items-center justify-center font-mono border border-border ${
                        index + 1 === currentStep.i ? "bg-primary/20" : ""
                      }`}
                    >
                      {char}
                    </div>
                    
                    {str2.split("").map((char2, index2) => {
                      const isCurrentCell = index + 1 === currentStep.i && index2 + 1 === currentStep.j;
                      const isMatch = char === char2;
                      
                      return (
                        <div
                          key={index2}
                          className={`w-10 h-10 flex items-center justify-center font-mono border border-border ${
                            isCurrentCell
                              ? "bg-primary/20"
                              : isMatch
                              ? "bg-green-500/10"
                              : ""
                          }`}
                        >
                          {isMatch ? "✓" : ""}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Résultat</h4>
            <div className="bg-muted/30 rounded-lg p-4">
              {currentStep.lcs ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">LCS:</span>
                    <Badge variant="outline" className="font-mono">
                      {currentStep.lcs}
                    </Badge>
                  </div>
                  <div className="text-sm">
                    Longueur: <span className="font-medium">{currentStep.lcs.length}</span>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  La LCS sera affichée à la fin de la visualisation.
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Table de programmation dynamique</h4>
            <div className="bg-muted/30 rounded-lg">
              <ScrollArea className="h-[300px]">
                <div className="p-4 overflow-x-auto" style={{ minWidth: "100%", width: "max-content" }}>
                  <table className="border-collapse">
                    <thead>
                      <tr>
                        <th className="p-2 border border-border bg-muted/50 text-xs">i\j</th>
                        <th className="p-2 border border-border bg-muted/50 text-xs"></th>
                        {str2.split("").map((char, j) => (
                          <th
                            key={j}
                            className={`p-2 border border-border text-xs ${
                              j + 1 === currentStep.j ? "bg-primary/20" : "bg-muted/50"
                            }`}
                          >
                            {char}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-2 border border-border bg-muted/50 text-xs"></td>
                        <td
                          className={`p-2 border border-border text-center ${
                            currentStep.i === 0 && currentStep.j === 0
                              ? "bg-primary/20"
                              : ""
                          }`}
                        >
                          {currentStep.table[0]?.[0] || 0}
                        </td>
                        {str2.split("").map((_, j) => (
                          <td
                            key={j}
                            className={`p-2 border border-border text-center ${
                              currentStep.i === 0 && currentStep.j === j + 1
                                ? "bg-primary/20"
                                : ""
                            }`}
                          >
                            {currentStep.table[0]?.[j + 1] || 0}
                          </td>
                        ))}
                      </tr>
                      {str1.split("").map((char, i) => (
                        <tr key={i}>
                          <td
                            className={`p-2 border border-border bg-muted/50 text-xs ${
                              i + 1 === currentStep.i ? "font-medium" : ""
                            }`}
                          >
                            {char}
                          </td>
                          <td
                            className={`p-2 border border-border text-center ${
                              currentStep.i === i + 1 && currentStep.j === 0
                                ? "bg-primary/20"
                                : ""
                            }`}
                          >
                            {currentStep.table[i + 1]?.[0] || 0}
                          </td>
                          {str2.split("").map((_, j) => (
                            <td
                              key={j}
                              className={`p-2 border border-border text-center ${
                                currentStep.i === i + 1 && currentStep.j === j + 1
                                  ? "bg-primary/20 font-medium"
                                  : currentStep.i > i + 1 || (currentStep.i === i + 1 && currentStep.j > j + 1)
                                  ? "bg-muted/20"
                                  : ""
                              }`}
                            >
                              {currentStep.table[i + 1]?.[j + 1] || 0}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Explication</h4>
            <div className="bg-muted/30 rounded-lg p-4 min-h-[100px]">
              {currentStep.i === 0 || currentStep.j === 0 ? (
                <p>
                  Initialisation de la table DP. Lorsque l&apos;une des chaînes est vide (i=0 ou j=0),
                  la longueur de la LCS est 0.
                </p>
              ) : currentStep.lcs ? (
                <p>
                  Solution finale : La plus longue sous-séquence commune est{" "}
                  <strong className="font-mono">{currentStep.lcs}</strong> avec une longueur
                  de <strong>{currentStep.lcs.length}</strong>.
                </p>
              ) : currentStep.decision === "match" ? (
                <p>
                  Les caractères <span className="font-mono">{str1[currentStep.i - 1]}</span> et{" "}
                  <span className="font-mono">{str2[currentStep.j - 1]}</span> correspondent.
                  <br />
                  DP[{currentStep.i}][{currentStep.j}] = DP[{currentStep.i - 1}][
                  {currentStep.j - 1}] + 1 = {currentStep.table[currentStep.i - 1][currentStep.j - 1]} + 1 ={" "}
                  {currentStep.result}
                </p>
              ) : (
                <p>
                  Les caractères <span className="font-mono">{str1[currentStep.i - 1]}</span> et{" "}
                  <span className="font-mono">{str2[currentStep.j - 1]}</span> ne correspondent pas.
                  <br />
                  DP[{currentStep.i}][{currentStep.j}] = max(DP[{currentStep.i - 1}][
                  {currentStep.j}], DP[{currentStep.i}][{currentStep.j - 1}]) = max(
                  {currentStep.table[currentStep.i - 1][currentStep.j]},{" "}
                  {currentStep.table[currentStep.i][currentStep.j - 1]}) ={" "}
                  {currentStep.result}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DPVisualizationBase>
  );
}
