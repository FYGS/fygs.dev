import { Metadata } from "next";
import { InterviewPrepHero } from "./_components/hero";
import { PracticeSections } from "./_components/practice-sections";

export const metadata: Metadata = {
  title: "Interview Prep | Fernand SOUALO",
  description:
    "Préparation structurée aux entretiens techniques - Algorithmes, System Design, Frontend, Backend et plus",
};

export default function InterviewPrepPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <InterviewPrepHero />
      <PracticeSections />
    </main>
  );
}
