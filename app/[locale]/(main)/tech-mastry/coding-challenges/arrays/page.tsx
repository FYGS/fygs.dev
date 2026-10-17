import { Metadata } from "next";
import { ChallengeHeader } from "../_components/challenge-header";
import { ArrayChallenge } from "./_components/array-challenge";

export const metadata: Metadata = {
  title: "Array Operations | Coding Challenges",
  description:
    "Pratiquez les algorithmes de manipulation de tableaux et les techniques de résolution",
};

const challengeData = {
  title: "Array Operations",
  difficulty: "Intermédiaire" as const,
  estimatedTime: "45 min",
  description:
    "Série de défis sur les opérations de tableaux, incluant le Two Pointers et le Sliding Window.",
  topics: ["Two Pointers", "Sliding Window", "Sorting"],
};

export default function ArraysChallengePage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <ChallengeHeader {...challengeData} />
      <ArrayChallenge />
    </div>
  );
}
