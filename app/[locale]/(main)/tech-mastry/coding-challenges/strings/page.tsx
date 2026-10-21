import { ChallengeHeader } from "../_components/challenge-header";
import { StringChallenge } from "./_components/string-challenge";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/coding-challenges/strings");

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
    <div className="container py-8 space-y-12 animate-fadeIn">
      <ChallengeHeader {...challengeData} />
      <StringChallenge />
    </div>
  );
}
