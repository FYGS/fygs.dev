import { Badge } from "@/components/ui/badge";

export function ComponentPatternsHero() {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Component Design Patterns
          </h1>
          <Badge variant="outline" className="ml-2">
            Avancé
          </Badge>
        </div>
        <p className="text-muted-foreground text-lg">
          Explorez les patterns de conception avancés pour créer des composants React réutilisables et maintenables
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">
          Compound Components
        </Badge>
        <Badge variant="secondary" className="bg-purple-500/10 text-purple-500">
          Render Props
        </Badge>
        <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500">
          Higher-Order Components
        </Badge>
        <Badge variant="secondary" className="bg-green-500/10 text-green-500">
          Custom Hooks
        </Badge>
        <Badge variant="secondary" className="bg-red-500/10 text-red-500">
          State Reducers
        </Badge>
        <Badge variant="secondary" className="bg-orange-500/10 text-orange-500">
          Controlled Components
        </Badge>
      </div>
    </section>
  );
}
