import { Metadata } from "next";
import { InterviewGuide } from "./_components/interview-guide";
import { UserCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Conseils d'Entretien | TechMastry",
  description: "Méthode STAR, présentation technique et checklist pour réussir vos entretiens",
};

export default function InterviewTipsPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-purple-500/10 text-purple-500">
          <UserCheck className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Conseils d&apos;Entretien</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Préparez-vous avec la méthode STAR, perfectionnez votre présentation
            technique et suivez la checklist complète.
          </p>
        </div>
      </section>
      <InterviewGuide />
    </main>
  );
}
