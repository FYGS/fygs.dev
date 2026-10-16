"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Code2,
  Play,
  RotateCcw,
  Zap,
  BookOpen,
  ArrowRight,
  Eye,
} from "lucide-react";

/* ─── Array Visualizer ─── */
function ArrayVisualizer() {
  const [arr, setArr] = useState([3, 7, 1, 9, 4, 6, 2, 8, 5]);
  const [highlights, setHighlights] = useState<number[]>([]);
  const [message, setMessage] = useState(
    "Cliquez sur une opération pour visualiser",
  );
  const [sorting, setSorting] = useState(false);

  const reset = () => {
    setArr([3, 7, 1, 9, 4, 6, 2, 8, 5]);
    setHighlights([]);
    setMessage("Tableau réinitialisé");
  };

  const accessElement = () => {
    const idx = Math.floor(Math.random() * arr.length);
    setHighlights([idx]);
    setMessage(
      `Accès arr[${idx}] = ${arr[idx]} — O(1) : accès constant par index`,
    );
  };

  const pushElement = () => {
    const val = Math.floor(Math.random() * 20) + 1;
    const newArr = [...arr, val];
    setArr(newArr);
    setHighlights([newArr.length - 1]);
    setMessage(`push(${val}) — O(1) amorti : ajout en fin de tableau`);
  };

  const unshiftElement = () => {
    const val = Math.floor(Math.random() * 20) + 1;
    const newArr = [val, ...arr];
    setArr(newArr);
    setHighlights(arr.map((_, i) => i));
    setMessage(
      `unshift(${val}) — O(n) : tous les éléments décalés vers la droite`,
    );
  };

  const popElement = () => {
    if (arr.length === 0) return;
    const removed = arr[arr.length - 1];
    setArr(arr.slice(0, -1));
    setHighlights([]);
    setMessage(`pop() → ${removed} — O(1) : retrait en fin`);
  };

  const linearSearch = () => {
    const target = arr[Math.floor(Math.random() * arr.length)];
    const idx = arr.indexOf(target);
    const visited = Array.from({ length: idx + 1 }, (_, i) => i);
    setHighlights(visited);
    setMessage(
      `Recherche de ${target} : trouvé à l'index ${idx} après ${idx + 1} comparaison(s) — O(n)`,
    );
  };

  const bubbleSort = async () => {
    if (sorting) return;
    setSorting(true);
    const a = [...arr];
    for (let i = 0; i < a.length; i++) {
      for (let j = 0; j < a.length - i - 1; j++) {
        setHighlights([j, j + 1]);
        if (a[j] > a[j + 1]) {
          [a[j], a[j + 1]] = [a[j + 1], a[j]];
          setArr([...a]);
        }
        await new Promise((r) => setTimeout(r, 200));
      }
    }
    setHighlights([]);
    setMessage("Bubble Sort terminé — O(n²) comparaisons");
    setSorting(false);
  };

  return (
    <Card className="p-6 space-y-6 border-blue-500/20">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-500" />
          Visualisation Interactive
        </h3>
        <button
          onClick={reset}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          title="Réinitialiser"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
      {/* Visual array */}
      <div className="flex items-end gap-1 justify-center min-h-[120px]">
        {arr.map((val, i) => (
          <div key={`${i}-${val}`} className="flex flex-col items-center gap-1">
            <div
              className={`w-10 rounded-t-md flex items-center justify-center text-xs font-mono font-bold transition-all duration-300
                ${highlights.includes(i) ? "bg-blue-500 text-white" : "bg-muted/80 text-foreground"}`}
              style={{ height: `${val * 10 + 20}px` }}
            >
              {val}
            </div>
            <span className="text-[10px] text-muted-foreground">{i}</span>
          </div>
        ))}
      </div>
      {/* Message */}
      <p className="text-sm text-center text-muted-foreground bg-muted/30 rounded-lg py-2 px-3">
        {message}
      </p>
      {/* Controls */}
      <div className="flex flex-wrap gap-2 justify-center">
        {[
          {
            label: "Accès O(1)",
            fn: accessElement,
            color: "bg-green-500/10 text-green-500 border-green-500/30",
          },
          {
            label: "push() O(1)",
            fn: pushElement,
            color: "bg-blue-500/10 text-blue-500 border-blue-500/30",
          },
          {
            label: "unshift() O(n)",
            fn: unshiftElement,
            color: "bg-orange-500/10 text-orange-500 border-orange-500/30",
          },
          {
            label: "pop() O(1)",
            fn: popElement,
            color: "bg-red-500/10 text-red-500 border-red-500/30",
          },
          {
            label: "Recherche O(n)",
            fn: linearSearch,
            color: "bg-purple-500/10 text-purple-500 border-purple-500/30",
          },
          {
            label: "Bubble Sort",
            fn: bubbleSort,
            color: "bg-amber-500/10 text-amber-500 border-amber-500/30",
          },
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={btn.fn}
            disabled={sorting && btn.label !== "Bubble Sort"}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:scale-105 disabled:opacity-50 ${btn.color}`}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </Card>
  );
}

/* ─── Two Pointers Visualizer ─── */
function TwoPointersVisualizer() {
  const sorted = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11];
  const [target, setTarget] = useState(10);
  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(sorted.length - 1);
  const [found, setFound] = useState<[number, number] | null>(null);
  const [step, setStep] = useState(0);

  const reset = () => {
    setLeft(0);
    setRight(sorted.length - 1);
    setFound(null);
    setStep(0);
  };

  const nextStep = () => {
    if (found || left >= right) return;
    const sum = sorted[left] + sorted[right];
    if (sum === target) {
      setFound([left, right]);
    } else if (sum < target) {
      setLeft(left + 1);
    } else {
      setRight(right - 1);
    }
    setStep(step + 1);
  };

  return (
    <Card className="p-6 space-y-5 border-green-500/20">
      <h3 className="text-lg font-bold flex items-center gap-2">
        <ArrowRight className="w-5 h-5 text-green-500" />
        Two Pointers — Two Sum (tableau trié)
      </h3>
      <div className="flex items-center gap-3 text-sm">
        <span className="text-muted-foreground">Cible :</span>
        <input
          type="number"
          value={target}
          onChange={(e) => {
            setTarget(Number(e.target.value));
            reset();
          }}
          className="w-16 px-2 py-1 rounded border border-border bg-background text-center text-sm"
        />
      </div>
      <div className="flex gap-1 justify-center">
        {sorted.map((val, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            {i === left && (
              <span className="text-[10px] text-green-500 font-bold">L</span>
            )}
            {i === right && (
              <span className="text-[10px] text-blue-500 font-bold">R</span>
            )}
            {i !== left && i !== right && (
              <span className="text-[10px] invisible">·</span>
            )}
            <div
              className={`w-10 h-10 rounded-md flex items-center justify-center text-sm font-mono font-bold transition-all
                ${
                  found && (i === found[0] || i === found[1])
                    ? "bg-green-500 text-white ring-2 ring-green-400"
                    : i === left
                      ? "bg-green-500/20 text-green-500 ring-1 ring-green-500/50"
                      : i === right
                        ? "bg-blue-500/20 text-blue-500 ring-1 ring-blue-500/50"
                        : "bg-muted/60 text-foreground"
                }`}
            >
              {val}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={reset}
          className="px-3 py-1.5 rounded-full text-xs font-medium border border-border/40 hover:bg-muted transition-all"
        >
          <RotateCcw className="w-3 h-3 inline mr-1" />
          Reset
        </button>
        <button
          onClick={nextStep}
          disabled={!!found || left >= right}
          className="px-4 py-1.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/30 hover:scale-105 transition-all disabled:opacity-50"
        >
          <Play className="w-3 h-3 inline mr-1" />
          Étape {step + 1}
        </button>
      </div>
      {found && (
        <p className="text-sm text-center text-green-500 font-medium">
          Trouvé ! arr[{found[0]}] + arr[{found[1]}] = {sorted[found[0]]} +{" "}
          {sorted[found[1]]} = {target} — {step} étape(s)
        </p>
      )}
    </Card>
  );
}

/* ─── Sliding Window Visualizer ─── */
function SlidingWindowVisualizer() {
  const data = [2, 1, 5, 1, 3, 2, 8, 4, 3];
  const [k, setK] = useState(3);
  const [windowStart, setWindowStart] = useState(0);
  const [maxSum, setMaxSum] = useState(0);
  const [currentSum, setCurrentSum] = useState(0);
  const [running, setRunning] = useState(false);

  const reset = () => {
    setWindowStart(0);
    setMaxSum(0);
    setCurrentSum(0);
  };

  const runDemo = async () => {
    if (running) return;
    setRunning(true);
    let ms = 0;
    let cs = 0;
    for (let i = 0; i < k; i++) cs += data[i];
    ms = cs;
    setCurrentSum(cs);
    setMaxSum(ms);
    setWindowStart(0);
    await new Promise((r) => setTimeout(r, 600));
    for (let i = k; i < data.length; i++) {
      cs = cs - data[i - k] + data[i];
      if (cs > ms) ms = cs;
      setCurrentSum(cs);
      setMaxSum(ms);
      setWindowStart(i - k + 1);
      await new Promise((r) => setTimeout(r, 600));
    }
    setRunning(false);
  };

  return (
    <Card className="p-6 space-y-5 border-purple-500/20">
      <h3 className="text-lg font-bold flex items-center gap-2">
        <Zap className="w-5 h-5 text-purple-500" />
        Sliding Window — Somme Maximale de K éléments
      </h3>
      <div className="flex items-center gap-3 text-sm">
        <span className="text-muted-foreground">Taille fenêtre (k) :</span>
        <input
          type="number"
          min={1}
          max={data.length}
          value={k}
          onChange={(e) => {
            setK(Math.max(1, Math.min(data.length, Number(e.target.value))));
            reset();
          }}
          className="w-16 px-2 py-1 rounded border border-border bg-background text-center text-sm"
        />
      </div>
      <div className="flex gap-1 justify-center">
        {data.map((val, i) => {
          const inWindow = i >= windowStart && i < windowStart + k;
          return (
            <div
              key={i}
              className={`w-10 h-10 rounded-md flex items-center justify-center text-sm font-mono font-bold transition-all
                ${inWindow ? "bg-purple-500 text-white ring-2 ring-purple-400" : "bg-muted/60 text-foreground"}`}
            >
              {val}
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-6 text-sm">
        <span>
          Somme courante :{" "}
          <strong className="text-purple-500">{currentSum}</strong>
        </span>
        <span>
          Max : <strong className="text-green-500">{maxSum}</strong>
        </span>
      </div>
      <div className="flex justify-center">
        <button
          onClick={runDemo}
          disabled={running}
          className="px-4 py-2 rounded-full text-xs font-medium bg-purple-500/10 text-purple-500 border border-purple-500/30 hover:scale-105 transition-all disabled:opacity-50"
        >
          <Play className="w-3 h-3 inline mr-1" />
          {running ? "En cours..." : "Lancer la Démo"}
        </button>
      </div>
    </Card>
  );
}

/* ─── Complexity Table ─── */
const operations = [
  {
    op: "Accès (arr[i])",
    time: "O(1)",
    space: "—",
    note: "Calcul direct d&apos;adresse mémoire",
  },
  { op: "Recherche", time: "O(n)", space: "O(1)", note: "Parcours linéaire" },
  {
    op: "Recherche binaire",
    time: "O(log n)",
    space: "O(1)",
    note: "Tableau trié requis",
  },
  {
    op: "push / pop",
    time: "O(1)*",
    space: "O(1)",
    note: "Amorti — réallocation possible",
  },
  {
    op: "unshift / shift",
    time: "O(n)",
    space: "O(1)",
    note: "Décalage de tous les éléments",
  },
  { op: "splice", time: "O(n)", space: "O(1)", note: "Décalage partiel" },
  {
    op: "sort()",
    time: "O(n log n)",
    space: "O(log n)",
    note: "TimSort en V8",
  },
  {
    op: "map / filter / reduce",
    time: "O(n)",
    space: "O(n)",
    note: "Crée un nouveau tableau",
  },
];

/* ─── Techniques */
const techniques = [
  {
    name: "Two Pointers",
    desc: "Deux pointeurs se déplaçant dans le tableau (vers le centre, même direction). Idéal pour les tableaux triés.",
    examples: [
      "Two Sum (trié)",
      "Remove Duplicates",
      "Container with Most Water",
      "3Sum",
    ],
    complexity: "O(n)",
  },
  {
    name: "Sliding Window",
    desc: "Fenêtre de taille fixe ou variable glissant sur le tableau. Optimise les sous-tableaux contigus.",
    examples: [
      "Max Sum Subarray (k)",
      "Longest Substring Without Repeat",
      "Minimum Window Substring",
    ],
    complexity: "O(n)",
  },
  {
    name: "Prefix Sum",
    desc: "Pré-calcul des sommes cumulées pour répondre aux requêtes de somme de plage en O(1).",
    examples: [
      "Subarray Sum Equals K",
      "Range Sum Query",
      "Product of Array Except Self",
    ],
    complexity: "O(n) pré-calcul + O(1) requête",
  },
  {
    name: "Kadane's Algorithm",
    desc: "Trouve la sous-séquence contiguë de somme maximale en un seul passage.",
    examples: [
      "Maximum Subarray",
      "Max Circular Subarray",
      "Max Product Subarray",
    ],
    complexity: "O(n)",
  },
  {
    name: "Binary Search",
    desc: "Division récursive de l'espace de recherche. Nécessite un tableau trié ou une propriété monotone.",
    examples: [
      "Search Rotated Array",
      "Find Peak Element",
      "Median of Two Sorted Arrays",
    ],
    complexity: "O(log n)",
  },
];

const stringTechniques = [
  {
    name: "Anagrammes",
    desc: "Comptage de fréquences (HashMap) pour comparer.",
    complexity: "O(n)",
  },
  {
    name: "Palindromes",
    desc: "Two pointers du centre ou des extrémités.",
    complexity: "O(n)",
  },
  {
    name: "Pattern matching",
    desc: "KMP, Rabin-Karp, ou Z-algorithm pour la recherche de motifs.",
    complexity: "O(n+m)",
  },
  {
    name: "String builder",
    desc: "Concaténation efficace via tableau + join au lieu de +=.",
    complexity: "O(n)",
  },
];

export default function ArraysPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      {/* Hero */}
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-500/10 text-blue-500">
          <Code2 className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
          Tableaux & Chaînes
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          La structure de données la plus fondamentale. Maîtrisez les
          opérations, les patterns d&apos;entretien et les techniques
          d&apos;optimisation essentielles.
        </p>
      </section>

      {/* Interactive Visualizers */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Play className="w-6 h-6 text-primary" />
          Visualisations Interactives
        </h2>
        <ArrayVisualizer />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TwoPointersVisualizer />
          <SlidingWindowVisualizer />
        </div>
      </section>

      {/* Complexity Table */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Complexité des Opérations</h2>
        <Card className="overflow-x-auto border-border/40">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left py-3 px-4 font-semibold">Opération</th>
                <th className="text-left py-3 px-4 font-semibold">Temps</th>
                <th className="text-left py-3 px-4 font-semibold">Espace</th>
                <th className="text-left py-3 px-4 font-semibold">Note</th>
              </tr>
            </thead>
            <tbody>
              {operations.map((o) => (
                <tr key={o.op} className="border-b border-border/20">
                  <td className="py-2.5 px-4 font-mono text-primary text-xs">
                    {o.op}
                  </td>
                  <td className="py-2.5 px-4">
                    <Badge className="bg-green-500/10 text-green-500 text-xs">
                      {o.time}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-4 text-muted-foreground text-xs">
                    {o.space}
                  </td>
                  <td className="py-2.5 px-4 text-muted-foreground text-xs">
                    {o.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      {/* Techniques d'entretien */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          Techniques d&apos;Entretien
        </h2>
        <div className="space-y-4">
          {techniques.map((t) => (
            <Card
              key={t.name}
              className="p-5 border-border/40 hover:border-primary/30 transition-all"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-2 flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{t.name}</h3>
                    <Badge className="bg-primary/10 text-primary text-xs">
                      {t.complexity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{t.desc}</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {t.examples.map((ex) => (
                      <Badge key={ex} variant="outline" className="text-[10px]">
                        {ex}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* String Techniques */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Techniques sur les Chaînes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stringTechniques.map((t) => (
            <Card key={t.name} className="p-5 border-border/40">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{t.name}</h3>
                <Badge className="bg-primary/10 text-primary text-xs">
                  {t.complexity}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{t.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Implementation */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Implémentations Clés</h2>
        <Card className="p-5 border-border/40 space-y-4">
          <h3 className="font-semibold text-blue-500">Binary Search</h3>
          <pre className="bg-muted/50 rounded-lg p-4 overflow-x-auto text-xs">
            <code>{`function binarySearch(arr: number[], target: number): number {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1; // not found
}

// Kadane's Algorithm — Maximum Subarray Sum
function maxSubarraySum(arr: number[]): number {
  let maxSoFar = arr[0], maxEndingHere = arr[0];
  for (let i = 1; i < arr.length; i++) {
    maxEndingHere = Math.max(arr[i], maxEndingHere + arr[i]);
    maxSoFar = Math.max(maxSoFar, maxEndingHere);
  }
  return maxSoFar;
}

// Prefix Sum — Range Query
function buildPrefixSum(arr: number[]): number[] {
  const prefix = [0];
  for (let i = 0; i < arr.length; i++) {
    prefix.push(prefix[i] + arr[i]);
  }
  return prefix;
  // rangeSum(l, r) = prefix[r+1] - prefix[l]
}`}</code>
          </pre>
        </Card>
      </section>
    </div>
  );
}
