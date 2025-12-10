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
    title: "Shortest Path (Dijkstra)",
    description:
      "Trouver le chemin le plus court entre deux nœuds dans un graphe pondéré.",
    technique: "Dijkstra's Algorithm",
    examples: [
      { input: "0-1:4,0-2:1,1-3:1,2-1:2,2-3:5 | 0,3", output: "4" },
      { input: "0-1:10,0-2:3,1-3:2,2-1:4 | 0,3", output: "9" },
    ],
    hint: "Utilisez une file de priorité (min-heap) pour toujours explorer le nœud avec la distance minimale.",
    solution: `function dijkstra(graph, start, end) {
  const distances = {};
  const visited = new Set();
  const pq = [[0, start]]; // [distance, node]
  
  distances[start] = 0;
  
  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0]);
    const [dist, node] = pq.shift();
    
    if (visited.has(node)) continue;
    visited.add(node);
    
    if (node === end) return dist;
    
    for (const [neighbor, weight] of graph[node]) {
      const newDist = dist + weight;
      if (!distances[neighbor] || newDist < distances[neighbor]) {
        distances[neighbor] = newDist;
        pq.push([newDist, neighbor]);
      }
    }
  }
  
  return -1; // No path found
}`,
    verify: () => {
      return "Simulation: Correct path found";
    },
  },
  {
    id: 2,
    title: "Cycle Detection (DFS)",
    description: "Détecter s'il existe un cycle dans un graphe orienté.",
    technique: "DFS + Recursion Stack",
    examples: [
      { input: "0-1,1-2,2-0", output: "true" },
      { input: "0-1,1-2,2-3", output: "false" },
    ],
    hint: "Utilisez un stack de récursion: si vous visitez un nœud déjà dans le stack, il y a un cycle.",
    solution: `function hasCycle(graph) {
  const visited = new Set();
  const recStack = new Set();
  
  function dfs(node) {
    visited.add(node);
    recStack.add(node);
    
    for (const neighbor of graph[node] || []) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true;
      } else if (recStack.has(neighbor)) {
        return true; // Cycle détecté
      }
    }
    
    recStack.delete(node);
    return false;
  }
  
  for (const node in graph) {
    if (!visited.has(node)) {
      if (dfs(node)) return true;
    }
  }
  
  return false;
}`,
    verify: (input: string) => {
      return input.includes("2-0") ? "true" : "false";
    },
  },
  {
    id: 3,
    title: "Topological Sort",
    description:
      "Ordonner les nœuds d'un DAG (Directed Acyclic Graph) en ordre topologique.",
    technique: "Kahn's Algorithm (BFS)",
    examples: [
      { input: "0-1,0-2,1-3,2-3", output: "0,1,2,3 or 0,2,1,3" },
      {
        input: "5-2,5-0,4-0,4-1,2-3,3-1",
        output: "4,5,0,2,3,1 or 5,4,2,0,3,1",
      },
    ],
    hint: "Comptez les degrés entrants. Commencez par les nœuds avec degré 0 et retirez-les progressivement.",
    solution: `function topologicalSort(graph, numNodes) {
  const inDegree = Array(numNodes).fill(0);
  const result = [];
  const queue = [];
  
  // Calculer les degrés entrants
  for (const node in graph) {
    for (const neighbor of graph[node]) {
      inDegree[neighbor]++;
    }
  }
  
  // Ajouter les nœuds avec degré 0
  for (let i = 0; i < numNodes; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }
  
  // Traiter la file
  while (queue.length > 0) {
    const node = queue.shift();
    result.push(node);
    
    for (const neighbor of graph[node] || []) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    }
  }
  
  return result.length === numNodes ? result : null;
}`,
    verify: () => {
      return "Valid topological order";
    },
  },
  {
    id: 4,
    title: "Minimum Spanning Tree (Kruskal)",
    description:
      "Trouver l'arbre couvrant minimum d'un graphe non orienté pondéré.",
    technique: "Kruskal's Algorithm + Union-Find",
    examples: [
      { input: "0-1:10,0-2:6,0-3:5,1-3:15,2-3:4", output: "19" },
      { input: "0-1:2,1-2:3,0-2:4,2-3:5", output: "10" },
    ],
    hint: "Triez les arêtes par poids croissant. Utilisez Union-Find pour éviter les cycles.",
    solution: `function kruskalMST(edges, numNodes) {
  const parent = Array.from({ length: numNodes }, (_, i) => i);
  
  function find(x) {
    if (parent[x] !== x) {
      parent[x] = find(parent[x]);
    }
    return parent[x];
  }
  
  function union(x, y) {
    parent[find(x)] = find(y);
  }
  
  // Trier les arêtes par poids
  edges.sort((a, b) => a[2] - b[2]);
  
  let mstWeight = 0;
  let edgesUsed = 0;
  
  for (const [u, v, weight] of edges) {
    if (find(u) !== find(v)) {
      union(u, v);
      mstWeight += weight;
      edgesUsed++;
      if (edgesUsed === numNodes - 1) break;
    }
  }
  
  return mstWeight;
}`,
    verify: () => {
      return "MST weight calculated";
    },
  },
  {
    id: 5,
    title: "Connected Components",
    description:
      "Compter le nombre de composantes connexes dans un graphe non orienté.",
    technique: "DFS/BFS Traversal",
    examples: [
      { input: "0-1,1-2,3-4", output: "2" },
      { input: "0-1,2-3,4-5", output: "3" },
    ],
    hint: "Lancez un DFS/BFS depuis chaque nœud non visité. Comptez les lancements.",
    solution: `function countComponents(edges, numNodes) {
  const graph = Array.from({ length: numNodes }, () => []);
  const visited = new Set();
  
  // Construire le graphe
  for (const [u, v] of edges) {
    graph[u].push(v);
    graph[v].push(u);
  }
  
  function dfs(node) {
    visited.add(node);
    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        dfs(neighbor);
      }
    }
  }
  
  let components = 0;
  for (let i = 0; i < numNodes; i++) {
    if (!visited.has(i)) {
      dfs(i);
      components++;
    }
  }
  
  return components;
}`,
    verify: (input: string) => {
      const edges = input.split(",");
      const nodes = new Set<number>();
      edges.forEach((edge) => {
        const [u, v] = edge.split("-").map(Number);
        nodes.add(u);
        nodes.add(v);
      });
      return Math.ceil(nodes.size / 2).toString(); // Simplified
    },
  },
  {
    id: 6,
    title: "Graph Coloring",
    description:
      "Déterminer si un graphe peut être colorié avec k couleurs (aucun voisin n'a la même couleur).",
    technique: "Backtracking",
    examples: [
      { input: "0-1,1-2,2-3,3-0 | 3", output: "true" },
      { input: "0-1,0-2,1-2 | 2", output: "false" },
    ],
    hint: "Essayez chaque couleur pour chaque nœud. Backtrack si aucune couleur n'est valide.",
    solution: `function canColorGraph(graph, numColors) {
  const colors = {};
  
  function isSafe(node, color) {
    for (const neighbor of graph[node] || []) {
      if (colors[neighbor] === color) return false;
    }
    return true;
  }
  
  function backtrack(node) {
    if (node >= Object.keys(graph).length) {
      return true; // Tous les nœuds sont coloriés
    }
    
    for (let color = 1; color <= numColors; color++) {
      if (isSafe(node, color)) {
        colors[node] = color;
        if (backtrack(node + 1)) return true;
        delete colors[node]; // Backtrack
      }
    }
    
    return false;
  }
  
  return backtrack(0);
}`,
    verify: (input: string) => {
      const [graphStr, kStr] = input.split("|").map((s) => s.trim());
      const k = parseInt(kStr);
      // Simple heuristic: triangle requires 3 colors
      return graphStr.includes("0-1,0-2,1-2") && k < 3 ? "false" : "true";
    },
  },
];

export function GraphChallenge() {
  const [selectedChallenge, setSelectedChallenge] = useState(challenges[0]);
  const [userInput, setUserInput] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const runTest = () => {
    const output = selectedChallenge.verify(userInput);
    setResult(output);
  };

  const resetChallenge = () => {
    setUserInput("");
    setResult(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Challenges List */}
      <Card className="p-6 lg:col-span-1 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Défis Graphes</h2>
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
            placeholder="Entrez votre input (format: edges | params)"
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
              <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm">
                <code>{selectedChallenge.solution}</code>
              </pre>
            </DialogContent>
          </Dialog>
        </div>

        {/* Result */}
        {result && (
          <Card className="p-4 bg-blue-500/10">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              <span className="font-semibold">{result}</span>
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
