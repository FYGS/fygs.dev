import { Code2 } from "lucide-react";

export function ChallengesHero() {
  return (
    <section className="text-center space-y-6">
      <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-500/10 text-blue-500">
        <Code2 className="w-8 h-8" />
      </div>
      
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Coding Challenges
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Relevez des défis de programmation inspirés d'entretiens techniques réels.
        </p>
      </div>
    </section>
  );
}
