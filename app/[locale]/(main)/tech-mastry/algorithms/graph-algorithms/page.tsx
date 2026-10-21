import { GraphAlgorithmsGuide } from "./_components/graph-algorithms-guide";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/algorithms/graph-algorithms");

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
