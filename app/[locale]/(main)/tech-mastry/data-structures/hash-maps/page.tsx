"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Hash, RotateCcw, Eye, Zap, Code2 } from "lucide-react";

/* ─── Interactive Hash Table Visualizer ─── */
function HashTableVisualizer() {
  const BUCKET_COUNT = 8;
  const [buckets, setBuckets] = useState<Array<Array<[string, string]>>>(() =>
    new Array(BUCKET_COUNT).fill(null).map(() => []),
  );
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [highlightBucket, setHighlightBucket] = useState<number | null>(null);
  const [message, setMessage] = useState(
    "Entrez une clé et une valeur pour insérer",
  );
  const [collisionCount, setCollisionCount] = useState(0);

  const hash = (k: string): number => {
    let h = 0;
    for (let i = 0; i < k.length; i++) {
      h = (h * 31 + k.charCodeAt(i)) % BUCKET_COUNT;
    }
    return h;
  };

  const insert = () => {
    if (!key.trim()) return;
    const idx = hash(key);
    const newBuckets = buckets.map((b) => [...b]);
    const existing = newBuckets[idx].findIndex(([k]) => k === key);
    if (existing !== -1) {
      newBuckets[idx][existing] = [key, value || "(vide)"];
      setMessage(`Mise à jour : "${key}" au bucket ${idx}`);
    } else {
      if (newBuckets[idx].length > 0) {
        setCollisionCount((c) => c + 1);
        setMessage(
          `Collision ! "${key}" hashé au bucket ${idx} (${newBuckets[idx].length} élément(s) déjà). Chaînage appliqué.`,
        );
      } else {
        setMessage(`"${key}" → hash = ${idx}. Aucune collision.`);
      }
      newBuckets[idx].push([key, value || "(vide)"]);
    }
    setBuckets(newBuckets);
    setHighlightBucket(idx);
    setKey("");
    setValue("");
  };

  const lookup = () => {
    if (!key.trim()) return;
    const idx = hash(key);
    setHighlightBucket(idx);
    const found = buckets[idx].find(([k]) => k === key);
    if (found) {
      setMessage(`get("${key}") → "${found[1]}" (bucket ${idx}) — O(1) moyen`);
    } else {
      setMessage(`"${key}" non trouvé dans le bucket ${idx}`);
    }
  };

  const remove = () => {
    if (!key.trim()) return;
    const idx = hash(key);
    const newBuckets = buckets.map((b) => [...b]);
    const before = newBuckets[idx].length;
    newBuckets[idx] = newBuckets[idx].filter(([k]) => k !== key);
    if (newBuckets[idx].length < before) {
      setBuckets(newBuckets);
      setHighlightBucket(idx);
      setMessage(`delete("${key}") — supprimé du bucket ${idx}`);
    } else {
      setMessage(`"${key}" non trouvé pour suppression`);
    }
    setKey("");
  };

  const reset = () => {
    setBuckets(new Array(BUCKET_COUNT).fill(null).map(() => []));
    setHighlightBucket(null);
    setCollisionCount(0);
    setMessage("Table réinitialisée");
  };

  const totalEntries = buckets.reduce((sum, b) => sum + b.length, 0);
  const loadFactor = (totalEntries / BUCKET_COUNT).toFixed(2);

  return (
    <Card className="p-6 space-y-6 border-amber-500/20">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Eye className="w-5 h-5 text-amber-500" />
          Hash Table Interactive ({BUCKET_COUNT} buckets)
        </h3>
        <div className="flex items-center gap-3 text-xs">
          <span>
            Load Factor :{" "}
            <strong
              className={
                Number(loadFactor) > 0.75 ? "text-red-500" : "text-green-500"
              }
            >
              {loadFactor}
            </strong>
          </span>
          <span>
            Collisions :{" "}
            <strong className="text-orange-500">{collisionCount}</strong>
          </span>
          <button
            onClick={reset}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Buckets visualization */}
      <div className="space-y-1.5">
        {buckets.map((bucket, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 rounded-lg p-2 transition-all ${highlightBucket === i ? "bg-amber-500/10 ring-1 ring-amber-500/50" : ""}`}
          >
            <div className="w-8 h-8 rounded bg-muted/60 flex items-center justify-center text-xs font-mono font-bold shrink-0">
              {i}
            </div>
            <div className="flex-1 flex gap-1.5 overflow-x-auto">
              {bucket.length === 0 ? (
                <span className="text-xs text-muted-foreground italic">
                  vide
                </span>
              ) : (
                bucket.map(([k, v], j) => (
                  <div
                    key={`${k}-${j}`}
                    className="flex items-center gap-0.5 shrink-0"
                  >
                    {j > 0 && (
                      <span className="text-muted-foreground text-xs">→</span>
                    )}
                    <div className="px-2 py-1 rounded bg-primary/10 text-xs">
                      <span className="font-mono text-primary">{k}</span>
                      <span className="text-muted-foreground">: {v}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm text-center text-muted-foreground bg-muted/30 rounded-lg py-2 px-3">
        {message}
      </p>

      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <input
          type="text"
          placeholder="Clé"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && insert()}
          className="px-3 py-2 rounded-lg border border-border bg-background text-sm flex-1 min-w-[100px]"
        />
        <input
          type="text"
          placeholder="Valeur"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && insert()}
          className="px-3 py-2 rounded-lg border border-border bg-background text-sm flex-1 min-w-[100px]"
        />
        <button
          onClick={insert}
          className="px-3 py-2 rounded-lg text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/30 hover:scale-105 transition-all"
        >
          set()
        </button>
        <button
          onClick={lookup}
          className="px-3 py-2 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/30 hover:scale-105 transition-all"
        >
          get()
        </button>
        <button
          onClick={remove}
          className="px-3 py-2 rounded-lg text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/30 hover:scale-105 transition-all"
        >
          delete()
        </button>
      </div>
    </Card>
  );
}

/* ─── Data ─── */
const operations = [
  { op: "get(key)", avg: "O(1)", worst: "O(n)", desc: "Recherche par clé" },
  {
    op: "set(key, val)",
    avg: "O(1)",
    worst: "O(n)",
    desc: "Insertion / mise à jour",
  },
  { op: "delete(key)", avg: "O(1)", worst: "O(n)", desc: "Suppression" },
  {
    op: "has(key)",
    avg: "O(1)",
    worst: "O(n)",
    desc: "Vérification existence",
  },
  {
    op: "keys() / values()",
    avg: "O(n)",
    worst: "O(n)",
    desc: "Itération complète",
  },
];

const collisionStrategies = [
  {
    name: "Chaînage (Chaining)",
    desc: "Chaque bucket contient une liste chaînée. Nouvelle entrée ajoutée en tête de liste en cas de collision.",
    pros: [
      "Simple à implémenter",
      "Supporte load factor > 1",
      "Suppression facile",
    ],
    cons: ["Cache-unfriendly", "Mémoire supplémentaire", "Pointeurs overhead"],
    color: "border-blue-500/30",
    titleColor: "text-blue-500",
  },
  {
    name: "Adressage Ouvert",
    desc: "En cas de collision, probing du slot suivant. Linear probing, Quadratic probing, Double hashing.",
    pros: [
      "Cache-friendly",
      "Pas de pointeurs supplémentaires",
      "Bon pour petites tables",
    ],
    cons: [
      "Clustering possible",
      "Load factor < 0.7-0.8",
      "Suppression complexe (tombstones)",
    ],
    color: "border-green-500/30",
    titleColor: "text-green-500",
  },
  {
    name: "Robin Hood Hashing",
    desc: "Variante open addressing : les éléments proches de leur bucket idéal cèdent leur place.",
    pros: ["Distribution uniforme", "Lookup plus rapide", "Variance réduite"],
    cons: ["Implémentation complexe", "Échanges fréquents", "Moins populaire"],
    color: "border-purple-500/30",
    titleColor: "text-purple-500",
  },
];

const interviewProblems = [
  {
    name: "Two Sum",
    desc: "HashMap pour stocker les compléments. O(n).",
    difficulty: "Easy",
  },
  {
    name: "Group Anagrams",
    desc: "Clé = tri de la chaîne ou comptage de fréquences.",
    difficulty: "Medium",
  },
  {
    name: "LRU Cache",
    desc: "HashMap + Doubly Linked List. get/put en O(1).",
    difficulty: "Medium",
  },
  {
    name: "Subarray Sum = K",
    desc: "Prefix sum + HashMap des sommes vues.",
    difficulty: "Medium",
  },
  {
    name: "Longest Consecutive",
    desc: "HashSet + expansion dans les deux sens.",
    difficulty: "Medium",
  },
  {
    name: "First Unique Char",
    desc: "Comptage de fréquences en un passage.",
    difficulty: "Easy",
  },
];

export default function HashMapsPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-amber-500/10 text-amber-500">
          <Hash className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
          Hash Maps & Hash Sets
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          La structure de données la plus utilisée : accès moyen en O(1),
          gestion des collisions et optimisations du load factor.
        </p>
      </section>

      {/* Interactive Visualizer */}
      <HashTableVisualizer />

      {/* Complexity */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Complexité des Opérations</h2>
        <Card className="overflow-x-auto border-border/40">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left py-3 px-4 font-semibold">Opération</th>
                <th className="text-left py-3 px-4 font-semibold">Moyenne</th>
                <th className="text-left py-3 px-4 font-semibold">Pire cas</th>
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
                    <Badge className="bg-green-500/10 text-green-500 text-xs">
                      {o.avg}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-4">
                    <Badge className="bg-red-500/10 text-red-500 text-xs">
                      {o.worst}
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

      {/* Collision Strategies */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">
          Stratégies de Gestion des Collisions
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {collisionStrategies.map((s) => (
            <Card key={s.name} className={`p-5 space-y-3 ${s.color}`}>
              <h3 className={`font-bold ${s.titleColor}`}>{s.name}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
              <div className="space-y-1.5">
                {s.pros.map((p) => (
                  <p key={p} className="text-xs text-green-500">
                    + {p}
                  </p>
                ))}
                {s.cons.map((c) => (
                  <p key={c} className="text-xs text-red-400">
                    - {c}
                  </p>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Interview Problems */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="w-6 h-6 text-primary" />
          Problèmes d&apos;Entretien
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {interviewProblems.map((p) => (
            <Card
              key={p.name}
              className="p-4 border-border/40 hover:border-primary/30 transition-all"
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

      {/* Implementation */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Code2 className="w-6 h-6 text-primary" />
          Implémentation TypeScript
        </h2>
        <Card className="border-border/40">
          <pre className="p-4 overflow-x-auto text-xs bg-muted/30 rounded-lg">
            <code>{`class HashMap<K, V> {
  private buckets: Array<Array<[K, V]>>;
  private size = 0;
  private capacity: number;

  constructor(capacity = 16) {
    this.capacity = capacity;
    this.buckets = Array.from({ length: capacity }, () => []);
  }

  private hash(key: K): number {
    const str = String(key);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) % this.capacity;
    }
    return hash;
  }

  set(key: K, value: V): void {
    if (this.size / this.capacity > 0.75) this.resize();
    const idx = this.hash(key);
    const existing = this.buckets[idx].findIndex(([k]) => k === key);
    if (existing !== -1) {
      this.buckets[idx][existing] = [key, value];
    } else {
      this.buckets[idx].push([key, value]);
      this.size++;
    }
  }

  get(key: K): V | undefined {
    const pair = this.buckets[this.hash(key)].find(([k]) => k === key);
    return pair?.[1];
  }

  delete(key: K): boolean {
    const idx = this.hash(key);
    const i = this.buckets[idx].findIndex(([k]) => k === key);
    if (i === -1) return false;
    this.buckets[idx].splice(i, 1);
    this.size--;
    return true;
  }

  private resize(): void {
    const old = this.buckets;
    this.capacity *= 2;
    this.buckets = Array.from({ length: this.capacity }, () => []);
    this.size = 0;
    for (const bucket of old)
      for (const [k, v] of bucket) this.set(k, v);
  }
}`}</code>
          </pre>
        </Card>
      </section>
    </main>
  );
}
