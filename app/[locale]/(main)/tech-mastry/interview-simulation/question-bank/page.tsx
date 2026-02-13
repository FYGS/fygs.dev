import type { Metadata } from "next";
import { QuestionBank } from "./_components/question-bank";

export const metadata: Metadata = {
  title: "Banque de Questions | Tech-Mastry",
  description: "Banque exhaustive de questions d'entretien technique classées par catégorie, difficulté et entreprise.",
};

export default function QuestionBankPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-orange-500/20 to-amber-500/20 mb-2">
          <span className="text-3xl">📚</span>
        </div>
        <h1 className="text-4xl font-bold">Banque de Questions</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Plus de 50 questions d&apos;entretien technique réelles, classées par catégorie,
          difficulté et entreprise cible, avec solutions détaillées.
        </p>
      </div>
      <QuestionBank />
    </main>
  );
}
