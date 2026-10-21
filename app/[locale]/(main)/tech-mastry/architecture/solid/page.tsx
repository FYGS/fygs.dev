import { SolidExplorer } from "./_components/solid-explorer";
import { Target } from "lucide-react";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/architecture/solid");

export default function SolidPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-green-500/10 text-green-500">
          <Target className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Principes SOLID
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Les 5 principes fondamentaux de la programmation orientée objet
            pour écrire du code maintenable, extensible et testable.
          </p>
        </div>
      </section>

      <SolidExplorer />
    </div>
  );
}
