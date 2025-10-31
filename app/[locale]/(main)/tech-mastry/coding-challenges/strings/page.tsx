import { Metadata } from "next";
import { ChallengeHeader } from "../_components/challenge-header";
import { StringChallenge } from "./_components/string-challenge";

export const metadata: Metadata = {
  title: "String Manipulation | Coding Challenges",
  description:
    "Pratiquez les algorithmes de manipulation de chaînes avec des défis interactifs",
};

const challengeData = {
  title: "String Manipulation",
  difficulty: "Facile" as const,
  estimatedTime: "30 min",
  description:
    "Série de défis sur la manipulation de chaînes de caractères, incluant les palindromes et les anagrammes.",
  topics: ["Palindrome", "Anagrammes", "Substring"],
};

export default function StringsChallengePage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <ChallengeHeader {...challengeData} />
      <StringChallenge />
    </main>
  );
}
