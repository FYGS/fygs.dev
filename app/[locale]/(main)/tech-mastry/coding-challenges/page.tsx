import { ChallengesList } from "./_components/challenges-list";
import { ChallengesHero } from "./_components/hero";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/coding-challenges");

export default function CodingChallengesPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <ChallengesHero />
      <ChallengesList />
    </div>
  );
}
