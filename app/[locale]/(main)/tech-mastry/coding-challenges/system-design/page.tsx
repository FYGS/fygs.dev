import { Metadata } from "next";
import { ChallengeHeader } from "../_components/challenge-header";
import { SystemDesignChallenge } from "./_components/system-design-challenge";

export const metadata: Metadata = {
  title: "System Design | Coding Challenges",
  description:
    "Pratiquez la conception de systèmes distribués avec des mini-challenges réels",
};

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
    <main className="container py-8 space-y-12 animate-fadeIn">
      <ChallengeHeader {...challengeData} />
      <SystemDesignChallenge />
    </main>
  );
}
