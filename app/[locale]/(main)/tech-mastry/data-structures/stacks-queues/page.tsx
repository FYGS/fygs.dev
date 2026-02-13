import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers } from "lucide-react";

export const metadata: Metadata = {
  title: "Piles & Files | Structures de Données",
  description: "Stack (LIFO), Queue (FIFO), Deque et leurs applications en algorithmique",
};

const stackOps = [
  { op: "push", complexity: "O(1)", desc: "Ajouter au sommet" },
  { op: "pop", complexity: "O(1)", desc: "Retirer du sommet" },
  { op: "peek", complexity: "O(1)", desc: "Voir le sommet sans retirer" },
  { op: "isEmpty", complexity: "O(1)", desc: "Vérifier si vide" },
];

const queueOps = [
  { op: "enqueue", complexity: "O(1)", desc: "Ajouter à la fin" },
  { op: "dequeue", complexity: "O(1)", desc: "Retirer du début" },
  { op: "front", complexity: "O(1)", desc: "Voir le premier élément" },
  { op: "isEmpty", complexity: "O(1)", desc: "Vérifier si vide" },
];

const stackUses = [
  "Call stack : gestion des appels de fonctions",
  "Undo/Redo : historique des actions",
  "Parenthèses balancées : validation d'expressions",
  "DFS (Depth-First Search) : parcours de graphe",
  "Évaluation d'expressions postfixées (RPN)",
  "Backtracking : exploration puis retour",
];

const queueUses = [
  "BFS (Breadth-First Search) : parcours de graphe",
  "Task scheduling : planification de tâches",
  "Message queues (Kafka, RabbitMQ)",
  "Rate limiting : fenêtre glissante",
  "Print queue : ordre d'impression",
  "Cache eviction (FIFO policy)",
];

export default function StacksQueuesPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-teal-500/10 text-teal-500">
          <Layers className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Piles & Files</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stack (LIFO) et Queue (FIFO) : les structures linéaires fondamentales.
            Simples mais omniprésentes en algorithmique.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Stack */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-blue-500">Stack (LIFO)</h2>
          <p className="text-muted-foreground">Last In, First Out. Comme une pile d&apos;assiettes.</p>

          <div className="space-y-2">
            {stackOps.map((o) => (
              <Card key={o.op} className="p-3 border-blue-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <code className="text-primary font-mono text-sm">{o.op}</code>
                  <span className="text-xs text-muted-foreground">{o.desc}</span>
                </div>
                <Badge className="bg-green-500/10 text-green-500 text-xs">{o.complexity}</Badge>
              </Card>
            ))}
          </div>

          <Card className="p-4 border-blue-500/20">
            <h3 className="font-semibold text-sm mb-2">Applications</h3>
            <ul className="space-y-1">
              {stackUses.map((u) => (
                <li key={u} className="text-xs text-muted-foreground">→ {u}</li>
              ))}
            </ul>
          </Card>
        </section>

        {/* Queue */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-green-500">Queue (FIFO)</h2>
          <p className="text-muted-foreground">First In, First Out. Comme une file d&apos;attente.</p>

          <div className="space-y-2">
            {queueOps.map((o) => (
              <Card key={o.op} className="p-3 border-green-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <code className="text-primary font-mono text-sm">{o.op}</code>
                  <span className="text-xs text-muted-foreground">{o.desc}</span>
                </div>
                <Badge className="bg-green-500/10 text-green-500 text-xs">{o.complexity}</Badge>
              </Card>
            ))}
          </div>

          <Card className="p-4 border-green-500/20">
            <h3 className="font-semibold text-sm mb-2">Applications</h3>
            <ul className="space-y-1">
              {queueUses.map((u) => (
                <li key={u} className="text-xs text-muted-foreground">→ {u}</li>
              ))}
            </ul>
          </Card>
        </section>
      </div>

      <section className="space-y-4">
        <h2 className="text-3xl font-bold">Variantes Avancées</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5 border-border/40">
            <h3 className="font-semibold text-purple-500">Deque</h3>
            <p className="text-sm text-muted-foreground mt-1">Double-ended queue. Insertion/suppression aux deux extrémités en O(1). Sliding window maximum.</p>
          </Card>
          <Card className="p-5 border-border/40">
            <h3 className="font-semibold text-orange-500">Priority Queue</h3>
            <p className="text-sm text-muted-foreground mt-1">Queue avec priorité. Implémentée via un Heap. Extraction du min/max en O(log n).</p>
          </Card>
          <Card className="p-5 border-border/40">
            <h3 className="font-semibold text-red-500">Circular Queue</h3>
            <p className="text-sm text-muted-foreground mt-1">Queue circulaire avec taille fixe. Buffer circulaire. Réutilise les espaces libérés.</p>
          </Card>
        </div>
      </section>
    </main>
  );
}
