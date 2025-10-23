import { Code2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ReactBasicsHero() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-500/10 text-blue-500">
          <Code2 className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            React Fondamentaux
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Maîtrisez les concepts essentiels de React pour réussir vos entretiens techniques
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 justify-center">
          <Badge variant="secondary">Hooks</Badge>
          <Badge variant="secondary">Components</Badge>
          <Badge variant="secondary">Props & State</Badge>
          <Badge variant="secondary">Context API</Badge>
          <Badge variant="secondary">Lifecycle</Badge>
        </div>
      </div>
    </section>
  );
}
