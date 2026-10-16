import type { Metadata } from "next";
import { BacktrackingGuide } from "./_components/backtracking-guide";

export const metadata: Metadata = {
  title: "Backtracking | Tech-Mastry",
  description: "Guide complet du backtracking : N-Queens, Sudoku solver, permutations, et patterns de résolution systématique.",
};

export default function BacktrackingPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-purple-500/20 to-violet-500/20 mb-2">
          <span className="text-3xl">🔙</span>
        </div>
        <h1 className="text-4xl font-bold">Backtracking</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Explorer systématiquement toutes les possibilités en revenant en arrière
          dès qu&apos;une solution partielle ne peut pas mener à une solution valide.
        </p>
      </div>
      <BacktrackingGuide />
    </div>
  );
}
