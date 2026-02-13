import type { Metadata } from "next";
import { ChallengeSolutions } from "./_components/challenge-solutions";

export const metadata: Metadata = {
  title: "Solutions Expliquées | Tech-Mastry",
  description: "Solutions détaillées et expliquées pas à pas des défis de code avec indices progressifs.",
};

export default function SolutionsPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-red-500/20 to-orange-500/20 mb-2">
          <span className="text-3xl">🧩</span>
        </div>
        <h1 className="text-4xl font-bold">Solutions Expliquées</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Chaque défi est décomposé étape par étape avec des indices progressifs
          et des solutions optimales expliquées en détail.
        </p>
      </div>
      <ChallengeSolutions />
    </main>
  );
}
