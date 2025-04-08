import { Layout } from "lucide-react";

export function FrontendHero() {
  return (
    <section className="text-center space-y-6">
      <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-green-500/10 text-green-500">
        <Layout className="w-8 h-8" />
      </div>
      
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Frontend Development
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Maîtrisez les concepts modernes du développement frontend et les meilleures pratiques React.
        </p>
      </div>
    </section>
  );
}
