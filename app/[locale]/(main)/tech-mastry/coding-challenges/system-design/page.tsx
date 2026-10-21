import { ChallengeHeader } from "../_components/challenge-header";
import { SystemDesignChallenge } from "./_components/system-design-challenge";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/coding-challenges/system-design");

const challengeData = {
  title: "System Design",
  difficulty: "Expert" as const,
  estimatedTime: "120 min",
  description:
    "Mini-défis de conception de systèmes distribués, incluant scalabilité, load balancing, et caching.",
  topics: ["Scalability", "Load Balancing", "Caching"],
};

export default function SystemDesignChallengePage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <ChallengeHeader {...challengeData} />
      <SystemDesignChallenge />
    </div>
  );
}
