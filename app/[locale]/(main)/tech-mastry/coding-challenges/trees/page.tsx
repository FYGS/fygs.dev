import { Metadata } from "next";
import { ChallengeHeader } from "../_components/challenge-header";
import { TreeChallenge } from "./_components/tree-challenge";

export const metadata: Metadata = {
  title: "Tree Traversal | Coding Challenges",
  description:
    "Maîtrisez les algorithmes de parcours d'arbres binaires avec DFS et BFS",
};

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
