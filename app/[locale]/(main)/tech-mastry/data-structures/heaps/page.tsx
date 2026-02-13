import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown } from "lucide-react";

export const metadata: Metadata = {
  title: "Heaps (Tas) | Structures de Données",
  description: "Min-heap, max-heap, priority queue et implémentation des tas binaires",
};

const operations = [
  { op: "insert", complexity: "O(log n)", desc: "Insérer un élément et bubble up" },
  { op: "extractMin/Max", complexity: "O(log n)", desc: "Retirer le min/max et heapify" },
  { op: "peek", complexity: "O(1)", desc: "Voir le min/max sans le retirer" },
  { op: "buildHeap", complexity: "O(n)", desc: "Construire un heap depuis un tableau" },
  { op: "heapSort", complexity: "O(n log n)", desc: "Tri par tas (in-place, pas stable)" },
];

const useCases = [
  "Priority Queue : planification de tâches par priorité",
  "Dijkstra : extraire le nœud avec la plus petite distance",
  "Top-K éléments : maintenir les K plus grands/petits en O(n log k)",
  "Median stream : 2 heaps (max-heap + min-heap) pour la médiane en O(log n)",
  "Merge K sorted lists : min-heap avec 1 élément de chaque liste",
  "Huffman coding : construction de l'arbre de compression",
];

export default function HeapsPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-violet-500/10 text-violet-500">
          <ArrowUpDown className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Heaps (Tas)</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Arbre binaire complet avec propriété de tas. Parfait pour les
            priority queues et les algorithmes de sélection.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Opérations</h2>
        <div className="space-y-3">
          {operations.map((o) => (
            <Card key={o.op} className="p-4 border-border/40 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <code className="text-primary font-mono text-sm">{o.op}</code>
                <span className="text-sm text-muted-foreground">{o.desc}</span>
              </div>
              <Badge className="bg-primary/10 text-primary">{o.complexity}</Badge>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Propriétés</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-3 border-green-500/30">
            <h3 className="font-semibold text-green-500">Min-Heap</h3>
            <p className="text-sm text-muted-foreground">Parent ≤ enfants. La racine est le minimum.</p>
            <p className="text-sm text-muted-foreground">Stocké en tableau : parent(i) = floor((i-1)/2), left(i) = 2i+1, right(i) = 2i+2</p>
          </Card>
          <Card className="p-6 space-y-3 border-blue-500/30">
            <h3 className="font-semibold text-blue-500">Max-Heap</h3>
            <p className="text-sm text-muted-foreground">Parent ≥ enfants. La racine est le maximum.</p>
            <p className="text-sm text-muted-foreground">Même formules d&apos;index. Inverser la comparaison.</p>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Cas d&apos;Usage</h2>
        <Card className="p-6 border-border/40">
          <ul className="space-y-2">
            {useCases.map((uc) => (
              <li key={uc} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-0.5">→</span>{uc}
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-3xl font-bold">Implémentation Min-Heap</h2>
        <pre className="bg-muted/50 rounded-lg p-4 overflow-x-auto text-sm">
          <code>{`class MinHeap {
  private heap: number[] = [];

  insert(val: number): void {
    this.heap.push(val);
    this.bubbleUp(this.heap.length - 1);
  }

  extractMin(): number | undefined {
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
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1, right = 2 * i + 2;
      if (left < n && this.heap[left] < this.heap[smallest]) smallest = left;
      if (right < n && this.heap[right] < this.heap[smallest]) smallest = right;
      if (smallest === i) break;
      [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
      i = smallest;
    }
  }
}`}</code>
        </pre>
      </section>
    </main>
  );
}
