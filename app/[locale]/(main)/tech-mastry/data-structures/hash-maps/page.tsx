import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Hash } from "lucide-react";

export const metadata: Metadata = {
  title: "Hash Maps | Structures de Données",
  description: "Tables de hachage, collisions, load factor et implémentation des hash maps",
};

const operations = [
  { op: "get(key)", avg: "O(1)", worst: "O(n)", desc: "Recherche par clé" },
  { op: "set(key, val)", avg: "O(1)", worst: "O(n)", desc: "Insertion / mise à jour" },
  { op: "delete(key)", avg: "O(1)", worst: "O(n)", desc: "Suppression" },
  { op: "has(key)", avg: "O(1)", worst: "O(n)", desc: "Vérification d'existence" },
];

const collisionStrategies = [
  {
    name: "Chaînage (Chaining)",
    desc: "Chaque bucket contient une liste chaînée. Nouvelle entrée ajoutée en tête de liste en cas de collision.",
    pros: ["Simple à implémenter", "Supporte un load factor > 1", "Suppression facile"],
    cons: ["Cache-unfriendly (pointeurs)", "Mémoire supplémentaire pour les listes"],
  },
  {
    name: "Adressage Ouvert (Open Addressing)",
    desc: "En cas de collision, probe le prochain slot libre. Types : Linear probing, Quadratic probing, Double hashing.",
    pros: ["Cache-friendly", "Pas de pointeurs supplémentaires", "Bon pour les petites tables"],
    cons: ["Clustering", "Load factor doit rester < 0.7", "Suppression complexe (tombstones)"],
  },
];

export default function HashMapsPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-amber-500/10 text-amber-500">
          <Hash className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Hash Maps</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tables de hachage : la structure de données la plus utilisée.
            Accès en O(1) moyen, gestion des collisions et optimisations.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Complexité des Opérations</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold">Opération</th>
                <th className="text-left py-3 px-4 font-semibold">Moyenne</th>
                <th className="text-left py-3 px-4 font-semibold">Pire cas</th>
                <th className="text-left py-3 px-4 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              {operations.map((o) => (
                <tr key={o.op} className="border-b border-border/40">
                  <td className="py-3 px-4 font-mono text-primary">{o.op}</td>
                  <td className="py-3 px-4"><Badge className="bg-green-500/10 text-green-500">{o.avg}</Badge></td>
                  <td className="py-3 px-4"><Badge className="bg-red-500/10 text-red-500">{o.worst}</Badge></td>
                  <td className="py-3 px-4 text-muted-foreground">{o.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Gestion des Collisions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {collisionStrategies.map((s) => (
            <Card key={s.name} className="p-6 space-y-3 border-border/40">
              <h3 className="font-semibold text-lg">{s.name}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  {s.pros.map((p) => <p key={p} className="text-xs text-muted-foreground">✅ {p}</p>)}
                </div>
                <div>
                  {s.cons.map((c) => <p key={c} className="text-xs text-muted-foreground">⚠️ {c}</p>)}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-3xl font-bold">Implémentation TypeScript</h2>
        <pre className="bg-muted/50 rounded-lg p-4 overflow-x-auto text-sm">
          <code>{`class HashMap<K, V> {
  private buckets: Array<Array<[K, V]>>;
  private size: number = 0;
  private capacity: number;

  constructor(capacity = 16) {
    this.capacity = capacity;
    this.buckets = new Array(capacity).fill(null).map(() => []);
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
    const idx = this.hash(key);
    const bucket = this.buckets[idx];
    const existing = bucket.findIndex(([k]) => k === key);
    if (existing !== -1) {
      bucket[existing] = [key, value]; // Update
    } else {
      bucket.push([key, value]); // Insert
      this.size++;
      if (this.size / this.capacity > 0.75) this.resize();
    }
  }

  get(key: K): V | undefined {
    const idx = this.hash(key);
    const pair = this.buckets[idx].find(([k]) => k === key);
    return pair?.[1];
  }
}`}</code>
        </pre>
      </section>
    </main>
  );
}
