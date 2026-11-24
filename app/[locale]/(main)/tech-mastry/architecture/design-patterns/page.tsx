import { PatternsCatalog } from "./_components/patterns-catalog";
import { Workflow } from "lucide-react";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/architecture/design-patterns");

export default function DesignPatternsPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
          <Workflow className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Design Patterns</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Solutions éprouvées aux problèmes récurrents de conception logicielle.
            Chaque pattern inclut le code TypeScript et des cas d&apos;usage concrets.
          </p>
        </div>
      </section>

      <PatternsCatalog />
    </div>
  );
}
