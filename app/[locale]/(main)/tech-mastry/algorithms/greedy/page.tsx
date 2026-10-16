import type { Metadata } from "next";
import { GreedyGuide } from "./_components/greedy-guide";

export const metadata: Metadata = {
  title: "Algorithmes Gloutons | Tech-Mastry",
  description: "Guide complet des algorithmes gloutons : sélection d'activités, Huffman, Kruskal, et stratégies de résolution.",
};

export default function GreedyPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-amber-500/20 to-yellow-500/20 mb-2">
          <span className="text-3xl">🎯</span>
        </div>
        <h1 className="text-4xl font-bold">Algorithmes Gloutons</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Les algorithmes gloutons font le choix localement optimal à chaque étape
          en espérant atteindre l&apos;optimum global. Maîtrisez cette technique puissante.
        </p>
      </div>
      <GreedyGuide />
    </div>
  );
}
