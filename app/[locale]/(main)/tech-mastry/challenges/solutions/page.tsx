import { ChallengeSolutions } from "./_components/challenge-solutions";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/challenges/solutions");

export default function SolutionsPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
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
    </div>
  );
}
