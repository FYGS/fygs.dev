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
    solution: `// Min-heap binaire : push et pop en O(log n)
class MinHeap {
  constructor() { this.items = []; }
  get size() { return this.items.length; }

  push(item) { // item = [priorité, valeur]
    const a = this.items;
    a.push(item);
    let i = a.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (a[parent][0] <= a[i][0]) break;
      [a[parent], a[i]] = [a[i], a[parent]];
      i = parent;
    }
  }

  pop() {
    const a = this.items;
    const top = a[0];
    const last = a.pop();
    if (a.length > 0) {
      a[0] = last;
      let i = 0;
      while (true) {
        const left = 2 * i + 1;
        const right = left + 1;
        let smallest = i;
        if (left < a.length && a[left][0] < a[smallest][0]) smallest = left;
        if (right < a.length && a[right][0] < a[smallest][0]) smallest = right;
        if (smallest === i) break;
        [a[smallest], a[i]] = [a[i], a[smallest]];
        i = smallest;
      }
    }
    return top;
  }
}

// Poids positifs ou nuls uniquement (sinon : Bellman-Ford)
function dijkstra(graph, start, end) {
  const distances = { [start]: 0 };
  const visited = new Set();
  const pq = new MinHeap();
  pq.push([0, start]); // [distance, node]

  while (pq.size > 0) {
    const [dist, node] = pq.pop();

    if (visited.has(node)) continue;
    visited.add(node);

    if (node === end) return dist;

    for (const [neighbor, weight] of graph[node] || []) {
      const newDist = dist + weight;
      // undefined (et non !distances[...]) : une distance de 0 est valide
      if (distances[neighbor] === undefined || newDist < distances[neighbor]) {
        distances[neighbor] = newDist;
        pq.push([newDist, neighbor]);
      }
    }
  }

  return -1; // Aucun chemin
}
// Complexité : O((V + E) log V) avec le tas binaire`,
    verify: (input: string): string => runDijkstra(input),
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
  
  // Object.keys donne des chaînes : on les reconvertit en nombres pour
  // rester cohérent avec les voisins (sinon visited.has(0) !== visited.has("0"))
  for (const node of Object.keys(graph).map(Number)) {
    if (!visited.has(node)) {
      if (dfs(node)) return true;
    }
  }
  
  return false;
}`,
    verify: (input: string): string => runCycleDetection(input),
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
    verify: (input: string): string => runTopologicalSort(input),
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
  
  // Moins de n-1 arêtes retenues : graphe non connexe, pas d'arbre couvrant
  return edgesUsed === numNodes - 1 ? mstWeight : -1;
}`,
    verify: (input: string): string => runKruskal(input),
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
    verify: (input: string): string => runConnectedComponents(input),
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
    solution: `// graph : liste d'adjacence non orientée (chaque arête est présente dans les
// deux sens et chaque nœud 0..n-1 est une clé)
function canColorGraph(graph, numColors) {
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
    verify: (input: string): string => runGraphColoring(input),
  },
];

type WeightedEdge = [number, number, number];

const FORMAT_ERROR = "Format invalide : ex. 0-1:4,1-2:3 | 0,2";

// Lit "u-v" ou "u-v:poids" séparés par des virgules ; null si le format est invalide.
function parseEdges(text: string): WeightedEdge[] | null {
  const edges: WeightedEdge[] = [];
  for (const part of text.split(",")) {
    const match = part.trim().match(/^(\d+)-(\d+)(?::(-?\d+(?:\.\d+)?))?$/);
    if (!match) return null;
    edges.push([
      Number(match[1]),
      Number(match[2]),
      match[3] === undefined ? 1 : Number(match[3]),
    ]);
  }
  return edges;
}

function nodeCount(edges: WeightedEdge[]): number {
  return edges.reduce((max, [u, v]) => Math.max(max, u, v), -1) + 1;
}

function buildAdjacency(edges: WeightedEdge[], n: number, directed: boolean) {
  const adjacency: number[][] = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    adjacency[u].push(v);
    if (!directed) adjacency[v].push(u);
  }
  return adjacency;
}

// Plus court chemin (arêtes orientées, poids >= 0) : "arêtes | départ,arrivée"
function runDijkstra(input: string): string {
  const [edgesText = "", paramsText = ""] = input.split("|").map((s) => s.trim());
  const edges = parseEdges(edgesText);
  const [start, end] = paramsText.split(",").map(Number);
  if (
    !edges ||
    !Number.isInteger(start) ||
    !Number.isInteger(end) ||
    start < 0 ||
    end < 0
  ) {
    return FORMAT_ERROR;
  }
  if (edges.some(([, , weight]) => weight < 0)) {
    return "Dijkstra n'accepte pas les poids négatifs";
  }
  const n = Math.max(nodeCount(edges), start + 1, end + 1);
  const dist: number[] = Array(n).fill(Infinity);
  const done: boolean[] = Array(n).fill(false);
  dist[start] = 0;
  for (let step = 0; step < n; step++) {
    let u = -1;
    for (let i = 0; i < n; i++) {
      if (!done[i] && dist[i] < Infinity && (u === -1 || dist[i] < dist[u])) {
        u = i;
      }
    }
    if (u === -1) break;
    done[u] = true;
    for (const [from, to, weight] of edges) {
      if (from === u && dist[u] + weight < dist[to]) dist[to] = dist[u] + weight;
    }
  }
  return dist[end] === Infinity ? "-1" : String(dist[end]);
}

// Cycle dans un graphe orienté : "u-v,v-w,..."
function runCycleDetection(input: string): string {
  const edges = parseEdges(input.trim());
  if (!edges) return FORMAT_ERROR;
  const n = nodeCount(edges);
  const adjacency = buildAdjacency(edges, n, true);
  const state: number[] = Array(n).fill(0); // 0 = nouveau, 1 = dans la pile, 2 = terminé
  const dfs = (node: number): boolean => {
    state[node] = 1;
    for (const next of adjacency[node]) {
      if (state[next] === 1) return true;
      if (state[next] === 0 && dfs(next)) return true;
    }
    state[node] = 2;
    return false;
  };
  for (let i = 0; i < n; i++) {
    if (state[i] === 0 && dfs(i)) return "true";
  }
  return "false";
}

// Tri topologique (Kahn, plus petit nœud disponible d'abord)
function runTopologicalSort(input: string): string {
  const edges = parseEdges(input.trim());
  if (!edges) return FORMAT_ERROR;
  const n = nodeCount(edges);
  const adjacency = buildAdjacency(edges, n, true);
  const inDegree: number[] = Array(n).fill(0);
  for (const [, v] of edges) inDegree[v]++;
  const ready: number[] = [];
  for (let i = 0; i < n; i++) {
    if (inDegree[i] === 0) ready.push(i);
  }
  const order: number[] = [];
  while (ready.length > 0) {
    ready.sort((a, b) => a - b);
    const node = ready.shift() as number;
    order.push(node);
    for (const next of adjacency[node]) {
      inDegree[next]--;
      if (inDegree[next] === 0) ready.push(next);
    }
  }
  return order.length === n
    ? order.join(",")
    : "Cycle détecté : pas d'ordre topologique";
}

function makeUnionFind(n: number) {
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (x: number): number => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };
  return { parent, find };
}

// Poids de l'arbre couvrant minimum (Kruskal) : "u-v:poids,..."
function runKruskal(input: string): string {
  const edges = parseEdges(input.trim());
  if (!edges) return FORMAT_ERROR;
  const n = nodeCount(edges);
  const { parent, find } = makeUnionFind(n);
  let total = 0;
  let used = 0;
  for (const [u, v, weight] of [...edges].sort((a, b) => a[2] - b[2])) {
    const rootU = find(u);
    const rootV = find(v);
    if (rootU !== rootV) {
      parent[rootU] = rootV;
      total += weight;
      used++;
    }
  }
  return used === n - 1
    ? String(total)
    : "Graphe non connexe : pas d'arbre couvrant";
}

// Nombre de composantes connexes d'un graphe non orienté : "u-v,..."
function runConnectedComponents(input: string): string {
  const edges = parseEdges(input.trim());
  if (!edges) return FORMAT_ERROR;
  const n = nodeCount(edges);
  const { parent, find } = makeUnionFind(n);
  let components = n;
  for (const [u, v] of edges) {
    const rootU = find(u);
    const rootV = find(v);
    if (rootU !== rootV) {
      parent[rootU] = rootV;
      components--;
    }
  }
  return String(components);
}

// Coloriage avec k couleurs par backtracking : "arêtes | k"
function runGraphColoring(input: string): string {
  const [edgesText = "", kText = ""] = input.split("|").map((s) => s.trim());
  const edges = parseEdges(edgesText);
  const k = Number(kText);
  if (!edges || !Number.isInteger(k) || k < 0) return FORMAT_ERROR;
  const n = nodeCount(edges);
  const adjacency = buildAdjacency(edges, n, false);
  if (edges.some(([u, v]) => u === v)) return "false"; // boucle : impossible
  const colors: number[] = Array(n).fill(0);
  const backtrack = (node: number): boolean => {
    if (node === n) return true;
    for (let color = 1; color <= k; color++) {
      if (adjacency[node].every((next) => colors[next] !== color)) {
        colors[node] = color;
        if (backtrack(node + 1)) return true;
        colors[node] = 0;
      }
    }
    return false;
  };
  return backtrack(0) ? "true" : "false";
}

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
                  <span className="text-muted-foreground">Entrée :</span>{" "}
                  {example.input}
                </div>
                <div>
                  <span className="text-muted-foreground">Sortie :</span>{" "}
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
              <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm" tabIndex={0}>
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
