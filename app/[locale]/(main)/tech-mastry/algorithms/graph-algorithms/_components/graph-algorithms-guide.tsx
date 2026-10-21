"use client";

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
    code: `function bfs(graph, start) {
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
}`,
    useCases: ["Plus court chemin (non pondéré)", "Parcours par niveaux d'arbre", "Résolution de labyrinthes", "Réseaux sociaux (amis d'amis)"],
  },
  {
    name: "DFS (Depth-First Search)",
    category: "Parcours",
    complexity: "O(V + E)",
    space: "O(V)",
    description: "Parcours en profondeur utilisant une pile (ou récursion). Détecte les cycles et les composantes connexes.",
    code: `// Récursif
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
}`,
    useCases: ["Détection de cycles", "Tri topologique", "Composantes connexes", "Résolution de puzzles"],
  },
  {
    name: "Dijkstra",
    category: "Plus courts chemins",
    complexity: "O((V+E) log V)",
    space: "O(V)",
    description: "Plus court chemin depuis une source dans un graphe pondéré positif. Utilise un min-heap.",
    code: `function dijkstra(graph, start, n) {
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
}`,
    useCases: ["GPS et navigation", "Routage réseau", "Chemins les plus courts pondérés", "Jeux vidéo (pathfinding)"],
  },
  {
    name: "Tri Topologique",
    category: "Ordonnancement",
    complexity: "O(V + E)",
    space: "O(V)",
    description: "Ordonnancement linéaire des sommets d'un DAG tel que pour chaque arête u→v, u précède v.",
    code: `// Kahn's Algorithm (BFS)
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
}`,
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
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto" tabIndex={0}>
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
