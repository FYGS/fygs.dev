import { Metadata } from "next";
import { InterviewPrepHero } from "./_components/hero";
import { PracticeSections } from "./_components/practice-sections";

export const metadata: Metadata = {
  title: "TechMastery | Plateforme de maîtrise technique avancée",
  description:
    "Plateforme complète pour maîtriser les compétences techniques avancées : algorithmes, structures de données, systèmes distribués, architecture et développement frontend/backend.",
};

export default function InterviewPrepPage() {
  return (
    <main className="container py-8 space-y-16 md:space-y-24 animate-fadeIn">
      <InterviewPrepHero />
      <PracticeSections />
    </main>
  );
}
