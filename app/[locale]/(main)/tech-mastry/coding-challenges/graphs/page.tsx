import { Metadata } from "next";
import { ChallengeHeader } from "../_components/challenge-header";
import { GraphChallenge } from "./_components/graph-challenge";

export const metadata: Metadata = {
  title: "Graph Problems | Coding Challenges",
  description:
    "Maîtrisez les algorithmes de graphes: plus court chemin, cycles, MST",
};

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
    <main className="container py-8 space-y-12 animate-fadeIn">
      <ChallengeHeader {...challengeData} />
      <GraphChallenge />
    </main>
  );
}
