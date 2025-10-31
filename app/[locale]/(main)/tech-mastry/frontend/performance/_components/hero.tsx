import { Badge } from "@/components/ui/badge";

export function PerformanceHero() {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Performance & Optimization
          </h1>
          <Badge variant="outline" className="ml-2">
            Avancé
          </Badge>
        </div>
        <p className="text-muted-foreground text-lg">
          Techniques et stratégies pour optimiser les performances des applications React
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">
          Memoization
        </Badge>
        <Badge variant="secondary" className="bg-purple-500/10 text-purple-500">
          Code Splitting
        </Badge>
        <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500">
          Bundle Size
        </Badge>
        <Badge variant="secondary" className="bg-green-500/10 text-green-500">
          Virtualization
        </Badge>
        <Badge variant="secondary" className="bg-red-500/10 text-red-500">
          Rendering Optimization
        </Badge>
        <Badge variant="secondary" className="bg-orange-500/10 text-orange-500">
          Network Optimization
        </Badge>
      </div>
    </section>
  );
}
