import { Metadata } from "next";
import { ChallengesList } from "./_components/challenges-list";
import { ChallengesHero } from "./_components/hero";

export const metadata: Metadata = {
  title: "Coding Challenges | Interview Prep",
  description:
    "Pratiquez avec des défis de programmation réels et améliorez vos compétences en résolution de problèmes",
};

export default function CodingChallengesPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <ChallengesHero />
      <ChallengesList />
    </main>
  );
}
