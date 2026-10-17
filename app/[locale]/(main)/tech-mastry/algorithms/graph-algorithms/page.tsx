import type { Metadata } from "next";
import { GraphAlgorithmsGuide } from "./_components/graph-algorithms-guide";

export const metadata: Metadata = {
  title: "Algorithmes de Graphes | Tech-Mastry",
  description: "BFS, DFS, Dijkstra, Bellman-Ford, tri topologique et algorithmes de graphes essentiels pour les entretiens.",
};

export default function GraphAlgorithmsPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-indigo-500/20 to-blue-500/20 mb-2">
          <span className="text-3xl">🕸️</span>
        </div>
        <h1 className="text-4xl font-bold">Algorithmes de Graphes</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Parcours, plus courts chemins, détection de cycles et algorithmes fondamentaux
          sur les graphes — les favoris des entretiens techniques.
        </p>
      </div>
      <GraphAlgorithmsGuide />
    </div>
  );
}
