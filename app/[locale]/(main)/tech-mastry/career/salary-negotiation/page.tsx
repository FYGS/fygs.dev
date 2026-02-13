import { Metadata } from "next";
import { NegotiationGuide } from "./_components/negotiation-guide";
import { DollarSign } from "lucide-react";

export const metadata: Metadata = {
  title: "Négociation Salariale | TechMastry",
  description: "Framework de négociation en 5 étapes, scripts et stratégies pour maximiser votre package",
};

export default function SalaryNegotiationPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
          <DollarSign className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Négociation Salariale</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Un framework structuré pour négocier avec confiance et obtenir
            le package que vous méritez.
          </p>
        </div>
      </section>
      <NegotiationGuide />
    </main>
  );
}
