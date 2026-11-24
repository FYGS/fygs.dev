import { ChallengeHeader } from "../_components/challenge-header";
import { ArrayChallenge } from "./_components/array-challenge";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/coding-challenges/arrays");

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
