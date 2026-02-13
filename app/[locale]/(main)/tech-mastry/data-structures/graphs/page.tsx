import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitFork } from "lucide-react";

export const metadata: Metadata = {
  title: "Graphes | Structures de Données",
  description: "Graphes dirigés et non-dirigés, BFS, DFS, Dijkstra et algorithmes de graphes",
};

const graphTypes = [
  { type: "Non-dirigé", desc: "Arêtes bidirectionnelles. Amitié sur Facebook.", color: "text-blue-500" },
  { type: "Dirigé (Digraph)", desc: "Arêtes unidirectionnelles. Following sur Twitter.", color: "text-green-500" },
  { type: "Pondéré", desc: "Arêtes avec poids/coût. Routes avec distances.", color: "text-purple-500" },
  { type: "Cyclique vs Acyclique", desc: "DAG (Directed Acyclic Graph) : builds, dépendances, topological sort.", color: "text-orange-500" },
];

const algorithms = [
  { name: "BFS (Breadth-First)", complexity: "O(V+E)", use: "Plus court chemin (non-pondéré), level-order traversal" },
  { name: "DFS (Depth-First)", complexity: "O(V+E)", use: "Détection de cycles, topological sort, composantes connexes" },
  { name: "Dijkstra", complexity: "O((V+E) log V)", use: "Plus court chemin (pondéré, positif)" },
  { name: "Bellman-Ford", complexity: "O(V×E)", use: "Plus court chemin (pondéré, négatif autorisé)" },
  { name: "Topological Sort", complexity: "O(V+E)", use: "Ordonnancement de tâches, résolution de dépendances" },
  { name: "Union-Find", complexity: "O(α(n)) ≈ O(1)", use: "Composantes connexes, détection de cycles" },
];

export default function GraphsPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-cyan-500/10 text-cyan-500">
          <GitFork className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Graphes</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            La structure de données la plus flexible. Modélise les réseaux,
            les relations et les dépendances complexes.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Types de Graphes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {graphTypes.map((g) => (
            <Card key={g.type} className="p-5 border-border/40">
              <h3 className={"font-semibold " + g.color}>{g.type}</h3>
              <p className="text-sm text-muted-foreground mt-1">{g.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Algorithmes Essentiels</h2>
        <div className="space-y-3">
          {algorithms.map((a) => (
            <Card key={a.name} className="p-5 border-border/40">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="font-semibold">{a.name}</h3>
                <Badge className="bg-primary/10 text-primary">{a.complexity}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{a.use}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Représentations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-3 border-blue-500/30">
            <h3 className="font-semibold text-blue-500">Liste d&apos;Adjacence</h3>
            <p className="text-sm text-muted-foreground">Espace : O(V+E). Idéal pour les graphes sparse.</p>
            <pre className="bg-muted/30 rounded p-3 text-xs">
              <code>{`const graph = new Map<number, number[]>();
graph.set(0, [1, 2]);
graph.set(1, [2]);
graph.set(2, [0, 3]);
graph.set(3, [3]);`}</code>
            </pre>
          </Card>
          <Card className="p-6 space-y-3 border-green-500/30">
            <h3 className="font-semibold text-green-500">Matrice d&apos;Adjacence</h3>
            <p className="text-sm text-muted-foreground">Espace : O(V²). Idéal pour les graphes dense.</p>
            <pre className="bg-muted/30 rounded p-3 text-xs">
              <code>{`const matrix = [
  [0, 1, 1, 0],  // 0 → 1, 2
  [0, 0, 1, 0],  // 1 → 2
  [1, 0, 0, 1],  // 2 → 0, 3
  [0, 0, 0, 1],  // 3 → 3
];`}</code>
            </pre>
          </Card>
        </div>
      </section>
    </main>
  );
}
