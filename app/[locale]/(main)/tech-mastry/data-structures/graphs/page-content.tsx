"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Network, Play, RotateCcw, Eye, Zap, Code2 } from "lucide-react";

/* ─── Graph Visualizer: BFS / DFS ─── */
function GraphTraversalVisualizer() {
  const nodes = [
    { id: 0, label: "A", x: 200, y: 40 },
    { id: 1, label: "B", x: 100, y: 120 },
    { id: 2, label: "C", x: 300, y: 120 },
    { id: 3, label: "D", x: 50, y: 220 },
    { id: 4, label: "E", x: 170, y: 220 },
    { id: 5, label: "F", x: 250, y: 220 },
    { id: 6, label: "G", x: 350, y: 220 },
  ];
  const edges: [number, number][] = [
    [0, 1],
    [0, 2],
    [1, 3],
    [1, 4],
    [2, 5],
    [2, 6],
    [4, 5],
  ];
  const [visited, setVisited] = useState<number[]>([]);
  const [current, setCurrent] = useState<number | null>(null);
  const [traversalOrder, setTraversalOrder] = useState<string[]>([]);
  const [message, setMessage] = useState(
    "Choisissez BFS ou DFS pour traverser le graphe",
  );
  const [running, setRunning] = useState(false);

  const adjacency = new Map<number, number[]>();
  for (const [a, b] of edges) {
    adjacency.set(a, [...(adjacency.get(a) || []), b]);
    adjacency.set(b, [...(adjacency.get(b) || []), a]);
  }

  const reset = () => {
    setVisited([]);
    setCurrent(null);
    setTraversalOrder([]);
    setMessage("Graphe réinitialisé");
  };

  const runBFS = async () => {
    if (running) return;
    setRunning(true);
    reset();
    const queue = [0];
    const seen = new Set<number>([0]);
    const order: string[] = [];
    while (queue.length > 0) {
      const node = queue.shift()!;
      setCurrent(node);
      setVisited((v) => [...v, node]);
      order.push(nodes[node].label);
      setTraversalOrder([...order]);
      setMessage(
        `BFS visite ${nodes[node].label} — File : [${queue.map((q) => nodes[q].label).join(", ")}]`,
      );
      await new Promise((r) => setTimeout(r, 700));
      for (const neighbor of adjacency.get(node) || []) {
        if (!seen.has(neighbor)) {
          seen.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    setCurrent(null);
    setMessage(`BFS terminé : ${order.join(" → ")} — O(V+E)`);
    setRunning(false);
  };

  const runDFS = async () => {
    if (running) return;
    setRunning(true);
    reset();
    const stack = [0];
    const seen = new Set<number>();
    const order: string[] = [];
    while (stack.length > 0) {
      const node = stack.pop()!;
      if (seen.has(node)) continue;
      seen.add(node);
      setCurrent(node);
      setVisited((v) => [...v, node]);
      order.push(nodes[node].label);
      setTraversalOrder([...order]);
      setMessage(
        `DFS visite ${nodes[node].label} — Pile : [${stack.map((s) => nodes[s].label).join(", ")}]`,
      );
      await new Promise((r) => setTimeout(r, 700));
      const neighbors = adjacency.get(node) || [];
      for (let i = neighbors.length - 1; i >= 0; i--) {
        if (!seen.has(neighbors[i])) stack.push(neighbors[i]);
      }
    }
    setCurrent(null);
    setMessage(`DFS terminé : ${order.join(" → ")} — O(V+E)`);
    setRunning(false);
  };

  return (
    <Card className="p-6 space-y-6 border-cyan-500/20">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Eye className="w-5 h-5 text-cyan-500" />
          Traversée de Graphe — BFS vs DFS
        </h3>
        <button
          onClick={reset}
          disabled={running}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* SVG Graph */}
      <div className="flex justify-center">
        <svg
          viewBox="0 0 400 280"
          className="w-full max-w-md"
          style={{ minHeight: 200 }}
        >
          {/* Edges */}
          {edges.map(([a, b]) => (
            <line
              key={`${a}-${b}`}
              x1={nodes[a].x}
              y1={nodes[a].y}
              x2={nodes[b].x}
              y2={nodes[b].y}
              stroke="currentColor"
              strokeWidth={2}
              className={`${visited.includes(a) && visited.includes(b) ? "text-cyan-500" : "text-muted-foreground/30"} transition-all duration-500`}
            />
          ))}
          {/* Nodes */}
          {nodes.map((node) => {
            const isVisited = visited.includes(node.id);
            const isCurrent = current === node.id;
            return (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={20}
                  className={`transition-all duration-500 ${isCurrent ? "fill-cyan-500 stroke-cyan-300" : isVisited ? "fill-cyan-500/30 stroke-cyan-500" : "fill-muted stroke-border"}`}
                  strokeWidth={2}
                />
                <text
                  x={node.x}
                  y={node.y + 5}
                  textAnchor="middle"
                  className={`text-sm font-bold ${isCurrent ? "fill-white" : isVisited ? "fill-cyan-500" : "fill-foreground"}`}
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Traversal Order */}
      {traversalOrder.length > 0 && (
        <div className="flex items-center justify-center gap-1 text-sm">
          <span className="text-muted-foreground">Ordre :</span>
          {traversalOrder.map((label, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-muted-foreground">→</span>}
              <Badge className="bg-cyan-500/10 text-cyan-500">{label}</Badge>
            </span>
          ))}
        </div>
      )}

      <p className="text-sm text-center text-muted-foreground bg-muted/30 rounded-lg py-2 px-3">
        {message}
      </p>

      <div className="flex justify-center gap-3">
        <button
          onClick={runBFS}
          disabled={running}
          className="px-4 py-2 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/30 hover:scale-105 transition-all disabled:opacity-50"
        >
          <Play className="w-3 h-3 inline mr-1" />
          BFS (File)
        </button>
        <button
          onClick={runDFS}
          disabled={running}
          className="px-4 py-2 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/30 hover:scale-105 transition-all disabled:opacity-50"
        >
          <Play className="w-3 h-3 inline mr-1" />
          DFS (Pile)
        </button>
      </div>
    </Card>
  );
}

/* ─── Data ─── */
const graphTypes = [
  {
    type: "Non-dirigé",
    desc: "Arêtes bidirectionnelles. Amitiés sur un réseau social.",
    color: "text-blue-500",
    border: "border-blue-500/30",
  },
  {
    type: "Dirigé (Digraph)",
    desc: "Arêtes unidirectionnelles. Following, dépendances.",
    color: "text-green-500",
    border: "border-green-500/30",
  },
  {
    type: "Pondéré",
    desc: "Arêtes avec coût/distance. Routes, bandwidth.",
    color: "text-purple-500",
    border: "border-purple-500/30",
  },
  {
    type: "DAG",
    desc: "Directed Acyclic Graph. Builds, scheduling, Git.",
    color: "text-orange-500",
    border: "border-orange-500/30",
  },
  {
    type: "Biparti",
    desc: "2 ensembles sans arêtes internes. Matching.",
    color: "text-pink-500",
    border: "border-pink-500/30",
  },
  {
    type: "Arbre",
    desc: "Graphe connexe acyclique. N noeuds, N-1 arêtes.",
    color: "text-teal-500",
    border: "border-teal-500/30",
  },
];

const algorithms = [
  {
    name: "BFS",
    complexity: "O(V+E)",
    space: "O(V)",
    use: "Plus court chemin (non-pondéré), level-order, composantes connexes",
    category: "Parcours",
  },
  {
    name: "DFS",
    complexity: "O(V+E)",
    space: "O(V)",
    use: "Détection de cycles, topological sort, backtracking",
    category: "Parcours",
  },
  {
    name: "Dijkstra",
    complexity: "O((V+E) log V)",
    space: "O(V)",
    use: "Plus court chemin (poids positifs)",
    category: "Plus court chemin",
  },
  {
    name: "Bellman-Ford",
    complexity: "O(V×E)",
    space: "O(V)",
    use: "Plus court chemin (poids négatifs autorisés)",
    category: "Plus court chemin",
  },
  {
    name: "Floyd-Warshall",
    complexity: "O(V³)",
    space: "O(V²)",
    use: "All-pairs shortest path",
    category: "Plus court chemin",
  },
  {
    name: "Topological Sort",
    complexity: "O(V+E)",
    space: "O(V)",
    use: "Ordonnancement, résolution de dépendances",
    category: "Tri",
  },
  {
    name: "Kruskal",
    complexity: "O(E log E)",
    space: "O(V+E)",
    use: "Minimum Spanning Tree (avec Union-Find : O(V) ; le tri des arêtes ajoute O(E) si l'on en fait une copie)",
    category: "MST",
  },
  {
    name: "Prim",
    complexity: "O(E log V)",
    space: "O(V)",
    use: "MST (avec tas binaire ; version O(V²) pour graphes denses)",
    category: "MST",
  },
  {
    name: "Union-Find",
    complexity: "O(α(n)) amorti",
    space: "O(V)",
    use: "Composantes connexes, détection de cycles (coût par opération find/union)",
    category: "Structures",
  },
  {
    name: "Tarjan",
    complexity: "O(V+E)",
    space: "O(V)",
    use: "Strongly Connected Components",
    category: "Avancé",
  },
];

const representations = [
  {
    name: "Liste d'Adjacence",
    space: "O(V+E)",
    pros: "Efficace en mémoire pour graphes sparse. Itération rapide sur les voisins. Ajouter un sommet : O(1) ; ajouter une arête : O(1) amorti (sans test de doublon) ; tester une arête : O(deg(v)).",
    code: `const graph = new Map<number, number[]>();
graph.set(0, [1, 2]);
graph.set(1, [0, 2, 3]);
graph.set(2, [0, 1]);
graph.set(3, [1]);`,
    color: "border-blue-500/30",
  },
  {
    name: "Matrice d'Adjacence",
    space: "O(V²)",
    pros: "Vérification d'arête en O(1). Idéal pour graphes denses. Ajouter une arête : O(1) ; ajouter un sommet : O(V) amorti avec redimensionnement (O(V²) si l'on recopie toute la matrice à chaque ajout).",
    code: `const matrix = [
  [0, 1, 1, 0],  // 0 → 1, 2
  [1, 0, 1, 1],  // 1 → 0, 2, 3
  [1, 1, 0, 0],  // 2 → 0, 1
  [0, 1, 0, 0],  // 3 → 1
];`,
    color: "border-green-500/30",
  },
];

export default function GraphsPage() {
  const [algoFilter, setAlgoFilter] = useState("Tous");
  const algoCategories = [
    "Tous",
    ...new Set(algorithms.map((a) => a.category)),
  ];
  const filteredAlgos =
    algoFilter === "Tous"
      ? algorithms
      : algorithms.filter((a) => a.category === algoFilter);

  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-cyan-500/10 text-cyan-500">
          <Network className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-teal-500 bg-clip-text text-transparent">
          Graphes
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          La structure de données la plus flexible. Modélise réseaux, relations
          et dépendances. Maîtrisez BFS, DFS, Dijkstra et les algorithmes
          essentiels.
        </p>
      </section>

      {/* Graph Traversal Visualizer */}
      <GraphTraversalVisualizer />

      {/* Graph Types */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Types de Graphes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {graphTypes.map((g) => (
            <Card key={g.type} className={`p-5 ${g.border}`}>
              <h3 className={`font-bold ${g.color}`}>{g.type}</h3>
              <p className="text-sm text-muted-foreground mt-1">{g.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Algorithms */}
      <section className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            Algorithmes Essentiels
          </h2>
          <div className="flex gap-2 flex-wrap">
            {algoCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setAlgoFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  algoFilter === cat
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/40 text-muted-foreground hover:border-primary/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          {filteredAlgos.map((a) => (
            <Card
              key={a.name}
              className="p-4 border-border/40 hover:border-primary/30 transition-all"
            >
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">{a.name}</h3>
                    <Badge className="bg-primary/10 text-primary text-xs">
                      {a.complexity}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {a.space}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{a.use}</p>
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0">
                  {a.category}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Representations */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Code2 className="w-6 h-6 text-primary" />
          Représentations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {representations.map((r) => (
            <Card key={r.name} className={`p-6 space-y-3 ${r.color}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-bold">{r.name}</h3>
                <Badge className="bg-primary/10 text-primary text-xs">
                  {r.space}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{r.pros}</p>
              <pre className="bg-muted/30 rounded-lg p-3 text-xs overflow-x-auto" tabIndex={0}>
                <code>{r.code}</code>
              </pre>
            </Card>
          ))}
        </div>
      </section>

      {/* BFS/DFS Implementation */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Implémentations</h2>
        <Card className="border-border/40">
          <pre className="p-4 overflow-x-auto text-xs bg-muted/30 rounded-lg" tabIndex={0}>
            <code>{`// BFS — Breadth First Search
function bfs(graph: Map<number, number[]>, start: number): number[] {
  const visited = new Set<number>([start]);
  // File = tableau + index de tête (head) : défiler est O(1).
  // queue.shift() décalerait tout le tableau (O(n)) et ferait dégénérer le BFS.
  const queue = [start];
  let head = 0;
  const result: number[] = [];
  while (head < queue.length) {
    const node = queue[head++];
    result.push(node);
    for (const neighbor of graph.get(node) || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return result;
}

// DFS — Depth First Search (iterative)
function dfs(graph: Map<number, number[]>, start: number): number[] {
  const visited = new Set<number>();
  const stack = [start];
  const result: number[] = [];
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (visited.has(node)) continue;
    visited.add(node);
    result.push(node);
    // Ordre de visite : la pile est LIFO, le DERNIER voisin empilé est visité
    // en premier. On parcourt donc les voisins à l'envers pour retrouver
    // l'ordre du DFS récursif (premier voisin d'abord).
    const neighbors = graph.get(node) || [];
    for (let i = neighbors.length - 1; i >= 0; i--) {
      if (!visited.has(neighbors[i])) stack.push(neighbors[i]);
    }
  }
  return result;
}

// Dijkstra — Shortest Path (positive weights)
function dijkstra(graph: Map<number, [number, number][]>, start: number, V: number): number[] {
  const dist = new Array(V).fill(Infinity);
  dist[start] = 0;
  // Tas binaire min (file de priorité) : push/pop en O(log n),
  // d'où O((V+E) log V) pour l'ensemble de l'algorithme.
  const pq = new MinHeap(); // éléments [distance, node]
  pq.push([0, start]);
  while (pq.size > 0) {
    const [d, u] = pq.pop()!;
    if (d > dist[u]) continue; // entrée périmée (lazy deletion)
    for (const [v, w] of graph.get(u) || []) {
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        pq.push([dist[v], v]);
      }
    }
  }
  return dist;
}

class MinHeap {
  private a: [number, number][] = [];
  get size() { return this.a.length; }
  push(x: [number, number]) {
    const a = this.a;
    a.push(x);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p][0] <= a[i][0]) break;
      [a[p], a[i]] = [a[i], a[p]];
      i = p;
    }
  }
  pop(): [number, number] | undefined {
    const a = this.a;
    if (a.length === 0) return undefined;
    const top = a[0];
    const last = a.pop()!;
    if (a.length > 0) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < a.length && a[l][0] < a[m][0]) m = l;
        if (r < a.length && a[r][0] < a[m][0]) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i], a[m]];
        i = m;
      }
    }
    return top;
  }
}`}</code>
          </pre>
        </Card>
      </section>
    </div>
  );
}
