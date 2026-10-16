import type { Metadata } from "next";
import { WhiteboardExercises } from "./_components/whiteboard-exercises";

export const metadata: Metadata = {
  title: "Whiteboard Interactif | Tech-Mastry",
  description: "Exercices de design système sur whiteboard : URL shortener, chat system, e-commerce et plus.",
};

export default function WhiteboardPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500/20 to-cyan-500/20 mb-2">
          <span className="text-3xl">🏗️</span>
        </div>
        <h1 className="text-4xl font-bold">Whiteboard Interactif</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Pratiquez les exercices de system design comme en entretien.
          Suivez la méthodologie structurée étape par étape.
        </p>
      </div>
      <WhiteboardExercises />
    </div>
  );
}
