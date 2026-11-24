import { ChallengeHeader } from "../_components/challenge-header";
import { TreeChallenge } from "./_components/tree-challenge";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/coding-challenges/trees");

const challengeData = {
  title: "Tree Traversal",
  difficulty: "Difficile" as const,
  estimatedTime: "60 min",
  description:
    "Problèmes de parcours et manipulation d'arbres binaires, incluant DFS, BFS, et validation de BST.",
  topics: ["DFS", "BFS", "Binary Trees"],
};

export default function TreesChallengePage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <ChallengeHeader {...challengeData} />
      <TreeChallenge />
    </div>
  );
}
