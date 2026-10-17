"use client";

import { Card } from "@/components/ui/card";
import { Eye, RotateCcw } from "lucide-react";
import { useState } from "react";

/* ─── Array Visualizer ─── */
export function ArrayVisualizer() {
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
