"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitMerge, RotateCcw, ArrowRight, Eye, Zap, Code2 } from "lucide-react";

/* ─── Linked List Node for visualization ─── */
interface LLNode {
  id: number;
  value: number;
  highlight?: "normal" | "active" | "found" | "removed";
}

let nodeIdCounter = 0;

function LinkedListVisualizer() {
  const initialNodes: LLNode[] = [
    { id: nodeIdCounter++, value: 5 },
    { id: nodeIdCounter++, value: 12 },
    { id: nodeIdCounter++, value: 8 },
    { id: nodeIdCounter++, value: 3 },
    { id: nodeIdCounter++, value: 17 },
  ];
  const [nodes, setNodes] = useState<LLNode[]>(initialNodes);
  const [message, setMessage] = useState(
    "Cliquez sur une opération pour visualiser",
  );

  const resetAll = () => {
    nodeIdCounter = 0;
    const fresh: LLNode[] = [
      { id: nodeIdCounter++, value: 5 },
      { id: nodeIdCounter++, value: 12 },
      { id: nodeIdCounter++, value: 8 },
      { id: nodeIdCounter++, value: 3 },
      { id: nodeIdCounter++, value: 17 },
    ];
    setNodes(fresh);
    setMessage("Liste réinitialisée");
  };

  const prepend = () => {
    const val = Math.floor(Math.random() * 30) + 1;
    const newNode: LLNode = {
      id: nodeIdCounter++,
      value: val,
      highlight: "active",
    };
    setNodes([
      newNode,
      ...nodes.map((n) => ({ ...n, highlight: "normal" as const })),
    ]);
    setMessage(
      `prepend(${val}) — O(1) : nouveau noeud pointe vers l'ancien head`,
    );
  };

  const append = () => {
    const val = Math.floor(Math.random() * 30) + 1;
    const newNode: LLNode = {
      id: nodeIdCounter++,
      value: val,
      highlight: "active",
    };
    setNodes([
      ...nodes.map((n) => ({ ...n, highlight: "normal" as const })),
      newNode,
    ]);
    setMessage(`append(${val}) — O(n) : parcours jusqu'au dernier noeud`);
  };

  const removeFirst = () => {
    if (nodes.length === 0) return;
    const removed = nodes[0].value;
    setNodes(
      nodes.slice(1).map((n) => ({ ...n, highlight: "normal" as const })),
    );
    setMessage(`removeFirst() → ${removed} — O(1) : head = head.next`);
  };

  const search = () => {
    if (nodes.length === 0) return;
    const target = nodes[Math.floor(Math.random() * nodes.length)].value;
    const idx = nodes.findIndex((n) => n.value === target);
    setNodes(
      nodes.map((n, i) => ({
        ...n,
        highlight: i <= idx ? (i === idx ? "found" : "active") : "normal",
      })),
    );
    setMessage(
      `search(${target}) — trouvé à la position ${idx} après ${idx + 1} noeud(s) — O(n)`,
    );
  };

  const reverse = () => {
    setNodes(
      [...nodes].reverse().map((n) => ({ ...n, highlight: "active" as const })),
    );
    setMessage("reverse() — O(n) : inversion de tous les pointeurs next");
  };

  const detectCycleDemo = () => {
    setNodes(
      nodes.map((n, i) => ({
        ...n,
        highlight: i % 2 === 0 ? "active" : "found",
      })),
    );
    setMessage(
      "Floyd's Cycle Detection (Tortoise & Hare) — slow avance de 1, fast avance de 2. Si cycle, ils se rencontrent — O(n)",
    );
  };

  const colorMap = {
    normal: "bg-muted/60 text-foreground border-border/40",
    active: "bg-green-500/20 text-green-500 border-green-500/50",
    found:
      "bg-blue-500/20 text-blue-500 border-blue-500/50 ring-2 ring-blue-400",
    removed: "bg-red-500/20 text-red-500 border-red-500/50",
  };

  return (
    <Card className="p-6 space-y-6 border-green-500/20">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Eye className="w-5 h-5 text-green-500" />
          Visualisation — Liste Chaînée
        </h3>
        <button
          onClick={resetAll}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Visual linked list */}
      <div className="flex items-center gap-0 overflow-x-auto py-4 justify-center flex-wrap">
        <div className="text-xs text-muted-foreground font-mono mr-2 shrink-0">
          HEAD →
        </div>
        {nodes.map((node, i) => (
          <div key={node.id} className="flex items-center shrink-0">
            <div
              className={`w-14 h-14 rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-300 ${colorMap[node.highlight || "normal"]}`}
            >
              <span className="text-sm font-bold font-mono">{node.value}</span>
              <span className="text-[8px] text-muted-foreground">
                #{node.id}
              </span>
            </div>
            {i < nodes.length - 1 && (
              <ArrowRight className="w-4 h-4 text-muted-foreground mx-1 shrink-0" />
            )}
          </div>
        ))}
        <div className="text-xs text-muted-foreground font-mono ml-2 shrink-0">
          → NULL
        </div>
      </div>

      <p className="text-sm text-center text-muted-foreground bg-muted/30 rounded-lg py-2 px-3">
        {message}
      </p>

      <div className="flex flex-wrap gap-2 justify-center">
        {[
          {
            label: "Prepend O(1)",
            fn: prepend,
            color: "bg-green-500/10 text-green-500 border-green-500/30",
          },
          {
            label: "Append O(n)",
            fn: append,
            color: "bg-blue-500/10 text-blue-500 border-blue-500/30",
          },
          {
            label: "Remove First O(1)",
            fn: removeFirst,
            color: "bg-red-500/10 text-red-500 border-red-500/30",
          },
          {
            label: "Search O(n)",
            fn: search,
            color: "bg-purple-500/10 text-purple-500 border-purple-500/30",
          },
          {
            label: "Reverse O(n)",
            fn: reverse,
            color: "bg-amber-500/10 text-amber-500 border-amber-500/30",
          },
          {
            label: "Cycle Detection",
            fn: detectCycleDemo,
            color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/30",
          },
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={btn.fn}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:scale-105 ${btn.color}`}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </Card>
  );
}

/* ─── Complexity ─── */
const operations = [
  { op: "prepend", singly: "O(1)", doubly: "O(1)", desc: "Insertion en tête" },
  { op: "append", singly: "O(n)", doubly: "O(1)", desc: "Insertion en queue" },
  {
    op: "removeFirst",
    singly: "O(1)",
    doubly: "O(1)",
    desc: "Suppression en tête",
  },
  {
    op: "removeLast",
    singly: "O(n)",
    doubly: "O(1)",
    desc: "Suppression en queue",
  },
  {
    op: "search",
    singly: "O(n)",
    doubly: "O(n)",
    desc: "Recherche d'un élément",
  },
  {
    op: "insertAt(i)",
    singly: "O(n)",
    doubly: "O(n)",
    desc: "Insertion à la position i",
  },
  {
    op: "deleteAt(i)",
    singly: "O(n)",
    doubly: "O(n)",
    desc: "Suppression à la position i",
  },
];

const comparisons = [
  {
    feature: "Accès par index",
    array: "O(1)",
    linkedList: "O(n)",
    winner: "array",
  },
  {
    feature: "Insertion en tête",
    array: "O(n)",
    linkedList: "O(1)",
    winner: "linkedList",
  },
  {
    feature: "Insertion au milieu",
    array: "O(n)",
    linkedList: "O(1)*",
    winner: "linkedList",
  },
  {
    feature: "Mémoire",
    array: "Contiguë",
    linkedList: "Fragmentée",
    winner: "array",
  },
  {
    feature: "Cache locality",
    array: "Excellente",
    linkedList: "Mauvaise",
    winner: "array",
  },
  {
    feature: "Taille dynamique",
    array: "Réallocation",
    linkedList: "Native",
    winner: "linkedList",
  },
];

const interviewPatterns = [
  {
    name: "Tortoise & Hare (Floyd)",
    desc: "Détection de cycle : slow (1 pas) et fast (2 pas). Si cycle, ils se rencontrent.",
    problems: ["Linked List Cycle", "Find Duplicate Number", "Happy Number"],
  },
  {
    name: "Reverse Linked List",
    desc: "3 pointeurs (prev, curr, next). Inverser next à chaque étape.",
    problems: [
      "Reverse Linked List",
      "Reverse Nodes in k-Group",
      "Palindrome Linked List",
    ],
  },
  {
    name: "Merge Two Lists",
    desc: "Dummy node + comparaison élément par élément.",
    problems: ["Merge Two Sorted Lists", "Merge K Sorted Lists", "Sort List"],
  },
  {
    name: "Fast & Slow (Middle)",
    desc: "fast avance 2x, slow 1x → slow est au milieu quand fast atteint la fin.",
    problems: ["Middle of Linked List", "Reorder List", "Delete Middle Node"],
  },
  {
    name: "Sentinel / Dummy Node",
    desc: "Noeud factice simplifie les cas limites (suppression en tête, liste vide).",
    problems: ["Remove Nth Node", "Remove Duplicates", "Partition List"],
  },
];

export default function ListsPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-green-500/10 text-green-500">
          <GitMerge className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
          Listes Chaînées
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Structure de données linéaire où chaque noeud pointe vers le suivant.
          Maîtrisez les opérations, Floyd&apos;s algorithm et les patterns
          d&apos;entretien.
        </p>
      </section>

      {/* Interactive Visualizer */}
      <LinkedListVisualizer />

      {/* Complexity Table */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Complexité : Singly vs Doubly</h2>
        <Card className="overflow-x-auto border-border/40">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left py-3 px-4 font-semibold">Opération</th>
                <th className="text-left py-3 px-4 font-semibold">Singly</th>
                <th className="text-left py-3 px-4 font-semibold">Doubly</th>
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
                    <Badge className="bg-blue-500/10 text-blue-500 text-xs">
                      {o.singly}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-4">
                    <Badge className="bg-green-500/10 text-green-500 text-xs">
                      {o.doubly}
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

      {/* Array vs Linked List */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Array vs Linked List</h2>
        <Card className="overflow-x-auto border-border/40">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left py-3 px-4 font-semibold">Critère</th>
                <th className="text-left py-3 px-4 font-semibold">Array</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Linked List
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((c) => (
                <tr key={c.feature} className="border-b border-border/20">
                  <td className="py-2.5 px-4 font-semibold text-xs">
                    {c.feature}
                  </td>
                  <td
                    className={`py-2.5 px-4 text-xs ${c.winner === "array" ? "text-green-500 font-medium" : "text-muted-foreground"}`}
                  >
                    {c.array}
                  </td>
                  <td
                    className={`py-2.5 px-4 text-xs ${c.winner === "linkedList" ? "text-green-500 font-medium" : "text-muted-foreground"}`}
                  >
                    {c.linkedList}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      {/* Interview Patterns */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="w-6 h-6 text-primary" />
          Patterns d&apos;Entretien
        </h2>
        <div className="space-y-4">
          {interviewPatterns.map((p) => (
            <Card
              key={p.name}
              className="p-5 border-border/40 hover:border-primary/30 transition-all"
            >
              <h3 className="font-bold text-lg mb-1">{p.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{p.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {p.problems.map((prob) => (
                  <Badge key={prob} variant="outline" className="text-[10px]">
                    {prob}
                  </Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Implementation */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Code2 className="w-6 h-6 text-primary" />
          Implémentation TypeScript
        </h2>
        <Card className="border-border/40">
          <pre className="p-4 overflow-x-auto text-xs bg-muted/30 rounded-lg">
            <code>{`class ListNode<T> {
  value: T;
  next: ListNode<T> | null = null;
  constructor(value: T) { this.value = value; }
}

class SinglyLinkedList<T> {
  head: ListNode<T> | null = null;
  size = 0;

  prepend(value: T): void {
    const node = new ListNode(value);
    node.next = this.head;
    this.head = node;
    this.size++;
  }

  append(value: T): void {
    const node = new ListNode(value);
    if (!this.head) { this.head = node; this.size++; return; }
    let curr = this.head;
    while (curr.next) curr = curr.next;
    curr.next = node;
    this.size++;
  }

  reverse(): void {
    let prev: ListNode<T> | null = null;
    let curr = this.head;
    while (curr) {
      const next = curr.next;
      curr.next = prev;
      prev = curr;
      curr = next;
    }
    this.head = prev;
  }

  hasCycle(): boolean {
    let slow = this.head, fast = this.head;
    while (fast?.next) {
      slow = slow!.next;
      fast = fast.next.next;
      if (slow === fast) return true;
    }
    return false;
  }

  findMiddle(): T | null {
    let slow = this.head, fast = this.head;
    while (fast?.next) {
      slow = slow!.next;
      fast = fast.next.next;
    }
    return slow?.value ?? null;
  }
}`}</code>
          </pre>
        </Card>
      </section>
    </div>
  );
}
