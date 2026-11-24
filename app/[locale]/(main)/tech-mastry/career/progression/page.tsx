import { CareerLadder } from "./_components/career-ladder";
import { TrendingUp } from "lucide-react";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/career/progression");

export default function ProgressionPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-500/10 text-blue-500">
          <TrendingUp className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Progression de Carrière</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprenez les attentes à chaque niveau et planifiez votre évolution
            de Junior à Principal Engineer.
          </p>
        </div>
      </section>
      <CareerLadder />
    </div>
  );
}
