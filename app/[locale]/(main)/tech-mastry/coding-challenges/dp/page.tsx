import { ChallengeHeader } from "../_components/challenge-header";
import { DPChallenge } from "./_components/dp-challenge";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/coding-challenges/dp");

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
    <div className="container py-8 space-y-12 animate-fadeIn">
      <ChallengeHeader {...challengeData} />
      <DPChallenge />
    </div>
  );
}
