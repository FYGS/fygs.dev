"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, RotateCcw, Eye, Zap, Code2 } from "lucide-react";

/* ─── Interactive Min-Heap Visualizer ─── */
function HeapVisualizer() {
  const [heap, setHeap] = useState<number[]>([2, 5, 8, 10, 7, 15, 12]);
  const [message, setMessage] = useState(
    "Ajoutez ou retirez des éléments pour voir le heap en action",
  );
  const [highlights, setHighlights] = useState<number[]>([]);
  const [heapType, setHeapType] = useState<"min" | "max">("min");

  const compare = (a: number, b: number) =>
    heapType === "min" ? a < b : a > b;

  const insert = (val: number) => {
    const newHeap = [...heap, val];
    let i = newHeap.length - 1;
    const path = [i];
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (compare(newHeap[i], newHeap[parent])) {
        [newHeap[i], newHeap[parent]] = [newHeap[parent], newHeap[i]];
        path.push(parent);
        i = parent;
      } else break;
    }
    setHeap(newHeap);
    setHighlights(path);
    setMessage(
      `insert(${val}) — Bubble up: ${path.length - 1} swap(s). O(log n)`,
    );
  };

  const extractRoot = () => {
    if (heap.length === 0) return;
    const root = heap[0];
    const newHeap = [...heap];
    const last = newHeap.pop()!;
    if (newHeap.length > 0) {
      newHeap[0] = last;
      let i = 0;
      const path = [0];
      const n = newHeap.length;
      while (true) {
        let target = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        if (left < n && compare(newHeap[left], newHeap[target])) target = left;
        if (right < n && compare(newHeap[right], newHeap[target]))
          target = right;
        if (target === i) break;
        [newHeap[i], newHeap[target]] = [newHeap[target], newHeap[i]];
        path.push(target);
        i = target;
      }
      setHighlights(path);
      setMessage(
        `extract${heapType === "min" ? "Min" : "Max"}() → ${root}. Heapify down: ${path.length - 1} swap(s). O(log n)`,
      );
    } else {
      setHighlights([]);
      setMessage(
        `extract${heapType === "min" ? "Min" : "Max"}() → ${root}. Heap vide.`,
      );
    }
    setHeap(newHeap);
  };

  const reset = () => {
    setHeap(
      heapType === "min" ? [2, 5, 8, 10, 7, 15, 12] : [15, 12, 10, 5, 7, 8, 2],
    );
    setHighlights([]);
    setMessage("Heap réinitialisé");
  };

  const toggleType = () => {
    const newType = heapType === "min" ? "max" : "min";
    setHeapType(newType);
    setHeap(
      newType === "min" ? [2, 5, 8, 10, 7, 15, 12] : [15, 12, 10, 5, 7, 8, 2],
    );
    setHighlights([]);
    setMessage(`Basculé en ${newType === "min" ? "Min" : "Max"}-Heap`);
  };

  // Tree visualization positions
  const getTreePosition = (idx: number) => {
    const level = Math.floor(Math.log2(idx + 1));
    const posInLevel = idx - (Math.pow(2, level) - 1);
    const nodesInLevel = Math.pow(2, level);
    const width = 380;
    const xSpacing = width / (nodesInLevel + 1);
    const x = xSpacing * (posInLevel + 1);
    const y = level * 60 + 30;
    return { x, y, level };
  };

  const totalLevels =
    heap.length > 0 ? Math.floor(Math.log2(heap.length)) + 1 : 0;
  const svgHeight = totalLevels * 60 + 20;

  return (
    <Card className="p-6 space-y-6 border-violet-500/20">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Eye className="w-5 h-5 text-violet-500" />
          {heapType === "min" ? "Min" : "Max"}-Heap Interactif
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleType}
            className="px-3 py-1.5 rounded-full text-xs font-medium border border-violet-500/30 bg-violet-500/10 text-violet-500 hover:scale-105 transition-all"
          >
            {heapType === "min" ? "→ Max-Heap" : "→ Min-Heap"}
          </button>
          <button
            onClick={reset}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tree visualization */}
      <div className="flex justify-center overflow-x-auto">
        <svg
          viewBox={`0 0 400 ${svgHeight}`}
          className="w-full max-w-md"
          style={{ minHeight: svgHeight }}
        >
          {/* Edges */}
          {heap.map((_, i) => {
            if (i === 0) return null;
            const parent = Math.floor((i - 1) / 2);
            const pos = getTreePosition(i);
            const parentPos = getTreePosition(parent);
            return (
              <line
                key={`edge-${i}`}
                x1={parentPos.x}
                y1={parentPos.y}
                x2={pos.x}
                y2={pos.y}
                stroke="currentColor"
                strokeWidth={1.5}
                className="text-border/60"
              />
            );
          })}
          {/* Nodes */}
          {heap.map((val, i) => {
            const pos = getTreePosition(i);
            const isHighlighted = highlights.includes(i);
            return (
              <g key={`node-${i}`}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={18}
                  className={`transition-all duration-300 ${isHighlighted ? "fill-violet-500 stroke-violet-300" : "fill-muted stroke-border"}`}
                  strokeWidth={2}
                />
                <text
                  x={pos.x}
                  y={pos.y + 5}
                  textAnchor="middle"
                  className={`text-xs font-bold ${isHighlighted ? "fill-white" : "fill-foreground"}`}
                >
                  {val}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Array representation */}
      <div className="flex items-center gap-1 justify-center flex-wrap">
        <span className="text-xs text-muted-foreground mr-1">[</span>
        {heap.map((val, i) => (
          <div
            key={i}
            className={`w-8 h-8 rounded flex items-center justify-center text-xs font-mono font-bold transition-all
            ${highlights.includes(i) ? "bg-violet-500 text-white" : "bg-muted/60 text-foreground"}`}
          >
            {val}
          </div>
        ))}
        <span className="text-xs text-muted-foreground ml-1">]</span>
      </div>

      <p className="text-sm text-center text-muted-foreground bg-muted/30 rounded-lg py-2 px-3">
        {message}
      </p>

      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => insert(Math.floor(Math.random() * 20) + 1)}
          className="px-4 py-2 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/30 hover:scale-105 transition-all"
        >
          Insert Random
        </button>
        <button
          onClick={() => {
            const v = prompt("Valeur ?");
            if (v) insert(Number(v));
          }}
          className="px-4 py-2 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/30 hover:scale-105 transition-all"
        >
          Insert Custom
        </button>
        <button
          onClick={extractRoot}
          disabled={heap.length === 0}
          className="px-4 py-2 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/30 hover:scale-105 transition-all disabled:opacity-50"
        >
          Extract {heapType === "min" ? "Min" : "Max"}
        </button>
      </div>
    </Card>
  );
}

/* ─── Data ─── */
const operations = [
  { op: "insert", complexity: "O(log n)", desc: "Ajouter + bubble up" },
  {
    op: "extractMin/Max",
    complexity: "O(log n)",
    desc: "Retirer racine + heapify down",
  },
  { op: "peek", complexity: "O(1)", desc: "Voir racine sans retirer" },
  {
    op: "buildHeap",
    complexity: "O(n)",
    desc: "Heapify bottom-up depuis un tableau",
  },
  {
    op: "heapSort",
    complexity: "O(n log n)",
    desc: "Tri in-place, pas stable",
  },
  {
    op: "decreaseKey",
    complexity: "O(log n)",
    desc: "Réduire une clé + bubble up",
  },
  {
    op: "delete(i)",
    complexity: "O(log n)",
    desc: "decreaseKey(-inf) + extract",
  },
];

const useCases = [
  {
    name: "Priority Queue",
    desc: "Planification de tâches par priorité. Dijkstra.",
  },
  {
    name: "Top-K éléments",
    desc: "Maintenir K plus grands en O(n log k). Min-heap de taille k.",
  },
  {
    name: "Médiane streaming",
    desc: "Max-heap (moitié basse) + Min-heap (moitié haute). O(log n) par élément.",
  },
  {
    name: "Merge K Sorted Lists",
    desc: "Min-heap avec le head de chaque liste. O(n log k).",
  },
  {
    name: "Huffman Coding",
    desc: "Construction de l'arbre de compression avec min-heap.",
  },
  {
    name: "Kth Largest",
    desc: "Min-heap de taille k. L'élément en haut est le kème plus grand.",
  },
];

const heapProperties = [
  {
    title: "Structure",
    desc: "Arbre binaire complet : tous les niveaux remplis sauf le dernier (rempli de gauche à droite).",
  },
  {
    title: "Propriété de Heap",
    desc: "Min-Heap : parent <= enfants. Max-Heap : parent >= enfants.",
  },
  {
    title: "Stockage en Tableau",
    desc: "parent(i) = floor((i-1)/2), left(i) = 2i+1, right(i) = 2i+2",
  },
  { title: "Hauteur", desc: "O(log n) — arbre complet, toujours équilibré." },
];

export default function HeapsPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-violet-500/10 text-violet-500">
          <ArrowUpDown className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
          Heaps & Priority Queues
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Arbre binaire complet avec propriété de tas. Parfait pour les files de
          priorité, Top-K, médiane streaming et algorithmes de sélection.
        </p>
      </section>

      {/* Interactive Heap */}
      <HeapVisualizer />

      {/* Properties */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Propriétés Fondamentales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {heapProperties.map((p) => (
            <Card key={p.title} className="p-5 border-border/40">
              <h3 className="font-bold text-violet-500 mb-1">{p.title}</h3>
              <p className="text-sm text-muted-foreground">{p.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Operations */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Complexité des Opérations</h2>
        <Card className="overflow-x-auto border-border/40">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left py-3 px-4 font-semibold">Opération</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Complexité
                </th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {operations.map((o) => (
                <tr key={o.op} className="border-b border-border/20">
                  <td className="py-2.5 px-4 font-mono text-primary text-xs">
                    {o.op}
                  </td>
                  <td className="py-2.5 px-4">
                    <Badge className="bg-primary/10 text-primary text-xs">
                      {o.complexity}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-4 text-muted-foreground text-xs">
                    {o.desc}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      {/* Use Cases */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="w-6 h-6 text-primary" />
          Cas d&apos;Usage en Entretien
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {useCases.map((uc) => (
            <Card
              key={uc.name}
              className="p-4 border-border/40 hover:border-violet-500/30 transition-all"
            >
              <h3 className="font-bold text-sm mb-1">{uc.name}</h3>
              <p className="text-xs text-muted-foreground">{uc.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Implementation */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Code2 className="w-6 h-6 text-primary" />
          Implémentation Min-Heap
        </h2>
        <Card className="border-border/40">
          <pre className="p-4 overflow-x-auto text-xs bg-muted/30 rounded-lg" tabIndex={0}>
            <code>{`class MinHeap<T extends number> {
  private heap: T[] = [];

  get size() { return this.heap.length; }
  peek(): T | undefined { return this.heap[0]; }

  insert(val: T): void {
    this.heap.push(val);
    this.bubbleUp(this.heap.length - 1);
  }

  extractMin(): T | undefined {
    if (this.heap.length === 0) return undefined;
    const min = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.heapifyDown(0);
    }
    return min;
  }

  private bubbleUp(i: number): void {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[parent] <= this.heap[i]) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }

  private heapifyDown(i: number): void {
    while (true) {
      let smallest = i;
      const left = 2 * i + 1, right = 2 * i + 2;
      if (left < this.heap.length && this.heap[left] < this.heap[smallest]) smallest = left;
      if (right < this.heap.length && this.heap[right] < this.heap[smallest]) smallest = right;
      if (smallest === i) break;
      [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
      i = smallest;
    }
  }

  // Build heap from array in O(n) using bottom-up heapify
  static fromArray(arr: number[]): MinHeap<number> {
    const heap = new MinHeap<number>();
    heap.heap = [...arr];
    for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) {
      heap.heapifyDown(i);
    }
    return heap;
  }
}`}</code>
          </pre>
        </Card>
      </section>
    </div>
  );
}
