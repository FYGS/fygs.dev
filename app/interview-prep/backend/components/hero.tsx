import { Database } from "lucide-react";

export function BackendHero() {
  return (
    <section className="text-center space-y-6">
      <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-orange-500/10 text-orange-500">
        <Database className="w-8 h-8" />
      </div>
      
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Backend Development
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Explorez les concepts clés du développement backend et les meilleures pratiques d'architecture.
        </p>
      </div>
    </section>
  );
}
