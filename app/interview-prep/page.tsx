import { Metadata } from "next";
import { InterviewPrepHero } from "./_components/hero";
import { PracticeSections } from "./_components/practice-sections";

export const metadata: Metadata = {
  title: "Préparation aux Entretiens Techniques",
  description:
    "Guide complet de préparation aux entretiens techniques : algorithmes, structures de données, systèmes distribués et bonnes pratiques.",
};

export default function InterviewPrepPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <InterviewPrepHero />
      <PracticeSections />
    </main>
  );
}
