import { ChallengeHeader } from "../_components/challenge-header";
import { GraphChallenge } from "./_components/graph-challenge";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/coding-challenges/graphs");

const challengeData = {
  title: "Graph Problems",
  difficulty: "Difficile" as const,
  estimatedTime: "75 min",
  description:
    "Problèmes sur les graphes et les algorithmes de parcours, incluant Dijkstra, détection de cycles, et MST.",
  topics: ["Shortest Path", "Cycle Detection", "MST"],
};

export default function GraphsChallengePage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <ChallengeHeader {...challengeData} />
      <GraphChallenge />
    </div>
  );
}
