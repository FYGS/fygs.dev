"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, Eye, Zap, Code2, ArrowDown, ArrowUp } from "lucide-react";

/* ─── Stack Visualizer ─── */
function StackVisualizer() {
  const [stack, setStack] = useState<number[]>([3, 7, 1, 9]);
  const [message, setMessage] = useState("LIFO — Last In, First Out");
  const [highlight, setHighlight] = useState<number | null>(null);

  const push = () => {
    const val = Math.floor(Math.random() * 20) + 1;
    setStack([...stack, val]);
    setHighlight(stack.length);
    setMessage(`push(${val}) — O(1). Ajouté au sommet.`);
  };

  const pop = () => {
    if (stack.length === 0) return;
    const val = stack[stack.length - 1];
    setStack(stack.slice(0, -1));
    setHighlight(null);
    setMessage(`pop() → ${val} — O(1). Retiré du sommet.`);
  };

  const peek = () => {
    if (stack.length === 0) return;
    setHighlight(stack.length - 1);
    setMessage(
      `peek() → ${stack[stack.length - 1]} — O(1). Le sommet sans le retirer.`,
    );
  };

  return (
    <Card className="p-6 space-y-5 border-blue-500/20">
      <h3 className="text-lg font-bold flex items-center gap-2">
        <Eye className="w-5 h-5 text-blue-500" />
        Stack (LIFO)
      </h3>
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs text-muted-foreground mb-1">← TOP</span>
        {[...stack].reverse().map((val, i) => {
          const realIdx = stack.length - 1 - i;
          return (
            <div
              key={`${realIdx}-${val}`}
              className={`w-24 h-10 rounded-md flex items-center justify-center text-sm font-mono font-bold transition-all border
                ${highlight === realIdx ? "bg-blue-500 text-white border-blue-400" : "bg-muted/60 text-foreground border-border/40"}`}
            >
              {val}
            </div>
          );
        })}
        {stack.length === 0 && (
          <div className="text-sm text-muted-foreground italic py-4">
            Pile vide
          </div>
        )}
        <span className="text-xs text-muted-foreground mt-1">← BOTTOM</span>
      </div>
      <p className="text-sm text-center text-muted-foreground bg-muted/30 rounded-lg py-2 px-3">
        {message}
      </p>
      <div className="flex gap-2 justify-center">
        <button
          onClick={push}
          className="px-4 py-2 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/30 hover:scale-105 transition-all"
        >
          <ArrowUp className="w-3 h-3 inline mr-1" />
          push()
        </button>
        <button
          onClick={pop}
          disabled={stack.length === 0}
          className="px-4 py-2 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/30 hover:scale-105 transition-all disabled:opacity-50"
        >
          <ArrowDown className="w-3 h-3 inline mr-1" />
          pop()
        </button>
        <button
          onClick={peek}
          disabled={stack.length === 0}
          className="px-4 py-2 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/30 hover:scale-105 transition-all disabled:opacity-50"
        >
          peek()
        </button>
      </div>
    </Card>
  );
}

/* ─── Queue Visualizer ─── */
function QueueVisualizer() {
  const [queue, setQueue] = useState<number[]>([5, 12, 8, 3]);
  const [message, setMessage] = useState("FIFO — First In, First Out");
  const [highlight, setHighlight] = useState<number | null>(null);

  const enqueue = () => {
    const val = Math.floor(Math.random() * 20) + 1;
    setQueue([...queue, val]);
    setHighlight(queue.length);
    setMessage(`enqueue(${val}) — O(1). Ajouté à la fin.`);
  };

  const dequeue = () => {
    if (queue.length === 0) return;
    const val = queue[0];
    setQueue(queue.slice(1));
    setHighlight(null);
    setMessage(`dequeue() → ${val} — O(1). Retiré du début.`);
  };

  const front = () => {
    if (queue.length === 0) return;
    setHighlight(0);
    setMessage(`front() → ${queue[0]} — O(1). Le premier sans le retirer.`);
  };

  return (
    <Card className="p-6 space-y-5 border-green-500/20">
      <h3 className="text-lg font-bold flex items-center gap-2">
        <Eye className="w-5 h-5 text-green-500" />
        Queue (FIFO)
      </h3>
      <div className="flex items-center gap-1 justify-center overflow-x-auto py-2">
        <span className="text-xs text-muted-foreground shrink-0">FRONT →</span>
        {queue.map((val, i) => (
          <div
            key={`${i}-${val}`}
            className={`w-12 h-12 rounded-md flex items-center justify-center text-sm font-mono font-bold transition-all border shrink-0
              ${highlight === i ? "bg-green-500 text-white border-green-400" : "bg-muted/60 text-foreground border-border/40"}`}
          >
            {val}
          </div>
        ))}
        {queue.length === 0 && (
          <div className="text-sm text-muted-foreground italic px-4">
            File vide
          </div>
        )}
        <span className="text-xs text-muted-foreground shrink-0">← BACK</span>
      </div>
      <p className="text-sm text-center text-muted-foreground bg-muted/30 rounded-lg py-2 px-3">
        {message}
      </p>
      <div className="flex gap-2 justify-center">
        <button
          onClick={enqueue}
          className="px-4 py-2 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/30 hover:scale-105 transition-all"
        >
          enqueue()
        </button>
        <button
          onClick={dequeue}
          disabled={queue.length === 0}
          className="px-4 py-2 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/30 hover:scale-105 transition-all disabled:opacity-50"
        >
          dequeue()
        </button>
        <button
          onClick={front}
          disabled={queue.length === 0}
          className="px-4 py-2 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/30 hover:scale-105 transition-all disabled:opacity-50"
        >
          front()
        </button>
      </div>
    </Card>
  );
}

/* ─── Data ─── */
const stackProblems = [
  {
    name: "Valid Parentheses",
    desc: "Push open, pop on close, vérifier match.",
    difficulty: "Easy",
  },
  {
    name: "Min Stack",
    desc: "Stack auxiliaire gardant le minimum courant.",
    difficulty: "Medium",
  },
  {
    name: "Evaluate RPN",
    desc: "Nombres → push, opérateurs → pop 2 + push résultat.",
    difficulty: "Medium",
  },
  {
    name: "Daily Temperatures",
    desc: "Monotonic decreasing stack. O(n).",
    difficulty: "Medium",
  },
  {
    name: "Largest Rectangle",
    desc: "Monotonic stack sur les hauteurs d'histogramme.",
    difficulty: "Hard",
  },
  {
    name: "Basic Calculator",
    desc: "Stack pour gérer parenthèses et signes.",
    difficulty: "Hard",
  },
];

const queueProblems = [
  {
    name: "BFS / Level Order",
    desc: "Queue pour parcours par niveau d'un arbre/graphe.",
    difficulty: "Medium",
  },
  {
    name: "Sliding Window Max",
    desc: "Monotonic deque descendante. O(n).",
    difficulty: "Hard",
  },
  {
    name: "Rotten Oranges",
    desc: "Multi-source BFS avec queue.",
    difficulty: "Medium",
  },
  {
    name: "Task Scheduler",
    desc: "Cooldown avec queue + heap.",
    difficulty: "Medium",
  },
  {
    name: "Implement Queue (2 Stacks)",
    desc: "Push stack + pop stack. Amorti O(1).",
    difficulty: "Easy",
  },
  {
    name: "Implement Stack (2 Queues)",
    desc: "Rotation pour LIFO. O(n) push ou O(n) pop.",
    difficulty: "Easy",
  },
];

const advancedVariants = [
  {
    name: "Monotonic Stack",
    desc: "Maintient un ordre croissant ou décroissant. Résout Next Greater Element, histogrammes.",
    color: "text-blue-500",
    border: "border-blue-500/30",
  },
  {
    name: "Monotonic Queue (Deque)",
    desc: "Sliding window min/max en O(1). Implémenté avec un deque.",
    color: "text-green-500",
    border: "border-green-500/30",
  },
  {
    name: "Circular Queue",
    desc: "Buffer circulaire à taille fixe. Front et rear avec modulo.",
    color: "text-purple-500",
    border: "border-purple-500/30",
  },
  {
    name: "Priority Queue",
    desc: "Queue avec priorité. Implémentée via Heap. Extract en O(log n).",
    color: "text-orange-500",
    border: "border-orange-500/30",
  },
  {
    name: "Deque (Double-ended)",
    desc: "Insertion/suppression aux deux extrémités en O(1).",
    color: "text-pink-500",
    border: "border-pink-500/30",
  },
  {
    name: "Two Stacks Queue",
    desc: "Queue avec 2 stacks : amortized O(1) pour toutes les opérations.",
    color: "text-teal-500",
    border: "border-teal-500/30",
  },
];

export default function StacksQueuesPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-teal-500/10 text-teal-500">
          <Layers className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent">
          Piles & Files
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Stack (LIFO) et Queue (FIFO) — structures linéaires fondamentales.
          Simples, omniprésentes, et essentielles en algorithmique.
        </p>
      </section>

      {/* Interactive Visualizers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StackVisualizer />
        <QueueVisualizer />
      </div>

      {/* Stack Interview Problems */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-blue-500">
          <Zap className="w-6 h-6" />
          Stack — Problèmes d&apos;Entretien
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stackProblems.map((p) => (
            <Card
              key={p.name}
              className="p-4 border-blue-500/20 hover:border-blue-500/40 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">{p.name}</h3>
                <Badge
                  variant="outline"
                  className={`text-[10px] ${p.difficulty === "Easy" ? "text-green-500" : p.difficulty === "Medium" ? "text-amber-500" : "text-red-500"}`}
                >
                  {p.difficulty}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{p.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Queue Interview Problems */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-green-500">
          <Zap className="w-6 h-6" />
          Queue — Problèmes d&apos;Entretien
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {queueProblems.map((p) => (
            <Card
              key={p.name}
              className="p-4 border-green-500/20 hover:border-green-500/40 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">{p.name}</h3>
                <Badge
                  variant="outline"
                  className={`text-[10px] ${p.difficulty === "Easy" ? "text-green-500" : p.difficulty === "Medium" ? "text-amber-500" : "text-red-500"}`}
                >
                  {p.difficulty}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{p.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Advanced Variants */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Variantes Avancées</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {advancedVariants.map((v) => (
            <Card key={v.name} className={`p-5 ${v.border}`}>
              <h3 className={`font-bold ${v.color} mb-1`}>{v.name}</h3>
              <p className="text-sm text-muted-foreground">{v.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Implementation */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Code2 className="w-6 h-6 text-primary" />
          Implémentations
        </h2>
        <Card className="border-border/40">
          <pre className="p-4 overflow-x-auto text-xs bg-muted/30 rounded-lg" tabIndex={0}>
            <code>{`// Monotonic Stack — Next Greater Element
function nextGreater(arr: number[]): number[] {
  const result = new Array(arr.length).fill(-1);
  const stack: number[] = []; // indices
  for (let i = 0; i < arr.length; i++) {
    while (stack.length > 0 && arr[stack[stack.length - 1]] < arr[i]) {
      result[stack.pop()!] = arr[i];
    }
    stack.push(i);
  }
  return result;
}

// Queue with 2 Stacks — Amortized O(1)
class QueueWith2Stacks<T> {
  private pushStack: T[] = [];
  private popStack: T[] = [];

  enqueue(val: T): void { this.pushStack.push(val); }

  dequeue(): T | undefined {
    if (this.popStack.length === 0) {
      while (this.pushStack.length > 0) {
        this.popStack.push(this.pushStack.pop()!);
      }
    }
    return this.popStack.pop();
  }

  get size(): number { return this.pushStack.length + this.popStack.length; }
}

// Circular Queue
class CircularQueue<T> {
  private queue: (T | undefined)[];
  private front = 0;
  private rear = -1;
  private count = 0;

  constructor(private capacity: number) {
    this.queue = new Array(capacity);
  }

  enqueue(val: T): boolean {
    if (this.count === this.capacity) return false;
    this.rear = (this.rear + 1) % this.capacity;
    this.queue[this.rear] = val;
    this.count++;
    return true;
  }

  dequeue(): T | undefined {
    if (this.count === 0) return undefined;
    const val = this.queue[this.front];
    this.front = (this.front + 1) % this.capacity;
    this.count--;
    return val;
  }
}`}</code>
          </pre>
        </Card>
      </section>
    </div>
  );
}
