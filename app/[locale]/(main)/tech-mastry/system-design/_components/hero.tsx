import { Network } from "lucide-react";

export function SystemDesignHero() {
  return (
    <section className="text-center space-y-6">
      <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-purple-500/10 text-purple-500">
        <Network className="w-8 h-8" />
      </div>
      
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          System Design
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Apprenez à concevoir des systèmes évolutifs, résilients et performants à grande échelle.
        </p>
      </div>
    </section>
  );
}
