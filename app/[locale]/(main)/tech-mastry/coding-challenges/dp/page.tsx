import { Metadata } from "next";
import { ChallengeHeader } from "../_components/challenge-header";
import { DPChallenge } from "./_components/dp-challenge";

export const metadata: Metadata = {
  title: "Dynamic Programming | Coding Challenges",
  description:
    "Maîtrisez les techniques de programmation dynamique avec mémoïzation et tabulation",
};

const challengeData = {
  title: "Dynamic Programming",
  difficulty: "Expert" as const,
  estimatedTime: "90 min",
  description:
    "Défis classiques de programmation dynamique, incluant mémoïzation, tabulation, et optimisation.",
  topics: ["Memoization", "Tabulation", "Optimization"],
};

export default function DPChallengePage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <ChallengeHeader {...challengeData} />
      <DPChallenge />
    </main>
  );
}
